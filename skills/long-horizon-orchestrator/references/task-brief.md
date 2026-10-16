# Task brief

A task agent starts with no memory of your conversation. Its brief, with the run's common file it points to, is everything it knows, so the two must be self-contained. They have to cover where to work, what is settled, what done looks like, how to merge, when to stop, and how to tell you.

## One message: the brief, no goal

Send the brief as the task's only message, on every host. Don't queue a `/goal` after it. The brief's stop conditions and its report-back define the end, and the heartbeat ([host-t3.md](host-t3.md#heartbeat-a-backup-for-silent-tasks)) catches a task that goes quiet without reporting. A subagent's final message is its report.

Earlier runs queued a goal behind every brief. An audit of the 33 Claude tasks of the 2026-10-14 and 2026-10-15 runs found that it never made a task finish required work:
- It started only when the brief's first turn ended, in about half the tasks after the merge and the report. Before a report, it never pushed.
- What kept tasks going was Claude Code waking a thread when its own background jobs and subagents finished, which it does with or without a goal.
- After the reports, its checker rejected "Couldn't check" lists, though the goal said they counted as done. It kept tasks working for about 3.8 hours in all and caused 19 extra reports. It pushed tasks into breaking their rules: a global shortcut while the owner's app ran, a re-signed app copy with an injected library on the real screen, the screen lease taken after a merge, and a question to the owner while they slept.
- Its useful catches were reports claiming checks for the final commit that had run on an earlier one. The handoff's rule on commits covers that.

A planner packet's prompt may begin with `/goal`: drop that line, put its checks into the brief's Validation, and its blockers into "Blocked".

## One common file for every brief

Much of a brief is the same for every task: the rules about the owner's things, the permissions the warm-up granted, the leases, the ports already taken, the help sections, and the rules the run learns as it goes. Put all of that into one file, `<run directory>/briefs/common.md` (template below), and keep in each brief only what is the task's own. Each brief tells its agent to read the common file first. Save the briefs next to it, as `<run directory>/briefs/<task ID>.md`.

When a rule changes during the run, add it to the common file with the time, so that tasks launched later get it. A running task read the file at its start: send it the new rule too. A queued follow-up reaches it only when its current turn ends, so send a rule that matters now, such as a safety rule, as a steer (in T3, `t3_thread_send` in mode `steer`), which reaches the running turn.

In the 2026-10-15 runs, both orchestrators did this, and used it to spread rules learned along the way, such as "renewing a lease doesn't extend your turn".

## Brief template

Fill in every angle-bracketed item with project-specific content, and drop any section that does not apply. Keep it under about 15,000 characters. A tight brief beats an exhaustive one.

