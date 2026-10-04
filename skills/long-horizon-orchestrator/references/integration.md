# Integration, dependents and cleanup

## Merge policies

- **Merge (default):** each task fast-forwards the integration branch itself once the review and full checks pass. Tasks that finish around the same time race safely: fast-forward-only either succeeds or fails cleanly, and a task that loses rebases, re-validates and tries again.
- **Leave on branch:** each task stops with a reviewed, validated, rebased branch and reports `ready`. Nothing touches the integration branch. A dependent task is based on its predecessor's branch, forming a stack. Say so in the contract and the report, because the user then has to merge in order.

## Verifying a "merged" report

```sh
git -C <integration checkout> log --oneline <recorded start>..<integration branch>
git merge-base --is-ancestor <task head> <integration branch> && echo merged
```

Record the merged commits in the ledger. If the report says `merged` but git disagrees, treat the task as `ready` and handle it as described below.

## A task that is ready but not merged

The integration branch may have moved, or the checkout may have been dirty at the gate. Either way:

1. Check the integration checkout. If it has tracked modifications the run didn't make, the user is probably working there. Don't touch it. Keep the task `ready` and list it in the final report.
2. Otherwise, send the task a follow-up asking it to rebase, re-validate and retry the merge gate.
3. If the task's agent is gone (a closed subagent or a crashed thread), do the gate yourself in its worktree: rebase, run the full validation, then fast-forward. Run the checks yourself; never merge on an old result.

## Launching dependents

A dependent task launches only when every prerequisite is `merged` (or `ready`, under "leave on branch").

- Base it on the current integration branch head, or on the predecessor's branch for a stack.
- Mention in its brief what the predecessors added and where. This is the context a fresh agent lacks.
- If a prerequisite is blocked or failed, mark the dependents `parked` with the reason, and don't launch them. They are listed in the final report.

## Cleanup after a merge

Clean up only worktrees and branches this run created.

Wait until the task has gone idle before cleaning up. A task may report back and then keep working, for example when its queued goal turn re-runs the checks in the same worktree. Removing the worktree under it breaks that turn.
- Launch the dependents as soon as the merge is verified; they don't need the old worktree.
- Do the cleanup on a later wake if the task is still running. The heartbeat or its next report will bring you back.

1. **Remove the worktree:** `git worktree remove <path>`, without `--force`. If git refuses because the worktree has changes, leave it and record why.
2. **Delete the branch:** `git branch -d <branch>` works when the branch tip is an ancestor of the integration branch.
3. **If the branch was rebased:** after a rebase, the old branch ref (or the tip of a separate branch whose work was folded in) may not be an ancestor, and `-d` refuses.
   - Confirm the content is in the integration branch by comparing patches, not commit IDs: `git range-diff`, `git cherry -v <integration> <branch>`, or comparing the added and removed lines.
   - Only then delete with `git branch -D`.
   - Record the old commit in the ledger and the final report as the way to restore it: `git branch <name> <sha>`.
4. **Tidy the host's task list:** settle the task's T3 thread, or close the subagent in Codex. See the host reference.

Cleanup is for merged work only. A blocked, failed, parked or ready-but-not-merged task keeps its worktree and branch, because they hold the unmerged work. Name them in the final report.

## What never happens

- Pushing, publishing, opening external pull requests, or force-updating any branch. All of these require an explicit request outside the contract.
- Resetting, stashing or cleaning the user's integration checkout to make the gate pass.
- Merging work whose checks you have not seen pass on its final commit.
