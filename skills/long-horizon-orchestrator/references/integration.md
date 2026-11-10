# Integration, dependents and cleanup

## Merge policies

- **Merge (default):** each task fast-forwards the integration branch itself once the review and full checks pass. Tasks that finish around the same time race safely: fast-forward-only either succeeds or fails cleanly, and a task that loses rebases, re-validates and tries again.
- **Leave on branch:** each task stops with a reviewed, validated, rebased branch and reports `ready`. Nothing touches the integration branch. A dependent task is based on its predecessor's branch, forming a stack. Say so in the contract and the report, because the user then has to merge in order.

### Many tasks merging at once

With more than about four tasks merging into one branch, every merge sends the others back to rebase, and a full check after each rebase makes them queue for build slots: on 2026-11-10 three tasks ran the full check on the same base while five waited, one on its second, about 30 to 45 minutes and the matching usage each. So the common file carries from the start ([task-brief.md](task-brief.md#common-file-template)):

- **A clean rebase needs only a re-check.** Once the full check has passed on a head of the task's, a later rebase that applies cleanly needs only a build, its focused tests and the tests of any file both sides changed; then it merges at once. A rebase with conflicts, or one that changes code the task calls, needs the full check again. Every later merge that night went through without another queue.
- **Timing limits under load** fail at random, a different test each run: the task runs the failing ones once more alone, and merges with both outputs under "Couldn't check" when they pass or differ; one that fails alone, twice, is real.
- **The full check runs once at the finish,** on the integration branch (SKILL.md, "Finish"), and what it finds goes to the task that owns it or to a follow-up task.

If fast-forwards still race after that (a task fails its fast-forward twice running), declare a one-slot `merge` lease ([machine.md](machine.md#6-shared-resources-and-disk)): a task takes it after its review and its GPU, VM or screen checks, for its last rebase, the re-check and the fast-forward only, and never waits on another lease while it holds it.

### A narrow, measured miss

Work merges only when every check passes. There is one exception, and you decide it, never the task: a task that meets its main goal with a broad, measured improvement, but misses one named check narrowly, for a reason it understands. The task reports `ready` with the numbers, and you may let it merge when all of these hold:
- the miss is small and measured: the check's threshold, the result before the change and after it;
- nothing else fails, and the main deliverable isn't the check that missed;
- a follow-up task is launched for the miss, within the contract (from the reserve, or as a new task with the same scope);
- the report names the miss and its follow-up.

Then tell the task to merge (it reports again once merged), or do the gate yourself. If any condition fails, the task stays `ready` and the report lists it under "Not finished". Never loosen, skip or re-baseline the check to make it pass. In the 2026-10-15 run, two tasks merged this way, each with a follow-up, and both checks were later made to pass as they stood.

## Verifying a "merged" report

```sh
git -C <integration checkout> log --oneline <recorded start>..<integration branch>
git merge-base --is-ancestor <task head> <integration branch> && echo merged
```

Record the merged commits in the ledger. If the report says `merged` but git disagrees, treat the task as `ready` and handle it as described below.

A task may report more than once: after review fixes, a rebase or a follow-up. Act on its latest report, verify that report's head, and record the commits it merged.

## A review that didn't converge

A task whose review gate stopped, because its rounds stopped converging or in the extra look at a conflict resolution, reports `ready` with "review didn't converge" and its open or unreviewed findings. Don't send it back to the merge gate as it is, and never do the gate yourself: its change has a known blocker or unreviewed fixes. You may send it one follow-up, at most once per task, in the first case whose conditions all hold, and name the decision in the report:

- **One fix that removes code:** one blocker is open, it names a fix that removes the disputed code instead of tuning it, and the task doesn't doubt its approach. The task makes that fix.
- **Only the last fixes unreviewed:** every blocker is fixed with tests, and only the last fixes haven't been reviewed.
- **The dispute sits in one part:** the open blockers all sit in code the task can name. The task puts that code back to the integration branch's behavior and keeps it, with the findings, on a branch of its own. Once the rest merges, the task is `merged` with that branch noted in the ledger and under "Not finished" in the report, and dependents that need the kept code stay parked.

Then the task gets one fresh look at the whole diff from the cross reviewer, fixes nits, follow-ups and blockers that don't change logic as the review gate says (it lists the follow-ups that would), and goes to the merge gate. A blocker in that look that changes logic stops it; after a split, any blocker on what's left does, logic or not.

Otherwise, or when that look stops it: if the task names a concrete fix for each open blocker and doesn't doubt its approach, launch a fresh fix-up agent on its branch and worktree while its own agent stays idle (in T3, `t3_thread_launch` with `workspaceStrategy: {type: "existing_worktree", worktreePath: "<its worktree>"}`). Its brief is the [continuation brief](task-brief.md#continuation-brief) with the open findings and their fixes as the work: it applies the fixes with tests, commits, gets one more look by the cross reviewer as above in place of a new review gate, then follows steps 3 and 4 of the original brief's "Finish and merge" and its "Report back". At most two fix-ups per task, its milestones together, and the follow-up above is once per task the same way. Once it merges (under "leave on branch", once it is `ready`), go on as for the task: after a milestone that isn't the last, send the next to the task's own thread; after the last, clean up and settle the fix-up's thread with the task's. Only a disputed approach, a product decision, a blocker with no concrete fix or a third stop (the gate's and each look's count) waits for the owner: keep it `ready`, park its dependents, and list it under "Not finished" in the report with the open findings, whether the task thought the approach itself is wrong, and your recommendation.

## Follow-up findings

The review gate's follow-ups are real defects that need rare timing or input, or missing hardening, and they don't hold back a merge. A task lists its open ones with their fixes in its handoff (`<run directory>/<task ID>/handoff.md`); read them there once it merges (under "leave on branch", once it is `ready`) and record them in the ledger. Give them to one follow-up task within the contract (from the reserve, or a new task with the same scope) while the run has room; otherwise list them under "Not finished" in the report.

## A task with no independent reviewer

A task whose review gate found no reviewer of another family available (each one and its replacement limited) reports `ready` with "no reviewer available". Don't merge it, and don't do its gate yourself: the contract promised an independent review. On a later wake, once a reviewer's subscription has room (after its reset), send the task a follow-up to run the review gate again; its dependents wait meanwhile. If no reviewer has room before the finish, it stays `ready` and the report lists it.

## A task that is ready but not merged

The integration branch may have moved, or the checkout may have been dirty at the gate. (A task that stopped because one check missed narrowly, or whose review didn't converge, is a different case: see the sections above.) Either way:

1. Check the integration checkout. If it has tracked modifications the run didn't make, the user is probably working there. Don't touch it. Look again on each later wake, and once it is clean, go on with step 2. If it is still dirty at the finish, the task stays `ready` and the report lists it, with its dependents parked.
2. Otherwise, send the task a follow-up asking it to rebase, re-validate and retry the merge gate.
3. If the task's agent is gone (a closed subagent or a crashed thread), do the gate yourself in its worktree: rebase, run the full validation, then fast-forward. Run the checks yourself; never merge on an old result. If the rebase has a conflict whose resolution would change logic, don't resolve it yourself: abort the rebase, keep the task `ready`, and list it in the report.

## Launching dependents

A dependent task launches only when every prerequisite is `merged` (or `ready`, under "leave on branch"); for a prerequisite split into milestones, once the milestone it needs is, based under "leave on branch" on that milestone's own branch. A prerequisite that merged after a split doesn't count for a dependent that needs its kept code: that dependent stays `parked` until the kept code merges.

- Base it on the current integration branch head, or, under "leave on branch", on the predecessor's branch: in T3 that branch is the launch's `baseRef`, and its brief says to rebase onto that branch, not the integration branch.
- Mention in its brief what the predecessors added and where. This is the context a fresh agent lacks.
- If a prerequisite is blocked or failed, or stays `ready` without merging (under the merge policy), mark the dependents `parked` with the reason, and don't launch them. If that prerequisite merges later (a retry succeeded), set them back to `pending` and launch them as usual; the finish waits for them. They are listed in the final report.

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

If anything still runs, leave the cleanup for a later wake; the heartbeat or the task's next report will bring you back. A job that would never end on its own (a server, a watcher) after the task's turn has stopped: ask the task to stop it, or stop it yourself by its process ID, once `ps -p <pid> -o command=` shows it is the task's. In the 2026-10-12 run, removing a worktree stopped a 24-minute measurement. On 2026-10-15, a thread showed completed while its background screen check still ran; its worktree was removed and its lease released, and another task's screen check overlapped it for two minutes and had to be redone.

Then clean up:

1. **Remove the worktree:** `git worktree remove <path>`, without `--force`. If git refuses because the worktree has changes, leave it and record why. If the project builds desktop apps, first unregister the worktree's builds from the system, so links and app identifiers stop reaching them (on macOS, `lsregister -u <app path>`; [machine.md](machine.md#5-the-users-own-things) gives its full path).
2. **Delete the branch:** `git branch -d <branch>` works when the branch tip is an ancestor of the integration branch.
3. **If the branch was rebased:** after a rebase, the old branch ref (or the tip of a separate branch whose work was folded in) may not be an ancestor, and `-d` refuses.
   - Confirm the content is in the integration branch by comparing patches, not commit IDs: `git range-diff`, `git cherry -v <integration> <branch>`, or comparing the added and removed lines.
   - Only then delete with `git branch -D`.
   - Record the old commit in the ledger and the final report as the way to restore it: `git branch <name> <sha>`.
4. **Tidy the host's task list:** settle the task's T3 thread, or close the subagent in Codex. See the host reference.
5. **Remove its scratch folder:** `<skill folder>/scripts/prune-runs --scratch <run directory>/<task ID>`, which deletes `<run directory>/<task ID>/scratch/` (builds, downloads, other projects' source, intermediate renders) and nothing else, and says how much it freed. It refuses a folder outside a run; inside, it removes a clean git worktree first (`git worktree remove`; its commits stay on their branch) and doesn't look into a SwiftPM build's dependency clones, a cache or a submodule, and it refuses only for `KEEP`, an `evidence/` folder, a worktree with uncommitted changes, or a clone with commits on no remote and not in the integration branch. The task's notes, evidence and pictures stay. If it refuses or can't remove something, record what in the ledger and the report's "Side effects", and go on.
6. **Remove its harness temp folders:** `<skill folder>/scripts/prune-runs --harness-temp <worktree path> <run directory>/<task ID> --apply` removes the temporary folders Claude Code kept for sessions in the worktree and in the task's run folder, scratchpads and background-task output included, which outlive both ([machine.md](machine.md#6-shared-resources-and-disk)). Run it after the worktree is gone, and note what it freed.

Cleanup is for merged work only, and a split's kept branch stays. A blocked, failed, parked, stopped or ready-but-not-merged task keeps its worktree, branch and scratch folder, because they hold the unmerged work or what it needs to go on. At the finish, put an empty `KEEP` file in each such task's folder in the run directory, so `prune-runs` leaves that folder whole in later runs too. Name them in the final report.

## A task the user stopped

Nothing of it merges. Mark it `stopped` and park its dependents. Keep its work in case the user wants it later:
1. Save everything uncommitted as a patch: `git -C <worktree> add -A && git -C <worktree> diff --cached --binary > <run directory>/stopped/<branch>.patch`. If its branch has commits (`git log <integration branch>..<branch>`), save them as well with `git format-patch -o <run directory>/stopped/<branch>/ <integration branch>..<branch>`.
2. Keep its worktree and branch: they also hold what the patch can't, such as files git ignores. Name them in the report for the user to delete once they've decided.
3. Record in the ledger and the report how to pick it up again: in its worktree as it is, or on a new branch from the integration branch with `git am` of the saved commits first, then `git apply` of the patch.

## What never happens

- Pushing, publishing, opening external pull requests, or force-updating any branch. All of these require an explicit request outside the contract. The one exception is the owner's provider profile and skill lessons, pushed to their private state repository as the contract says ([routing.md](routing.md#6-the-owners-profile)).
- Resetting, stashing or cleaning the user's integration checkout to make the gate pass.
- Merging work whose checks you have not seen pass on its final commit.