```text
Brief for <task ID>: <one-line objective>.
Read <run directory>/briefs/common.md first. It holds the rules for every task in this run, and they are part of this brief. Check it again before the merge gate: the orchestrator adds rules there during the run.
The project owner has authorized in advance: commits on <task branch>, and the fast-forward of <integration branch> described under "Finish and merge". Nothing may be pushed or published.

Read first: <instruction files such as AGENTS.md and CLAUDE.md, plus the docs and source paths that matter, each with a few words on why>.

Objective: <one coherent outcome, in two to four sentences>.

Boundaries:
- Settled: <decisions this task relies on and must not reopen>.
- Not yours to decide: <choices left to the owner>. Recommend in the handoff; don't implement.
- Deferred: <adjacent work to leave alone>.

Required work:
1. <intrinsically necessary item with an observable result>
2. ...

Constraints, besides those in the common file:
- Work only in this task's workspace: <worktree path, or "the active task workspace">. Do not edit other checkouts.
- Use ports <ports> for anything that listens.
- Keep this task's files that must outlive it (handoff, evidence logs) in <run directory>/<task ID>/.
- <Rules for this task only, such as a resource it alone may use.>

<Optional "Help available" sections from routing.md that only this task gets. Include one only when the orchestrator has checked that the provider has room.>

Validation (show the output in the conversation):
- <exact commands>
<If a check needs the real screen: "Real-screen checks: <list>. Before them, confirm the screen is unlocked (ioreg -n Root -d1 -a | grep -A1 CGSSessionScreenIsLocked prints <true/> when locked). If it is locked or the app's window can't be captured, don't retry. List each such check under 'Couldn't check' in the handoff, and continue to the merge gate on the other checks.">

Finish and merge:
1. Commit on <task branch> following the project's commit rules. Review the staged diff, stage explicit files, and never commit credentials, local traces or scratch output.
2. Review the result independently. Use fresh reviewer agents if you can launch them; otherwise do a separate review pass. Verify each finding before acting on it. Fix confirmed defects with tests, as additional commits. List unfixed findings with reasons.
3. Rebase onto the latest <integration branch>. Resolve conflicts by meaning. Regenerate generated files rather than hand-merging them. Re-run the full validation.
4. Merge gate: only if every check passes and no confirmed defect remains, confirm that <integration checkout path> is on <integration branch> with no tracked modifications, then run:
   git -C <integration checkout path> merge --ff-only <task branch>
   If the fast-forward fails because the branch moved, go back to step 3. Never force-update, never push.
   If one check misses narrowly while the main goal is met, don't merge, and don't loosen, skip or re-baseline the check: report status=ready with "narrow miss", the check's threshold and its results before and after your change, then stop. The orchestrator decides, and may tell you to merge.
<For the "leave on branch" policy, replace steps 3–4 with: "Rebase onto <integration branch>, re-run validation, and stop. Do not merge.">

Blocked. Stop without merging, report the evidence, then do the report-back:
- <conditions that genuinely need the owner: missing prerequisite, a product decision, a confirmed defect you can't fix safely, checks that cannot pass, a dirty integration checkout>
- <A real-screen check that couldn't run is not one of these, unless it is the task's main deliverable. It goes under "Couldn't check".>

The <range> estimate is a sizing guess, not a timer. Don't wait, and don't add scope to fill it.

Handoff (in your final message, and saved as <run directory>/<task ID>/handoff.md): what changed; evidence for each required item; any work handed to a helper (which harness, model and reasoning level, for what, and any switch after a limit); validation output, with the commit each check ran on (a check that ran before your final commit counts only for that commit: say so, rather than claiming it for the final head); review findings; the commits merged (git log); "Couldn't check": checks that couldn't run and why, with what the owner should look at; untested platforms; "Open decisions": questions for the owner, each with a sentence of context and your recommended answer with its reason (a recommendation only; don't build on it); elapsed time and token usage if available.

Report back (your very last action, whether you finished or are blocked):
<host-specific report-back instruction from the host reference, with the orchestrator's ID filled in>
After the report, your work is over: start no new checks or changes unless the orchestrator sends a follow-up.
If your head or the merge changes after a report (review fixes, a rebase, a follow-up, a merge you were told to do), report again, with the next report number.
```

## Common file template

```text
Rules for every task in run <run ID>. Your brief points here, and these rules are part of it. The orchestrator adds rules at the end during the run, each with its time.

The owner is away for the whole run. Never ask them anything, and never wait for them: no question tools (AskUserQuestion, request_user_input, an "ask" tool), no approval prompts. Decide yourself what is reversible and within your brief; put every other question under "Open decisions" in your handoff.

- Install dependencies only from existing lockfiles; never change the lockfiles.
- No pushing, publishing, deploying, or contacting outside services. <project-specific rules, such as live API calls or secrets>.
- Do all the work on your own thread. Hand work to another provider only as a "Help available" section allows, never the rest of the task. If your usage limit runs out, simply stop: the orchestrator resumes you on your thread after the reset.
- Keep files that must outlive your task in <run directory>/<your task ID>/, not in /tmp, which a restart clears. Keep large files (traces, recordings, downloads) there too, delete what isn't evidence, and list downloads with sizes in the handoff.
- Never run anything that asks for a password, Touch ID or keychain access: sudo, sfltool, DevToolsSecurity, tccutil, installers, creating keychain items<, project-specific ones>. Granted for this run: <permissions from the warm-up>. If a step needs more, skip it and list it under "Couldn't check". If a dialog asks for one of the granted permissions, Allow is fine; cancel any other, and mention it in the report-back.
- Stop only processes you started, by the process ID you recorded. Never use pkill, killall, or a process name or pattern: one can match another task's build or the owner's own app. Close the windows and app copies you opened by their window or process ID.
- Never press global keyboard shortcuts, and never operate the owner's own running app or their windows. Use only the builds and windows you launched.
- The owner's things: <from the contract: their running app, its settings and data, services, their ports>. Launch your own build by its path, with its own <settings, sockets, data folders>. Prefer launch arguments to writing the owner's settings; if a step writes one anyway, read it first and put it back right after. <Don't delete test builds' sandbox containers: macOS asks for a password.>
- Ports and folders of other tasks<, and of the other run>: <list>. Don't stop or reuse them.
- <If the run has leases:> Shared resources: take <resource> with `<lease folder>/bin/lease acquire <resource> --owner <owner prefix><your task ID>` only while you use it, and release it right after (`release`, or `lease run <resource> --owner ... -- <command>` for one command). Renewing is only for finishing the same check: once your turn is over and others wait, a renewal releases the lease (exit 76), so stop using the resource and queue again. If no turn comes within the wait (exit 75), list the check under "Couldn't check" and go on. Prefer checks that need no lease, such as rendering a view to an image. Once merged, don't wait for a lease.
- <If another orchestrator runs:> Another run works on <its code areas>. Don't edit them; its merges into <integration branch> are normal, so rebase onto them as onto any other.

<"Help available" sections from routing.md that every task gets.>

Rules added during the run:
- <time>: <rule>
```

