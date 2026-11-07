# Why the orchestrator works this way

The skill states its rules without their reasons, to keep the model's context for the work. The reasons are here.

Last checked: new work 2026-10-31; sources 2026-10-31.

## Our own runs (2026-10-04 to 2026-11-07)

The skill grew from its overnight runs; the review gate's [study](../review-gate/evidence.md) covers 263
handoffs from 21 of them. The incidents below each changed a rule. The per-run details stay in the owner's
private records.

- **An approval prompt stalled a run for seven hours** (2026-10-23): a task stopped on Claude Code's
  approval of an `rm -rf` on a variable path; the orchestrator interrupted it, ran the same kind of deletion
  itself, and waited until the owner woke. On 2026-10-27 a task's prompt waited until the owner happened to
  see it. → *never a command that waits for approval; deletions as plain `rm` of literal paths; every wake
  reads each task's thread for a pending approval; a heartbeat of 15 minutes or less.*
- **The disk filled:** 61 GB of profiler traces in the temporary folder took free space from 123 to 23 GB
  (2026-10-12), and run folders held 14.6 GB of builds, prototypes and downloaded source after three weeks
  (2026-10-31). → *large files in the run directory, free space checked on every wake, a `scratch/` folder
  deleted after each merge, and older runs pruned with the owner's approval.*
- **The screen:** tasks waited up to 69 minutes for it until leases were capped at 15 minutes (2026-10-12);
  one task renewed it for over an hour while seven waited (2026-10-15); a check's drags landed in the window
  the owner was using (2026-10-19), and evening runs found the owner still at the computer (2026-10-24 and
  -26). → *leases with bounded turns and waits, and a screen that waits until the owner is away.*
- **Cleanup that came too early:** removing a worktree stopped a 24-minute measurement (2026-10-12), and a
  thread that showed completed still had a screen check running, which another task's check then overlapped
  (2026-10-15). → *cleanup only once the task and every job it started have stopped.*
- **The owner's settings:** in four runs (2026-10-13 to -15), test builds that shared the owner's settings
  cleared a chosen model and wrote first-run state. → *a snapshot at the start, compared and restored key by
  key on every wake.*
- **OpenCode's free limit** (2026-10-29): it stopped both free models for the whole computer six minutes in,
  and again 33 minutes after it came back; one task waited out both and was parked unfinished. → *the same
  models on the OpenCode Go plan as their backup, and whole tasks starting there.*
- **Stopped reviews became the common case** (2026-11-03 and -06): the review gate's stop rule stopped 10
  of 22 tasks in one run and 8 of 9 deep-reviewed tasks in another, nearly all with every must-fix fixed and only
  the last fixes unreviewed, while the one path out, which needs a must-fix still open, fitted two. Worked outside the text, one
  fresh look by the cross reviewer at the whole diff merged three clean and stopped four on new, real logic
  defects, and putting the disputed part back to the integration branch's behavior merged the rest six
  times, about 40 fixes. → *one follow-up per stopped task: the removal fix, the fresh look, or the split.*
- **A committed test on a fixed port** (2026-11-06): one task's end-to-end test bound the port its brief gave
  it; once merged, every parallel worktree's checks ran it, and four tasks hit "Address already in use" until
  a follow-up moved it to a free port. → *tests a task commits bind port 0.*
- **Known fixes waited for the morning** (2026-11-06): four tasks' reviews stopped overnight with their fixes
  written up and the approach not in doubt, after their one follow-up; they waited about 8 hours, and the
  owner approved each fix, about 30 minutes of work each, while the run still had time and quota. → *a fresh
  fix-up agent on the same branch, at most two per task.*
- **One diff at the end** (2026-11-06): each part of a new app, 2 to 5 thousand changed lines, was reviewed as
  one diff when it was done; rounds kept finding issues across the whole diff, and a stop held back the whole
  feature, the undisputed parts too, so the owner woke to a placeholder instead of a basic working app. →
  *tasks over about 800 lines merge in milestones, a thin working version first.*
