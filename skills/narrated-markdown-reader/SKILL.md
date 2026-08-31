---
name: narrated-markdown-reader
description: Create, rebuild, archive, or open a Markdown read-through with neural audio, synchronized row and word highlighting, rendered fenced math, playback controls, themes, and adjustable reading layout. Use when the user asks to read a Markdown file aloud, generate a synchronized audio reader, preserve one in a repository, or reopen an existing read-through. Do not use for ordinary Markdown editing without narration.
---

# Narrated Markdown Reader

Create a durable reader bundle whose normal launch path is the local `index.html` file. Do not leave a local web server running by default.

## Existing read-throughs

When the user asks to open or inspect an existing reader:

1. Find the nearest `read-through/manifest.json` or repository read-through catalog.
2. Compare the manifest's `sourceSha256` with the current source file.
3. If they match, use `open-reader.command` on macOS or the operating system's normal file opener for `index.html`. The generated macOS launcher repeats the checksum check before opening. Do not start a server solely to open the reader. Browser-control environments may block agent navigation to `file://` URLs even though the user can open the file normally.
4. If they differ, label the reader stale and offer to rebuild it. Do not silently present old narration as current.

## Creating or rebuilding

1. Read the repository instructions and identify the source document's canonical owner. Preserve unrelated changes.
2. Keep the Markdown source canonical. Put generated output in a repository-owned location consistent with local rules; prefer a sibling `read-through/` directory when the source already lives in a dedicated document folder.
3. Inspect every fenced `math` block. Read [references/math-narration-spec.md](references/math-narration-spec.md) and create a source-specific math narration specification when formulas are present. Never send raw LaTeX to text-to-speech.
4. Prepare blocks with `scripts/prepare-reader.mjs`. Use `--link-prefix` when the archived reader is nested below the source so relative document links still resolve.
5. Generate narration with `scripts/synthesize-reader.py`. It requires `edge-tts==7.2.3`, `ffmpeg`, and `ffprobe`. If `edge_tts` is unavailable, install the pinned package into a task-specific cache outside the repository and set `PYTHONPATH`; do not commit environments or caches.
6. Build `index.html` with `scripts/build-reader.mjs`.
7. Archive only the durable bundle with `scripts/archive-reader.py`: `index.html`, `narration.mp3`, `manifest.json`, and `open-reader.command`. Keep intermediate blocks and timing JSON outside the repository unless the user requests diagnostic artifacts.
8. Update an existing repository catalog when one exists or the user requests one. Link to the canonical source and the archived reader; do not duplicate source content.

## Launch policy

- Default: use `open-reader.command` on macOS or open the archived `index.html` with the operating system's normal file opener. No process remains active.
- Server fallback: use `scripts/serve-reader.py` only when the browser cannot seek local audio reliably. Its default maximum lifetime is two hours. Keep it foregrounded when practical and report its expiry.
- Never start an unbounded background server for a reader.
- The reader currently loads KaTeX from the pinned jsDelivr URL, so formula typesetting needs network access even though playback does not need a server.

## Quality checks

- The text stays left-aligned inside a centered reading column by default.
- Page alignment, reading width, light/dark appearance, playback speed, follow mode, and seeking all work.
- Entering a formula advances the highlight across its rendered symbol groups; leaving it resumes normal word highlighting.
- All narration words map without warnings, and browser diagnostics contain no errors.
- The reader has no page-level horizontal overflow at 360px and 736px.
- The manifest source hash matches the current Markdown.
- Run the repository's relevant checks and `git diff --check` before handoff.

## Script entry points

```text
node scripts/prepare-reader.mjs --source SOURCE.md --output BUILD/blocks.json [--math-spec SPEC.json] [--link-prefix ../]
python scripts/synthesize-reader.py --workdir BUILD
node scripts/build-reader.mjs --workdir BUILD --title "Reader title"
python scripts/archive-reader.py --source SOURCE.md --reader BUILD/index.html --audio BUILD/narration.mp3 --timings BUILD/block-timings.json --output DESTINATION/read-through --title "Reader title"
```

Use absolute paths when invoking the scripts from outside the skill directory.
