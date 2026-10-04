# Host: T3 Code

T3 runs every task as its own top-level thread, bound to its own worktree. A task can run on any enabled provider: Claude Code, Codex, OpenCode, Antigravity, and others. Threads outlive your conversation, and the user can open any of them to watch.

Tool names may carry a harness prefix such as `mcp__t3-code__t3_thread_launch`; their meaning is the same.

## Discover

Call `orchestrator_capabilities` once at the start. Its output can be large; if the harness saves it to a file, query it with `jq`:

```sh
jq -r '.parentThreadId' "$f"   # your own threadId: the orchestrator ID for report-backs
jq -c '.providers[] | {id: .providerInstanceId, ok: .canRunCrossProviderChildTask, constraints, models: [.models[].id]}' "$f"
jq -c '.providers[] | select(.providerInstanceId=="claudeAgent") | .models[] | {id, options: [.options[]? | {id, values: [.options[]?.id]}]}' "$f"
```

- **Providers:** use only those with no `constraints`.
- **Model options:** reasoning is passed as an option, and its name differs by provider: Claude uses `{"id": "effort", "value": "high"}`, Codex uses `{"id": "reasoningEffort", "value": "high"}`. Always set it explicitly, following [routing.md](routing.md), and use only values the catalog lists.
- **Record your `parentThreadId`** in the ledger. Every brief's report-back instruction needs it.

## Launch a task

```text
t3_thread_launch({
  title: "<task ID>: <short title>",
  workspaceStrategy: {type: "worktree", baseRef: "<integration branch>", branch: "<task branch>", startFromOrigin: false},
  modelSelection: {instanceId: "<provider>", model: "<model id>", options: [<reasoning option, see routing.md>]},
  runtimeMode: "full-access",
  message: "<the brief>"
})
```

- **Base on local commits.** With `startFromOrigin: false`, the worktree starts from local commits. Uncommitted changes are never copied, so commit anything the task needs first.
- **Select the workspace in this call.** Never ask a task to create its own worktree from the shell: T3's thread binding would not follow it.
- **Retries.** `t3_thread_launch` has no retry key. Keep the returned `threadId`. After an error or a lost response, check `t3_thread_list` for the title before launching again.
- **`runtimeMode`.** The task must run commands, commit and merge without approval prompts, so use `full-access` unless the contract says otherwise.

## Queue the goal

This applies to Claude Code (`claudeAgent`) and Codex (`codex`) tasks:

```text
t3_thread_send({threadId: "<task thread>", message: "<the /goal text>", mode: "queue", clientRequestId: "<run>-<task>-goal-v1"})
```

- **Queue it, don't steer it.** Queueing makes the goal its own turn, after the brief's first turn.
- **Confirm it took.** A short `t3_thread_read` later should show the goal was accepted ("Goal set: …"). If it was rejected for length, shorten it and send it again with a new `clientRequestId`.
- **Other providers** (OpenCode, Antigravity, …) get the brief alone. Their persistence comes from the brief's stop conditions.

## Report-back: how you get woken

Put this into every brief's "Report back" section, filled in:

```text
Call t3_thread_send with threadId "<orchestrator threadId>", mode "queue", clientRequestId "<run>-<task>-report-1" (increase the number if you report again), and this message:
[long-horizon-orchestrator] run=<run> task=<task> status=<...>
branch=<...> head=<...> integrated=<yes|no>
summary: <...>
If the t3_thread_send tool is not available but the environment variable T3_ACP_MCP_NODE is set, send the same call through:
ELECTRON_RUN_AS_NODE=1 "$T3_ACP_MCP_NODE" ${T3_ACP_MCP_ENTRYPOINT:+"$T3_ACP_MCP_ENTRYPOINT"} acp-mcp-call t3_thread_send '<the same arguments as JSON>'
```

A queued message to your idle thread starts a new turn. That turn is the wake-up. If you are busy, the message waits behind your current turn. Put the report-back into the goal condition too, so the goal evaluator won't mark the task finished until it has been sent.

## Heartbeat: a backup for silent tasks

A task can die without reporting: a provider crash, a hung command, or a lost goal. After launching the first wave, schedule a heartbeat that posts into your own thread:

```text
schedule_task({
  title: "<run> heartbeat",
  schedule: {type: "interval", everyMs: 1800000},
  bindToCurrentThread: true,
  clientRequestId: "<run>-heartbeat",
  prompt: "Heartbeat for long-horizon-orchestrator run <run>. Read the ledger at <path>. For each task marked running, check its thread with t3_thread_list or t3_thread_read. Act on anything that finished, blocked or went idle without reporting, as described in the skill's 'On every wake' step. If nothing changed, reply with one line."
})
```