- **Hangs inside running tasks** (2026-11-06): a task's shell call hung for about 5 minutes on a stray
  command reading stdin, and another's evaluation sat at 0% CPU in a text-recognition request for about 8;
  both were found only because the orchestrator read the task's session log for a call with no result and its
  process tree, which the skill didn't say to do. A system service pinned a core from early in the night and
  stalled three tasks' tests; four heartbeats missed it, and a task's report named it about an hour later.
  Ledger times written from memory were later corrected three times. Of 17 task calls that ran 5 minutes or
  more, only one or two were stalls: the rest were reviewer waits, lease-queued builds, GPU benchmarks, a
  deliberate stress test and sleep loops on background jobs, all of which used CPU or GPU, started processes
  or wrote files. 24 of the run's 28 heartbeats found nothing to act on. → *`scripts/run-watch` first on every
  wake: a call is a hang only when its processes are idle, start nothing and write nothing; exact times from
  git and the logs.* Later the same night ledger times written from memory still ran 5 to 12 minutes late,
  because run-watch printed each time only once and a busy wake skimmed its output. → *the time lines also go
  to the run's `times.log`.*
- **Builds overloaded the owner's computer while they used it** (2026-11-06, evening): eight tasks, three
  cpu-leased Swift builds at full parallelism, a 4 GB evaluation and busy test loops took the load average
  to about 100 on 18 cores, and the harness was restarted twice; earlier the same run had reached 40 GB of
  swap with model benchmarks beside builds. Starting leased commands at nice 10 and capping each build at 6
  jobs (18 cores ÷ 3 slots) brought the load to about 20. → *`lease run cpu` lowers the priority and caps
  the jobs itself, and an evening run gives a new cpu acquire one slot less while the owner is there.*
- **Harness temp folders outlived the cleanup** (2026-11-07): after every merged task's worktree and
  `scratch/` folder had been removed and the report had said every temporary folder was cleaned up, Claude
  Code's per-working-folder temp folders still held 52.6 GB from the run's 24 task worktrees, 32.6 GB of it
  one task's evaluation libraries, model copies and builds in its session scratchpad; the owner saw free disk
  fall from 189.5 to 125.7 GB over the runs. Codex, OpenCode and Antigravity were checked: they keep session
  logs and state in their own folders (Codex's logs for that day about 0.1 GB), not a folder per worktree.
  Later that night a merged task that followed the new rule still left 6.6 GB there: two of its reviewers,
  run in its worktree, had built the code into their own session scratchpads (3.3 GB each).
  → *the cleanup removes a task's harness temp folders, the finish lists what is left and the report's size
  line counts it, briefs say the harness's scratchpad isn't scratch and reviewers build into the task's
  scratch or not at all, and run-watch's disk line names the folder that grows.*

## Outside sources

- **Anthropic, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)**
  (Justin Young, 26 November 2025):
  - Each new session starts with no memory, and compaction alone wasn't enough. What worked: a progress file
    and git history that every session reads first, and one feature at a time.
  - Two failures: building too much at once and running out of context midway, and later sessions that saw
    progress and "declare the job done" with features still missing.
  - The agent marked features complete after unit tests or `curl` checks; telling it to test "as a human
    user would", through a browser, substantially improved the results.

  → *the ledger and handoff files a fresh context resumes from; one coherent objective per task with checks
  that prove it; a report checked against git before it is believed; checks on the real screen.*
- **Anthropic, [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)**
  (Prithvi Rajasekaran, 24 March 2026):
  - Agents rate their own work too highly; a separate evaluator helped, once its prompt made it skeptical.
  - A solo run took 20 minutes and $9 and its core feature didn't work; the three-agent harness took 6 hours
    and $200 and worked noticeably better.
  - Parts of the harness stopped earning their cost as models improved (context resets after Opus 4.5, the
    sprint structure after Opus 4.6): "find the simplest solution possible, and only increase complexity
    when needed."

  → *review by agents that didn't write the change ([review-gate](../review-gate/evidence.md)); the run's
  expected cost in the contract; a version per skill, so a rule that stops helping can be found and
  removed.*
