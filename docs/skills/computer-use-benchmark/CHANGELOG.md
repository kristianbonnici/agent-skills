# computer-use-benchmark changelog

## 1.0.0 (2026-11-26)

- **A benchmark skill for macOS desktop computer-use setups** (`computer-use-benchmark`), built from the standardized 8-task Harbor Desk comparison kit (`assets/Bench.swift`, `assets/manifest.yaml`, `scripts/tui.py`, `scripts/bench`).
- **App-graded runs across seeds and isolated harnesses:** supports `codex-native`, `codex-cua`, `claude-native`, `claude-cua`, `antigravity-cua`, and `opencode-cua` via `arm[:model[@effort]]`, with `--seed`/`--seeds`, `--between`, `--usage`, `bench selftest`, `bench record`, `bench summarize`, and `bench totals`.
- **Hardened isolation and parsing:**
  - resolves relative `CODEX_HOME` once at startup and passes the absolute path to both `codex exec` and the Codex TUI;
  - classifies Codex rate limits from the terminal outcome so a recovered 429 followed by `turn.completed` does not make a completed failure redoable;
  - stages Antigravity workspace plugin files outside `agy-ws` in `.agy-staging` and cleans up failed writes so interrupted runs never block future runs;
  - parses and verifies Cua Driver's capability manifest scope (`local.computer-use-benchmark.harbor-desk` only, `desktop.display: false`) and checks its `sha256` digest in `cua-driver status` before running any Cua arm.
- **Private state and tests:** compact records (`results.jsonl`, `usage.jsonl`) and per-version `results.md` live in the private state repository; `tests/computer-use-benchmark-test` verifies all setup, parsing, manifest, staging, and reporting rules offline.
