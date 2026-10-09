---
name: long-horizon-orchestrator
description: Run a set of long-running agent tasks to completion while the user is away. Launch each task as its own agent (T3 threads on any provider, Claude Code background subagents, or Codex subagents). Get woken automatically when a task finishes or blocks, launch dependent tasks once their prerequisites are merged, and have finished work reviewed, checked and merged into the branch the run started from. End with a plain-language report of what was built, open decisions and next steps. Use whenever the user wants several tasks run in parallel or overnight, asks you to launch, coordinate, chain or babysit agents or follow-up tasks, says "launch everything and merge it", or wants work to continue while they sleep or step away, even if they never say "orchestrate". If no task list exists yet, plan one first and get a single approval.
---

# Long-Horizon Orchestrator

You are the orchestrator. Task agents do the work. You own the plan, the order, the integration branch and the final report.

The user approves once, at the start. After that they should not need to return until the final report. In particular, never rely on them to tell you a task has finished. That is the failure this skill exists to prevent, so every launch comes with a wake-up path that reaches you on its own.

## Choose the host mode

Check which launch tools this session has, then read the matching reference before launching anything:

| Available tools | Mode | Read |
|---|---|---|
| T3 orchestration (`t3_thread_launch`, `t3_thread_send`, `schedule_task`) | One top-level T3 thread per task, on any provider | [references/host-t3.md](references/host-t3.md) |
| Claude Code `Agent` tool, without T3 | Background subagents in their own worktrees | [references/host-claude-code.md](references/host-claude-code.md) |
| Codex `spawn_agent` / `wait_agent`, without T3 | Subagents, each working in a worktree you create | [references/host-codex.md](references/host-codex.md) |

Prefer T3 when it is present. It can run tasks on any provider, binds each task to its own worktree, and its threads outlive this conversation.

If none of these tools exist, say so. Give the user ready-to-paste briefs instead of pretending to orchestrate.

## Route by home harness, real capacity and strengths

Read [references/routing.md](references/routing.md) before assigning providers. In short:

- **Home harness first.** Tasks run on the harness and model you are running on, unless a clear strength or the user says otherwise. Routing is settled in the contract.
- **Real capacity.** Check usage with `scripts/provider-usage`, and judge it against plan size, never by raw percentage. 30% left of a Max 20x plan and of a Plus plan are very different amounts of work. Count other active runs that share the same subscriptions.
- **Strengths are soft preferences.** Example: computer-use steps go to Codex when it has room. Prefer handing off just that step over moving the whole task.
- **Reasoning errs upward.** Never use low. Use medium only for very simple steps, high or extra high for real tasks, and Ultracode (Claude Code) or Ultra (Codex) for work that gains from parallel sub-agents. The multi-agent modes use up a usage window much faster than a single agent. Always set the level explicitly; never inherit a default.
- **Antigravity is a sparing helper, never a task agent.** Its fast Gemini Flash models, always at high reasoning, may take a few simple, fully specified steps that can be checked, within a small per-window budget. Never give it complex work, and never orchestration.
- **Quota pauses work; it never moves it.** You and every task stay on the subscription the contract assigned. When a 5-hour window runs out, the affected work pauses and resumes on the same thread after the reset, woken by a wake-up you schedule in advance. Never switch your own model, and never hand a task to another subscription, because of quota. A helper step that the brief allows is still fine.

## Workflow

### 1. Get the task list

- If the user supplied tasks or a planner portfolio, use them.
- Otherwise:
  - If `long-horizon-task-planner` is installed, run it to propose tasks.
  - If it isn't, apply its intent inline: tasks grounded in the current project, ready now, each one coherent objective with checks that prove completion.
- Draw the dependency graph. A task that needs another task's code starts only after that predecessor is merged. Group tasks into waves.
- Give each task an ID (A, B, C…) and a branch name.

### 2. Present the run contract and get one approval

Put everything the user might want to decide into one message, so nothing needs asking later:

- **Tasks:** one plain-language line each, with the waves and dependencies.
- **Per task:** host or provider, model and effort, branch, and exclusive resources such as test ports. Give the reason for any task not on the home harness.
- **Usage:** each subscription's current usage in plain words, any other active run sharing them ([references/routing.md](references/routing.md#2-measure-capacity-as-plan-size-times-room-left) shows how to find them), and what the run is expected to consume. Say that work pauses when a 5-hour window runs out and resumes after its reset, at what time if that is likely.
- **Integration branch:** the branch checked out where the run starts (`main`, `dev`, …).
  - Default policy: each task commits, gets an independent review, passes the full checks, and fast-forwards the integration branch itself. Nothing is pushed.
  - Alternative the user may choose: leave each task on its reviewed branch for the user to merge.
