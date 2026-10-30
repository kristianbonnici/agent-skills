---
name: long-horizon-orchestrator
description: Run a set of long-running agent tasks to completion while the user is away. Launch each task as its own agent (T3 threads on any provider, Claude Code background subagents, or Codex subagents). Get woken automatically when a task finishes or blocks, launch dependent tasks once their prerequisites are merged, and have finished work reviewed, checked and merged into the branch the run started from. End with a plain-language report of what was built, open decisions and next steps. Use whenever the user wants several tasks run in parallel or overnight, asks you to launch, coordinate, chain or babysit agents or follow-up tasks, says "launch everything and merge it", or wants work to continue while they sleep or step away, even if they never say "orchestrate". If no task list exists yet, plan one first and get a single approval.
metadata:
  version: 1.1.0
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
- **Strengths are soft preferences.** Example: computer-use steps go to Codex's GPT-6.1 Terra when Codex has room. Prefer handing off just that step over moving the whole task. Hand off as often as it genuinely helps, with no fixed count, but only for work the helper is better at, or, for the fast helpers below, research and simple steps that save the task agent's context.
- **Reasoning errs upward.** Never use low. Use medium only for very simple steps and high for real tasks. Use extra high only when you see a real benefit from the extra thinking, and name it in the contract. Use Ultracode (Claude Code) or Ultra (Codex) sparingly, only when the task clearly gains from parallel sub-agents, and name that gain in the contract. The multi-agent modes use up a usage window much faster than a single agent. Always set the level explicitly; never inherit a default.
- **Fast helpers take research and simple steps inside tasks.** Antigravity's Gemini Flash and OpenCode's two good free models (DeepSeek V4.1 Flash, GLM-5.3 Flash), all at high reasoning, take research and retrieval (web and documentation research, searching code and logs, collecting facts) and simple, fully specified steps, as a sub-task or as a research subagent running beside the task's agent. GitHub Copilot (Auto routing, GPT-5.6 Luna) is the backup when those are limited, within a monthly budget. That agent checks what they return. They are never merge gates or orchestrators, and task agents only when the user asks for it; OpenCode's free models review only where the `review-gate` skill's levels put them.
- **Gemini 4 Argon takes harder sub-tasks, sparingly.** Antigravity's stronger model, at high reasoning, takes sub-tasks too hard for Flash but still bounded: deep research and synthesis, a scoped investigation, a well-specified piece of code. It doesn't review: Gemini reviews were weak in past runs. It has a small weekly quota of its own, so the contract gives it a budget, and the agent that asked still checks its work and decides.
- **Quota pauses work; it never moves it.** You and every task stay on the subscription the contract assigned. When a 5-hour window runs out, the affected work pauses and resumes on the same thread after the reset, woken by a wake-up you schedule in advance. Never switch your own model, and never hand a task to another subscription, because of quota. Fast helpers are the exception, because the run isn't sized on them: a helper that hits a rate limit or slows down hands its work to the next helper (on OpenCode, its other free model first, then the other provider), and when all are limited, back to the agent that asked. Argon's work goes straight back to the agent that asked. A whole task given to a free or low-cost model is the other exception: when a limit stops it, it moves at once between OpenCode's and Antigravity's Gemini models, and when they are all limited to Codex's Terra or Claude Sonnet, always and without asking; it never waits for the user ([references/routing.md](references/routing.md#a-task-on-a-free-model)).

## Workflow

### 1. Get the task list

- If the user supplied tasks or a planner portfolio, use them.
- Otherwise:
  - If `long-horizon-task-planner` is installed, run it to propose tasks.
  - If it isn't, apply its intent inline: tasks grounded in the current project, ready now, each one coherent objective with checks that prove completion.
- Draw the dependency graph. A task that needs another task's code starts only after that predecessor is merged. Group tasks into waves.
- If the user wants the run to use up an allowance ("most of this week's usage"), size the list for it now: add a ranked reserve of extra tasks to the contract. Launch reserve tasks while the run is going, as places free up, and never after the final report.
- Give each task an ID (A, B, C…) and a branch name.

### 2. Present the run contract and get one approval

Put everything the user might want to decide into one message, so nothing needs asking later:

