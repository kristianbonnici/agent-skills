# Task brief

A task agent starts with no memory of your conversation. Its brief is everything it knows, so it must be self-contained. It has to cover where to work, what is settled, what done looks like, how to merge, when to stop, and how to tell you.

## Two messages: the brief and the goal

On hosts with a native `/goal` (Claude Code and Codex top-level threads), send two separate messages:

1. **The brief**, as a plain first message without `/goal`. It can be long.
2. **The goal**, queued as a separate message. It is a short completion condition that refers back to the brief.

Never put the brief after `/goal`. Claude Code limits a goal condition to 4,000 characters, and a long brief after `/goal` is rejected outright. Aim for under 1,500 characters, and count before sending:

```sh
printf %s "$goal" | wc -m
```

The goal evaluator judges only what appears in the conversation. So the goal asks for evidence to be shown, such as check output and `git log`, not merely produced.

Subagents (Claude Code `Agent`, Codex `spawn_agent`) take no `/goal`. Their brief's stop conditions define the end, and their final message is their report.

## Brief template

Fill in every angle-bracketed item with project-specific content, and drop any section that does not apply. Keep it under about 15,000 characters. A tight brief beats an exhaustive one.

```text
Brief for <task ID>: <one-line objective>. <If the host uses a goal: "A /goal referring to this brief follows.">
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

Constraints:
- Work only in this task's workspace: <worktree path, or "the active task workspace">. Do not edit other checkouts.
- Install dependencies only from existing lockfiles; never change the lockfiles.
- Use ports <ports> for anything that listens. Do not stop or reuse processes on <user and other tasks' ports>.
- No pushing, publishing, deploying, or contacting outside services. <project-specific rules, such as live API calls or secrets>.
- Do all the work on this thread. Hand a step to another provider only as "Help available" allows, never the rest of the task. If your usage limit runs out, simply stop: the orchestrator resumes you on this thread after the reset.
- Keep files that must outlive the task (handoff, evidence logs) in <run directory>/<task ID>/, not in /tmp, which a restart clears.

<Optional "Help available" section from routing.md, for example handing a computer-use step to Codex. Include it only when the orchestrator has checked that the other provider has room.>

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
<For the "leave on branch" policy, replace steps 3–4 with: "Rebase onto <integration branch>, re-run validation, and stop. Do not merge.">

Blocked. Stop without merging, report the evidence, then do the report-back:
- <conditions that genuinely need the owner: missing prerequisite, a product decision, a confirmed defect you can't fix safely, checks that cannot pass, a dirty integration checkout>
- <A real-screen check that couldn't run is not one of these, unless it is the task's main deliverable. It goes under "Couldn't check".>

The <range> estimate is a sizing guess, not a timer. Don't wait, and don't add scope to fill it.

Handoff (in your final message, and saved as <run directory>/<task ID>/handoff.md): what changed; evidence for each required item; any steps handed to a helper (which harness, model and reasoning level, and for what); validation output; review findings; the commits merged (git log); "Couldn't check": checks that couldn't run and why, with what the owner should look at; untested platforms; recommendations kept separate from decisions; elapsed time and token usage if available.

Report back (your very last action, whether you finished or are blocked):
<host-specific report-back instruction from the host reference, with the orchestrator's ID filled in>
```

## Goal template

```text
/goal The brief earlier in this thread (beginning "Brief for <task ID>") is complete. Every item under its "Required work" is done, <the two or three most important outcomes, named concretely>. The validation commands pass on the final branch, with output shown<, and any real-screen check that couldn't run is listed under "Couldn't check">. <Integration branch> has been fast-forwarded to <task branch> with nothing pushed (git log shown). The handoff is written, and the report-back message has been sent to the orchestrator. Alternatively: you stopped on one of the brief's "Blocked" conditions without merging, reported the evidence, and sent the report-back message.
```

Name the report-back explicitly in the goal. Without that, the evaluator can mark the goal met before the task has told you anything, and you won't be woken.

## Report-back message

Keep it short and machine-friendly. The facts you need sit on the first lines; a few plain sentences follow:

```text
[long-horizon-orchestrator] run=<run ID> task=<task ID> status=<merged|ready|blocked|failed>
branch=<task branch> head=<commit> integrated=<yes|no>
agent=<harness/model/reasoning level that did the work> helpers=<harness/model/reasoning level × count for each hand-off, or none>
unchecked=<checks that couldn't run, such as real-screen checks on a locked screen, or none>
summary: <two to five plain sentences: what was built, what is left, and the decision needed if blocked>
```

The `helpers` line tells the orchestrator about hand-offs it can't see otherwise. The `agent` line is only a cross-check: an agent doesn't always know its own reasoning level, so the diagram takes each agent's harness, model and reasoning level from the orchestrator's own launch record. The `unchecked` line feeds the report's list of things the user should look at.

A task whose usage limit runs out can't send a report at all. The orchestrator notices from the thread's state and resumes it after the reset.

Use `ready` when the work is reviewed and validated on its branch but not merged: either the policy is "leave on branch" or the merge gate failed for a reason outside the task. Use `failed` for a crash or an environment problem, not for a decision.

## Continuation brief

Use this when a new agent has to pick up a task in its existing worktree and branch: for example after its thread became unusable, or when the user approves moving it. A task paused by quota doesn't need one; it resumes on its own thread. The new agent must build on the earlier work rather than start over.

```text
Continuation of <task ID>. The previous agent (<harness/model>) stopped at <time> because <reason, for example "its thread crashed and could not be resumed">. You continue in the same workspace and branch. Keep its work, including any uncommitted changes, unless it is clearly wrong.

First: run git status, git diff and git log <integration branch>..HEAD to see what exists. The previous agent's last progress: <two to five sentences from its last messages>.

Then finish the original brief below, from "Required work" through "Report back". Report agent=<your harness/model/reasoning level>, and mention the earlier agent in the summary.

<the original brief, verbatim>
```

Its goal follows the goal template, with "(beginning "Continuation of <task ID>")" as the reference.

## Before sending

- Every placeholder is filled in, and the brief makes sense to someone with no other context.
- The ports and paths don't collide with the user's dev servers or with other running tasks.
- The integration branch name, its checkout path and the task branch match the ledger.
- The run directory path is filled in and exists, and no path in the brief points into `/tmp` for anything that must survive a restart.
- The orchestrator ID in the report-back instruction is your own ID, copied exactly.
- If a goal is used, its character count is under 4,000. Recount after every edit.