- **Blocked:** what makes a task stop without merging. Other tasks continue when one blocks. A check on the real screen that can't run (the screen is locked, or the app's window can't be captured) doesn't block a merge: the task merges on its other checks, and the report lists what still needs the user's eyes. The exception is a task whose main deliverable is that check.
- **Pre-flight items:**
  - uncommitted work the tasks depend on (new worktrees contain only committed work);
  - an integration checkout that isn't clean;
  - missing credentials or services;
  - **computer use:** if any task or helper step operates the real screen, remind the user to keep the Mac awake and unlocked for the whole run (automatic screen lock off, and don't lock it by hand), and to turn off Stage Manager, which hides windows from Codex's screen capture. Read the current settings first and say what you found ([references/routing.md](references/routing.md#computer-use-needs-the-screen)).
- **Estimate:** a rough duration, labelled as an estimate. Agent runs often finish much faster than planned.
- **Ledger:** where the ledger file will be.

Ask for approval once. If the user has already said to go ahead ("launch everything now"), treat that as approval and don't wait for a reply. Still post the contract as a chat message before the first launch. It is the user's record of what they agreed to, which models will run, and what the run will use of their subscriptions. The ledger doesn't replace it, because the user reads the chat, not the ledger.

After approval, do not ask the user anything. When a new decision comes up:
- If a reversible default is clearly within the contract, take it.
- Otherwise park the affected task and its dependents, and keep going with the rest.

Record each such decision for the final report.

### 3. Prepare

- Confirm the integration checkout: it is on the integration branch and has no tracked modifications. Record its path and HEAD.
- Create the ledger and the run directory (see below), and record the contract in the ledger.
- Record your own harness, model and reasoning level, read from the host rather than remembered (in T3, `t3_thread_configuration`). The report's charts need it.
- Allocate exclusive resources per task: unique test ports, temporary directories and branch names.
  - Never use the user's own dev-server ports.
  - Never stop processes you didn't start.

### 4. Launch the ready tasks

Before each wave, run `scripts/provider-usage` and confirm the routing still fits (see [references/routing.md](references/routing.md)). Then, for each task whose prerequisites are merged:
1. Write its brief from [references/task-brief.md](references/task-brief.md), and save it in the run directory.
2. Launch it as the host reference describes.
3. Record its IDs in the ledger, with the launch time taken from the host, and the model and reasoning level the host reports for it. Agents often don't know their own reasoning level.

Launch a whole wave together, then set up the backup wake-up the host reference calls for (for example the heartbeat in T3).

### 5. End the turn and wait to be woken

After launching, end your turn. You will be woken by one of:
- a task's report-back message;
- the host's completion notification;
- the heartbeat, which also covers a task that died without reporting;
- a resume wake you scheduled for just after a usage window resets.

Do not ask the user to check on tasks. Do not run short polling loops either: they burn context and tokens.

### 6. On every wake

1. **Re-read the ledger.** Your context may have been summarized since the last wake.
2. **Find out what changed and verify it at the source.**
   - Use `git log` of the integration branch and `git merge-base --is-ancestor <task head> <integration branch>`.
   - Check the task's thread or agent status and read its last message.
   - A report says what the task believes; git says what happened.
3. **Act.** Follow [references/integration.md](references/integration.md):
   - **Merged:** mark it done and launch any task this unblocked. Once the task has gone idle, remove its worktree and branch and tidy its entry in the host's task list (in T3, settle its thread).
   - **Ready but not merged** (the integration branch moved, the checkout is dirty, or the policy is to leave it on its branch): follow the integration reference.
   - **Blocked:** if the cause is mechanical and within the contract, such as a rebase conflict, a port clash or a flaky check, send the task a follow-up. Otherwise mark it blocked, park its dependents, and record the decision it needs.
   - **Paused by quota** (its provider's window ran out, so it stopped without reporting): leave it as it is, on its thread and worktree. Make sure a resume wake is scheduled, and after the reset continue it on the same thread, as [references/routing.md](references/routing.md#3-when-a-window-runs-short-or-runs-out) describes. This is not a failure, and the nudge that resumes it doesn't count as its one nudge.
   - **Silent** (idle, failed, cancelled or interrupted, with no report and no quota cause): read its last messages and act on them. Several tasks stopping at the same moment means the computer or the host restarted. Nudge each of them, and check that the run directory survived. If a task simply stopped, for example after a crash or a provider error, nudge it once. If the nudge fails as well:
     - and the task made no progress (no commits, nothing worth keeping), relaunch it once in a fresh thread and worktree, on the same provider. Then retire the old one: cancel its queued messages and tidy it away.
     - otherwise, mark it failed and keep its worktree for the user.

     Record each nudge and relaunch in the ledger.
4. **Check the home subscription's 5-hour window.** Take a usage snapshot and compare it with the last one. If the window is nearly used up, or will run out before the next heartbeat at its current pace, schedule the resume wake now, while you still can (see [references/routing.md](references/routing.md#3-when-a-window-runs-short-or-runs-out)).
5. **Update the ledger, then end the turn.** Write down every state change before ending, so the next wake starts from the truth.

Launching dependent tasks is your job, not the job of the task briefs. Keeping the chain in one place keeps the ledger accurate and lets you skip the dependents of a blocked task.

### 7. Finish

When every task is done, blocked or parked:

1. Wait for any merged task that is still running to go idle, and finish its cleanup. Then stop the heartbeat and any resume wake, and close or cancel any remaining agents.
2. Verify the end state:
   - the integration branch log;
   - nothing was pushed;
   - the integration checkout is clean;
   - every merged task's worktree and branch is removed, and its entry and its helper threads tidied;
   - unfinished tasks keep theirs and stay visible.
3. If the project has a quick main check, run it once on the integration branch.
4. Remove throwaway threads or worktrees you made along the way.
5. Take a final usage snapshot, and update the calibration in the owner's provider profile (see [references/routing.md](references/routing.md)).
6. Write the final report from [references/final-report.md](references/final-report.md), with its two Mermaid charts of how the run actually went (a dependency graph and a timeline), and **post it in the chat as your final message**. This applies to every ending: all tasks merged, some blocked or parked, or the run stopped early. A copy saved next to the ledger is for the record; the user reads the chat.
7. Set the ledger's status to `finished`.
8. If the host has a push-notification tool, send one line saying the run is finished.

### 8. When the user comes back

The user may answer open decisions, check something themselves, or ask for changes after reading the report. Keep the run's discipline for these:

- **A check the user did counts.** If a task was blocked only on a check the user has now done, record their result and let the task finish its merge gate.
- **Changes go to the task that owns the work.** For an unfinished task, send the request to its thread. For merged work, launch a small follow-up task. Make a change of a few lines yourself only if that is clearly simpler, and then run the full checks and the merge gate as a task would.
- **Close the loop.** Update the ledger, clean up as in step 7, and post the report again: the whole report, updated, with one line at the top saying what changed since the last one.

## Ledger

The ledger is a small Markdown file outside the repository, next to a run directory of the same name:

```
${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/long-horizon-orchestrator/<repo-name>-<YYYYMMDD-HHMM>.md
${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/long-horizon-orchestrator/<repo-name>-<YYYYMMDD-HHMM>/
```

The run directory holds everything else the run writes and needs later: briefs, task handoffs, logs you keep as evidence, and the saved copy of the final report. Never keep these in `/tmp`, which macOS clears on restart, and never link to `/tmp` from the report.

The ledger is your memory across context summaries, heartbeats and wakes. Its first line after the title is `Status: running`, `Status: paused until <time>` or `Status: finished`, so other runs can tell whether this one is still active. It holds:

- **Contract:**
  - the integration checkout path, branch and starting HEAD;
  - the merge policy;
  - the user's approval, quoted;
  - the port and resource allocation.
- **Orchestrator identity:** your own thread or session ID; your harness, model and reasoning level as the host reports them; and the IDs of the heartbeat and any resume wake.
- **One row per task:**
  - ID, title, dependencies;
  - host, provider, model and effort, as the host reports them after launch;
  - thread or agent ID, branch, worktree path, ports;
  - status (`pending`, `running`, `paused`, `merged`, `ready`, `blocked`, `failed`, `parked`);
  - launch and finish times taken from the host's timestamps, never estimated; merged commits; notes;
  - the harness, model and reasoning level of every agent that worked on it, including a relaunched attempt;
  - helper hand-offs (which harness, model and reasoning level, for what, how many times);
  - events such as follow-ups, nudges, relaunches, rebases, level changes, and quota pauses with when they began and when the tasks resumed. The final report's charts are drawn from these.
- **Usage snapshots:** from `scripts/provider-usage`, taken at the start, before each wave, on wakes near a limit and at the finish. Note other active runs sharing the subscriptions, and the reason for any task routed away from the home harness.
- **Decisions log:** what you decided on the user's behalf, and why.
- **Open decisions:** what the user still needs to decide, with the task that raised each one.

Update it on every state change. Mention its path in the contract message and in the final report.

## Principles

- **Verify, don't trust.** Check reports against git and thread state before acting on them or passing them on to the user.
- **One approval, then no interruptions.** The user approved a contract, not a conversation. Questions that arise go into the final report, unless every remaining task is blocked on the same answer. In that case, finish early and report.
- **Isolation by default.** Use a separate worktree for each writing task, exclusive ports and directories, and fast-forward-only merges. A task whose fast-forward fails rebases, re-validates and tries again.
- **Stay on the assigned subscriptions.** Running short of quota means waiting for a reset, never borrowing from another subscription. The user sized each subscription for its own work.
- **Never push, publish or force-update.** Never delete branches or worktrees the run didn't create. Read-only exploration of the user's other checkouts is fine.
- **Calibrate.** Record actual task durations in the ledger and report them, so future estimates improve.
