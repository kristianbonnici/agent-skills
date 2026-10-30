# long-horizon-orchestrator changelog

## 1.2.0 (2026-10-30)

The skill's first full review: its instructions by Codex GPT-6.1 Terra (safety), Claude Sonnet 5.5 (a whole run) and OpenCode DeepSeek V4.1 Flash (an open look); its scripts by Terra and OpenCode GLM-5.3 Flash. Every finding was checked against the files; the script fixes are by Claude Sonnet 5.5.
- **A run that the owner leaves at once still starts:** the warm-up schedules a wake before the admin block and runs its permission prompts in the background.
- **The finish can't strand the run:** the ledger is set finished, the heartbeat deleted and the notification sent before the report, which is the last message.
- **No task waits forever:** the finish counts `ready` tasks as done and parks their dependents; a dirty checkout is retried on later wakes; a task with no independent reviewer waits for one instead of merging unreviewed.
- **Stacks and stopped tasks:** under "leave on branch" a dependent starts from its predecessor's branch; a stopped task keeps its worktree.
- **The contract says what the run will do:** the one push (the owner's profile), the narrow-miss exception, a T3 thread per task, tasks at once and a `cpu` lease for builds.
- **Wakes check more:** the heartbeat is 15 minutes or less and checks approval prompts; every wake checks the heartbeat, the sampler and reserve tasks.
- **Hosts:** T3's current tool names and the launch's retry key; Codex's `fork_turns` and timeouts as full wakes; Claude Code's backup check always on, and command-line reviewers from a subagent.
- **The owner's settings:** screen lock, Stage Manager and Focus are in the snapshot and restored where possible.
- **Scripts:** `lease run` ends a command's whole process group and holds the lease until it has stopped, survives a stop at any moment, and refuses bad input; `--all` renewals take every slot; `provider-usage` can't stall on a half line and skips malformed log lines; the sampler's timeout covers a slow live reading, kills its children's group, records failed measures as gaps and keeps going after a write error; `run-charts` never shows a reset window as full until a real reading, skips malformed records and explains bad facts in one sentence; `report-offer`'s writes are bounded; the run map escapes the branch, head and status.

## 1.1.0 (2026-10-30)

- Every task passes the new `review-gate` skill instead of "fresh reviewer agents" of the task's own
  choosing; the contract shows each task's review level and reviewers, and counts the paid reviews in
  each subscription's expected use. Past runs used one to five reviewers per task with no stated rule
  ([review-gate's evidence](../review-gate/evidence.md)).
- The orchestrator says in the common file when Codex is short for reviews (weekly past about 80%,
  5-hour past about 85%, or a reviewer stopped by a limit), so tasks use the Claude substitute.
- OpenCode's free models may review where the review gate puts them; Gemini 4 Argon no longer takes
  advisory reviews (Gemini reviews were the weakest in past runs).
- The contract splits the review gate's trial reviewers, GPT-6 Luna and Claude Haiku 5.5, half and half across the standard and deep tasks.
- The ledger records this skill's and `review-gate`'s versions, so runs can be compared by version.
- A task whose review didn't converge stays `ready` with its open findings, and is never sent back to the merge gate; a conflict resolution that changed logic after the review goes back to the cross reviewer (from the gate's first review, by Codex's Terra).

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
