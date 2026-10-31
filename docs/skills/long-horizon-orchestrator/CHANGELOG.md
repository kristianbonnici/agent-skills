# long-horizon-orchestrator changelog

## 2.0.0 (2026-10-31)

Major because the skill now deletes files on its own: a merged task's scratch folder, and, with the contract's approval, older runs' material (owner, 2026-10-31, after 21 run folders held 14.6 GB that another agent deleted by hand, and the week's 7 runs 4.4 GB more).
- **Tasks keep what can be made again in `scratch/`:** builds, downloads, other projects' source, intermediate renders, uncited traces and recordings; evidence stays beside it. "Delete what isn't evidence" was left to each task, and none did.
- **A merged task's `scratch/` is deleted in its cleanup,** with the new `scripts/prune-runs --scratch`; an unmerged task keeps it.
- **Older runs shrink to their write-ups:** `scripts/prune-runs` lists, and with `--apply` removes, everything but text files, `report/`, `stopped/`, `pictures/`, links and worktrees in runs finished over a week ago; a run holding `KEEP` stays whole. The contract names the total when it is over about 1 GB, and Prepare prunes once approved. On the week's 7 runs (with `--older-than 0`, before they were a week old) it would keep 0.3 GB of 4.4 GB.
- **The report says how big the run directory ended up,** and what pruning freed at the start.
- **Review (deep), round 1:** Codex GPT-6.1 Terra found 5 must-fixes, all fixed with tests: an unmerged task's scratch in an old run was pruned (the finish now puts `KEEP` in each unmerged task's folder, and any folder holding `KEEP` is left whole); the `pruned.txt` note could be written through a link; a folder swapped for a link between the plan and the removal could redirect a deletion (removals now go folder by folder from the root without following links); `--root` took any folder (it must be named `long-horizon-orchestrator`); partial failures were counted as freed. Claude Sonnet 5.5 found the same KEEP gap and nits; OpenCode DeepSeek V4.1 Flash (free) and Claude Haiku 5.5 (trial) each found one more must-fix: a task folder that was itself a git clone was removed with its handoff (now only its `.git` goes and its files are sorted like any task's; a clone a worktree was made from is kept whole), and the brief let tasks keep evidence over 10 MB that pruning then removed (it now goes in `evidence/`, kept whole). Nits fixed: only folders the removals emptied are removed; `--older-than nan` refused; `--scratch` refuses a link or report/; a first run with no state folder lists nothing instead of failing; the contract names every project's runs; host-t3's cleanup and finish checks name scratch and KEEP; a failed removal is recorded and the run goes on.
- **Round 2** (Terra, the fixes only, 3 must-fix, fewer than round 1's 7): KEEP, evidence/ or a clone a worktree was made from inside a folder that would go whole (a build, scratch) now keeps that folder from going whole, and `--scratch` leaves such a scratch alone; `--root` must be `agent-skills/long-horizon-orchestrator`, as the default is.
- **Round 3** (Terra, 2 must-fix, fewer again): `--root` is gone, so the script only ever works in the skill's own state folder (`$XDG_STATE_HOME/agent-skills/long-horizon-orchestrator`; checks set `XDG_STATE_HOME`); a `KEEP` that is a link to a folder protects too.

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
- **Reviews of this release:** the instructions went through five rounds (about 23, 7, 3, 2 and 1 must-fixes; the last fix is unreviewed); the scripts' lease through four (10, 4, 3, 0); the API credits through five (6, 5, 3, 1, then 2 small ones, so not fully converged: the incomplete-reading fix after round 5 is unreviewed, and two rare limits are written down in machine.md instead).
- **Claude API credits** (owner, 2026-10-30): `provider-usage` estimates the credits left from the owner's grants (`api-credits.json` beside the profile) less the API spend T3 logs for the `claudeAgent_claude_api` instance, soonest-expiring grant first; credits that would expire within about a week are used first for Claude work, and the usage panel and usage line show the dollars left.
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
