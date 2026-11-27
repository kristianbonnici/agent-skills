# Host: T3 Code

T3 runs every task as its own top-level thread, bound to its own worktree. A task can run on any enabled provider: Claude Code, Codex, OpenCode, Antigravity, and others. Threads outlive your conversation, and the user can open any of them to watch.

Tool names may carry a harness prefix such as `mcp__t3-code__t3_thread_launch`; their meaning is the same. When a T3 tool (`delegate_task`, `schedule_task`, `t3_thread_read`, any other) is missing from your tool list and `T3_ACP_MCP_NODE` is set, call it through `ELECTRON_RUN_AS_NODE=1 "$T3_ACP_MCP_NODE" ${T3_ACP_MCP_ENTRYPOINT:+"$T3_ACP_MCP_ENTRYPOINT"} acp-mcp-call <tool> '<its arguments as JSON>'`, with the same `clientRequestId`, before any command-line fallback.

## Discover

Call `orchestrator_capabilities` once at the start. Its output can be large; if the harness saves it to a file, query it with `jq`:

```sh
jq -r '.parentThreadId' "$f"   # your own threadId: the orchestrator ID for report-backs
jq -c '.providers[] | {id: .providerInstanceId, ok: .canRunCrossProviderChildTask, constraints, models: [.models[].id]}' "$f"
jq -c '.providers[] | select(.providerInstanceId=="claudeAgent") | .models[] | {id, options: [.options[]? | {id, values: [.options[]?.id]}]}' "$f"
```

