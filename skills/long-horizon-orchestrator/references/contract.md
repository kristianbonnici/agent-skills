# The run contract

The one message the user approves before the run. SKILL.md ("Present the run contract and get one approval") says how approval works and what happens to decisions that come up later; this file says what the message holds.

Put everything the user might want to decide into one message, so nothing needs asking later:

- **Tasks:** one plain-language line each, with the waves and dependencies.
- **How tasks run:** in T3, each task in a top-level thread of its own, which the user's approval of the contract asks for; elsewhere, as the host's subagents. Say how many tasks run at once at most on this computer, and how many of them may build or run heavy test suites at the same time (the `cpu` lease's slots, [machine.md](machine.md#6-shared-resources-and-disk)).
- **Per task:** host or provider, model and effort, branch, exclusive resources such as test ports, the helpers it may use, and its review level (light, standard or deep, by the `review-gate` skill's rules) with the reviewers that level gives it. Give the reason for any task not on the home harness, and for any task above high or on Fable 5.2.
- **Usage:** each subscription's current usage in plain words (for Claude, the Fable week beside the all-models week), any other active run sharing them ([routing.md](routing.md#2-measure-capacity-as-plan-size-times-room-left) shows how to find them), and what the run is expected to consume. For Claude, estimate it from this run's tasks (by model, review level and your own wakes), never from an earlier run's total, and give the run a budget in points of the all-models week ([routing.md](routing.md#the-runs-claude-estimate-and-budget)). With a task on Fable, give the run's Fable budget in points of the Fable week, and say that a Fable task continues on Opus 5.5 once the budget is used or the Fable week runs out. When your own thread runs on Fable, say what your wakes will cost of the Fable week, so the owner can switch you to Opus 5.5 before they leave. Say that work pauses when a 5-hour window runs out and resumes after its reset, at what time if that is likely.
- **Another run:** if another orchestrator is active on this computer, what you agreed with it before the contract: the code areas each run stays out of, the shared lease folder, ports and folders, and who does the shared finish steps ([routing.md](routing.md#running-beside-another-orchestrator)).
- **Integration branch:** the branch checked out where the run starts (`main`, `dev`, …).
  - Default policy: each task commits, passes the review gate (the `review-gate` skill: reviewers of another model family, at a level set by what its diff touches), passes the full checks, and fast-forwards the integration branch itself. Nothing is pushed, except the owner's provider profile and skill lessons to their private state repository when they live there ([routing.md](routing.md#6-the-owners-profile)).
  - One exception you may decide during the run: a task that meets its goal but misses one check narrowly may merge with a follow-up task for the miss ([integration.md](integration.md#a-narrow-measured-miss)). Say so in the contract.
  - Alternative the user may choose: leave each task on its reviewed branch for the user to merge.
- **Blocked:** what makes a task stop without merging. Other tasks continue when one blocks. A check on the real screen that can't run (the screen is locked, or the app's window can't be captured) doesn't block a merge: the task merges on its other checks, and the report lists what still needs the user's eyes. The exception is a task whose main deliverable is that check.
- **Pre-flight items:**
  - uncommitted work the tasks depend on (new worktrees contain only committed work);
  - an integration checkout that isn't clean;
  - missing credentials or services.
- **Permissions and the computer:** the user won't be there to type a password or click Allow, so the run gets everything it may need before they leave. Err on the side of more: an unused permission costs nothing, while a missing one stops a task or leaves a prompt on the screen. Read the current state, then list what's missing of these, from [machine.md](machine.md):
  - admin commands for the user to paste into Terminal once (Developer mode, toolchain licenses, installs);
  - privacy permissions for the harness app and for the app the tasks build or test (Accessibility, Screen Recording, Automation, …);
  - settings for the run (screen lock and Stage Manager off when anything uses the real screen);
  - the user's own things the run must leave as it found them, and the shared resources tasks take turns on (the screen, the GPU);
  - whether the user may still be at the computer (an evening run): then the screen's lease waits until they have been away five minutes, nothing records the screen or plays out loud before that, and their screen lock must not start sooner ([machine.md](machine.md#6-shared-resources-and-disk)).

  Say that you will keep the computer awake for the whole run (`caffeinate` on macOS), and that the warm-up needs the user at the computer for about five minutes right after they approve. Approving the contract approves all of it.
- **Older runs:** run `scripts/prune-runs` (it only lists) and, when finished runs older than a week, of every project on this computer, hold more than about 1 GB beyond their write-ups, say how much, of which projects, and that you will shrink them to their notes, reports and pictures at the start ([machine.md](machine.md#6-shared-resources-and-disk)). A run folder holding a file named `KEEP` at its top is left whole, and so is a task's folder holding one.
- **Estimate:** a rough duration, labelled as an estimate. Agent runs often finish much faster than planned.
- **Ledger:** where the ledger file will be.

Before posting it, ask Fable for a second opinion on the plan when the run's Fable budget has room ([routing.md](routing.md#a-fable-second-opinion-for-your-own-decisions)), and change what its answer convinces you of.
