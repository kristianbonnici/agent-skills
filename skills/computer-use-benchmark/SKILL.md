---
name: computer-use-benchmark
description: Measure how well a computer-use setup (harness, driver, model and reasoning level) operates a real macOS desktop app on seeded GUI tasks, graded from the app's own state log. Run setups across seeds, record compact results in private state, and report one table per set version with passes, minutes, retries, cost and failure kinds. Use when benchmarking or comparing computer-use models, drivers, or harnesses; it never changes routing.
metadata:
  version: 1.0.0
---

# Computer Use Benchmark

Every computer-use setup runs the same eight seeded GUI tasks in Harbor Desk (`assets/Bench.swift`), a sample macOS app of this skill's own. Each run is graded strictly from Harbor Desk's own JSONL event log, never by what the agent claims. `scripts/bench` handles building, daemon isolation, launching, grading, recording, and summarizing; you manage screen turns, usage snapshots, and reporting.

The private results (`runs/`, `results.md`, `set.json`, and `config.json`) live outside this repository in `${AGENT_SKILLS_STATE}/computer-use-benchmark` (`scripts/bench where` prints the folder). Never copy private overlays, private server names, transcripts, screenshots, or raw screen captures into this public repository.

## Rules that never bend

- **Graded by the app, never the agent's word.** Harbor Desk writes `shown`, `dot`, `press`, `success`, `wrong`, `pointer-moved`, and `front-changed` to its own log. A run passes only when its last grade event is `success`, so a stray click after `success` fails the run (and on `canvas`, any decoy or out-of-order click spoils the attempt).
- **Operate only when the screen is yours.** Live runs require an unlocked screen idle for at least 120 seconds (or `--force`), and must pass `--between` whenever a shared screen lease controls access. Never run unattended setups over other people's active windows.
- **Verify Cua Driver's manifest scope before every Cua run.** `bench start-cua` and `bench run` refuse unless the daemon on the benchmark's own socket (`COMPUTER_USE_BENCHMARK_SOCKET`, never the user's default socket) runs in `bounded` mode with an approved `version: 3` manifest whose SHA-256 matches `assets/manifest.yaml` (Harbor Desk alone, `desktop.display: false`, no desktop-wide listing tools).
- **Per-run isolated harness configs only.** Never mutate the user's global `~/.claude`, `~/.codex`, `~/.config/opencode`, or `~/.gemini` configs, and never run `cua-driver mcp-config --client` into live folders.
- **Timeouts and real failures are results.** Only runs cut short by a provider usage limit (`claude limit`, `codex limit`, `agy limit` as the terminal outcome) are eligible to redo in the same output folder; a recovered rate limit that ends in a completed turn stays recorded as-is.
- **Evidence, not a routing decision.** Output tables inform routing updates (for example via `skill-evolution` on the owner's word) and never modify orchestrator routing on their own.

## 1. Check folders and build

Run `scripts/bench where` to inspect the private state folder, rebuildable cache folder, isolated socket, and current set version (`references/set.md`).

Build Harbor Desk and verify all eight task views off-screen before requesting screen time:

```sh
scripts/bench build
scripts/bench selftest
```

TUI arms (`claude-native`, `claude-cua`, `codex-native`) require Python 3.11+ with `pyte` installed in a virtual environment. Run `scripts/bench` from that Python interpreter when using those arms (`references/setups.md`).

## 2. Start the bounded Cua Driver (for Cua arms)

For any `*-cua` arm, start the benchmark's isolated daemon before running:

```sh
scripts/bench start-cua
```

`bench start-cua` kills only an older daemon on the benchmark's own socket, verifies `assets/manifest.yaml` scope and SHA-256, and starts Cua Driver in `bounded` mode with `--approve-capability-manifest`. Always run `scripts/bench stop-cua` when finished.

## 3. Run setups across seeds

A setup is `arm[:model[@effort]]` (`references/setups.md`). Arms: `codex-native`, `codex-cua`, `claude-native`, `claude-cua`, `antigravity-cua`, `opencode-cua`.

Run in chunks (`--seed n`) or full batches (`--seeds 3`) into a scratch or temporary output folder:

```sh
<venv>/bin/python scripts/bench run <out> <setup,setup> <task,task|all> \
  --seed 1 --between '<lease-check-cmd>' --usage '<provider-usage-cmd>'
```

- Pass `--quiet` only when testing background behavior while the screen is in use (note that `pointer` and `front` counts then include user activity).
- `touch <cache>/STOP` stops a batch cleanly between runs without leaving partial rows; remove `<cache>/STOP` before starting the next batch.
- Pass `--allow-overlay <App>` (or configure `allow_overlays` in `<data>/config.json`) for user-approved overlay windows when testing native computer-use approval prompts.

## 4. Record and report

Record only compact JSONL results and usage snapshots (never screenshots, `.screen.txt`, `.events.jsonl`, or harness logs) into the private state folder:

```sh
scripts/bench record <out> --name <YYYY-MM-DD-label> --note "<summary>"
scripts/bench totals [--set <version|all>]
scripts/bench summarize [--set <version|all>]
```

Update `results.md` in `<data>` with the `bench totals` table, the set version, date, plan-window deltas from `usage.jsonl` (noting any concurrent work on the computer), failure breakdown, and any blind spots outside Harbor Desk (such as non-activating panels). Commit `runs/`, `set.json`, and `results.md` in the private state repository; push only when asked.
