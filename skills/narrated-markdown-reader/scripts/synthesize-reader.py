import asyncio
import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

import edge_tts

parser = argparse.ArgumentParser(description="Create neural narration and exact word timings for prepared Markdown blocks.")
parser.add_argument("--workdir", required=True, type=Path)
parser.add_argument("--blocks", type=Path)
parser.add_argument("--voice", default="en-US-BrianMultilingualNeural")
parser.add_argument("--rate", default="-8%")
parser.add_argument("--concurrency", type=int, default=3)
args = parser.parse_args()

ROOT = args.workdir.resolve()
BLOCKS_PATH = args.blocks.resolve() if args.blocks else ROOT / "blocks.json"
OUTPUT_AUDIO = ROOT / "narration.mp3"
OUTPUT_TIMINGS = ROOT / "block-timings.json"
OUTPUT_WORD_TIMINGS = ROOT / "word-timings.json"
VOICE = args.voice
RATE = args.rate
MAX_CHARS = 4600


def spoken_form(block):
    text = block["text"].strip()
    if not re.search(r"[.!?][\"')\]]?$", text):
        text += "."
    return text


def make_chunks(blocks):
    chunks = []
    current_parts = []
    current_blocks = []
    current_length = 0

    for block in blocks:
        text = spoken_form(block)
        addition = text + "\n\n"
        if current_parts and current_length + len(addition) > MAX_CHARS:
            chunks.append({"text": "".join(current_parts), "blocks": current_blocks})
            current_parts = []
            current_blocks = []
            current_length = 0

        current_blocks.append({"index": block["index"], "char_start": current_length, "speech": text})
        current_parts.append(addition)
        current_length += len(addition)

    if current_parts:
        chunks.append({"text": "".join(current_parts), "blocks": current_blocks})
    return chunks


async def synthesize_chunk(chunk, index, directory, semaphore):
    async with semaphore:
        audio_path = directory / f"chunk-{index:03d}.mp3"
        events = []
        communicate = edge_tts.Communicate(
            chunk["text"],
            VOICE,
            rate=RATE,
            boundary="WordBoundary",
        )
        with audio_path.open("wb") as audio_file:
            async for event in communicate.stream():
                if event["type"] == "audio":
                    audio_file.write(event["data"])
                elif event["type"] == "WordBoundary":
                    events.append({
                        "offset": event["offset"] / 10_000_000,
                        "duration": event["duration"] / 10_000_000,
                        "text": event["text"],
                    })

        duration = float(subprocess.check_output([
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(audio_path),
        ], text=True).strip())
        return {"index": index, "audio_path": audio_path, "duration": duration, "events": events}


def locate_events(chunk_text, events):
    cursor = 0
    located = []
    for event in events:
        text = event["text"]
        position = chunk_text.find(text, cursor)
        if position < 0:
            compact_text = re.sub(r"\s+", " ", text).strip()
            compact_chunk = re.sub(r"\s+", " ", chunk_text[cursor:])
            compact_position = compact_chunk.find(compact_text)
            if compact_position >= 0:
                probe = cursor
                seen = 0
                while probe < len(chunk_text) and seen < compact_position:
                    if not chunk_text[probe].isspace() or (probe == 0 or not chunk_text[probe - 1].isspace()):
                        seen += 1
                    probe += 1
                position = probe
        if position < 0:
            position = cursor
        located.append({**event, "char_start": position})
        cursor = max(cursor, position + len(text))
    return located


async def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    data = json.loads(BLOCKS_PATH.read_text())
    blocks = data["blocks"]
    chunks = make_chunks(blocks)
    chunk_directory = Path(tempfile.mkdtemp(prefix="narrated-markdown-audio-"))
    semaphore = asyncio.Semaphore(max(1, args.concurrency))
    results = await asyncio.gather(*[
        synthesize_chunk(chunk, index, chunk_directory, semaphore)
        for index, chunk in enumerate(chunks)
    ])
    results.sort(key=lambda result: result["index"])

    concat_path = chunk_directory / "concat.txt"
    concat_path.write_text("".join(f"file '{result['audio_path']}'\n" for result in results))
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "concat", "-safe", "0", "-i", str(concat_path),
        "-c", "copy", str(OUTPUT_AUDIO),
    ], check=True)

    accumulated = 0.0
    starts = {}
    word_timings = []
    diagnostics = []

    for chunk, result in zip(chunks, results):
        events = locate_events(chunk["text"], result["events"])
        for event in events:
            owner_position = 0
            for candidate_position, candidate in enumerate(chunk["blocks"]):
                if candidate["char_start"] <= event["char_start"]:
                    owner_position = candidate_position
                else:
                    break
            owner = chunk["blocks"][owner_position]
            absolute_start = accumulated + event["offset"]
            word_timings.append({
                "index": len(word_timings),
                "block": owner["index"],
                "text": event["text"],
                "charStart": event["char_start"] - owner["char_start"],
                "start": round(absolute_start, 3),
                "end": round(absolute_start + event["duration"], 3),
            })

        for block_position, block in enumerate(chunk["blocks"]):
            next_start = (
                chunk["blocks"][block_position + 1]["char_start"]
                if block_position + 1 < len(chunk["blocks"])
                else len(chunk["text"])
            )
            candidates = [
                event for event in events
                if block["char_start"] <= event["char_start"] < next_start
            ]
            if candidates:
                local_start = candidates[0]["offset"]
            else:
                following = [event for event in events if event["char_start"] >= block["char_start"]]
                preceding = [event for event in events if event["char_start"] < block["char_start"]]
                if following:
                    local_start = following[0]["offset"]
                elif preceding:
                    prior = preceding[-1]
                    local_start = prior["offset"] + prior["duration"]
                else:
                    local_start = 0.0
                diagnostics.append(block["index"])
            starts[block["index"]] = accumulated + local_start
        accumulated += result["duration"]

    final_duration = float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(OUTPUT_AUDIO),
    ], text=True).strip())

    timings = []
    for index, block in enumerate(blocks):
        start = starts.get(index, timings[-1]["end"] if timings else 0.0)
        if index + 1 < len(blocks):
            end = starts.get(index + 1, start)
        else:
            end = final_duration
        timings.append({
            "index": index,
            "start": round(start, 3),
            "end": round(max(start, end), 3),
        })

    OUTPUT_TIMINGS.write_text(json.dumps({
        "voice": VOICE,
        "rate": RATE,
        "duration": final_duration,
        "chunks": len(chunks),
        "fallbackBlocks": diagnostics,
        "timings": timings,
    }, indent=2))

    OUTPUT_WORD_TIMINGS.write_text(json.dumps({
        "voice": VOICE,
        "rate": RATE,
        "duration": final_duration,
        "words": word_timings,
    }, indent=2))

    print(json.dumps({
        "audio": str(OUTPUT_AUDIO),
        "timings": str(OUTPUT_TIMINGS),
        "wordTimings": str(OUTPUT_WORD_TIMINGS),
        "voice": VOICE,
        "chunks": len(chunks),
        "blocks": len(blocks),
        "words": len(word_timings),
        "duration": round(final_duration, 3),
        "fallbackBlocks": diagnostics,
        "temporaryChunks": str(chunk_directory),
    }, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
