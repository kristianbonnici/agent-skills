# What the ledger holds

SKILL.md ("Ledger") says where the ledger and the run directory are, and what is written to the ledger during the run. Create it in Prepare with these sections:

- **Contract:**
  - the integration checkout path, branch and starting HEAD;
  - the merge policy;
  - the user's approval, quoted with its time, which starts the run's clock for the report, and every amendment they sent during the run, quoted with its time;
  - the port and resource allocation;
  - any other active run: its ledger, the notes you exchanged and what you agreed.
- **Orchestrator identity:** your own thread or session ID; your harness, model and reasoning level as the host reports them; the versions of this skill and `review-gate`, and this skill's folder; and the IDs of the heartbeat, the warm-up wake and any resume wake.
- **One row per task:**
  - ID, title, dependencies;
  - host, provider, model and effort, as the host reports them after launch;
  - thread or agent ID and helper thread IDs, branch, worktree path, ports;
  - status (`pending`, `running`, `paused`, `merged`, `ready`, `blocked`, `failed`, `stopped`, `parked`); a `ready` task also notes why it isn't merged ("leave on branch", "narrow miss", "review didn't converge", "no reviewer available", "checkout dirty");
  - launch and finish times taken from the host's timestamps, never estimated; merged commits; notes;
  - the harness, model and reasoning level of every agent that worked on it, including a relaunched attempt;
  - helper hand-offs (which harness, model and reasoning level, for what, how many times), and any limit a helper hit and what its work switched to;
  - events such as follow-ups, nudges, relaunches, rebases, level changes, a Fable task's move to Opus 5.5 (when, the Fable week's reading against the budget, and why), and quota pauses with when they began and when the tasks resumed. The final report's charts are drawn from these.
- **Usage snapshots:** from `scripts/provider-usage`, taken at the start, before each wave, on wakes near a limit and, through `usage-sampler --final`, at the finish. Note other active runs sharing the subscriptions, and the reason for any task routed away from the home harness.
- **The computer:** what the warm-up granted and what is still missing; how the computer is kept awake (on macOS, the `caffeinate` process ID); the usage sampler's process ID and folder; where the start snapshot of the user's state is; and what was restored at the finish.
- **Rounds:** when the run goes on after its report, one line per round: its number and title, what started it, its start and end, and the integration branch's commit at each.
- **Decisions log:** what you decided on the user's behalf, and why; for a Fable second opinion, the question, its answer in a line, the Fable week before and after, and whether it changed your decision.
- **Incidents:** one line each, written when it happens, with the time: what cost the user time, work or an interruption, or needed a workaround outside this skill's rules (a stalled prompt, a disk filling up, a check that couldn't run for a reason the skill could have foreseen), what it cost, and the rule involved or missing. The finish turns them into skill lessons.
- **Open decisions:** what the user still needs to decide, with the task that raised each one and the recommendations you and the task have for it. The report gathers these with the next steps into "What needs you".
