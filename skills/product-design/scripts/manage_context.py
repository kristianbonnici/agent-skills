#!/usr/bin/env python3
"""Create and inspect portable Product Design user context."""

from __future__ import annotations

import argparse
import os
import sys
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
    base = Path(os.environ.get("XDG_STATE_HOME", Path.home() / ".local" / "state"))
    return base / "agent-skills" / "product-design"


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
    parser.add_argument("command", choices=("preflight", "init", "show", "path"))
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
    if not context.is_file():
        print(f"No saved Product Design context at {context}", file=sys.stderr)
        return 1
    print(context.read_text(encoding="utf-8").rstrip())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
