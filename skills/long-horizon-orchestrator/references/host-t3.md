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
- **Record your own settings.** `t3_thread_configuration` (no `threadId`) returns your provider, model and reasoning option. Copy them into the ledger for the report's charts.

## Name your own thread

The user may have several orchestrators in the thread list, and a thread's title is usually its first message, cut short. Once the contract is approved, read your title: `t3_thread_read` on your `parentThreadId`, with `limit: 1`, returns it as `thread.title`. If it doesn't say plainly which run this is, for example it is generic, a fragment of the request, or about something else, rename it:

```text
t3_thread_update({action: "rename", title: "Orchestrator: <project> · <what the run does>", clientRequestId: "<run>-rename"})
```

Omit `threadId`, so it renames your own thread. Keep the title short, such as `Orchestrator: lector · voice agent and settings`, and record it in the ledger. Leave a title that already says this alone. Rename only your own thread, never the user's other threads or another run's.

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
- **Record what actually launched.** Call `t3_thread_configuration` with the task's `threadId`, and record the provider, model and reasoning option it returns. Take the launch time from the thread's `createdAt` in `t3_thread_list`, not from your own estimate.
- **The brief is the only message.** Don't queue a `/goal` behind it, on any provider ([task-brief.md](task-brief.md#one-message-the-brief-no-goal)). A Claude Code task that ends its turn while its builds or reviewers run is woken when they finish.

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

A queued message to your idle thread starts a new turn. That turn is the wake-up. If you are busy, the message waits behind your current turn.

## Heartbeat: a backup for silent tasks

A task can die without reporting: a provider crash, a hung command, or a turn that ended before its work was done. After launching the first wave, schedule a heartbeat that posts into your own thread:

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
- **Model:** a scheduled run uses this thread's provider and model, which is one more reason never to switch your own model during a run.

Every wake, not only a heartbeat, should check all running tasks. In testing, a crashed task was usually caught when another task's report woke the orchestrator.

## Resume wake: after a usage window resets

The scheduler has no one-off schedule, so use a fixed-time schedule for the reset day and delete it once it has fired:

```text
schedule_task({
  title: "<run> resume after <provider> reset",
  schedule: {type: "fixed_time", timeOfDay: "<local HH:MM, about 5 minutes after resets_at>", weekdays: [<that day, 0 = Sunday>]},
  bindToCurrentThread: true,
  clientRequestId: "<run>-resume-<n>",
  prompt: "Resume wake for long-horizon-orchestrator run <run>: the <provider> 5-hour window has reset. Read the ledger at <path>. Continue every task marked paused on its own thread, check all other tasks as in the skill's 'On every wake' step, then delete this scheduled task."
})
```

- **Check the time.** Convert `resets_at` (UTC) to local time, and confirm that the returned `nextRunAt` falls just after the reset.
- **Record and remove it.** Keep its ID in the ledger, and delete it with `delete_scheduled_task` on the wake it causes, or at the finish.
- **Keep the heartbeat.** A tick while the window is empty fails without harm, and the first tick after the reset is a backup for the resume wake.

## When a task's run fails or is cancelled

A crashed or provider-failed run leaves the thread with status `failed`. A restart of the computer or of the T3 server cancels every run in progress, which leaves `cancelled` or `interrupted`. In each case T3 does not start the thread's queued messages, so a follow-up queued behind the stopped turn never runs, and the task sits silent. Several tasks stopping at the same moment points to a restart: nudge each of them. A task that stopped because its usage window ran out is different; see "When a window runs out" below.

1. **Nudge it once** with `t3_thread_send` in mode `"auto"`, which starts an idle thread. Say what happened, and ask it to continue the brief from where it stopped.
2. **If the nudge fails too and the task made no progress,** relaunch it once with `t3_thread_launch` on the same provider and model, using the same brief and a fresh branch name such as `<branch>-r2`. On the old thread:
   - remove anything still queued with `t3_queue_cancel`;
   - remove its worktree and branch if they hold nothing;
   - settle it.
