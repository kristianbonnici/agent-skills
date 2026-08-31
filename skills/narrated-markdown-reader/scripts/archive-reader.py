from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Archive a generated narrated reader beside its Markdown source."
    )
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--reader", required=True, type=Path)
    parser.add_argument("--audio", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--title", required=True)
    parser.add_argument("--timings", type=Path)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    source = args.source.resolve()
    reader = args.reader.resolve()
    audio = args.audio.resolve()
    output = args.output.resolve()

    for path in (source, reader, audio):
        if not path.is_file():
            raise SystemExit(f"Required file does not exist: {path}")

    managed_files = [
        output / "index.html",
        output / "narration.mp3",
        output / "manifest.json",
        output / "open-reader.command",
    ]
    existing = [path for path in managed_files if path.exists()]
    if existing and not args.force:
        names = ", ".join(path.name for path in existing)
        raise SystemExit(f"Archive already contains {names}; rerun with --force to replace managed files.")

    output.mkdir(parents=True, exist_ok=True)
    html = reader.read_text(encoding="utf-8")
    html, replacements = re.subn(
        r'(<audio\b[^>]*\bsrc=")[^"]+("[^>]*>)',
        r'\1./narration.mp3\2',
        html,
        count=1,
        flags=re.IGNORECASE,
    )
    if replacements != 1:
        raise SystemExit("Could not identify exactly one audio source in the reader HTML.")

    (output / "index.html").write_text(html, encoding="utf-8")
    shutil.copy2(audio, output / "narration.mp3")

    timing_data = {}
    if args.timings:
        timing_data = json.loads(args.timings.resolve().read_text(encoding="utf-8"))

    manifest = {
        "schemaVersion": 1,
        "title": args.title,
        "source": os.path.relpath(source, output),
        "sourceSha256": sha256(source),
        "reader": "index.html",
        "audio": "narration.mp3",
        "durationSeconds": timing_data.get("duration"),
        "voice": timing_data.get("voice"),
        "rate": timing_data.get("rate"),
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "launchMode": "file",
        "requiresServer": False,
        "externalAssets": [
            "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
            "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js",
        ],
    }
    (output / "manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )

    launcher = output / "open-reader.command"
    launcher.write_text(
        '''#!/bin/sh
set -eu
reader_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
python3 - "$reader_dir" <<'PY'
import hashlib
import json
import sys
from pathlib import Path

reader_dir = Path(sys.argv[1])
manifest = json.loads((reader_dir / "manifest.json").read_text(encoding="utf-8"))
source = (reader_dir / manifest["source"]).resolve()
if not source.is_file():
    raise SystemExit(f"Canonical Markdown source is missing: {source}")

digest = hashlib.sha256()
with source.open("rb") as source_file:
    for chunk in iter(lambda: source_file.read(1024 * 1024), b""):
        digest.update(chunk)

if digest.hexdigest() != manifest["sourceSha256"]:
    raise SystemExit(
        "This read-through is stale because its Markdown source changed. "
        "Rebuild it before opening."
    )
PY
if [ "${1:-}" = "--check" ]; then
    printf '%s\n' "Read-through matches its Markdown source."
    exit 0
fi
open "$reader_dir/index.html"
''',
        encoding="utf-8",
    )
    launcher.chmod(0o755)

    print(json.dumps({
        "output": str(output),
        "reader": str(output / "index.html"),
        "audio": str(output / "narration.mp3"),
        "manifest": str(output / "manifest.json"),
        "launcher": str(launcher),
    }, indent=2))


if __name__ == "__main__":
    main()
