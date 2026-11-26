# Why the computer-use benchmark works this way

The skill states its rules without their history to keep the model's context focused. The evidence behind those rules is recorded here.

Last checked: new work 2026-11-26; sources 2026-11-26.

## Baseline comparison (2026-11-25)

Set 1.0 was calibrated across 96 main runs (4 setups × 8 tasks × 3 seeds) plus 16 single-seed follow-up runs and an earlier 72-run baseline (2026-11-01) on a macOS desktop with active overlay windows present:

- **Grade from the app, never the agent's word.** Agents frequently miss subtle state mismatches or trigger stray post-success clicks. Having Harbor Desk log every UI state transition and `mouseDown` directly prevents false positives (`post-success-wrong` surfaced 9 failures across 9 Cua Driver `canvas` runs where every setup actually hit all three dots in order before a ~0.4 s trailing background `mouseDown` landed off-target).
- **Real desktop overlays separate native routes.** Under active macOS desktop overlays approved in private config, Codex's built-in computer use passed 23/24 runs (median 9–17 s on short tasks, 78 s on `list`), whereas Claude Code's built-in computer use scored 0/24 on 2026-11-01 because overlay windows intercepted pointer hits. Cua Driver setups (Claude Opus 5.5, Gemini 4 Neon, Gemini 4 Hydrogen) each scored 21/24 (100% outside `canvas`).
- **Foreground delivery on drawn views.** On 2026-11-01, OpenCode + Cua Driver passed `canvas` 3/3 by falling back to `delivery_mode: "foreground"`, confirming that the double `mouseDown` defect is specific to background coordinate delivery on custom-drawn `NSView` surfaces.
- **Cost vs. token volume.** Codex native spent fewer non-cache tokens per run (11–23 k) but consumed a noticeably larger share (~1% per run) of a ChatGPT Plus 5-hour window than Claude Opus + Cua Driver (~0.1% per run of a Max 20x 5-hour window) or Gemini 4 Hydrogen (~0.1% of the Gemini 5-hour window), making cost-per-run plan tracking (`usage.jsonl`) essential alongside raw token counts.
- **What Harbor Desk cannot measure directly.** Regular-window benchmarks do not capture non-activating panels of menu-bar/accessory (`LSUIElement`) apps, which Codex's built-in computer use could not target in real-app checks (where Cua Driver succeeded 9/11 times). Results tables must therefore be read alongside real-app checks.

## Isolation and parser hardening (2026-11-26)

Four defects uncovered during review and live batches shaped `scripts/bench`:

1. **Absolute `CODEX_HOME` propagation:** Codex `exec` runs in the cache dir while the Codex TUI runs in a per-attempt temporary directory, so a relative `CODEX_HOME` would read one `config.toml` and write sessions under another path unless resolved once up front.
2. **Terminal-outcome rate-limit classification:** Transient 429 warnings followed by `turn.completed` represent recovered turns, not cutoffs; classifying only active/terminal rate limits prevents real failures from being overwritten on redo.
3. **Out-of-workspace `agy` staging:** Staging temporary plugin files inside `agy-ws` caused failed or interrupted writes to leave unexpected files that tripped the workspace purity check on later runs.
4. **Manifest scope + SHA-256 verification:** Checking only `permission mode: bounded` trusts whatever manifest a daemon on the socket was started with; parsing the manifest structure and matching `capability manifest sha256` guarantees Harbor-Desk-only scope.

## Left out

Weighed and not cited as rules for this desktop benchmark:

- **Public VM desktop benchmarks (OSWorld, Mind2Web, WebArena):** measure Linux VMs or pure browser tasks under different action spaces and lack macOS AppKit/WKWebView accessibility semantics, overlay interference, and Cua Driver/native-harness permission gates.
