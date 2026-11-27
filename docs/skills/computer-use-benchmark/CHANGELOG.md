# computer-use-benchmark changelog

## 1.0.1 (2026-11-27)

- **Guard against late Claude workspace-trust prompts and keep startup blocks resumable** (1.0.0 review follow-ups):
  - `drive_claude()` now polls up to 30 s (within `--limit`) for a ready prompt screen (rejecting workspace-trust phrasing including `"Do you trust the files in this folder?"`, `No, exit`, `Enter to confirm`, and numbered Ink select menus), re-inspects `tui.show()` after the post-paste 0.6 s pump so a late workspace-trust dialog never receives `\r` on `No, exit`, and clears the input with Ctrl+U (`\x15`) and verifies no earlier prompt text remains before re-pasting if late trust recovery succeeded (stopping as resumable `claude prompt not ready` rather than double-pasting if multi-line text remains).
  - Both unresolved workspace trust and `claude prompt not ready` (with 0 tool calls) now route through the resumable setup-failure path in `run_attempts()` / `run_batch()` (aborting with cache-folder recovery guidance without consuming the cell when no agent attempt ran, or recording a resumable `retry stopped` row when an earlier attempt ran, and classifying legacy/incomplete rows under `stopped` so they stay redoable).
  - Documented in `references/setups.md` the `claude-native` `/mcp` prerequisite, cache-folder workspace-trust recovery, and three operating caveats (`agy` still starts configured user MCP servers while deny rules only refuse calls; `read_file` stays allowed for `agy`; Cua Spaces' `--embedded` helper inherits the starting terminal's Accessibility and Screen Recording permissions).
  - Added tests in `tests/computer-use-benchmark-test` for late workspace-trust prompts (including single-paste recovery), alternate trust/menu rejection, unready prompt screens, post-paste `KeyboardInterrupt` PTY cleanup, and resumable setup-failure batches.

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
