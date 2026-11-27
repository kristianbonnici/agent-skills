# The set, grading and private results

## Where files live

`scripts/bench where` prints the three paths and the active set version:

- **Data folder (`<data>`):** `computer-use-benchmark/` in the private state repository (`AGENT_SKILLS_STATE`, or next to this repository when `.git` exists), otherwise `${XDG_STATE_HOME:-~/.local/state}/agent-skills/computer-use-benchmark/`.
  - `set.json`: set `version` (`MAJOR.MINOR`), `tasks`, `seeds`, and `history`.
  - `config.json`: optional per-owner private configuration:
    ```json
    {
      "allow_overlays": ["OverlayApp"],
      "extra_deny_servers": ["private-mcp"]
    }
    ```
  - `runs/<run-id>/`: recorded compact results (`results.jsonl`, optional `usage.jsonl`, `meta.json`). `bench run` stamps `set_version` on every batch row and `bench record` preserves that version cleanly with crash-recoverable no-clobber publication; recorded folders under `<data>/runs/` lacking both `meta.json` and row `set_version` are labeled `legacy`. Large `.events.jsonl`, `.screen.txt`, and harness logs stay in scratch and are never committed here.
  - `results.md`: published per-version tables (`bench totals`), plan-window cost deltas, and failure notes.
- **Cache folder (`<cache>`):** `${XDG_CACHE_HOME:-~/.cache}/agent-skills/computer-use-benchmark/` (override: `COMPUTER_USE_BENCHMARK_CACHE`). Holds compiled `Harbor Desk.app`, `build.json` build stamp, copied `manifest.yaml`, `agy-ws/`, `.agy-staging/`, `opencode-config/`, and `cua-serve.log`.
- **Socket:** `/tmp/cu-bench-<uid>/cua.sock` (override: `COMPUTER_USE_BENCHMARK_SOCKET`).

## The eight tasks

Each seed (`1..N`) deterministically generates targets for all eight tasks via an FNV/LCG generator in `assets/Bench.swift`, identical for the task prompt (`--describe`) and grading:

| Task | Exercises | Pass condition |
| --- | --- | --- |
| `form` | AppKit text field, pop-up menu, stepper/field, radios, checkboxes, key button | Exact guest name, room, nights, bed, single extra on Book press |
| `menu` | Native main-menu submenu (`Format > Emphasis > <style>`) | Target style chosen |
| `list` | Scrolling a 5,000-row `NSTableView` and clicking Open | Exact `Stop NNNN` row selected when Open pressed |
| `drag` | Drawn `NSView` board with zero accessibility children | Target card moved to target column; all other cards stay in `To do` |
| `canvas` | Drawn `NSView` with blue numbered dots (1–3) and grey decoy dots (4–9) | Dots 1, 2, 3 clicked in order with no wrong click after dot 3 (earlier misses are counted in `wrong`) |
| `slider` | Setting an `NSSlider` to an exact integer and clicking Apply | Rounded slider value matches target on Apply |
| `web` | `WKWebView` HTML form (radios, `<select>`, checkbox, input, submit) | Exact form fields posted through `WKScriptMessageHandler` |
| `code` | Visual OCR of drawn monospaced 6-char code, typing, modal `NSAlert` sheet | Exact code submitted on Confirm sheet `Send` |

## Grading and failure kinds

`HarborDesk` logs each event with elapsed seconds `t` since launch. A run passes iff at least one grade event (`success`/`wrong`) occurs and the **last** grade event is `success`. Time to success (`seconds`) subtracts harness startup delay before the prompt was sent.

Failed runs are grouped into:

- `usage-limit`: terminal provider quota/rate-limit error (eligible for redo in the same folder; a transient rate limit followed by a completed turn is **not** marked `usage-limit`).
- `stopped`: interrupted between automatic retries by `<cache>/STOP`, a failing `--between` check, a mid-batch daemon or launch failure, or a Claude TUI startup block (unresolved workspace trust or prompt not ready; eligible to redo in the same folder, with any prior real attempt costs folded into totals on resume).
- `timeout`: reached `--limit` seconds (default `420`).
- `approval-held`: interactive approval prompt named an unapproved app outside `allow_overlays`.
- `permission`: macOS Accessibility or Screen Recording prompt blocked the harness.
- `harness-error`: non-zero exit, status error, or denied server/web tool call.
- `post-success-wrong`: reached `success`, then a later `wrong` event invalidated it (for example a stray second `mouseDown` after clicking the final dot).
- `wrong-answer`: submitted a wrong state without reaching `success`.
- `gave-up`: agent replied `FAILED` without recording a `wrong` grade.
- `other`: ended without tool calls or `DONE`/`FAILED`.

## Set versioning

`set.json` uses `MAJOR.MINOR`:

- Increment `MINOR` for clarifications or non-breaking additions recorded in `history`.
- Increment `MAJOR` whenever `Bench.swift` tasks, target layouts, prompts, or grading rules change; results compare only within one `MAJOR`.
