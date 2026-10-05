# Host: Codex

Without T3, Codex runs each task as a subagent through its multi-agent tools. This needs the `multi_agent` feature, which is on by default in current versions; `codex features list` shows it. The tools are:
- `spawn_agent`;
- `wait_agent`;
- `send_input`;
- `close_agent`;
- `resume_agent`.

A newer variant may expose `followup_task`, `send_message` and `list_agents` instead. Use whichever the session lists.

## Worktrees: create them yourself

Codex subagents share your working directory. Parallel writing tasks would collide, so create one worktree per task before spawning it, outside the repository directory:

```sh
git worktree add "<repo parent>/<repo>-worktrees/<task branch>" -b <task branch> <integration branch>
```

Put that path in the brief's constraints: "Work only in `<path>`; run every command there."

You created these worktrees, so you remove them. Once a merge is verified, call `close_agent` on its subagent, then remove the worktree and branch as [integration.md](integration.md) describes.

## Launch a task

```text
spawn_agent({
  task_name: "<task_id_lowercase>",
  message: "<the brief>",
  fork_context: false,
  model: <omit unless the contract names one>,
  reasoning_effort: <omit unless the contract names one>
})
```

- **Fresh context.** Use `fork_context: false`, so the task starts from the brief alone and not from your conversation.
- **No `/goal` for subagents.** Their brief's stop conditions define the end. Replace the brief's "Report back" section with: "End with the handoff as your final message. Its first line must be the `[long-horizon-orchestrator]` status line."
- **Concurrency.** Sessions have a limit on concurrent agents (`max_concurrent_threads_per_session`), so keep each wave within it. Finished agents count toward the limit until closed: call `close_agent` once you have handled a result.

## Staying in control

A Codex orchestrator should keep its own turn going instead of ending it and hoping to be woken:

1. **Give yourself a goal.** After the user approves the contract, set a goal of your own:
   `/goal Every task in the ledger at <path> is merged, ready, blocked, parked or failed, the ledger is up to date, and the final report has been posted in the chat.`
   If you can't run `/goal` yourself, put the exact line in the contract message for the user to send along with their approval.
2. **Wait in a loop.** Call `wait_agent` on all running task IDs with the longest allowed timeout. Each return means at least one task reached a final status: handle it as described in "On every wake", launch anything it unblocked, then wait again on the remaining tasks.
3. **On a timeout,** re-read the ledger and wait again. A timeout is not a failure.

Codex also delivers a final-status notification for completed agents. Verify on first use whether that notification starts a new turn for an idle orchestrator. Until it is confirmed, rely on the `wait_agent` loop under your own goal.

## Following up

`send_input` (or `followup_task`) continues a task with its context, for example "rebase onto `<integration branch>`, re-validate and retry the merge gate". Use `resume_agent` if you have already closed it.

## When the usage window runs out

You and every subagent share one Codex subscription. Policy: [routing.md](routing.md#3-when-a-window-runs-short-or-runs-out). Codex has no scheduler to wake you after a reset, so:
- **Pause, don't move.** When the 5-hour window is nearly used up, record in the ledger which tasks are paused and when the window resets, and leave their worktrees as they are.
- **Resume after the reset** with `send_input` (or `followup_task`) on each paused agent, so it keeps its context. If your own turn ended because of the limit, the run continues only when the session is resumed. Say this in the contract, with the likely reset time.

## Limits to state in the contract

- **The session has to stay open.** Subagents live inside this Codex session, so it must stay running and the machine awake.
- **No wake-up after a usage reset.** If the window runs out, the run pauses until the session is resumed.
- **OpenAI models only.** Subagents run models available to Codex. For Claude, Antigravity or OpenCode tasks, prefer T3.