3. **If the nudge fails and the task did make progress,** mark it failed instead. Keep its worktree, leave its thread active and unread, and name it in the report.

## Checking a task

- **`t3_thread_list`:** status of every thread.
- **`t3_thread_read`:** `view: "messages"` and a small `limit` give the last messages. Long results may be saved to a file; read the last items with `jq '.items[-3:]'`, and page through long texts with `itemId` and `textOffset`.
- **`t3_thread_wait`:** only for a short wait inside a turn, never as the main waiting mechanism. With a short `timeoutMs`, it is also the quickest way to see whether a task has gone idle before cleanup: an idle thread returns immediately. A report-back often arrives while the task's turn is still writing its final message.

## Following up with a task

To ask a task to rebase and retry, or to nudge it once:

```text
t3_thread_send({threadId, message, mode: "queue", clientRequestId: "<run>-<task>-followup-<n>"})
```

Use `queue` so the follow-up doesn't interrupt work in progress.

## After a verified merge

A task's turn usually ends with its final message, just after the report-back. It can go on when a background job it started finishes and wakes it, or when it decides on more checks. On the wake that verifies the merge:

1. **See whether it still runs:** `t3_thread_wait` with a short `timeoutMs` returns at once for an idle thread.
2. **If it runs, read its last messages.** Re-running checks, or retrying one it listed under "Couldn't check", is over: stop it now, as below, before any cleanup. Let a turn finish only when it does something still to come, such as a follow-up you sent; clean up on a later wake.
3. **Then the cleanup gate** in [integration.md](integration.md#cleanup-after-a-merge): its background jobs and its leases, then the worktree and the branch.
4. **Settle the thread and its helper threads** (below), including any fast-helper children it delegated.

## Stopping a task

- **A merged task that keeps working** (re-running checks, or retrying one it listed under "Couldn't check"): interrupt the turn with `t3_thread_interrupt`, and cancel anything still queued for it (`t3_queue_list`, `t3_queue_cancel`). If the thread has a goal set some other way, also queue `/goal clear` with `t3_thread_send` in mode `queue`, on the same wake: sent as a steer, it fails while a turn runs.
- **A task the user stops:** cancel its queued messages (`t3_queue_list`, `t3_queue_cancel`), interrupt it, save its unfinished work as a patch ([integration.md](integration.md#a-task-the-user-stopped)), remove its worktree, and settle its thread.

## When a window runs out

For the policy, see [routing.md](routing.md#3-when-a-window-runs-short-or-runs-out): work pauses and resumes on the same subscription. The mechanics:

- **A task stopped on quota:** leave its thread, queue and worktree alone. Schedule the resume wake. On the first wake after the reset, read the thread with `t3_thread_list`. If it isn't running again, send `t3_thread_send` in mode `"auto"`: "Your usage limit has reset. Continue the brief from where you stopped." The agent keeps its whole conversation, so it carries on where it was.
- **Your own window is nearly used up:** schedule the resume wake, update the ledger, and end your turn.
- **Never call `t3_thread_configure` on your own thread during a run.** In the first real run it went wrong in three ways:
  - the call ended the calling turn on the spot, so nothing after it ran, and T3 recorded the turn as failed;
  - the first switch didn't stick: the next heartbeat ran on the old model again;
  - each call left a record that stayed "running" forever, so the thread showed "Waiting on N background tasks" with a Stop button that couldn't clear it, until the T3 server restarted.

## Keeping the thread list honest

The user's active thread list should show only what still needs them. Use `t3_thread_organize`:

- **One thread per call.** `t3_thread_organize` takes a single `threadId`. A list passed in another field is ignored, and the call then acts on your own thread. In the 2026-10-12 run, that marked the orchestrator's thread to settle and left about 40 finished threads open. Check each result: a call on another thread returns a `sequence`, while `settlesWhenTurnEnds: true` means it hit your own thread. Afterwards, `t3_thread_list({settled: false, includeSubagents: true})` should list only the threads you meant to keep.
- **Your own thread:**
  - Pin it (omit `threadId`) when the first wave launches, so it's easy to find during the run.
  - Keep it pinned after the final report. The user unpins it after reading.
  - Never settle it. It holds the report, and the user settles it after reading.
- **A merged task:** settle its thread once you have verified the merge and removed its worktree. Settle it yourself rather than letting the task do it, because only you know the merge checked out. Its workspace no longer exists, and the transcript stays available in the settled list.
- **A task's helper threads:** reviewers, `delegate_task` children and other sub-agents get threads of their own. List them with `t3_thread_list({includeSubagents: true, limit: 100})` (paginate with `cursor`). Those with `relationshipToParent: "subagent"` and a `parentThreadId` that is a task's thread belong to that task. Settle the idle ones when you settle the task, and at the finish settle the idle helpers of unfinished tasks too. In the first real run, 27 helper threads were left for the end.
- **A task that isn't finished** (blocked, failed, parked or ready-but-not-merged): leave its thread active and `mark_unread` it, so the user's active list matches the report's "Not finished" section.
- **Throwaway probe threads you created, and superseded threads** (a failed attempt you relaunched): settle them.

Don't archive anything; settling is enough and easy to undo. A settled thread drops out of `t3_thread_list` by default. Track tasks by the thread IDs in the ledger, and unsettle a thread before sending it a follow-up.

## `delegate_task`: short work in your own checkout

`delegate_task` children notify you automatically on completion. Use them for short, read-mostly work you need to finish this step, such as an extra review or a research question. They aren't bound to their own worktree, so don't use them for parallel writing tasks in one repository.

For research and collection, a fast helper suits ([routing.md](routing.md#fast-helpers-antigravity-and-opencode)): give it `role: "research"`, the target and options from routing.md, and a prompt that says it is read-only. If it is limited (an error, or far slower than expected), `task_cancel` it and delegate the same prompt to the next helper. Settle its child thread once you've used its result.

## Another orchestrator's thread

When another run is active ([routing.md](routing.md#running-beside-another-orchestrator)), its ledger names its orchestrator thread. Write to it with `t3_thread_send` in mode `queue` and a `clientRequestId` such as `<run>-to-<other run>-<n>`. A queued message starts a turn there, so send only what the other run needs: the coordination note at the start, findings that affect it, and the word that you have finished. Never interrupt, configure or settle another run's threads, or send commands to them.

## When the run finishes

1. Delete the heartbeat and any resume wake. `list_scheduled_tasks` should show none of this run's schedules. Stop the keep-awake too.
2. Confirm that every merged task's worktree is removed and its thread and helper threads settled. Unfinished tasks keep their worktree and stay active and unread.
3. Gather the times for the report's timeline. For each task thread, and for your own thread, `t3_thread_read` with `limit: 1`, `maxCharsPerItem: 1` and `runLimit: 50` returns `recentRuns`, each turn with `startedAt`, `completedAt` and `status`. The sum of their durations is the task's worked time. Failed turns that ended together mark the start of a quota pause. The thread's `createdAt` is its launch time. All of these are in UTC; convert them to local time. If `runCount` is above 50, the oldest turns are missing, so say the worked time is a lower bound. A fast helper ([routing.md](routing.md#fast-helpers-antigravity-and-opencode)) can collect these for all the threads, which keeps the long results out of your context; check a few of its times against the ledger. Your own turns from the approval on give your worked time and wake count, for the facts file's `run`; the approval's time is in the ledger, and the run ends with the report. Write them into the facts file, and `scripts/run-charts` draws both charts ([final-report.md](final-report.md#run-charts)).
4. Post the final report as your last message in your own thread. Leave the thread pinned and active.
5. If any pull requests were created, link them with `link_pull_request`.
