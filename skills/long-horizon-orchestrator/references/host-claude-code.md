# Host: Claude Code

Without T3, Claude Code runs each task as a background subagent in its own git worktree. When a background subagent finishes, Claude Code notifies you automatically and starts a new turn. That notification is your wake-up.

## Launch a task

Launch a whole wave in one message, with one `Agent` call per task:

```text
Agent({
  description: "<task ID> <short title>",
  subagent_type: "general-purpose",
  isolation: "worktree",
  run_in_background: true,
  model: "<sonnet|opus|fable|haiku, as the contract says>",
  prompt: "<the brief>"
})
```

- **Start from the integration branch.** The worktree is created from your current HEAD, so make sure the integration checkout is on the integration branch and that anything the task needs is committed. Under "leave on branch", a task stacked on another starts with `git merge --ff-only <predecessor branch>` in its worktree, as its brief's first step; if that can't fast-forward (the integration branch moved since), `git reset --hard <predecessor branch>` instead, since the new worktree holds no work yet.
- **Use the reported branch.** The subagent gets its own branch, named only once it runs, so the brief says "your task branch is the one `git branch --show-current` prints in your worktree". Use the branch name it reports, and look up its path with `git worktree list`.
- **Reviews from a subagent.** A subagent can't launch agents of its own, so its brief says to run the review gate's reviewers with the command-line forms in review-gate's `references/launching.md`.
- **The brief alone.** As on every host, a task gets no `/goal` ([task-brief.md](task-brief.md#one-message-the-brief-no-goal)): the brief's stop conditions define the end, so state them sharply. Replace the brief's "Report back" section with: "End with the handoff as your final message. Its first line must be the `[long-horizon-orchestrator]` status line." That final message comes back to you.
- **Merging.** Under the merge policy, the subagent fast-forwards the integration checkout itself (`git -C <integration checkout> merge --ff-only <branch>`).
- **Worktree cleanup.** Claude Code removes a subagent's worktree automatically only when it has no changes, and a task with commits always has some. So once you have verified a merge, remove the worktree and delete the branch yourself, as [integration.md](integration.md) describes.

## Warm-up wake

Before posting the warm-up's admin block, create a one-shot `CronCreate` (`recurring: false`) about 10 minutes later, whose prompt says to read the ledger (it names the skill's folder), and if the warm-up still waits for the user, record what is missing, finish the rest of Prepare (the common file), and launch the first wave. Record its ID; delete it if the user answers first.

## Waiting and following up

- **Waiting:** end your turn after launching. Each subagent's completion arrives as a notification. Don't poll, and don't call blocking waits.
- **Following up:** to continue a finished subagent with its context, for example "rebase and retry the merge gate", use `SendMessage` with its agent ID or name. A new `Agent` call starts from scratch.
- **Backup check, always:** completion notifications fire when a subagent finishes or errors out, not when one hangs on an approval prompt or a command. So after the first wave, create a session-only recurring `CronCreate` job every 15 minutes or less (at an odd minute) whose prompt says to read the ledger, read the skill's `SKILL.md` from the folder the ledger names if its text is no longer in context, and do its "On every wake" step. Record its ID; it expires after 7 days. Delete it at the finish, just before posting the report.

## When the usage window runs out

You and every subagent share one Claude subscription, so its 5-hour window runs out for all of you at once. Policy: [routing.md](routing.md#3-when-a-window-runs-short-or-runs-out). Here:
- **Before it runs out,** schedule a one-shot `CronCreate` (`recurring: false`) for a few minutes after the reset, pinned to that local date and time. Its prompt says to re-read the ledger (and the skill's `SKILL.md` from the folder it names, if needed) and resume the paused tasks. Record its ID.
- **Subagents stopped by the limit** report as finished with an error. Leave their worktrees as they are. After the reset, continue each one with `SendMessage`, so it keeps its context: "Your usage limit has reset. Continue the brief from where you stopped."
- **Session-only.** Cron jobs live in this session. If the session closes, nothing resumes the run, so say so in the contract.

## Limits to state in the contract

- **The session has to stay open.** Background subagents live inside this session. If the terminal closes or the machine sleeps, they stop. Tell the user to keep the session open, and keep the machine awake yourself ([machine.md](machine.md#4-keeping-the-computer-awake)).
- **Long tasks.** A subagent lives inside this session and ends with its final message. For tasks expected to take many hours, recommend running them as T3 threads or separate top-level sessions instead, which keep their own conversation and can be continued on their own.
- **Claude models only.** `Agent` runs only Claude models. For other providers, prefer T3. As a fallback, a provider's CLI can run headless through `Bash` with `run_in_background` (for example `codex exec`), and its exit wakes you. Background commands time out after at most 2 hours, so this suits only shorter tasks.

## Workflows

If the user has opted into multi-agent workflows (for example by saying "ultracode", or when the session has Ultracode on), a `Workflow` script can express the waves deterministically. Otherwise use `Agent`, as above.

## At the end

In the skill's Finish order: if you have OrbOS's `offer_reading`, offer the report once, as a reading with its tour, through `scripts/report-offer` ([final-report.md](final-report.md#offer-it-to-listen-to-with-its-tour)). Then set the ledger to `finished`, delete the cron jobs you created, and send a `PushNotification` with one line saying the run is finished, if that tool is available. Post the final report as your final message last. A live tour, when the offer couldn't keep one, waits for the user to ask.
