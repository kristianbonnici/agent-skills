---
name: long-horizon-orchestrator
description: Run a set of long-running agent tasks to completion while the user is away. Launch each task as its own agent (T3 threads on any provider, Claude Code background subagents, or Codex subagents). Get woken automatically when a task finishes or blocks, launch dependent tasks once their prerequisites are merged, and have finished work reviewed, checked and merged into the branch the run started from. End with a plain-language report of what was built and what needs the user. Use whenever the user wants several tasks run in parallel or overnight, asks you to launch, coordinate, chain or babysit agents or follow-up tasks, says "launch everything and merge it", or wants work to continue while they sleep or step away, even if they never say "orchestrate". If no task list exists yet, plan one first and get a single approval.
metadata:
  version: 5.9.1
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

T3 can also run a task on another of the owner's computers linked to it, to keep the daily one free or spare a weak one; the contract names each task's computer and why. Read [references/computers.md](references/computers.md) before placing a task there: discovery, pre-flight, how briefs and commits travel, and what you can't watch there. Claude Code and Codex hosts run every task on your own computer.

If none of these tools exist, say so. Give the user ready-to-paste briefs instead of pretending to orchestrate.

## Route by home harness, real capacity and strengths

Read [references/routing.md](references/routing.md) before assigning providers: it names every model, helper, limit and budget. The rules it builds on:

