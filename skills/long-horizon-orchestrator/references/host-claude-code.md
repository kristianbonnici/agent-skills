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

- **Start from the integration branch.** The worktree is created from your current HEAD, so make sure the integration checkout is on the integration branch and that anything the task needs is committed.
- **Use the reported branch.** The subagent gets its own branch. Use the branch name it reports, and look up its path with `git worktree list`.
- **No `/goal` for subagents.** The brief's stop conditions define the end, so state them sharply. Replace the brief's "Report back" section with: "End with the handoff as your final message. Its first line must be the `[long-horizon-orchestrator]` status line." That final message comes back to you.
- **Merging.** Under the merge policy, the subagent fast-forwards the integration checkout itself (`git -C <integration checkout> merge --ff-only <branch>`).
- **Worktree cleanup.** Claude Code removes a subagent's worktree automatically only when it has no changes, and a task with commits always has some. So once you have verified a merge, remove the worktree and delete the branch yourself, as [integration.md](integration.md) describes.

## Waiting and following up

- **Waiting:** end your turn after launching. Each subagent's completion arrives as a notification. Don't poll, and don't call blocking waits.
- **Following up:** to continue a finished subagent with its context, for example "rebase and retry the merge gate", use `SendMessage` with its agent ID or name. A new `Agent` call starts from scratch.
- **Backup check:** usually unnecessary, because completion notifications also fire when a subagent errors out. For extra safety on very long runs, a session-only `CronCreate` job (for example hourly at an odd minute) can re-read the ledger. It expires after 7 days. Delete it at the end.

## Limits to state in the contract

- **The session has to stay open.** Background subagents live inside this session. If the terminal closes or the machine sleeps, they stop, so tell the user to keep the session open and the machine awake.
- **No goal evaluator.** Subagents don't take `/goal`, so nothing makes them persist. For tasks expected to take many hours, recommend running them as T3 threads or separate top-level sessions instead.
- **Claude models only.** `Agent` runs only Claude models. For other providers, prefer T3. As a fallback, a provider's CLI can run headless through `Bash` with `run_in_background` (for example `codex exec`), and its exit wakes you. Background commands time out after at most 2 hours, so this suits only shorter tasks.

## Workflows

If the user has opted into multi-agent workflows (for example by saying "ultracode", or when the session has Ultracode on), a `Workflow` script can express the waves deterministically. Otherwise use `Agent`, as above.

## At the end

Send a `PushNotification` with one line saying the run is finished, if that tool is available. Then write the final report.