- **Anthropic, [Building a C compiler with a team of parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler)**
  (Nicholas Carlini, 5 February 2026):
  - 16 agents, nearly 2,000 sessions over two weeks, just under $20,000, a 100,000-line compiler. Each agent
    worked in its own container against a shared git upstream and claimed a task with a lock file; there was
    no orchestrator.
  - The tests did most of the work of keeping agents on track; late on, new features kept breaking old ones
    until stricter CI stopped such commits.
  - Long test output polluted context (fixed with a few lines of output and details in log files); agents
    couldn't judge elapsed time and spent hours on test runs; once all were stuck on one large bug, more
    agents didn't help until the work was split into independently testable pieces.
  - Passing tests can be mistaken for a finished job; the author was left "uneasy" about autonomous code.

  → *tasks that are independent pieces, each with its own checks; the full checks on the final commit before
  a merge; logs kept in the run directory, not in the conversation; time-bounded leases and waits; the
  orchestrator, not the tasks, chaining dependents.*
- **Anthropic, [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)**
  (Jeremy Hadfield and others, 13 June 2025):
  - An Opus lead with Sonnet subagents beat a single Opus by 90.2% on Anthropic's research eval; token usage
    alone explained 80% of the variance, and multi-agent systems used about 15× the tokens of chat.
  - Each subagent needs an objective, an output format, guidance on tools and "clear task boundaries"; vague
    briefs duplicated work.
  - It fits poorly where agents share context or depend on each other: "most coding tasks involve fewer
    truly parallelizable tasks than research."

  → *a brief with the objective, the checks, the boundaries and the report's form; the contract's usage
  estimate; dependent tasks that start only after their prerequisite merges.*
- **Cognition, [Don't build multi-agents](https://cognition.com/blog/dont-build-multi-agents)** (Walden
  Yan, 12 June 2025): share full context, because every action carries implicit decisions; two subagents
  each building half of a game made parts that didn't fit. → *one task per coherent objective, never split
  across agents; a dependent's brief says what its predecessors added; helpers only for research and fully
  specified steps, checked by the agent that asked.*