- **Interval:** 20–45 minutes suits long tasks. Use the shorter end when only one or two tasks are running, because then few report-backs will wake you, and a dead task waits until the next tick. Shorter intervals mostly cost tokens.
- **Record it:** keep the returned ID in the ledger, and delete the heartbeat with `delete_scheduled_task` when the run finishes.

Every wake, not only a heartbeat, should check all running tasks. In testing, a crashed task was usually caught when another task's report woke the orchestrator.

## When a task's run fails

A crashed or provider-failed run leaves the thread with status `failed`. T3 then does not start the thread's queued messages, so a goal queued behind a failed first turn never runs, and the task sits silent.

1. **Nudge it once** with `t3_thread_send` in mode `"auto"`, which starts an idle thread. Say what failed, and ask it to continue the brief from the start of the thread.
2. **If the nudge fails too and the task made no progress,** relaunch it once with `t3_thread_launch`, using the same brief, a fresh branch name such as `<branch>-r2`, and a new goal. On the old thread:
   - remove anything still queued with `t3_queue_cancel`;
   - remove its worktree and branch if they hold nothing;
   - settle it.
3. **If the nudge fails and the task did make progress,** mark it failed instead. Keep its worktree, leave its thread active and unread, and name it in the report.

## Checking a task

- **`t3_thread_list`:** status of every thread.
- **`t3_thread_read`:** `view: "messages"` and a small `limit` give the last messages. Long results may be saved to a file; read the last items with `jq '.items[-3:]'`, and page through long texts with `itemId` and `textOffset`.
- **`t3_thread_wait`:** only for a short wait inside a turn, never as the main waiting mechanism. With a short `timeoutMs`, it is also the quickest way to see whether a task has gone idle before cleanup: an idle thread returns immediately. A report-back often arrives while the task's queued goal turn is still running.

## Following up with a task

To ask a task to rebase and retry, or to nudge it once:

```text
t3_thread_send({threadId, message, mode: "queue", clientRequestId: "<run>-<task>-followup-<n>"})
```

Use `queue` so the follow-up doesn't interrupt work in progress.

## When a provider runs out of quota

For the policy, see [routing.md](routing.md#3-when-a-provider-runs-short-or-runs-out). The mechanics:

- **A task's provider is exhausted:**
  1. Run `t3_queue_cancel` on the old thread, so its queued goal can't start when the quota resets.
  2. Launch the successor with `t3_thread_launch` on the new provider and model. Use `workspaceStrategy: {type: "existing_worktree", worktreePath: "<the task's worktree>", branch: "<the task's branch>"}` and a title like `"<task ID>: <title> (continued on <harness>)"`. Its message is the continuation brief.
  3. Queue a goal if the new provider supports one.
  4. Settle the old thread once the successor is running, and keep both thread IDs in the ledger.
- **Your own provider is nearly exhausted:**
  1. Call `t3_thread_configure` on your own thread (omit any `threadId`) with a model selection from a provider that has room. Task report-backs keep arriving, because the thread ID doesn't change.
  2. Delete the heartbeat and schedule it again, so it runs on the new provider too.
  3. Re-read the ledger first thing on the next wake. A different provider may not carry over the conversation, and the ledger has everything you need.

## Keeping the thread list honest

The user's active thread list should show only what still needs them. Use `t3_thread_organize`:

- **Your own thread:**
  - Pin it (omit `threadId`) when the first wave launches, so it's easy to find during the run.
  - Unpin it when the final report is written.
  - Never settle it. It holds the report, and the user settles it after reading.
- **A merged task:** settle its thread once you have verified the merge and removed its worktree. Settle it yourself rather than letting the task do it, because only you know the merge checked out. Its workspace no longer exists, and the transcript stays available in the settled list.
- **A task that isn't finished** (blocked, failed, parked or ready-but-not-merged): leave its thread active and `mark_unread` it, so the user's active list matches the report's "Not finished" section.
- **Throwaway probe threads you created, and superseded threads** (a failed attempt you relaunched): settle them.

Don't archive anything; settling is enough and easy to undo. A settled thread drops out of `t3_thread_list` by default. Track tasks by the thread IDs in the ledger, and unsettle a thread before sending it a follow-up.

## `delegate_task`: short work in your own checkout

`delegate_task` children notify you automatically on completion. Use them for short, read-mostly work you need to finish this step, such as an extra review or a research question. They aren't bound to their own worktree, so don't use them for parallel writing tasks in one repository.

## When the run finishes

1. Delete the heartbeat.
2. Confirm that every merged task's worktree is removed and its thread settled. Unfinished tasks keep their worktree and stay active and unread.
3. Unpin your own thread, and leave it active with the final report.
4. If any pull requests were created, link them with `link_pull_request`.