- **Tasks:** one plain-language line each, with the waves and dependencies.
- **Per task:** host or provider, model and effort, branch, exclusive resources such as test ports, the helpers it may use, and its review level (light, standard or deep, by the `review-gate` skill's rules) with the reviewers that level gives it. Give the reason for any task not on the home harness, and for any task above high.
- **Usage:** each subscription's current usage in plain words, any other active run sharing them ([references/routing.md](references/routing.md#2-measure-capacity-as-plan-size-times-room-left) shows how to find them), and what the run is expected to consume. Say that work pauses when a 5-hour window runs out and resumes after its reset, at what time if that is likely.
- **Another run:** if another orchestrator is active on this computer, what you agreed with it before the contract: the code areas each run stays out of, the shared lease folder, ports and folders, and who does the shared finish steps ([references/routing.md](references/routing.md#running-beside-another-orchestrator)).
- **Integration branch:** the branch checked out where the run starts (`main`, `dev`, …).
  - Default policy: each task commits, passes the review gate (the `review-gate` skill: reviewers of another model family, at a level set by what its diff touches), passes the full checks, and fast-forwards the integration branch itself. Nothing is pushed.
  - Alternative the user may choose: leave each task on its reviewed branch for the user to merge.
- **Blocked:** what makes a task stop without merging. Other tasks continue when one blocks. A check on the real screen that can't run (the screen is locked, or the app's window can't be captured) doesn't block a merge: the task merges on its other checks, and the report lists what still needs the user's eyes. The exception is a task whose main deliverable is that check.
- **Pre-flight items:**
  - uncommitted work the tasks depend on (new worktrees contain only committed work);
  - an integration checkout that isn't clean;
  - missing credentials or services.
- **Permissions and the computer:** the user won't be there to type a password or click Allow, so the run gets everything it may need before they leave. Err on the side of more: an unused permission costs nothing, while a missing one stops a task or leaves a prompt on the screen. Read the current state, then list what's missing of these, from [references/machine.md](references/machine.md):
  - admin commands for the user to paste into Terminal once (Developer mode, toolchain licenses, installs);
  - privacy permissions for the harness app and for the app the tasks build or test (Accessibility, Screen Recording, Automation, …);
  - settings for the run (screen lock and Stage Manager off when anything uses the real screen);
  - the user's own things the run must leave as it found them, and the shared resources tasks take turns on (the screen, the GPU);
  - whether the user may still be at the computer (an evening run): then the screen's lease waits until they have been away five minutes, nothing records the screen or plays out loud before that, and their screen lock must not start sooner ([references/machine.md](references/machine.md#6-shared-resources-and-disk)).

  Say that you will keep the computer awake for the whole run (`caffeinate` on macOS), and that the warm-up needs the user at the computer for about five minutes right after they approve. Approving the contract approves all of it.
- **Estimate:** a rough duration, labelled as an estimate. Agent runs often finish much faster than planned.
- **Ledger:** where the ledger file will be.

Ask for approval once. If the user has already said to go ahead ("launch everything now"), treat that as approval and don't wait for a reply. Still post the contract as a chat message before the first launch. It is the user's record of what they agreed to, which models will run, and what the run will use of their subscriptions. The ledger doesn't replace it, because the user reads the chat, not the ledger.

After approval, do not ask the user anything. When a new decision comes up:
- If a reversible default is clearly within the contract, take it.
- Otherwise park the affected task and its dependents, and keep going with the rest.

Record each such decision for the final report.

A message from the user during the run amends the contract. Quote it in the ledger with its time, and act on it: it may widen the scope, move a task to another provider, or override a default of this skill. Don't ask them to confirm what they already said, and don't take it as an opening for other questions; the rest of the contract stands. Name each amendment in the report.

### 3. Prepare

- Confirm the integration checkout: it is on the integration branch and has no tracked modifications. Record its path and HEAD.
- Create the ledger and the run directory (see below), and record the contract in the ledger.
- Record your own harness, model and reasoning level, read from the host rather than remembered (in T3, `t3_thread_configuration`). The report's charts need it.
- Record the version of this skill and of `review-gate` (`metadata.version` in each `SKILL.md`), so later studies can compare runs by version.
- If your thread's title doesn't say plainly which run this is, rename it so the user can tell runs apart (in T3, [references/host-t3.md](references/host-t3.md#name-your-own-thread)).
- Allocate exclusive resources per task: unique test ports, temporary directories and branch names.
  - Never use the user's own dev-server ports.
  - Never stop processes you didn't start.
- Run the warm-up while the user is still there ([references/machine.md](references/machine.md#3-the-warm-up)): the admin block, every approved prompt made to appear once, each permission checked. Record the results in the ledger and the owner's profile.
- Keep the computer awake until the finish ([references/machine.md](references/machine.md#4-keeping-the-computer-awake)), and record how.
- Start the usage sampler in the background and record its process ID ([references/machine.md](references/machine.md#9-the-usage-sampler)): `scripts/usage-sampler <run directory>/usage &`. It uses no model tokens and next to no processor time, and the final report draws its usage graphs from that folder.
- Snapshot the user's own state into the run directory, and set up the leases for shared resources ([references/machine.md](references/machine.md#5-the-users-own-things)).
- Write the common file that every brief points to, with the rules all tasks share ([references/task-brief.md](references/task-brief.md#one-common-file-for-every-brief)).

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
   - **Merged:** verify the head of its latest report, mark it done and launch any task this unblocked. Then clean up, only once the task and everything it started have stopped, in the order [references/integration.md](references/integration.md#cleanup-after-a-merge) gives: stop a turn that outlived the report, check for background jobs, then for leases it holds, then remove its worktree and branch and tidy its entry in the host's task list (in T3, settle its thread). Settling a thread or closing an agent doesn't stop the jobs it started, so if anything still runs, clean up on a later wake.
   - **Ready but not merged** (the integration branch moved, the checkout is dirty, the policy is to leave it on its branch, one check missed narrowly, or its review didn't converge): follow the integration reference.
   - **Blocked:** if the cause is mechanical and within the contract, such as a rebase conflict, a port clash or a flaky check, send the task a follow-up. Otherwise mark it blocked, park its dependents, and record the decision it needs.
   - **Paused by quota** (its provider's window ran out, so it stopped without reporting): leave it as it is, on its thread and worktree. Make sure a resume wake is scheduled, and after the reset continue it on the same thread, as [references/routing.md](references/routing.md#3-when-a-window-runs-short-or-runs-out) describes. This is not a failure, and the nudge that resumes it doesn't count as its one nudge.
   - **Silent** (idle, failed, cancelled or interrupted, with no report and no quota cause): read its last messages and act on them. Several tasks stopping at the same moment means the computer or the host restarted. Nudge each of them, and check that the run directory survived. If a task simply stopped, for example after a crash or a provider error, nudge it once. If the nudge fails as well:
     - and the task made no progress (no commits, nothing worth keeping), relaunch it once in a fresh thread and worktree, on the same provider. Then retire the old one: cancel its queued messages and tidy it away.
     - otherwise, mark it failed and keep its worktree for the user.

     Record each nudge and relaunch in the ledger.
4. **Check the computer** ([references/machine.md](references/machine.md#7-during-the-run)):
   - Compare the user's settings with the start snapshot. Restore at once, key by key, what a test build changed, and tell the task that did it.
   - A password or keychain dialog on the screen (on macOS, `pgrep -x SecurityAgent` finds one) means a task ran something that asks for one. Nobody will answer it: find the command, stop it by its process ID, and tell the task.
   - Check free disk space and the keep-awake too, and look for leftover processes: a paused or merged task's test build, watcher or computer-use service still running ([references/machine.md](references/machine.md#8-leftover-processes)).
5. **Check the home subscription's 5-hour window.** Take a usage snapshot and compare it with the last one. If the window is nearly used up, or will run out before the next heartbeat at its current pace, schedule the resume wake now, while you still can (see [references/routing.md](references/routing.md#3-when-a-window-runs-short-or-runs-out)). Note any fast helper the tasks found limited, and leave it out of new briefs until it recovers. The snapshot also shows Antigravity's windows: leave Flash out of new briefs while the Gemini 5-hour window is past about 85%, and Argon once the run has used its budget.
6. **Update the ledger, then end the turn.** Write down every state change before ending, so the next wake starts from the truth.

Launching dependent tasks is your job, not the job of the task briefs. Keeping the chain in one place keeps the ledger accurate and lets you skip the dependents of a blocked task.

### 7. Finish

When every task is done, blocked or parked:

1. Wait for any merged task that is still running to go idle, and finish its cleanup. Then stop the heartbeat, any resume wake, the keep-awake and the usage sampler (`kill <its recorded process ID>`; it ends within a moment), close or cancel any remaining agents, and stop the run's leftover processes: test builds, watchers, the kit's browsers, and computer-use services the run's steps started ([references/machine.md](references/machine.md#8-leftover-processes)).
2. Verify the end state:
   - the integration branch log;
   - nothing was pushed;
   - the integration checkout is clean;
   - every merged task's worktree and branch is removed, and its entry and its helper threads tidied;
   - unfinished tasks keep theirs and stay visible.
3. Compare the user's state with the snapshot: restore what the run changed, remove what it left, and note anything you couldn't for the report's "Side effects" ([references/machine.md](references/machine.md#5-the-users-own-things)). If another run is still active, leave the steps you share with it to whichever finishes last, as agreed, and tell it you have finished.
4. If the project has a quick main check, run it once on the integration branch. Run it in a detached worktree (`git worktree add --detach <run directory>/final-check <integration branch>`, then `git worktree remove --force` it, since it holds no work) when another run still works in the checkout, or when the check writes files the user's own copy uses, such as the app they have running.
5. Remove throwaway threads or worktrees you made along the way.
6. Take a final usage snapshot, and update the calibration in the owner's provider profile. If the profile lives in the owner's private repository, commit and push it (see [references/routing.md](references/routing.md#6-the-owners-profile)).
7. Write the final report from [references/final-report.md](references/final-report.md), with the tasks' pictures of what changed and a picture of how the run actually went: in T3 the run map, shown with `html_render` just before the report; elsewhere its two Mermaid charts (a dependency graph and a timeline). `scripts/run-charts` draws all of them from one facts file, with the usage graphs from the sampler's folder (`"usage": {"folder": "<run directory>/usage"}`). Save a copy next to the ledger, for the record.
8. If you have OrbOS's `offer_reading` tool, offer the report once, as a reading to listen to later with its tour ([references/final-report.md](references/final-report.md#offer-it-to-listen-to-with-its-tour)). `scripts/report-offer` turns the facts file and the saved report into the tool's arguments and offers them through OrbOS's own command, so the tour shows the tasks' pictures too; if it can't, it says so and you call `offer_reading` yourself. It returns within moments, and the card waits in the notch for 8 hours, with **Tour** beside **Play**: the user plays the tour whenever they like, without you.
9. **Post the report in the chat as your final message.** This applies to every ending: all tasks merged, some blocked or parked, or the run stopped early. The saved copy isn't enough; the user reads the chat.
10. Set the ledger's status to `finished`.
11. If the host has a push-notification tool, send one line saying the run is finished.
12. No live tour is needed when the offered reading kept its tour. Only when it didn't (an OrbOS that can't keep one, or no offer), and you have OrbOS's `walkthrough` tool and the user is at the computer now, give the report as a live tour: an optional tail after the finish, not part of it. Your turn stays open while it runs, at most until the user stops it or leaves it 10 minutes ([references/final-report.md](references/final-report.md#the-live-tour-only-when-the-tour-didnt-wait)), so everything above is done first. End with one short line, not another report. With the user away, don't offer it: the reading and the report tell them to ask for it.

    Without OrbOS's tools, skip steps 8 and 12 silently, and never speak aloud about either.
13. The report ends the run. Start nothing new after it, even with allowance left: put further work under "Suggested next steps" and wait for the user. A tour they ask for ("walk me through the run") isn't new work: point them to **Tour** on the waiting card, or give it from the same files.

### 8. When the user comes back

The user may answer open decisions, check something themselves, or ask for changes after reading the report. Keep the run's discipline for these:

- **A check the user did counts.** If a task was blocked only on a check the user has now done, record their result and let the task finish its merge gate.
- **Changes go to the task that owns the work.** For an unfinished task, send the request to its thread. For merged work, launch a small follow-up task. Make a change of a few lines yourself only if that is clearly simpler, and then run the full checks and the merge gate as a task would.
- **A tour when they ask.** "Walk me through the run": while the offered reading waits with its tour, **Tour** on its card plays it. Otherwise give the live tour from `tour.json` ([references/final-report.md](references/final-report.md#the-live-tour-only-when-the-tour-didnt-wait)). Run `scripts/report-offer --no-offer` again first if the report or the integration branch changed since, because the file steps' lines are found at its head.
- **Close the loop.** Update the ledger, clean up as in step 7, and post the report again: the whole report, updated, with one line at the top saying what changed since the last one. Offer the new reading as in step 8 when the outcome changed. The old card can't be withdrawn from a new session, so it waits until the user dismisses it or it expires.

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
  - the user's approval, quoted with its time, which starts the run's clock for the report, and every amendment they sent during the run, quoted with its time;
  - the port and resource allocation;
  - any other active run: its ledger, the notes you exchanged and what you agreed.
- **Orchestrator identity:** your own thread or session ID; your harness, model and reasoning level as the host reports them; the versions of this skill and `review-gate`; and the IDs of the heartbeat and any resume wake.
- **One row per task:**
  - ID, title, dependencies;
  - host, provider, model and effort, as the host reports them after launch;
  - thread or agent ID, branch, worktree path, ports;
  - status (`pending`, `running`, `paused`, `merged`, `ready`, `blocked`, `failed`, `parked`);
  - launch and finish times taken from the host's timestamps, never estimated; merged commits; notes;
  - the harness, model and reasoning level of every agent that worked on it, including a relaunched attempt;
  - helper hand-offs (which harness, model and reasoning level, for what, how many times), and any limit a helper hit and what its work switched to;
  - events such as follow-ups, nudges, relaunches, rebases, level changes, and quota pauses with when they began and when the tasks resumed. The final report's charts are drawn from these.
- **Usage snapshots:** from `scripts/provider-usage`, taken at the start, before each wave, on wakes near a limit and at the finish. Note other active runs sharing the subscriptions, and the reason for any task routed away from the home harness.
- **The computer:** what the warm-up granted and what is still missing; how the computer is kept awake (on macOS, the `caffeinate` process ID); the usage sampler's process ID and folder; where the start snapshot of the user's state is; and what was restored at the finish.
- **Decisions log:** what you decided on the user's behalf, and why.
- **Open decisions:** what the user still needs to decide, with the task that raised each one and the recommendations you and the task have for it.

Update it on every state change. Mention its path in the contract message and in the final report.

## Principles

- **Verify, don't trust.** Check reports against git and thread state before acting on them or passing them on to the user.
- **One approval, then no interruptions.** The user approved a contract, not a conversation. Questions that arise go into the final report, unless every remaining task is blocked on the same answer. In that case, finish early and report.
- **Ask before the run, not during it.** Whatever needs the user (a password, a click on Allow, a decision) goes into the contract and the warm-up. A prompt that appears during the run is a defect to stop, not a question to wait on.
- **The report ends the run.** A usage target is met by the plan and its reserve list, never by work added after the report.
- **Isolation by default.** Use a separate worktree for each writing task, exclusive ports and directories, and fast-forward-only merges. A task whose fast-forward fails rebases, re-validates and tries again.
- **Stop only what you started,** by its recorded process ID, never by a name or pattern. A pattern matches other tasks' builds and the user's own apps.
- **Never run a command that waits for approval,** in your own thread above all. Even with permissions bypassed, Claude Code stops for approval on commands it judges dangerous, such as `rm -rf` on a path built from a shell variable (`rm -rf "$RUN/$d"`), or any `rm` inside a `sh -c` script or compound command ("This shell -c script runs rm and could not be checked"). Delete with a Bash call of its own: plain `rm` and literal absolute paths, one per argument. A prompt in a task's thread stalls that task. A prompt in your own thread stalls the whole run: the heartbeats queue behind your stuck turn, so nothing notices. On 2026-10-23, a task stopped on such a prompt; the orchestrator interrupted it, then ran the same kind of deletion itself and waited seven hours for the user to wake up and approve it. If a task's thread shows a pending request with no child process running, it is waiting for approval: interrupt the turn and tell the task how to finish without that command. On every wake, read each running task's thread for a pending approval (in T3, `pendingRequestCount` from `t3_thread_read`), and keep the heartbeat at 15 minutes or less while tasks run: on 2026-10-27 a task's approval prompt waited until the owner happened to see it.
- **Stay on the assigned subscriptions.** Running short of quota means waiting for a reset, never borrowing from another subscription. The user sized each subscription for its own work. Only a fast helper's work switches, between helpers, when one is limited.
- **Never push, publish or force-update.** Never delete branches or worktrees the run didn't create. Read-only exploration of the user's other checkouts is fine.
- **Calibrate.** Record actual task durations in the ledger and report them, so future estimates improve.
