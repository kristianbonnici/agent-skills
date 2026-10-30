# review-gate changelog

## 1.1.0 (2026-10-30)

- A round with no independent reviewer (each one and its replacement limited) doesn't merge: in an orchestrated run the task reports `ready` with "no reviewer available" and the gate runs again once a reviewer has room (from the orchestrator's first full review).
- A subagent that can't launch agents runs every reviewer by command line, Claude's too.
- Rounds stop when they stop converging instead of at a flat three: rounds 4 and 5 only while each round finds fewer must-fixes; a re-review reports a finding a fix didn't settle as "not fixed".

## 1.0.0 (2026-10-30)

- First release, from a study of 263 reviewed tasks in 21 orchestrated runs, Anthropic's account of
  its own code review, and a paper on verification in agent harnesses ([evidence.md](evidence.md)).
- Three levels by what a diff touches: light (docs, wording, styling), standard, deep (outside input,
  security, the user's files, processes, concurrency, release machinery, extra-high tasks).
- Reviewers of another family at high reasoning: Codex's GPT-6.1 Terra for Claude's changes, Claude
  Sonnet for others; Codex preferred but never required. OpenCode's free models review alone at light,
  join at deep, and stand in for the lost family when Codex is short; never in later rounds, never
  waited for. Gemini doesn't review.
- A replacement for a limited reviewer is never a model already reviewing that round; a timed-out reviewer is stopped before its replacement starts; in T3, the main reviewer's wait is the round's deadline.
- Trial reviewers (owner, 2026-10-30): GPT-6 Luna and Claude Haiku 5.5 add one cheap extra review in round 1 at Standard and Deep, recorded `trial=yes`, to learn whether cheaper models can take regular places.
- Findings sorted must-fix, nit, pre-existing or rejected; re-review only after a logic fix, the fix's
  diff only, no repeats; up to three rounds, then rounds 4 and 5 only while each round finds fewer must-fixes than the one before (owner, 2026-10-30, after the gate's own review went 7, 4, 2); a fixed record format for later studies.
