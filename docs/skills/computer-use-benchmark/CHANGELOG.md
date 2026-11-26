# computer-use-benchmark changelog

## 1.0.0 (2026-11-26)

- **A benchmark skill for macOS desktop computer-use setups** (`computer-use-benchmark`), built from the standardized 8-task Harbor Desk comparison kit (`assets/Bench.swift`, `assets/manifest.yaml`, `scripts/tui.py`, `scripts/bench`).
- **App-graded runs across seeds and isolated harnesses:** supports `codex-native`, `codex-cua`, `claude-native`, `claude-cua`, `antigravity-cua`, and `opencode-cua` via `arm[:model[@effort]]`, with `--seed`/`--seeds`, `--between`, `--usage` (via `shlex`, including `opencode_go`), `bench selftest`, `bench record`, `bench summarize`, and `bench totals` (both supporting `--set <version|all>` and per-MAJOR partitioning).
- **Hardened isolation, retries, and parsing:**
  - resolves relative `CODEX_HOME` once at startup and passes the absolute path to both `codex exec` and the Codex TUI, encoding Claude transcript paths cleanly across `.`/`_`;
  - classifies Codex and Antigravity rate limits from the terminal outcome so a recovered 429 followed by a completed run does not make a failure redoable;
  - stages Antigravity workspace plugin files outside `agy-ws` in `.agy-staging` and cleans up failed writes so interrupted runs never block future runs;
  - anchors Cua Driver manifest scope (`local.computer-use-benchmark.harbor-desk` only, `desktop.display: false`) and `sha256` verification to `assets/manifest.yaml`, polling `stop` cleanly and checking `cua-driver status` before every Cua attempt and retry;
  - runs each retry with a fresh Harbor Desk instance/log (`-aN`), aggregates wall time and token usage across attempts, persists completed attempt costs when a retry check stops, waits up to 20 s for slow Harbor Desk launches before retrying, and reaps PTY process groups and child harnesses on EOF or interrupt.
- **Private state and tests:** `bench run` stamps `set_version` on batch rows and `bench record` preserves that version atomically with crash-recoverable no-clobber publication; `tests/computer-use-benchmark-test` verifies all setup, parsing, manifest, staging, lifecycle, recording, totals, and Harbor Desk build/selftest behavior.
