# Integration, dependents and cleanup

For a task on another computer, what this file does in a task's worktree runs on that computer, over SSH or through the run's machine thread there ([computers.md](computers.md#10-reaching-it-ssh-first-one-machine-thread-second)), and its merges go to the run branch ([computers.md](computers.md#7-launch-and-report-back)).

## Merge policies

- **Merge (default):** each task fast-forwards the integration branch itself once the review and full checks pass. Tasks that finish around the same time race safely: fast-forward-only either succeeds or fails cleanly, and a task that loses rebases, re-validates and tries again.
- **Leave on branch:** each task stops with a reviewed, validated, rebased branch and reports `ready`. Nothing touches the integration branch. A dependent task is based on its predecessor's branch, forming a stack. Say so in the contract and the report, because the user then has to merge in order.

### Many tasks merging at once

With more than about four tasks merging into one branch, every merge sends the others back to rebase, and a full check after each rebase makes them queue for build slots. So the common file carries from the start ([task-brief.md](task-brief.md#common-file-template)):

- **A clean rebase needs only a re-check.** Once the full check has passed on a head of the task's, a later rebase that applies cleanly needs only a build, its focused tests and the tests of any file both sides changed; then it merges at once — except for an effective `Live UI check: required` task when the rebased commits touched files that draw the captured window, which invalidates the earlier captures and requires retaking them and getting a `"visual look"` before merging (or stopping at `ready` with `"live UI check pending"`). A rebase with conflicts, or one that changes code the task calls, needs the full check again.
- **Timing limits under load** fail at random, a different test each run: the task runs the failing ones once more alone, and merges with both outputs under "Couldn't check" when they pass or differ; one that fails alone, twice, is real.
- **The full check runs once at the finish,** on the integration branch ([finish.md](finish.md), step 4), and what it finds goes to the task that owns it or to a follow-up task.

If fast-forwards still race after that (a task fails its fast-forward twice running), declare a one-slot `merge` lease ([machine.md](machine.md#6-shared-resources-and-disk)): a task takes it after its review and its GPU, VM or screen checks, for its last rebase, the re-check and the fast-forward only, and never waits on another lease while it holds it. If that last rebase invalidates a live UI check (by touching files that draw the captured window), the task releases the `merge` lease first, retakes the live captures and gets a `"visual look"`, and only then queues for `merge` again.

### A narrow, measured miss

Work merges only when every check passes. There is one exception, and you decide it, never the task: a task that meets its main goal with a broad, measured improvement, but misses one named check narrowly, for a reason it understands. The task reports `ready` with the numbers, and you may let it merge when all of these hold:
- the miss is small and measured: the check's threshold, the result before the change and after it;
- nothing else fails, and the main deliverable isn't the check that missed;
- a follow-up task is launched for the miss, within the contract (from the reserve, or as a new task with the same scope);
- the report names the miss and its follow-up.

Then tell the task to merge (it reports again once merged), or do the gate yourself. If any condition fails, the task stays `ready` and the report lists it under "Not finished". Never loosen, skip or re-baseline the check to make it pass.

## Verifying a "merged" report

```sh
git -C <integration checkout> log --oneline <recorded start>..<integration branch>
git merge-base --is-ancestor <task head> <integration branch> && echo merged
```

Record the merged commits in the ledger. If the report says `merged` but git disagrees, treat the task as `ready` and handle it as described below. For any task whose **effective** `Live UI check` classification (from the contract, or upgraded to `required` by the task or a reviewer and recorded in the ledger) is `required` (not waived), also check its handoff facts without opening the images by default: confirm either that an explicit owner verification of the final window-drawing commit is recorded in the ledger and `review.json`'s `note` (which stands in for both captures and a reviewer verdict), or that its live UI check is not in `unchecked`, its recorded captures exist on disk for the final window-drawing commit, and at least one eligible reviewer returned an affirmative, non-voided `Pictures:` verdict covering every required state in its Review section (or an explicit orchestrator fallback visual inspection is recorded in the ledger and `review.json`'s `note`). If a required live check or visual clearance was skipped without a waiver, recorded fallback clearance, or recorded owner verification, mark the task's visual hold open in the ledger and do **not** launch its dependents or advance stacked dependents yet: record an incident, inspect the captures yourself if present on disk (or send a follow-up to take them and run a visual look / fix any defect), and flag the gap under "Not finished" if it cannot be resolved before finish.

A task may report more than once: after review fixes, a rebase or a follow-up. Act on its latest report, verify that report's head, and record the commits it merged.

## A review that didn't converge

A task whose review gate stopped, because its rounds stopped converging or in the extra look at a conflict resolution, reports `ready` with "review didn't converge" and its open or unreviewed findings. Don't send it back to the merge gate as it is, and never do the gate yourself: its change has a known blocker or unreviewed fixes. You may send it one follow-up, at most once per task, in the first case whose conditions all hold, and name the decision in the report:

- **One fix that removes code:** one blocker is open, it names a fix that removes the disputed code instead of tuning it, and the task doesn't doubt its approach. The task makes that fix.
- **Only the last fixes unreviewed:** every blocker is fixed with tests, and only the last fixes haven't been reviewed.
- **The dispute sits in one part:** the open blockers all sit in code the task can name. The task puts that code back to the integration branch's behavior and keeps it, with the findings, on a branch of its own. Once the rest merges, the task is `merged` with that branch noted in the ledger and under "Not finished" in the report, and dependents that need the kept code stay parked.

Then the task gets one fresh look at the whole diff from the cross reviewer, fixes nits, follow-ups and blockers that don't change logic as the review gate says (it lists the follow-ups that would), and goes to the merge gate. A blocker in that look that changes logic stops it; after a split, any blocker on what's left does, logic or not.

Otherwise, or when that look stops it: if the task names a concrete fix for each open blocker and doesn't doubt its approach, launch a fresh fix-up agent on its branch and worktree while its own agent stays idle (in T3, `t3_thread_launch` with `workspaceStrategy: {type: "existing_worktree", worktreePath: "<its worktree>"}`). Its brief is the [continuation brief](task-brief.md#continuation-brief) with the open findings and their fixes as the work: it applies the fixes with tests, commits, gets one more look by the cross reviewer as above in place of a new review gate, then follows steps 3 and 4 of the original brief's "Finish and merge" and its "Report back". At most two fix-ups per task, its milestones together, and the follow-up above is once per task the same way. Once it merges (under "leave on branch", once it is `ready`), go on as for the task: after a milestone that isn't the last, send the next to the task's own thread; after the last, clean up and settle the fix-up's thread with the task's. Before one of these waits for the owner, ask Fable for a second opinion while one is left ([routing.md](routing.md#a-fable-second-opinion-for-your-own-decisions)): whether the approach is wrong, and a concrete fix for each open blocker if it isn't. When no open blocker is a product decision and the approach isn't in dispute, a fix it names counts as the task's own once the task agrees it fits (send it to the task's thread and ask), so the fix-up above may go ahead within its count. A product decision or a disputed approach still waits for the owner, whatever Fable says. Only a disputed approach, a product decision, a blocker with no concrete fix or a third stop (the gate's and each look's count) waits for the owner: keep it `ready`, park its dependents, and list it under "Not finished" in the report with the open findings, whether the task thought the approach itself is wrong, Fable's view if you asked, and your recommendation.

## Follow-up findings

The review gate's follow-ups are real defects that need rare timing or input, or missing hardening, and they don't hold back a merge. A task lists its open ones with their fixes in its handoff (`<run directory>/<task ID>/handoff.md`); read them there once it merges (under "leave on branch", once it is `ready`) and record them in the ledger. Give them to one follow-up task within the contract (from the reserve, or a new task with the same scope) while the run has room; otherwise list them under "Not finished" in the report. Its review is capped (review-gate, section 5): from the third numbered round on it lists new non-blockers instead of fixing them. Make a further follow-up task of those only when the owner asks.

## A reviewer that held on its blocker

When a task rejects a finding its reviewer tagged a blocker, or gives it a lower tag, the review gate asks that reviewer whether it agrees and records the answer. The task's tag stands either way. A task lists the blockers its reviewer held on under "A reviewer held" in its handoff's Review section, each with the reviewer's case and the task's reason. By themselves they never hold back a merge, and they aren't a reason to relaunch the task, run its gate again or start a follow-up task. Only when the task itself lists one as an open follow-up, because the answer showed it a case it got wrong, does it go with the task's other follow-ups ([above](#follow-up-findings)). Once the task merges (under "leave on branch", once it is `ready`), record them in the ledger and list each under "Worth checking yourself" in the report.

## A task with no independent reviewer

A task whose review gate found no reviewer of another family available (each one and its replacement limited) reports `ready` with "no reviewer available". Don't merge it, and don't do its gate yourself: the contract promised an independent review. On a later wake, once a reviewer's subscription has room (after its reset), send the task a follow-up to run the review gate again; its dependents wait meanwhile. If no reviewer has room before the finish, it stays `ready` and the report lists it.

## A task with a live UI check pending

A task whose **effective** `Live UI check` classification is `required` — whether set in the contract or upgraded from `rendered is enough` by the task or a reviewer (record any upgrade in the ledger's task row at once so retries, merge checks, and dependent launches all use the effective classification) — and whose live capture or visual review could not complete (screen locked, capture failed, screen-lease timeout, reviewer limit on visual look, or no reviewer able to open/verify the captures) reports `ready` with `"live UI check pending"` and the exact scene and reason. Don't merge it on its own, and don't silently downgrade it to "Couldn't check":

- **Screen-lease contention** (`lease` timed out because another task held `screen`, while the screen is unlocked and not waiting on the owner): once the screen lease is free (or via a single wake 30–60 minutes later, retried at most once), send the task a follow-up to take its live captures, run `review-gate`'s `"visual look"`, and finish the merge gate (retaking captures only if a later rebase touched files that draw that window).
- **Owner-present evening timeout** (`lease` reported waiting for the owner to be away): retry at most once after the owner leaves; if finish arrives with the owner still present, keep the task `ready` and list it under "Not finished".
- **Reviewer usage limit during a visual look (including mixed failures):** when valid live captures exist for the current head and **any** eligible reviewer that could still supply a visual verdict hit a usage limit (even if another reviewer returned `couldn't open` or had its verdict voided), schedule a resume wake for the soonest such reviewer's window reset within ~6 hours (same rule as "no reviewer available") and send a follow-up to rerun only the visual look (no recapture needed unless the branch changed) and merge; if no such reset falls within ~6 hours, keep the task `ready` under "Not finished" rather than clearing it via fallback.
- **Every eligible reviewer couldn't open the captures or had its visual verdict voided:** when valid live captures exist on disk for the final window-drawing commit and **every** eligible reviewer reported `couldn't open` or had its visual verdict voided (never when an eligible reviewer was merely limited), you (the orchestrator) are the sole authorized fallback eye *before* merge: open and inspect the captures yourself. If defective, send the task back to fix with fresh captures and a visual look. If clean, record your visual inspection in the ledger (listing the capture paths and commit you inspected), update the gate record's `review.json` to `"result": "passed"` with `"note": "visual check cleared by orchestrator fallback inspection"`, and tell the task to merge citing that recorded clearance (which satisfies step 4 of its brief and post-merge verification); if you cannot inspect them either, keep the task `ready` under "Not finished" for the owner.
- **Locked screen or unavailable capture:** a locked screen does not free itself unattended, so do **not** schedule retries. Keep the task `ready`, park its dependents by default (if the contract allows stacking a dependent on the ready branch, that dependent reports `ready` with `"waiting on pending prerequisite"` and must **not** fast-forward the integration branch until every pending prerequisite whose commits would enter integration has passed its live UI check and merged), and put a single concrete step under "Not finished" in the report so the owner can unlock or run the check when they return ([finish.md](finish.md#when-the-user-comes-back)).

## A task that is ready but not merged

The integration branch may have moved, or the checkout may have been dirty at the gate. (A task that stopped because one check missed narrowly, whose review didn't converge, that found no independent reviewer, or that has `"live UI check pending"` is a different case: see the sections above — never use step 3 below to merge one of those. A stacked dependent with `"waiting on pending prerequisite"` is excluded while any prerequisite remains unmerged or has an unresolved visual hold in the ledger, and enters the steps below only once every prerequisite is merged with verified UI clearance — if its agent is gone then, step 3 applies with its live UI gate, or launch a continuation agent; if step 3 cannot merge it safely, keep it `ready` and let finish proceed.) Either way:

1. Check the integration checkout. If it has tracked modifications the run didn't make, the user is probably working there. Don't touch it. Look again on each later wake, and once it is clean, go on with step 2. If it is still dirty at the finish, the task stays `ready` and the report lists it, with its dependents parked.
2. Otherwise, send the task a follow-up asking it to rebase, re-validate and retry the merge gate.
3. If the task's agent is gone (a closed subagent or a crashed thread), do the gate yourself in its worktree: rebase, run the full validation, then fast-forward. Run the checks yourself; never merge on an old result. Apply the same live UI gate as the task's merge gate: if the task's effective classification is `Live UI check: required` (not waived) and the rebase touched files that draw the captured window (or valid live captures / visual clearance for the final window-drawing commit are missing), abort the merge, keep the task `ready` with `"live UI check pending"`, and either relaunch/follow up to recapture and run a visual look or list it under "Not finished" — never fast-forward with stale captures. If the rebase has a conflict whose resolution would change logic, don't resolve it yourself: abort the rebase, keep the task `ready`, and list it in the report.

## Launching dependents

A dependent task launches only when every prerequisite is `merged` (or `ready`, under "leave on branch", or when the contract explicitly allows stacking on a `ready` `"live UI check pending"` branch — in which case the stacked dependent reports `ready` with `"waiting on pending prerequisite"` and never fast-forwards the integration branch until every prerequisite whose commits would enter integration has merged); for a prerequisite split into milestones, once the milestone it needs is, based under "leave on branch" on that milestone's own branch. A prerequisite that merged after a split doesn't count for a dependent that needs its kept code: that dependent stays `parked` until the kept code merges.

- Base it on the current integration branch head, or, under "leave on branch", on the predecessor's branch: in T3 that branch is the launch's `baseRef`, and its brief says to rebase onto that branch, not the integration branch.
- Mention in its brief what the predecessors added and where. This is the context a fresh agent lacks.
- If a prerequisite is blocked or failed, or stays `ready` without merging (under the merge policy), mark the dependents `parked` with the reason, and don't launch them. If that prerequisite merges later with verified UI clearance (no open visual hold in the ledger), set `parked` dependents back to `pending` and launch them as usual, and send any stacked `ready` dependent (`"waiting on pending prerequisite"`) whose prerequisites are all now merged with verified UI clearance a follow-up to rebase onto the updated integration branch, re-validate (retaking live captures if window-drawing files changed), and merge (or run step 3 above with its live UI gate if its agent is gone); also check that every prerequisite is merged **with verified UI clearance** (no open visual hold) whenever a stacked dependent's own `ready` (`"waiting on pending prerequisite"`) report arrives, in case its last prerequisite merged while the dependent was still running. The finish waits for them unless a gone-agent stacked task cannot merge safely. They are listed in the final report.

## Cleanup after a merge

Clean up only worktrees and branches this run created.

Launch the dependents as soon as the merge is verified; they don't need the old worktree. Then clean up only once the task and everything it started have stopped. Check, in this order:

1. **Its turn.** A task can report back and keep working, for example when a background job it started wakes it, or when it re-runs the checks or retries one it listed under "Couldn't check". Once the merge is verified, that work is over: stop the turn on this same wake (in T3, interrupt it, [host-t3.md](host-t3.md#stopping-a-task)). A turn doing something the report-back mentioned as still to come, such as a follow-up you sent, finishes first.
2. **Its background jobs.** Settling a thread or closing an agent does not stop the jobs it started. Read the task's last messages for anything it started in the background (a `lease run`, a server, a measurement), then look:

   ```sh
   pgrep -fl '<worktree path>'            # processes whose command line names the worktree
   lsof +D '<worktree path>'              # processes with files or their working folder there: only the idle agent's own session
   pgrep -fl '<run directory>/<task ID>'  # jobs whose command line names the task's folder in the run directory
   ```
   Also the helpers it used that outlive it, such as a computer-use service or its `cua_node` processes, a browser or app of the kit's, a `tail -F`: stop them by process ID once no other running task uses them ([machine.md](machine.md#8-leftover-processes)).
3. **Its leases.** `lease status` (in the run's lease folder, normally the run directory) should show none held by the task. Release a merged task's lease only after its processes are gone; releasing it earlier hands the resource to another task while the old job still uses it.

If anything still runs, leave the cleanup for a later wake; the heartbeat or the task's next report will bring you back. A job that would never end on its own (a server, a watcher) after the task's turn has stopped: ask the task to stop it, or stop it yourself by its process ID, once `ps -p <pid> -o command=` shows it is the task's.

Then clean up:

1. **Remove the worktree:** `git worktree remove <path>`, without `--force`. If git refuses because the worktree has changes, leave it and record why. If the project builds desktop apps, first unregister the worktree's builds from the system, so links and app identifiers stop reaching them (on macOS, `lsregister -u <app path>`; [machine.md](machine.md#5-the-users-own-things) gives its full path).
2. **Delete the branch:** `git branch -d <branch>` works when the branch tip is an ancestor of the integration branch.
3. **If the branch was rebased:** after a rebase, the old branch ref (or the tip of a separate branch whose work was folded in) may not be an ancestor, and `-d` refuses.
   - Confirm the content is in the integration branch by comparing patches, not commit IDs: `git range-diff`, `git cherry -v <integration> <branch>`, or comparing the added and removed lines.
   - Only then delete with `git branch -D`.
   - Record the old commit in the ledger and the final report as the way to restore it: `git branch <name> <sha>`.
4. **Tidy the host's task list:** settle the task's T3 thread, or close the subagent in Codex. See the host reference.
5. **Remove its scratch folder:** `<skill folder>/scripts/prune-runs --scratch <run directory>/<task ID>`, which deletes `<run directory>/<task ID>/scratch/` (builds, downloads, other projects' source, intermediate renders) and nothing else, and says how much it freed. It refuses a folder outside a run; inside, it removes a clean git worktree whose commits are on a branch first (`git worktree remove`) and doesn't look into a SwiftPM build's dependency clones, a cache or a submodule, and it refuses for `KEEP` or an `evidence/` folder anywhere in it, a git look that fails or takes over two minutes, a worktree or clone with uncommitted changes, a worktree whose commits are on no branch, or a clone with commits on no remote and not in the integration branch. The task's notes, evidence and pictures stay. If it refuses or can't remove something, record what in the ledger and the report's "Side effects", and go on.
6. **Remove its harness temp folders:** `<skill folder>/scripts/prune-runs --harness-temp <worktree path> <run directory>/<task ID> --apply` removes the temporary folders Claude Code kept for sessions in the worktree and in the task's run folder, scratchpads and background-task output included, which outlive both ([machine.md](machine.md#6-shared-resources-and-disk)). Run it after the worktree is gone, and note what it freed.

Cleanup is for merged work only, and a split's kept branch stays. A blocked, failed, parked, stopped or ready-but-not-merged task keeps its worktree, branch and scratch folder, because they hold the unmerged work or what it needs to go on. At the finish, put an empty `KEEP` file in each such task's folder in the run directory, so `prune-runs` leaves that folder whole in later runs too. Name them in the final report.

## A pause the owner asks for

A pause the owner asks for mid-run (to close a lid or move a computer) is not a quota pause, and nothing in it is lost if you go in this order:

1. Switch the heartbeat and any resume wake off (in T3, `schedule_task` with `enabled: false`), and stop the watcher (`kill` the process ID in `<run directory>/watch-wait.pid`), so none wakes tasks you are stopping. A task's review gate deletes its own wake when told to stop; one still listed in `list_scheduled_tasks` on the task's computer (its `environmentId`) once the task is idle (titled `<task> review-gate wake`, bound to the task's thread, its ID in the task's `review*/wake.txt`), delete, and the same for a `<task> helper wake` (its ID in `<task>/helper-wake.txt`, which you then empty) and the run's second-opinion wake.
2. Tell each running task to stop at its next safe point: commit what is ready, start nothing new, cancel its reviewers and helpers, delete its review-gate and helper wakes and empty its helper-wake.txt, no rebase or push. Send it as a steer, or in mode `auto` when the task is between turns (a steer then fails with "no running turn"). Never interrupt a task mid-push.
3. Wait until each task is idle, then stop its leftover processes by process ID ([machine.md](machine.md#8-leftover-processes); on another computer, over SSH or through the run's machine thread there, [computers.md](computers.md#10-reaching-it-ssh-first-one-machine-thread-second)).
4. Set the ledger to `Status: paused until the owner continues`, each task you stopped to `paused (owner)` there and `paused` in `watch.json` (a task already paused by quota stays as it is), and tell the owner it is safe now.

On their word to continue: switch the heartbeat on (and start the watcher again), and each resume wake whose reset is still ahead (a quota-paused task whose reset passed meanwhile continues now, as on its resume wake); check each computer's keep-awake and power (restart a keep-awake that ended); set the ledger back to `Status: running` and the tasks you stopped back to `running`, there and in `watch.json`, and send each of them "continue".

The steps name T3's tools. In Claude Code, the heartbeat and resume wakes are `CronCreate` jobs: delete them (`CronDelete`) and create them again on continuing, and send the stop and the "continue" with `SendMessage`. In Codex, send them with `send_input` (or `followup_task`) and wait for the tasks with `wait_agent`; your goal ([host-codex.md](host-codex.md#staying-in-control)) would keep the turn going, so clear it (or ask the owner to) before you end the turn, and on continuing set it again and go back to the `wait_agent` loop.

## A task the user stopped

Nothing of it merges. Mark it `stopped` and park its dependents. In T3, delete its review-gate and helper wakes if listed (`list_scheduled_tasks` on its computer, titled `<task> review-gate wake` or `<task> helper wake`, bound to its thread), since a stopped task may never get to delete it. Keep its work in case the user wants it later:
1. Save everything uncommitted as a patch: `git -C <worktree> add -A && git -C <worktree> diff --cached --binary > <run directory>/stopped/<branch>.patch`. If its branch has commits (`git log <integration branch>..<branch>`), save them as well with `git format-patch -o <run directory>/stopped/<branch>/ <integration branch>..<branch>`.
2. Keep its worktree and branch: they also hold what the patch can't, such as files git ignores. Name them in the report for the user to delete once they've decided.
3. Record in the ledger and the report how to pick it up again: in its worktree as it is, or on a new branch from the integration branch with `git am` of the saved commits first, then `git apply` of the patch.

## What never happens

- Pushing, publishing, opening external pull requests, or force-updating any branch. All of these require an explicit request outside the contract. The exceptions are the owner's provider profile and skill lessons, pushed to their private state repository as the contract says ([routing.md](routing.md#6-the-owners-profile)), and, in a run with a task on another computer, the run, task and briefs branches the contract names, never forced ([computers.md](computers.md#6-commits-travel-through-the-remote)).
- Resetting, stashing or cleaning the user's integration checkout to make the gate pass.
- Merging work whose checks you have not seen pass on its final commit.