## Report-back message

Keep it short and machine-friendly. The facts you need sit on the first lines; a few plain sentences follow:

```text
[long-horizon-orchestrator] run=<run ID> task=<task ID> status=<merged|ready|blocked|failed>
branch=<task branch> head=<commit> integrated=<yes|no>
agent=<harness/model/reasoning level that did the work> helpers=<harness/model/reasoning level × count for each hand-off, or none>
unchecked=<checks that couldn't run, such as real-screen checks on a locked screen, or none>
prompts=<password, keychain or permission dialogs you saw and what you did, or none>
summary: <two to five plain sentences: what was built, what is left, and the decision needed if blocked>
```

The `prompts` line tells the orchestrator about dialogs on the user's screen. The `helpers` line tells the orchestrator about hand-offs it can't see otherwise. The `agent` line is only a cross-check: an agent doesn't always know its own reasoning level, so the report's charts take each agent's harness, model and reasoning level from the orchestrator's own launch record. The `unchecked` line feeds the report's list of things the user should look at.

A task whose usage limit runs out can't send a report at all. The orchestrator notices from the thread's state and resumes it after the reset.

A task reports again whenever its head or its merge changes after a report: review fixes, a rebase, a follow-up, a merge it was told to do. Each report carries the next number in its request ID (`report-2`, …), and the orchestrator acts on the latest.

Use `ready` when the work is reviewed and validated on its branch but not merged: the policy is "leave on branch", the merge gate failed for a reason outside the task, or one check missed narrowly and the orchestrator decides ([integration.md](integration.md#a-narrow-measured-miss)). Use `failed` for a crash or an environment problem, not for a decision.

## Continuation brief

Use this when a new agent has to pick up a task in its existing worktree and branch: for example after its thread became unusable, or when the user approves moving it. A task paused by quota doesn't need one; it resumes on its own thread. The new agent must build on the earlier work rather than start over.

```text
Continuation of <task ID>. The previous agent (<harness/model>) stopped at <time> because <reason, for example "its thread crashed and could not be resumed">. You continue in the same workspace and branch. Keep its work, including any uncommitted changes, unless it is clearly wrong.

First: run git status, git diff and git log <integration branch>..HEAD to see what exists. The previous agent's last progress: <two to five sentences from its last messages>.

Then finish the original brief below, from "Required work" through "Report back". Report agent=<your harness/model/reasoning level>, and mention the earlier agent in the summary.

<the original brief, verbatim>
```

## Before sending

- Every placeholder is filled in, and the brief and the common file make sense to someone with no other context.
- The brief points to the common file, and the common file holds every rule added so far.
- The ports and paths don't collide with the user's dev servers or with other running tasks.
- The integration branch name, its checkout path and the task branch match the ledger.
- The run directory path is filled in and exists, and no path in the brief points into `/tmp` for anything that must survive a restart.
- The orchestrator ID in the report-back instruction is your own ID, copied exactly.
- The permissions, lease and owner's-things lines in the common file match the contract and what the warm-up granted.