- **Home harness first.** Tasks run on the harness and model you are running on, unless a clear strength or the user says otherwise. Routing is settled in the contract.
- **Real capacity.** Check usage with `scripts/provider-usage`, and judge it against plan size, never by raw percentage. 30% left of a Max 20x plan and of a Plus plan are very different amounts of work. Count other active runs that share the same subscriptions.
- **Strengths are soft preferences.** Example: computer-use steps go to Codex when it has room. Prefer handing off just that step over moving the whole task. Hand off as often as it genuinely helps, with no fixed count, but only for work the helper is better at, or, for the fast helpers below, research and simple steps that save the task agent's context.
- **On Claude, Opus does the tasks, complex ones included; Fable is rare.** A task gets Fable only when the contract can say why Opus would probably fall short and Fable would clearly do better; most runs have none. Never for helpers, reviewers, fix-ups, later milestones or your own thread unless the owner set it.
- **A Fable second opinion for your hardest decisions.** Before posting the contract, before a task whose review didn't converge waits for the owner, and before parking or relaunching a task blocked for a reason that isn't mechanical, ask Fable one bounded, read-only question, within the count and budget the contract gives. It advises; you decide and record both ([references/routing.md](references/routing.md#a-fable-second-opinion-for-your-own-decisions)).
- **Reasoning: medium for bounded work, high for demanding work.** Never use low. Use extra high only when you see a real benefit from the extra thinking, and name it in the contract. Use a harness's multi-agent mode sparingly, only when the task clearly gains from parallel sub-agents, name that gain in the contract, and give the brief a lane cap. Always set the level explicitly; never inherit a default ([references/routing.md](references/routing.md#reasoning-level-medium-for-bounded-work-high-for-demanding-work)).
- **Helpers work inside tasks.** Fast, low-cost models take research, retrieval and simple, fully specified steps; a stronger one takes bounded harder sub-tasks, within a budget. The agent that asked checks what they return. They are never merge gates or orchestrators, task agents only when the user asks for it, and reviewers only where the `review-gate` skill puts them.
- **Quota pauses work; it never moves it.** You and every task stay on the subscription the contract assigned. When a 5-hour window runs out, the affected work pauses and resumes on the same thread after the reset, woken by a wake-up you schedule in advance. Never switch your own model, and never hand a task to another subscription, because of quota. Only four kinds of work move when a limit stops them, each as [references/routing.md](references/routing.md#3-when-a-window-runs-short-or-runs-out) says: a helper's, to the next helper; a whole task given to a free or low-cost model, along that pool and then to a paid model, without asking; a Fable task whose Fable week or budget is used, to Opus on the same subscription and its own thread; and Claude work between the Claude subscription and the owner's Claude API credits, only as the contract allows.

## Workflow

### 1. Get the task list

- If the user supplied tasks or a planner portfolio, use them.
- Otherwise:
  - If `long-horizon-task-planner` is installed, run it to propose tasks.
  - If it isn't, apply its intent inline: tasks grounded in the current project, ready now, each one coherent objective with checks that prove completion.
- Split a task that will change more than about 800 lines into milestones that each pass the review gate and merge on their own, the first one a thin working version of the feature, so a later stop holds back only the last slice and dependents build on merged code. The brief lists the milestones and asks for the first; once one merges (under "leave on branch", once it is `ready`, and the next goes on a branch stacked on it, `<task branch>-m<n>`, so a dependent can be based on the ready one), send the next to the same thread as a follow-up. Each report names its milestone (`task=B milestone=1/3`); the task stays `running` until its last one merges, with each merge an event in the ledger.
- Draw the dependency graph. A task that needs another task's code starts only after that predecessor is merged, or only the milestone it needs. Group tasks into waves.
- If the user wants the run to use up an allowance ("most of this week's usage"), size the list for it now: add a ranked reserve of extra tasks to the contract. Launch reserve tasks while the run is going, as places free up, and never after the final report.
- Give each task an ID (A, B, C…) and a branch name.

### 2. Present the run contract and get one approval

Put everything the user might want to decide into one message, so nothing needs asking later. Write it from [references/contract.md](references/contract.md), which lists every part: the tasks and their waves, how tasks run and how many at once, each task's provider, model, effort and review level, usage and the run's budgets, another active run, the integration branch and merge policy, what blocks a task, pre-flight items, permissions and the computer, older runs to shrink, the estimate and the ledger. It also says when to ask for a second opinion on the plan before you post it.

Ask for approval once. If the user has already said to go ahead ("launch everything now"), treat that as approval and don't wait for a reply. Still post the contract as a chat message before the first launch. It is the user's record of what they agreed to, which models will run, and what the run will use of their subscriptions. The ledger doesn't replace it, because the user reads the chat, not the ledger.

After approval, do not ask the user anything. When a new decision comes up:
- If a reversible default is clearly within the contract, take it.
- Otherwise park the affected task and its dependents, and keep going with the rest.

Record each such decision for the final report.

A message from the user during the run amends the contract. Quote it in the ledger with its time, and act on it: it may widen the scope, move a task to another provider, or override a default of this skill. Don't ask them to confirm what they already said, and don't take it as an opening for other questions; the rest of the contract stands. Name each amendment in the report. A pause they ask for (to move or close a computer), and continuing after it, go in the order [references/integration.md](references/integration.md#a-pause-the-owner-asks-for) gives.

### 3. Prepare

After the approval and before the first launch, do every step of [references/prepare.md](references/prepare.md), in its order: confirm the integration checkout; create the ledger and the run directory; record who you are and which versions of the skills run; allocate each task's ports and folders; snapshot the user's own state and set up the leases; keep the computer awake; start the usage sampler; write `<run directory>/watch.json`, which `scripts/run-watch` and `scripts/heartbeat` read on every wake; run the warm-up while the user is still there, with a wake set up first so that it can't hold up the run; and write the common file every brief points to.

### 4. Launch the ready tasks

Before each wave, run `scripts/provider-usage` and confirm the routing still fits (see [references/routing.md](references/routing.md)). Then, up to the contract's limit on tasks at once, for each task whose prerequisites are merged (under "leave on branch", `ready` because of that policy, not for a review that didn't converge or found no reviewer; for a prerequisite split into milestones, the milestone it needs), and then the next reserve task:
1. Write its brief from [references/task-brief.md](references/task-brief.md), and save it in the run directory.
2. Launch it as the host reference describes.
3. Record its IDs in the ledger, with the launch time taken from the host, and the model and reasoning level the host reports for it. Agents often don't know their own reasoning level. Add it to `<run directory>/watch.json` too: `"<task ID>": {"worktree", "harness" ("claude-code", "codex" or the provider's name), "session" or "session_log" when the host reference says to, "thread" (its thread or agent ID), "branch", "launched", "model", "status": "running"}`, and `"computer"` for a task on another computer. Set its `status` there (`ready`, `merged`, `paused`, …) whenever it stops running, so `run-watch` stops judging it.

Launch a whole wave together, then set up the backup wake-up the host reference calls for (for example the heartbeat in T3), and confirm it is scheduled: in T3, `list_scheduled_tasks` shows it enabled, with its next run within the interval.

### 5. End the turn and wait to be woken

After launching, end your turn (on Codex, keep it open and wait on the agents instead, as [references/host-codex.md](references/host-codex.md) describes). You will be woken by one of:
- a task's report-back message;
- the host's completion notification;
- the heartbeat, which also covers a task that died without reporting;
- a resume wake you scheduled for just after a usage window resets.

Do not ask the user to check on tasks. Do not run short polling loops either: they burn context and tokens.

### 6. On every wake

1. **Re-read the ledger.** Your context may have been summarized since the last wake.
2. **Find out what changed and verify it at the source.**
   - On a heartbeat, run `<skill folder>/scripts/heartbeat <run directory>` first: one call for run-watch, the integration branch, the computer and usage, which adds its line to the ledger. When it says "nothing to act on", reply with its line and end the turn: an idle wake is that one call. Otherwise act on the lines it prints, as below, and read a task's thread only for a task it names.
   - On other wakes, run `<skill folder>/scripts/run-watch <run directory>` first (a few seconds; files and processes only) and act on each line it prints. Nothing printed means nothing to act on.
   - [references/run-watch.md](references/run-watch.md) says what each kind of line means and what to do about it (`hang`, `idle`, `approval`, `quiet`, `hog`, `disk`, `swap`, `dialog`, `keep-awake`, `sampler`, `vm`, `slept`, `commit`, `merged`, `report`, `blind`, `note`). Read it whenever a line appears and you don't have its instructions in front of you, so again after a context summary, and always before you stop a process: a `hang` or `idle` line alone doesn't prove a task is stuck.
   - Use `git log` of the integration branch and `git merge-base --is-ancestor <task head> <integration branch>`.
   - For a task a line names, one that reported, or one `run-watch` can't read (`blind`), check the task's thread or agent status and read its last message, and whether it waits on an approval prompt (in T3, `pendingRequestCount` from `t3_thread_read`): a running task with a pending request and no child process running is stuck on one, so interrupt the turn and tell it how to finish without that command.
   - A report says what the task believes; git says what happened.
3. **Act.** Follow [references/integration.md](references/integration.md):
   - **Merged:** verify the head of its latest report, mark it `merged` (a milestone that isn't its last: keep the task `running`, send the next milestone to its thread, and leave the cleanup until the last merges) and launch any task this unblocked (after a split, not one that needs the code it kept back). Record its open review follow-ups ([references/integration.md](references/integration.md#follow-up-findings)) and any blocker a reviewer held on ([references/integration.md](references/integration.md#a-reviewer-that-held-on-its-blocker)). Then clean up, only once the task and everything it started have stopped, in the order [references/integration.md](references/integration.md#cleanup-after-a-merge) gives: stop a turn that outlived the report, check for background jobs, then for leases it holds, then remove its worktree and branch, tidy its entry in the host's task list (in T3, settle its thread), delete its `scratch/` folder with `scripts/prune-runs --scratch`, and its harness temp folders with `scripts/prune-runs --harness-temp <worktree> <run directory>/<task ID> --apply`. Settling a thread or closing an agent doesn't stop the jobs it started, so if anything still runs, clean up on a later wake.
   - **Ready but not merged** (the integration branch moved, the checkout is dirty, the policy is to leave it on its branch, one check missed narrowly, or its review didn't converge): follow the integration reference.
   - **Blocked:** if the cause is mechanical and within the contract, such as a rebase conflict, a port clash or a flaky check, send the task a follow-up. Otherwise ask Fable for a second opinion while one is left ([references/routing.md](references/routing.md#a-fable-second-opinion-for-your-own-decisions)), and act on it where the contract allows; else mark it blocked, park its dependents, and record the decision it needs.
   - **Paused by quota** (its provider's window ran out, so it stopped without reporting): a Fable task stopped by Claude's Fable week continues on Opus instead ([references/routing.md](references/routing.md#when-the-fable-week-runs-out-or-passes-its-budget)). Otherwise leave it as it is, on its thread and worktree (unless the contract lets Claude work move to the owner's API credits as a backup: [references/routing.md](references/routing.md#claude-api-credits-use-what-would-expire)). Make sure a resume wake is scheduled, and after the reset continue it on the same thread, as [references/routing.md](references/routing.md#3-when-a-window-runs-short-or-runs-out) describes. This is not a failure, and the nudge that resumes it doesn't count as its one nudge.
   - **Silent** (idle, failed, cancelled or interrupted, with no report and no quota cause): read its last messages and act on them. Several tasks stopping at the same moment means the computer or the host restarted. Nudge each of them, and check that the run directory survived. If a task simply stopped, for example after a crash or a provider error, nudge it once. If the nudge fails as well (when its last messages show a cause that isn't mechanical, ask Fable for a second opinion first, while one is left, [references/routing.md](references/routing.md#a-fable-second-opinion-for-your-own-decisions)):
     - and the task made no progress (no commits, nothing worth keeping), relaunch it once in a fresh thread and worktree, on the same provider. Then retire the old one: cancel its queued messages and tidy it away.
     - otherwise, mark it failed and keep its worktree for the user.

     Record each nudge and relaunch in the ledger.
4. **Check the computer** ([references/machine.md](references/machine.md#7-during-the-run)). `run-watch` already looked for a password dialog, the disk, swap, the keep-awake and the sampler; act on what it printed, and check the rest:
   - Compare the user's settings with the start snapshot. Restore at once, key by key, what a test build changed, and tell the task that did it.
   - A password or keychain dialog on the screen (the reference gives the command that finds the system's own; a test's stand-in is no dialog) means a task ran something that asks for one. Nobody will answer it: find the command, stop it by its process ID, and tell the task.
   - Check free disk space, the keep-awake, the usage sampler (restart it on the same folder if it died) and that the heartbeat is still scheduled, and look for leftover processes: a paused or merged task's test build, watcher or computer-use service still running ([references/machine.md](references/machine.md#8-leftover-processes)).
5. **Check the home subscription's 5-hour window.** Take a usage snapshot and compare it with the last one. If the window is nearly used up, or will run out before the next heartbeat at its current pace, schedule the resume wake now, while you still can (see [references/routing.md](references/routing.md#3-when-a-window-runs-short-or-runs-out)). Compare the run's Claude use with its budget, and launch no more Claude work once it would pass it ([references/routing.md](references/routing.md#the-runs-claude-estimate-and-budget)); keep `watch.json`'s `"usage_marks"` at the readings where the run's Claude and Fable budgets will be used (`{"claude.weekly": 34, "claude.weekly_fable": 21}`, moved after a reset), so an idle heartbeat flags them. While a task runs on Fable, compare Claude's `weekly_fable` (a live reading) with the run's Fable budget, and move the task to Opus when the budget is used, or will be before the next heartbeat at its pace, or the Fable week runs out ([references/routing.md](references/routing.md#when-the-fable-week-runs-out-or-passes-its-budget)). Note any fast helper the tasks found limited, and leave it out of new briefs until it recovers. The snapshot also shows the helpers' own windows: leave a helper out of new briefs once it is past its own limit, which [references/routing.md](references/routing.md#fast-helpers-antigravity-and-opencode) gives for each: for a fast helper judged by a window, that window past about 85%; for a helper the contract gave a budget, that budget used, whatever its window reads.
6. **Launch what can start:** dependents a merge unblocked, and reserve tasks while the run is under its limit on tasks at once.
7. **Update the ledger, then end the turn.** Write down every state change before ending, so the next wake starts from the truth.

Launching dependent tasks is your job, not the job of the task briefs. Keeping the chain in one place keeps the ledger accurate and lets you skip the dependents of a blocked task.

### 7. Finish

The run is finished when no task is running, paused or able to start (every task is merged, `ready`, blocked, failed, stopped or parked; a pending task whose prerequisite will not merge in this run is parked). One exception: a task `ready` only because no reviewer had room, or because the integration checkout was dirty, is retried before the finish when a reviewer's window resets within about six hours: schedule a resume wake for that reset (or, for the checkout, a wake an hour later, once), and finish once that wake has run the retry and any dependents it unblocked are done. On Codex, which can't schedule a wake, such a task stays `ready` and the report lists it.

Then do every step of [references/finish.md](references/finish.md), in its order: wait for merged tasks to go idle and stop what the run started; verify the end state; restore the user's state; run the final check; hand the run to `skill-evolution`; take the final usage snapshot; write the report with its charts and costs; tidy the host's task list and stop the heartbeat; and post the report.

- **Post the report in the chat as your final message.** This applies to every ending: all tasks merged, some blocked or parked, or the run stopped early. The saved copy isn't enough; the user reads the chat. Nothing comes after it in this turn.
- **The report ends the run.** Start nothing new after it, even with allowance left: put further work under "What needs you" and wait for the user.

### 8. When the user comes back

The user may answer open decisions, check something themselves, ask for changes, ask for a tour of the run, or pick a proposed skill change after reading the report. Keep the run's discipline for these, as [references/finish.md](references/finish.md#when-the-user-comes-back) says: a change goes to the task that owns the work, work started after the report is a new round in the ledger, and the whole updated report is posted again.

## Ledger

The ledger is a small Markdown file outside the repository, next to a run directory of the same name:

```
${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/long-horizon-orchestrator/<repo-name>-<YYYYMMDD-HHMM>.md
${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/long-horizon-orchestrator/<repo-name>-<YYYYMMDD-HHMM>/
```

If a ledger of that name already exists (two runs on one repository started within a minute), add `-2`. The run directory holds everything else the run writes and needs later: briefs, task handoffs, logs you keep as evidence, and the saved copy of the final report. Never keep these in `/tmp`, which macOS clears on restart, and never link to `/tmp` from the report. Each task's folder in it has a `scratch/` folder for what can be made again (builds, downloads, other projects' source), deleted once the task merges; a week after a run finishes, `scripts/prune-runs` can shrink it to its write-ups ([references/machine.md](references/machine.md#6-shared-resources-and-disk)).

The ledger is your memory across context summaries, heartbeats and wakes. Its first line after the title is `Status: running`, `Status: paused until <time>` or `Status: finished`, so other runs can tell whether this one is still active.

[references/ledger.md](references/ledger.md) lists what it holds: the contract, your own identity, one row per task, usage snapshots, the computer, rounds, the decisions log, incidents and open decisions. Three kinds of line are written as they happen, with times taken from the host and never from memory:

- **A task's events:** launches, follow-ups, nudges, relaunches, rebases, level changes, merges, a change of model, and quota pauses with when they began and when the task resumed. The final report's charts are drawn from these.
- **Decisions** you took on the user's behalf, and why.
- **Incidents:** one line each, with the time: what cost the user time, work or an interruption, or needed a workaround outside this skill's rules, what it cost, and the rule involved or missing. The finish turns them into skill lessons.

Update it on every state change. Mention its path in the contract message and in the final report.

## Principles

- **Verify, don't trust.** Check reports against git and thread state before acting on them or passing them on to the user.
- **One approval, then no interruptions.** The user approved a contract, not a conversation. Questions that arise go into the final report, unless every remaining task is blocked on the same answer. In that case, finish early and report.
- **Ask before the run, not during it.** Whatever needs the user (a password, a click on Allow, a decision) goes into the contract and the warm-up. A prompt that appears during the run is a defect to stop, not a question to wait on.
- **The report ends the run.** A usage target is met by the plan and its reserve list, never by work added after the report.
- **Isolation by default.** Use a separate worktree for each writing task, exclusive ports and directories, and fast-forward-only merges. A task whose fast-forward fails rebases, re-validates and tries again.
- **Stop only what you started,** by its recorded process ID, never by a name or pattern. A pattern matches other tasks' builds and the user's own apps.
- **Never run a command that waits for approval,** in your own thread above all. Even with permissions bypassed, Claude Code stops for approval on commands it judges dangerous, such as `rm -rf` on a path built from a shell variable (`rm -rf "$RUN/$d"`), or any `rm` inside a `sh -c` script or compound command ("This shell -c script runs rm and could not be checked"). Delete with a Bash call of its own: plain `rm` and literal absolute paths, one per argument. A prompt in a task's thread stalls that task. A prompt in your own thread stalls the whole run: the heartbeats queue behind your stuck turn, so nothing notices. If a task's thread shows a pending request with no child process running, it is waiting for approval: interrupt the turn and tell the task how to finish without that command. On every wake, check each running task for a pending approval (`run-watch`'s `approval` line, or the thread of a task it can't read; step 2 of "On every wake"), and keep the heartbeat at 15 minutes or less while tasks run.
- **Stay on the assigned subscriptions.** Running short of quota means waiting for a reset, never borrowing from another subscription. The user sized each subscription for its own work. Only the four kinds of work named under "Quota pauses work" above move when a limit stops them, and a Fable task that moves to Opus changes model, not subscription.
- **Never push, publish or force-update,** except the owner's provider profile and skill lessons to their private state repository (or to its run branch, [references/computers.md](references/computers.md#6-commits-travel-through-the-remote)), and, in a run with tasks on another computer, the run, task and briefs branches its contract names ([references/computers.md](references/computers.md#6-commits-travel-through-the-remote)), never forced. Never delete branches or worktrees the run didn't create. Read-only exploration of the user's other checkouts is fine.
- **Calibrate.** Record actual task durations in the ledger and report them, so future estimates improve.
