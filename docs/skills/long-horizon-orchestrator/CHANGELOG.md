# long-horizon-orchestrator changelog

## 1.1.0 (2026-10-30)

- Every task passes the new `review-gate` skill instead of "fresh reviewer agents" of the task's own
  choosing; the contract shows each task's review level and reviewers, and counts the paid reviews in
  each subscription's expected use. Past runs used one to five reviewers per task with no stated rule
  ([review-gate's evidence](../review-gate/evidence.md)).
- The orchestrator says in the common file when Codex is short for reviews (weekly past about 80%,
  5-hour past about 85%, or a reviewer stopped by a limit), so tasks use the Claude substitute.
- OpenCode's free models may review where the review gate puts them; Gemini 4 Argon no longer takes
  advisory reviews (Gemini reviews were the weakest in past runs).
- The ledger records this skill's and `review-gate`'s versions, so runs can be compared by version.

## 1.0.0 (2026-10-30)

- First versioned release: the skill as it stood on 2026-10-30, after about 25 real runs. Earlier
  history is in `git log -- skills/long-horizon-orchestrator`.
- Includes that day's changes from the owner's review of the 2026-10-29 run:
  - the run map hatches a quota pause only on the lanes it stopped, never across the whole
    timeline or the usage panel; a task parked while paused keeps its pause to the pause's end;
  - the usage panel shows each used subscription's weekly (or monthly) window as the percent left,
    with a model's own limit (Gemini 4 Argon) dashed, no fills, and no 5-hour windows;
  - the run-time line counts as paused only a pause that stopped every task;
  - a task on a free model moves on when a limit stops it, between OpenCode's and Gemini's models
    and then to Codex's Terra or Claude Sonnet, without asking (task C waited 2h 15m and was parked).
