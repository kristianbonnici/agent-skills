# review-gate changelog

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
- Findings sorted must-fix, nit, pre-existing or rejected; re-review only after a logic fix, the fix's
  diff only, no repeats, at most three rounds; a fixed record format for later studies.