- **Anthropic, [Building agents: When to fold subagents into your main agent loop](https://claude.com/resources/articles/building-agents-when-to-fold-subagents-into-your-main-agent-loop)**
  (Diane Sarkis, 22 October 2026):
  - In several enterprise deployments, one agent with skills often beat both a single prompt and a design
    with subagents; one customer's single loop ran "roughly 2x faster" than its multi-agent harness.
    Handoffs lose context, and specialists multiply into overlapping prompts with conflicting rules.
  - Subagents still fit when one loop measurably degrades from context bloat, when tasks run in parallel
    "with fresh context windows that can be discarded once the task is done", or when one agent can't choose
    its tools or its instructions conflict. A subagent that stays is best called as a tool by the main agent.
  - On a sample support agent, folding one subagent into another "broke a process that had been passing",
    and the break showed "in one run out of two": measure, change one thing at a time, keep what holds up.

  → *a task is an agent of its own only as an independent piece with a fresh context, discarded after its
  merge; reviewers and helpers are called by the task, which keeps the work and judges what they return;
  procedures in skills, loaded when needed; skill changes proposed a few at a time, each a version, so one
  that hurts can be found.*
- **Kim, Liu and others (Google Research, Google DeepMind, MIT), [Towards a science of scaling agent systems](https://research.google/blog/towards-a-science-of-scaling-agent-systems-when-and-why-agent-systems-work/)**
  ([arXiv 2512.08296](https://arxiv.org/abs/2512.08296), blog 28 January 2026): 180 configurations, five
  architectures, three model families.
  - Centralized coordination improved a parallelizable task by 80.9% over a single agent; on a sequential
    planning task every multi-agent variant lost 39–70%.
  - Independent agents amplified errors up to 17.2×; a central coordinator held it to 4.4×.

  → *one orchestrator that verifies every report, parallel work only between independent tasks, and
  dependencies run in waves.*
- **Cemri and others (UC Berkeley), [Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657)**
  (NeurIPS 2025, Datasets and Benchmarks): 14 failure modes from more than 1,600 annotated traces of seven
  frameworks, in three groups: system design, misalignment between agents, and task verification; most
  failures came from the system's design rather than the model. → *a written contract, briefs with explicit
  checks, and verification at the source instead of trust.*
- **METR, [Measuring AI Ability to Complete Long Tasks](https://arxiv.org/abs/2503.14499)** (Kwa, West and
  others, NeurIPS 2025) and **[Time Horizon 1.1](https://metr.org/blog/2026-01-29-time-horizon-1-1/)**
  (29 January 2026):
  - The length of task agents complete at 50% reliability has doubled about every seven months since 2019;
    under TH1.1, every 131 days since 2023 and 89 since 2024, with wide confidence intervals.
  - At 80% reliability the horizons are 4–6× shorter.

  → *long work split into tasks that can each be checked, review and full checks on every merge rather than
  trust in one long run, and durations in the contract labelled as estimates.*
- **Zhong, Raghunathan and Carlini, [ImpossibleBench](https://arxiv.org/abs/2510.20270)** (October 2025):
  coding tasks whose tests contradict the specification, so passing means cheating. GPT-5 passed 54% of the
  contradictory SWE-bench tasks and Claude Opus 4.1 50%. Telling the agent to stop when tests look wrong cut
  GPT-5 from 92% to 1% on one variant; letting it abort with a flag cut 54% to 9%. → *"Blocked" and
  "Couldn't check" as outcomes a task may report instead of forcing a pass, and every merge checked by
  someone other than its author.*
- **Anthropic, [Beyond permission prompts](https://www.anthropic.com/engineering/claude-code-sandboxing)**
  (20 October 2025) and **[How we built Claude Code auto mode](https://www.anthropic.com/engineering/claude-code-auto-mode)**
  (John Hughes, 25 March 2026):
  - Sandboxing cut permission prompts by 84% in internal use. Users accept 93% of prompts, and approval
    fatigue sets in.
  - Auto mode's classifier still misses 17% of real overeager actions, such as deleting remote branches
    after "clean up old branches", or retrying a failed deploy with a skip-verification flag. After 3 denials
    in a row or 20 in all, a headless session ends.

  → *permissions granted once, in the warm-up before the owner leaves; a prompt during the run treated as a
  defect; never pushing, and never deleting branches or worktrees the run didn't create.*
- **Anthropic, [Quantifying infrastructure noise in agentic coding evals](https://www.anthropic.com/engineering/infrastructure-noise)**
  (Gian Segato, 5 February 2026): resources alone moved Terminal-Bench 2.0 scores by 6 points, and
  infrastructure errors fell from 5.8% to 0.5% with headroom; pass rates seemed to vary with the time of day.
  → *a `cpu` lease that limits how many tasks build or run heavy suites at once, so timing checks don't fail
  on contention.*
- **Anthropic, [Scaling Managed Agents](https://www.anthropic.com/engineering/managed-agents)** (Lance
  Martin, Gabe Cemaj and Michael Cohen, 8 April 2026): the session is an append-only log outside the
  context window, so a crashed harness wakes, reads it and resumes; harness assumptions expire as models
  change. → *the ledger as the orchestrator's memory across summaries and wakes, written on every state
  change; the heartbeat and resume wakes.*
- **Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)**
  (Prithvi Rajasekaran and others, 29 September 2025): the smallest set of high-signal tokens; notes kept
  outside the context window; subagents that return "a condensed, distilled summary". → *handoffs and the
  ledger instead of transcripts; fast helpers that keep long results out of a task's context; rules in the
  skill, reasons here.*
- **OpenAI, [Harness engineering](https://openai.com/index/harness-engineering/)** (Ryan Lopopolo, 11
  February 2026): three engineers driving Codex merged about 1,500 pull requests and about a million lines
  in five months. One big AGENTS.md failed; a short one that maps into checked-in docs and execution plans
  worked, and the bottleneck was an underspecified environment, not the model. → *one common file every
  brief points to, short briefs, and a contract and warm-up that set up the environment before the run.*
- **Anthropic, [Redesigning source control at Anthropic](https://www.anthropic.com/research/redesigning-source-control)**
  (13 October 2026): merged changes grew from about 2,500 a day in May 2026 to over 30,000 in September,
  most by agents. Conflicts are frequent, and Claude fixes them faster than people find them; agents still
  broke system rules, such as working out merge times by scanning the commit log. → *fast-forward-only
  merges, where the task that loses rebases, re-validates and tries again; rules that don't depend on the
  agent noticing them.* At our scale a fast-forward is cheap; at theirs, a global lock on merges was given
  up for testing after the merge.

- **DeepSeek, [dsh-superagent-prototype](https://github.com/deepseek-ai/dsh-superagent-prototype)**
  (MIT, research code), `docs/006-deployment.md`, "Hourly check": an hourly schedule, kept outside the
  service it watches, runs a deterministic `status` command; "Exit 0: do nothing and say nothing", and a
  model acts only on a failing exit. The article that introduced it describes a model-driven watchdog judging
  progress and drift; the shipped prototype's docs describe none.

  → *a script that prints nothing when all is well, run by the existing heartbeat, rather than a second
  model judging the tasks.*

## Where the evidence argues against us

- **Multi-agent work costs more and can hurt.** Google's study lost 39–70% on sequential tasks, Cognition
  advises against splitting work, and Anthropic used 15× the tokens of chat. The skill runs agents in
  parallel only between independent tasks, keeps each task's work on one agent, and chains dependents.
- **Anthropic now advises folding subagents into one loop.** Its October 2026 article finds one agent with
  skills often better, and wants a longer-running agent's tasks to "sit in the main context window". It
  studies enterprise agents that talk to users, not runs of many coding tasks over hours, which don't fit one
  window. The skill keeps work that shares context in one task, and gives the orchestrator only what it
  needs to verify, merge and chain the tasks: their reports, the ledger and git.
- **A run without an orchestrator worked.** The C compiler's 16 agents coordinated through git and lock
  files alone. That project had one near-perfect test oracle; our tasks span apps, sites and skills with
  different checks, so one orchestrator verifies each merge.
- **Harness parts expire.** Anthropic removed resets and sprints as models improved. Each skill carries a
  version, and these notes say which rule came from which evidence, so a rule can be dropped when it stops
  paying.

## Left out

Weighed and not cited, so later checks don't weigh them again unless they change:

- [AI Agent Pull Requests on GitHub: Frequency, Structure, and Merge Conflict Rates](https://arxiv.org/abs/2607.04697)
  (arXiv 2607.04697, 2026): a seven-page preprint with no venue and no named affiliations.
- [Passes Alone, Fails Together: Benchmarking Semantic Coordination in Parallel LLM-Agent Development](https://arxiv.org/abs/2609.25396)
  (arXiv 2609.25396, 2026): a workshop paper. Its finding, parallel changes that pass alone and fail
  together, fits the rule that a dependent's brief says what its predecessors added.
- [Confident and Wrong](https://arxiv.org/abs/2603.25764) (arXiv 2603.25764, 2026): false "done" claims in
  1,750 trajectories; a single author and an observational sample.