- **Providers:** use only those with no `constraints`.
- **Model options:** reasoning is passed as an option, and its name differs by provider: Claude uses `{"id": "effort", "value": "high"}`, Codex uses `{"id": "reasoningEffort", "value": "high"}`, Antigravity uses `{"id": "thought_level", "value": "high"}` (Antigravity Claude defaults to `medium` and never exposes `"xhigh"`). Always set it explicitly, following [routing.md](routing.md), and use only values the catalog lists.
- **Record your `parentThreadId`** in the ledger. Every brief's report-back instruction needs it.
- **Record your own settings.** `t3_thread_configure` with no `threadId` and no `modelSelection` only reads, and returns your provider, model and reasoning option (older T3 builds call it `t3_thread_configuration`). Never pass `modelSelection` for your own thread ("When a window runs out", below). Copy them into the ledger for the report's charts.

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
  projectId: "<the integration checkout's T3 project, when your own thread is in another project>",
  workspaceStrategy: {type: "worktree", baseRef: "<integration branch; under 'leave on branch', a dependent's predecessor branch>", branch: "<task branch>", startFromOrigin: false},
  clientRequestId: "<run>-<task>-launch",
  modelSelection: {instanceId: "<provider>", model: "<model id>", options: [<reasoning option, see routing.md>]},
  runtimeMode: "full-access",
  message: "<the brief>"
})
```

- **Launch in the repository's project.** Without `projectId`, a thread is made in your own thread's T3 project, and the worktree is cut from that project's folder. When your thread belongs to another project, such as one for a parent folder that isn't a git repository, every launch fails ("Failed to resolve the VCS driver"). So before the first launch, compare your thread's project (`thread.projectId` from `t3_thread_read` on your `parentThreadId`) with the integration checkout's: `t3_project_list` and the entry whose `workspaceRoot` is the checkout's path. If they differ, pass that entry's `id` as `projectId` in every launch, and record it in the ledger.
- **Base on local commits.** With `startFromOrigin: false`, the worktree starts from local commits. Uncommitted changes are never copied, so commit anything the task needs first.
- **Select the workspace in this call.** Never ask a task to create its own worktree from the shell: T3's thread binding would not follow it.
- **Retries.** After an error or a lost response, call `t3_thread_launch` again with the same `clientRequestId`: it returns the thread already made instead of a second one. Keep the returned `threadId`.
- **A top-level thread per task.** T3 makes new top-level threads only when the user asks for them; the contract says each task runs in one, and the user's approval is that request.
- **`runtimeMode`.** The task must run commands, commit and merge without approval prompts, so use `full-access` unless the contract says otherwise.
- **Record what actually launched.** Call `t3_thread_configure` with the task's `threadId` and no `modelSelection`, and record the provider, model and reasoning option it returns. Take the launch time from the thread's `createdAt` in `t3_thread_list`, not from your own estimate.
- **Add it to `watch.json`** (SKILL.md, "Launch the ready tasks"): `worktree` and `branch` from `t3_thread_read` (`thread.worktreePath`, `thread.branch`), `harness` from the provider (`claudeAgent` is `claude-code`, `codex` is `codex`, any other its own name), `thread` the `threadId`, `launched` the `createdAt`. Leave `session` out: T3's thread data doesn't carry the provider's session, but T3 starts a Claude Code task's `claude` in its worktree with `--session-id=<id>` (and `--resume=<the same id>` after a restart), which names its log, `~/.claude/projects/<worktree path, every character but letters and digits as "-">/<id>.jsonl`; `run-watch` reads it from the process and remembers it. A Codex task's log is the rollout in `~/.codex/sessions` whose first line names the worktree; `run-watch` finds that too. An Antigravity task's conversation DB (`.db` and `.db-wal`) is mapped from its `thread` through T3's `statev2.sqlite` (`nativeThreadRef.nativeId`), giving `run-watch` activity and 20-minute `quiet` tracking (not per-call `hang`, `idle`, `approval`, or `report` lines; approval prompts on Antigravity rely on the heartbeat's T3 check below).
- **On another computer,** add its `environmentId` and its own `projectId` and model IDs, and base on the run branch: [computers.md](computers.md#7-launch-and-report-back).
- **The brief is the only message.** Don't queue a `/goal` behind it, on any provider ([task-brief.md](task-brief.md#one-message-the-brief-no-goal)). A Claude Code task that ends its turn while its builds or reviewers run is woken when they finish.

## Report-back: how you get woken

Put this into every brief's "Report back" section, filled in:

```text
Call t3_thread_send with threadId "<orchestrator threadId>", mode "queue", clientRequestId "<run>-<task>-report-1" (increase the number if you report again), and this message:
[long-horizon-orchestrator] run=<run, the ledger's name> task=<task> status=<...>
branch=<...> head=<...> integrated=<yes|no>
agent=<...> helpers=<...>
unchecked=<...>
prompts=<...>
summary: <...>
(each line as the brief's "Report-back message" describes)
If the t3_thread_send tool is not available but the environment variable T3_ACP_MCP_NODE is set, send the same call through:
ELECTRON_RUN_AS_NODE=1 "$T3_ACP_MCP_NODE" ${T3_ACP_MCP_ENTRYPOINT:+"$T3_ACP_MCP_ENTRYPOINT"} acp-mcp-call t3_thread_send '<the same arguments as JSON>'
```

For a task on another computer, the call also carries your own `environmentId`, and the task ends with the report as its final message, so you can read it there if the send fails ([computers.md](computers.md#7-launch-and-report-back)).

A queued message to your idle thread starts a new turn. That turn is the wake-up. If you are busy, the message waits behind your current turn.

## Heartbeat: a backup for silent tasks

A task can die without reporting: a provider crash, a hung command, or a turn that ended before its work was done. After launching the first wave, schedule a heartbeat that posts into your own thread:

```text
schedule_task({
  title: "<run> heartbeat",
  schedule: {type: "interval", everyMs: <900000, or 2100000 while the watcher runs>},
  bindToCurrentThread: true,
  clientRequestId: "<run>-heartbeat",
  prompt: "Heartbeat for long-horizon-orchestrator run <run>. Run <skill folder>/scripts/heartbeat <run directory> (adding --live while Antigravity tasks or heavy Antigravity reviews run, or when an Antigravity 5-hour window passed ~50% on the last reading) first, in one call. If it said 'nothing to act on', either no review-gate/helper reserve flag is active in <run directory>/briefs/common.md or none shows recovered below its threshold on the usage line, and your own subscription's weekly window isn't past ~95%, reply with its first line and end the turn: read nothing else. Otherwise read the ledger at <path> (it names the skill's folder; if you no longer have the skill's text, read its SKILL.md) and act on each line it printed (plus any recovered flag or ~95% own-week warning), as the skill's 'On every wake' step and references/run-watch.md say, reading with t3_thread_read only the threads of tasks it names and of tasks it calls blind. On a 't3-state unreadable' line, or the summary's 'read with the tools on <computer>', also read the running tasks' reviewers and helpers as references/host-t3.md's heartbeat section says."
})
```

- **An idle wake is one call.** `scripts/heartbeat` runs `run-watch`, reads the integration branch, the computer, the usage sampler's last readings (live when a running task's `model` in `watch.json` names Fable) and T3's own state database read-only, and adds its line to the ledger. `run-watch` flags an approval prompt (`approval`) and a silent task (`quiet`) for Claude Code and Codex tasks, and tracks Antigravity conversation DBs for `quiet`. The database gives every pending request on a running task's thread or any thread under it (reviewers, helpers, their children), which no task's own `pendingRequestCount` shows: `approval-task` or `approval-subagent <task> <thread> <kind> since HH:MM:SS (id <digest>)`. The heartbeat names `blind` tasks on every wake and is never idle while one runs. The one-call heartbeat is T3's only: Claude Code and Codex wakes still start with `run-watch`.
- **On an `approval-subagent` line,** tell its task, with `t3_thread_send` in mode `auto` (it steers a running turn and starts an idle one), naming that thread: "stop it with task_cancel (its taskId is in your delegate_task result) unless you already did, and relaunch it once with the same brief, which ends with the read-only line your rules give, where your rules allow a relaunch (a Neon call only while one is left in your count); if it is already a relaunch, it is limited: replace it as your rules say". Note the thread in the ledger, and send nothing again for a thread already noted. **On an `approval-task` line** with no child process running, interrupt the turn and tell the task how to finish without that command (SKILL.md, "On every wake" step 2).
- **The tool reads, only on a `t3-state unreadable` line or for another computer's tasks:** on each computer that runs one (its `environmentId` on every call), `t3_thread_list({includeSubagents: true, allProjects: true, settled: false, statuses: ['starting', 'running', 'waiting'], limit: 100})`, passing each page's `nextCursor` back as `cursor` until it is null; `t3_thread_read` each subagent whose `parentThreadId` is a running task's thread or one of that task's subagents, and (`limit: 1`) each running Antigravity task's thread. A `pendingRequestCount` above 0, or "Subagent needs approval", is a request nobody will answer: act on it as on the lines above. A task makes the same check itself while it waits on a reviewer or helper (review-gate's launching reference, and the "Help available" text).
- **Interval:** 15 minutes or less while tasks run, so an approval prompt or a dead task waits at most that long (the skill's principles). With the watcher running (below), the heartbeat is only its backup, for a dead watcher or a stuck host: 30 to 40 minutes. While nothing runs, waiting only for a reset, it may be longer.
- **Record it:** keep the returned ID in the ledger, and delete the heartbeat with `delete_scheduled_task` when the run finishes.
- **Model:** a scheduled run uses this thread's provider and model, which is one more reason never to switch your own model during a run.

Every wake, not only a heartbeat, should check all running tasks. In testing, a crashed task was usually caught when another task's report woke the orchestrator.

## The watcher: a wake only when there is something to act on

A Claude Code orchestrator (in T3 too) starts `<skill folder>/scripts/watch-wait <run directory> --max 6600` as a background command (`run_in_background: true`, `timeout: 7200000`), after the first wave and on every wake where it isn't running (`run-watch`'s `watcher` line; set `"watcher": "background"` in `watch.json` once). It runs heartbeat's checks every 5 minutes without model tokens, and exits, printing heartbeat's lines, once one has something actionable it hasn't delivered yet (ignoring `commit` lines alone and carrying them into the next real exit), or every 15 minutes while heartbeat names tasks to read with the tools (blind, or on another computer); the command's exit starts your next turn within seconds. Act on its lines as on heartbeat's, without running heartbeat again, then start it again: a lasting non-usage condition you can't clear yet (a quiet task, low disk) comes back every 30 minutes, while an already-delivered usage warning stays quiet until that window resets, recovers below its threshold, or crosses a new threshold or mark. Only one runs per run. An Antigravity or Codex orchestrator keeps the 15-minute heartbeat: a detached process can't wake its thread, since the credentials in a T3 turn's environment stop working when the turn ends (`acp-mcp-call` answered HTTP 401).

## Warm-up wake: when the user may leave before answering

Before posting the warm-up's admin block, schedule a fixed-time wake for about 10 minutes later, as the resume wake below is scheduled (its weekday the day it falls on, which past midnight is the next day), with the prompt: "Warm-up wake for long-horizon-orchestrator run <run>. Read the ledger at <path>; it names the skill's folder. If the warm-up is still waiting for the user, check what it can read without them, record what is missing, finish the rest of Prepare (the common file), and launch the first wave. Then delete this scheduled task." Record its ID in the ledger. If the user answers first, delete it then.

## Resume wake: after a usage window resets

The scheduler has no one-off schedule, so use a fixed-time schedule for the reset day and delete it once it has fired:

```text
schedule_task({
  title: "<run> resume after <provider> <window/bucket> reset",
  schedule: {type: "fixed_time", timeOfDay: "<local HH:MM, about 5 minutes after resets_at>", weekdays: [<that day, 0 = Sunday>]},
  bindToCurrentThread: true,
  clientRequestId: "<run>-resume-<n>",
  prompt: "Resume wake for long-horizon-orchestrator run <run>: the <provider> <window/bucket> window has reset. Read the ledger at <path>; it names the skill's folder, and if you no longer have the skill's text, read its SKILL.md. Verify the run's weekly budget for that bucket still has room (a reset does not refill a spent run budget), then continue every task marked paused on that window on its own thread (or spill/park instead if its weekly budget is spent), check all other tasks as in the skill's 'On every wake' step, then delete this scheduled task."
})
```

- **Check the time.** Convert `resets_at` (UTC) to local time, and confirm that the returned `nextRunAt` falls just after the reset.
- **Record and remove it.** Keep its ID in the ledger, and delete it with `delete_scheduled_task` on the wake it causes, or at the finish.
- **Keep the heartbeat.** A tick while the window is empty fails without harm, and the first tick after the reset is a backup for the resume wake.

## When a task's run fails or is cancelled

A crashed or provider-failed run leaves the thread with status `failed`. A restart of the computer or of the T3 server cancels every run in progress, which leaves `cancelled` or `interrupted`. In each case T3 does not start the thread's queued messages, so a follow-up queued behind the stopped turn never runs, and the task sits silent. Several tasks stopping at the same moment points to a restart: nudge each of them. A task that stopped because its usage window ran out is different; see "When a window runs out" below.

1. **Nudge it once** with `t3_thread_send` in mode `"auto"`, which starts an idle thread. Say what happened, and ask it to continue the brief from where it stopped.
2. **If the nudge fails too and the task made no progress,** relaunch it once with `t3_thread_launch` on the same provider and model, using the same brief and a fresh branch name such as `<branch>-r2`. First, on the old thread:
   - delete its review-gate and helper wakes if listed (titled `<task> review-gate wake` or `<task> helper wake`, bound to the old thread), and empty `<task>/helper-wake.txt`;
   - remove anything still queued: `t3_queue` with `action: "list"`, then `action: "cancel"` for each (older T3 builds: `t3_queue_list`, `t3_queue_cancel`).

   Then launch it, and on the old thread remove its worktree and branch if they hold nothing, and settle it.
3. **If the nudge fails and the task did make progress,** mark it failed instead, and delete its wakes as in step 2. Keep its worktree and name it in the report; settle its thread at the finish.

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
3. **Then the cleanup gate** in [integration.md](integration.md#cleanup-after-a-merge): its background jobs and its leases, then the worktree and the branch, then its `scratch/` folder and its harness temp folders (`scripts/prune-runs --harness-temp <worktree> <run directory>/<task ID> --apply`).
4. **Settle the task's own thread and any verified idle unsettled helpers it reported** (below): in T3, tasks settle their own idle reviewer and helper threads once finished or stopped, so you settle the task's own thread plus any helper or reviewer thread IDs its handoff lists as unsettled only after `t3_thread_read` (`limit: 1`) confirms each belongs to that task's lineage (`parentThreadId` traces to that task's thread, never another run's or your own thread) and is idle or terminal (record verified still-running ones in the ledger for a later wake or the finish sweep; ignore any ID that doesn't trace to the task and note it in the ledger; never call `t3_thread_interrupt` on a delegate).

## Stopping a task

- **A merged task that keeps working** (re-running checks, or retrying one it listed under "Couldn't check"): interrupt the turn with `t3_thread_interrupt`, and cancel anything still queued for it (`t3_queue`, `list` then `cancel`). If the thread has a goal set some other way, also queue `/goal clear` with `t3_thread_send` in mode `queue`, on the same wake: sent as a steer, it fails while a turn runs.
- **A task the user stops:** cancel its queued messages (`t3_queue`, `list` then `cancel`), interrupt it, delete its review-gate and helper wakes if listed (titled `<task> review-gate wake` or `<task> helper wake`, bound to its thread; the review-gate wake's ID in `<task>/review*/wake.txt`, the helper wake's in `<task>/helper-wake.txt`), save its unfinished work as a patch and keep its worktree ([integration.md](integration.md#a-task-the-user-stopped)), and settle its thread.

## When a window runs out

For the policy, see [routing.md](routing.md#3-when-a-window-runs-short-or-runs-out): short 5-hour windows pause and resume on the same thread, while weekly limits or budgets on a peer primary subscription may spill queued work or hand off a running task at most once. The mechanics:

- **A task stopped on a 5-hour quota:** leave its thread, queue and worktree alone. Schedule the resume wake. On the first wake after the reset, read the thread with `t3_thread_list`. If it isn't running again, send `t3_thread_send` in mode `"auto"`: "Your usage limit has reset. Continue the brief from where you stopped." The agent keeps its whole conversation, so it carries on where it was.
- **Your own window is nearly used up:** schedule the resume wake, update the ledger, and end your turn.
- **A Fable task whose Fable week ran out or passed the run's budget** continues on Opus 5.5 on its own thread ([routing.md](routing.md#when-the-fable-week-runs-out-or-passes-its-budget)). For the budget, stop its turn first with `t3_thread_interrupt` on its thread; the Fable limit stops it by itself. Either way, delete its review-gate and helper wakes if listed and empty `<task>/helper-wake.txt` and its `review*/wake.txt`, so no wake starts a turn on Fable before the switch; the continue message asks it to set new ones for a reviewer or helper still running. Once `t3_thread_read` shows it idle, update the ledger and set its model as the last call of your wake, since a switch of your own thread ends the calling turn and one of another thread isn't known not to:

  ```text
  t3_thread_configure({threadId: "<the task's thread>", modelSelection: {instanceId: "claudeAgent", model: "claude-opus-5-5", options: [{id: "effort", value: "<its effort>"}]}})
  ```

  On the next wake (the heartbeat brings it), read it back with `t3_thread_configure` and the `threadId` alone, and send the continue message in mode `"auto"` only once it shows Opus 5.5. If it still shows Fable, set it again as the last call of that wake and read it back on the next one. After the task's next turn starts, check its run's `model` in `t3_thread_read`; if it still ran on Fable, interrupt it and start again from the read-back. Record the switch in the ledger. The warning below is about your own thread, which you never switch.
- **A running task stopped by a weekly limit or weekly budget on a peer primary subscription** ([routing.md](routing.md#a-weekly-limit)): when the peer primary subscription has ample room and the task has not already moved once:
  1. Delete the old thread's review-gate and helper wakes first (`list_scheduled_tasks` on its computer, titled `<task> review-gate wake` or `<task> helper wake`, bound to its thread -> `delete_scheduled_task`) and empty `<task>/review*/wake.txt` and `<task>/helper-wake.txt`.
  2. Stop the predecessor and drain its delegates safely (**never call `t3_thread_interrupt` on a delegate**; only top-level threads accept it):
     - *On a run-budget stop (provider still has quota):* send the old thread a short stop message (`t3_thread_send` mode `"auto"`) telling it to stop editing, call `task_cancel` on every running reviewer/helper it launched, confirm each stopped via `task_status`, and stop; call `t3_thread_interrupt` on the top-level old thread if it does not stop promptly.
     - *On a quota stop (provider window empty):* list active subagents on the old thread (`t3_thread_list` with `includeSubagents: true`, `allProjects: true`, `settled: false`, `statuses: ['starting', 'running', 'waiting']`) and wait for running delegates with `t3_thread_wait` (within their deadlines). If a file-editing helper is still active and cannot be drained safely, mark the task `parked` rather than launching a second writer into the same worktree.
     - Settle finished child threads (`t3_thread_organize`) and stop or wait for leftover OS background jobs and leases ([integration.md](integration.md#cleanup-after-a-merge), steps 2 and 3).
  3. Clear anything still queued on the old thread (`t3_queue` with `action: "list"`, then `action: "cancel"`), then re-read `t3_thread_read` right before snapshotting to confirm the old thread is `idle`, its queue is empty, and zero subagents remain active (if a child completion woke the old thread during draining, interrupt the top-level thread, cancel any newly queued messages, and re-confirm `idle`).
  4. Save any uncommitted changes as a patch in `<run directory>` (`git -C <worktree> diff > <run directory>/<task>-handoff.patch`, or `add -A` + `diff --cached --binary` when launching a fresh worktree).
  5. Launch the successor with `t3_thread_launch` on the peer primary subscription (`modelSelection` from its catalog) in the same branch and worktree (`workspaceStrategy: {type: "existing_worktree", worktreePath: "<its worktree>"}`; or, where the host cannot reuse the worktree, a new worktree based on `<task branch>` on a handoff branch such as `<task branch>-handoff` with the saved patch applied) with a [continuation brief](task-brief.md#continuation-brief) (rewriting harness-specific helper sections for the new provider/model, preserving existing `<task>/review*/` files/rounds, keeping both authoring families when the review gate inspects the combined diff, and replacing worktree/branch paths when fresh).
  6. Update `<run directory>/watch.json`: preserve predecessor dollar tracking by keeping `"<task>-prev": {"thread": "<old thread>", "status": "stopped"}` (plus `"computer"` if on another computer — noting `run-charts` does not merge `<task>-prev` onto `<task>`, so give `<task>` the combined helpers list from both threads in `facts.json` and note the predecessor's cost beside it); update `<task>`'s `thread`, `harness`, `model`, `launched` (to the successor's launch time so `find_claude_log` cannot attach to an older log), and `worktree`/`branch` (if on a fresh handoff worktree), clearing stale `session` / `session_log`; run `scripts/run-watch <run directory> --forget-session <task>`, on the task's computer (over SSH for one `"machines"` reaches: its own copy and run directory there); it drops the remembered log under run-watch's lock, so no running check saves it back; settle the old thread (`t3_thread_organize`), and record the move (plus any old worktree/branch left for post-merge cleanup) in the ledger and report.
- **Never call `t3_thread_configure` with a `modelSelection` on your own thread during a run** (a call without one only reads). In the first real run a switch went wrong in three ways:
  - the call ended the calling turn on the spot, so nothing after it ran, and T3 recorded the turn as failed;
  - the first switch didn't stick: the next heartbeat ran on the old model again;
  - each call left a record that stayed "running" forever, so the thread showed "Waiting on N background tasks" with a Stop button that couldn't clear it, until the T3 server restarted.

## Keeping the thread list honest

Keep the user's thread list clear of this run's tasks. Use `t3_thread_organize`:

- **One thread per call.** `t3_thread_organize` takes a single `threadId`. A list passed in another field is ignored, and the call then acts on your own thread. Always pass `threadId`, and never call it without one during a run, since that means your own thread. At the finish, check the run's thread IDs as below.
- **Your own thread:**
  - Pin it (omit `threadId`) when the first wave launches, so it's easy to find during the run.
  - Keep it pinned after the final report. The user unpins it after reading.
  - Never settle it. It holds the report, and the user settles it after reading.
- **A merged task:** settle its thread once you have verified the merge and removed its worktree. Settle it yourself rather than letting the task do it, because only you know the merge checked out. Its workspace no longer exists, and the transcript stays available in the settled list.
- **A task's helper threads:** reviewers, `delegate_task` children and other sub-agents get threads of their own. In T3, tasks settle their own idle reviewer threads when `review-gate` ends (per `review-gate`, or directly if their copy of `review-gate` didn't settle them) and settle any non-review helper thread they delegated once finished or stopped (never while still running), via `t3_thread_organize({action: "settle", threadId: "<id>"})` (one thread per call, always passing `threadId` explicitly — never omitting it), listing any they could not settle in their handoff. On a verified merge, settle the task's own thread plus any helper or reviewer thread its handoff lists as unsettled only after `t3_thread_read` (`limit: 1`) confirms its `parentThreadId` traces to that task's thread (never another run's or your own thread) and that it is idle or terminal (record verified still-running ones in the ledger for a later wake or the finish sweep; ignore any ID that doesn't trace to the task and note it in the ledger; never call `t3_thread_interrupt` on a delegate). At the finish, still run the `t3_thread_list({settled: false, allProjects: true, includeSubagents: true, limit: 100})` (paginated, per computer with its `environmentId`) sweep as a safety net for crashed, stopped, unfinished, or older tasks: catch any remaining descendants with `relationshipToParent: "subagent"` whose `parentThreadId` traces to this run's tasks, your own thread, or any helper recorded in the ledger; if an unsettled subagent's `parentThreadId` is not in the unsettled list or ledger (for example, a child spawned under an already-settled helper), walk its ancestor chain (`t3_thread_read` with `limit: 1` on its `parentThreadId`, or `t3_thread_list({settled: true, allProjects: true, includeSubagents: true, limit: 100})` if many) so settled intermediate helpers still trace back to the run, record any leftover IDs in the ledger, and settle only idle or terminal ones belonging to this run.
- **A task that isn't finished** (blocked, failed, parked or ready-but-not-merged): settle its thread at the finish. Put what needs the owner in the report and the ledger; keep its worktree, `KEEP` and saved patch untouched.
- **Throwaway probe threads you created, and superseded threads** (a failed attempt you relaunched): settle them.

Don't archive anything; settling is enough and easy to undo. A settled thread drops out of `t3_thread_list` by default. Track tasks by the thread IDs in the ledger, and unsettle a thread before sending it a follow-up.

## `delegate_task`: short work in your own checkout

`delegate_task` children notify you automatically on completion. Use them for short, read-mostly work you need to finish this step, such as an extra review or a research question. They aren't bound to their own worktree, so don't use them for parallel writing tasks in one repository.

For research and collection, a fast helper suits ([routing.md](routing.md#fast-helpers-antigravity-and-opencode)): give it `role: "research"`, the target and options from routing.md, and a prompt that says it is read-only. If it is limited (an error, or far slower than expected), `task_cancel` it and delegate the same prompt to the next helper. Settle its child thread once you've used its result.

## Another orchestrator's thread

When another run is active ([routing.md](routing.md#running-beside-another-orchestrator)), its ledger names its orchestrator thread. A run told to start after another waits with nothing scheduled but one `once` backup wake (`schedule_task` with `schedule: {type: "once", runAt: "<UTC>"}`): the run ahead's start message wakes it. Write to it with `t3_thread_send` in mode `queue` and a `clientRequestId` such as `<run>-to-<other run>-<n>`. A queued message starts a turn there, so send only what the other run needs: the coordination note at the start, findings that affect it, and the word that you have finished. Never interrupt, configure or settle another run's threads, or send commands to them.

## When the run finishes

1. Stop the keep-awake. Keep the heartbeat until step 7, so a turn that dies while you prepare the report is woken again.
2. Confirm that every merged task's worktree, `scratch/` folder and harness temp folders are removed (`scripts/prune-runs --harness-temp` with every task's worktree and `<run directory>/<task ID>` lists what is left). Unfinished tasks keep their worktree, `KEEP` and saved patch. Settle any remaining task threads and any unsettled helper threads (from unfinished or crashed tasks, or any a task's handoff listed as unsettled). Leave your own thread pinned and unsettled; verify nothing remains unsettled in step 7.
3. Gather the times for the report's timeline. For each task thread, and for your own thread, `t3_thread_read` with `limit: 1`, `maxCharsPerItem: 1` and `runLimit: 50` returns `recentRuns`, each turn with `startedAt`, `completedAt` and `status`. The sum of their durations is the task's worked time. Failed turns that ended together mark the start of a quota pause. The thread's `createdAt` is its launch time. All of these are in UTC; convert them to local time. If `runCount` is above 50, the oldest turns are missing, so say the worked time is a lower bound. A fast helper ([routing.md](routing.md#fast-helpers-antigravity-and-opencode)) can collect these for all the threads, which keeps the long results out of your context; check a few of its times against the ledger. Your own turns from the approval on give your worked time and wake count, for the facts file's `run`; the approval's time is in the ledger, and the run ends with the report. Write them into the facts file, keeping each thread's turns as its `turns`, and `scripts/run-charts` draws the run map and both charts ([final-report.md](final-report.md#the-runs-facts)).
4. Show the run map: pass `run-map-t3.html`, as `run-charts` wrote it, to `html_preview` once and then to `html_render` ([final-report.md](final-report.md#run-map)).
5. If you have OrbOS's tools, offer the report once, with its tour, just before posting it: run `scripts/report-offer` on the facts file and the saved report with `--pictures <run directory>` (and `--harness codex` when you are Codex), and it offers them through OrbOS's own command; only if it says `not offered`, call `offer_reading` yourself ([final-report.md](final-report.md#offer-it-to-listen-to-with-its-tour)). Your thread runs at the project's root, so pass `--repo` with the integration checkout.
6. If any pull requests were created, link them with `link_pull_request`.
7. Before posting, run the safety-net sweep with `t3_thread_list({settled: false, allProjects: true, includeSubagents: true, limit: 100})` (paginate with `cursor`, once per computer with its `environmentId`) to catch any unsettled task thread in the ledger and any leftover unsettled descendant thread whose `parentThreadId` traces to this run's tasks, your own thread, or any helper recorded in the ledger (from unfinished, crashed, or older tasks, or failed task-side settlements). If any unsettled `relationshipToParent: "subagent"` thread has a `parentThreadId` absent from both the unsettled list and the ledger (for example, a child spawned under an already-settled helper), walk its ancestor chain (`t3_thread_read` with `limit: 1` on its `parentThreadId`, or `t3_thread_list({settled: true, allProjects: true, includeSubagents: true, limit: 100})` if many) so settled intermediate helpers still trace back to this run. Record any leftover helper IDs in the ledger and settle every idle or terminal thread belonging to this run (one thread per call, always passing `threadId`), excluding your own thread and other runs (and never settling a thread that is still running). Recheck and retry a failed settlement once; if any remain, record them in the ledger and report as a side effect. As the skill's Finish says: set the ledger to `finished`, delete the heartbeat, any resume wake, any second-opinion wake, and any task's review-gate or helper wake still there (titled `<task> review-gate wake` or `<task> helper wake`, bound to the task's thread; list each computer's with its `environmentId`; `list_scheduled_tasks` should then show none of this run's schedules), and send the push notification. The report is your last message; a live tour, when the offer couldn't keep its tour, waits for the user to ask.
8. Post the final report as your last message in your own thread, without the Mermaid charts. Leave the thread pinned and active.
