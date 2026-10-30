#!/usr/bin/env python3
"""Create and inspect portable Product Design user context."""

from __future__ import annotations

import argparse
import os
import re
import sys
from datetime import date
from pathlib import Path


TEMPLATE = """# Product Design Context

## Products and URLs

status: not provided

## Visual references and screenshots

status: not provided

## Codebases, components, and design systems

status: not provided

## Brand and asset sources

status: not provided

## Browser and sharing preferences

status: not provided

## Other durable notes

status: not provided
"""


def state_root() -> Path:
    # An exported but empty XDG_STATE_HOME counts as unset, as in the shell's ${XDG_STATE_HOME:-...}.
    # A relative one counts as unset too (the XDG spec says so), so state never lands in the current folder.
    configured = os.environ.get("XDG_STATE_HOME")
    base = Path(configured) if configured and os.path.isabs(configured) else Path.home() / ".local" / "state"
    return base / "agent-skills" / "product-design"


def resolved(path: Path) -> Path:
    """path with links resolved, though its last parts may not exist yet: the nearest existing
    folder resolved, and the rest added to it."""
    path = path.absolute()
    for folder in [path, *path.parents]:
        if folder.exists():
            return folder.resolve() / path.relative_to(folder)
    return path


def inside_repository(path: Path) -> bool:
    """Whether path, links resolved, is inside a git working tree (a .git folder or file in it or a parent)."""
    path = resolved(path)
    for folder in [path, *path.parents]:
        if (folder / ".git").exists():
            return True
    return False


def new_run_dir(name: str) -> Path:
    """Create a fresh evidence folder outside any repository; never reuse an existing one."""
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:40] or "run"
    runs = state_root() / "runs"
    if inside_repository(runs):
        # XDG_STATE_HOME points into a repository: evidence must stay out of it
        runs = Path.home() / ".local" / "state" / "agent-skills" / "product-design" / "runs"
        print(f"XDG_STATE_HOME is inside a repository; using {runs} instead", file=sys.stderr)
        if inside_repository(runs):
            raise SystemExit(f"{runs} is inside a repository too; set XDG_STATE_HOME to a folder outside any repository")
    runs.mkdir(parents=True, exist_ok=True)
    stem = f"{date.today().isoformat()}-{slug}"
    for attempt in range(1, 1000):
        candidate = runs / (stem if attempt == 1 else f"{stem}-{attempt}")
        try:
            candidate.mkdir()
        except FileExistsError:
            continue
        return candidate
    raise SystemExit(f"Could not create a unique run folder under {runs}")


def init_context() -> Path:
    root = state_root()
    root.mkdir(parents=True, exist_ok=True)
    (root / "assets").mkdir(exist_ok=True)
    context = root / "user-context.md"
    if not context.exists():
        context.write_text(TEMPLATE, encoding="utf-8")
    return context


def preflight() -> int:
    root = state_root()
    context = root / "user-context.md"
    parent = root if root.exists() else root.parent
    writable = parent.exists() and os.access(parent, os.W_OK)
    if not parent.exists():
        ancestor = parent
        while not ancestor.exists() and ancestor != ancestor.parent:
            ancestor = ancestor.parent
        writable = os.access(ancestor, os.W_OK)

    print(f"state_root: {root}")
    print(f"persistent_context_available: {'yes' if writable else 'no'}")
    print(f"context_exists: {'yes' if context.is_file() else 'no'}")
    if context.is_file():
        print("--- user-context.md ---")
        print(context.read_text(encoding="utf-8").rstrip())
    return 0 if writable else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("preflight", "init", "show", "path", "run-dir"))
    parser.add_argument("name", nargs="?", help="short name for run-dir, such as the product or flow")
    args = parser.parse_args()

    context = state_root() / "user-context.md"
    if args.command == "preflight":
        return preflight()
    if args.command == "init":
        print(init_context())
        return 0
    if args.command == "path":
        print(context)
        return 0
    if args.command == "run-dir":
        if not args.name:
            parser.error("run-dir needs a short name")
        print(new_run_dir(args.name))
        return 0
    if not context.is_file():
        print(f"No saved Product Design context at {context}", file=sys.stderr)
        return 1
    print(context.read_text(encoding="utf-8").rstrip())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
