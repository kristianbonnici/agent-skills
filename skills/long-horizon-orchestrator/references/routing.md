# Routing and capacity

Each task needs a provider and model. The default is simple: use the harness you are running on. Deviate only for a concrete reason, and never because a percentage looks better somewhere else.

## 1. Home harness first

The home harness is the harness and model the orchestrator itself runs on:
- **T3:** `inheritedProviderInstanceId` and `inheritedModel` from `orchestrator_capabilities`.
- **Plain Claude Code:** Claude.
- **Plain Codex:** Codex.

Route every task there by default. The user chose this harness for the run, its tools and installed skills are known to work, and it is usually the subscription the user sized for this kind of work.

On Claude, the home model is Opus 5.5 (`claude-opus-5-5`), for you and for every task, complex ones too, even when the owner started your own thread on Fable 5.2: Fable is rare, chosen for a task only with a reason ([Fable 5.2](#fable-52-the-demanding-tasks-only)).

The one exception: if you yourself run on Antigravity or on one of OpenCode's free or Go models, don't treat it as the home harness for complex tasks. Route those to Claude Code or Codex (see "Fast helpers" below).

Route a task elsewhere only when one of these applies, and only in the contract the user approves:
1. **Strength:** another provider clearly does a particular piece of work better and has room for it (section 4).
2. **The user asked**, in the request or the contract.

Running short of capacity is not a reason to route elsewhere. The home subscription is the one the user started the run on and sized for it; the others are usually smaller and kept for the work they were given. If the home harness can't fit the whole run, say so in the contract and plan for pauses (section 3).

Once the run has started, nothing changes subscription: not the tasks, and not you. Only a fast helper's work may switch between helpers (section 4).

## Reasoning level: medium for bounded work, high for demanding work

Medium is the normal level for a well-specified, bounded task; high is for demanding work. The owner, 12 Nov 2026: "we can more easily use medium reasoning than what we would normally use", with high kept for the more demanding tasks. An under-powered agent on demanding work still costs more than it saves (wrong turns, rework, failures found in the morning), so when a task is both, take high:

| The work | Reasoning level |
|---|---|
| A well-specified, bounded task: documents, small fixes, mechanical changes, settings, an integration with a clear spec | medium |
| Demanding work: design judgment, a tricky bug, data and sync, a broad review | high |
| A task where you see a real benefit from extra thinking (for example subtle correctness or security logic, a bug with an unknown cause, a design choice with no precedent in the project). Name the benefit in the contract | extra high |
| Rarely, on Claude: a task where Opus 5.5 would probably fall short and Fable would clearly do better. Name why in the contract | Fable 5.2 at high, not Opus 5.5 ([Fable 5.2](#fable-52-the-demanding-tasks-only)) |
| Sparingly: large or many-sided work that clearly gains from parallel sub-agents inside the task (several independent lanes, a broad review, a big refactor). Name the gain in the contract, and the brief's lane cap: "at most <n> sub-agents at once, <m> in all", from the contract's budget for it | the harness's multi-agent mode: Ultracode in Claude Code, Ultra in Codex |
| A fast helper's step or research lane, on Antigravity or OpenCode | high (see "Fast helpers" below) |
| An advanced helper step: Gemini 4 Hydrogen first, then Gemini 4 Argon | high: `gemini-4-hydrogen-high`, `gemini-4-argon-high` (see "Advanced helpers" below) |

- **Never use low reasoning.** If a task feels too small for medium, it is probably a step to hand off, not a task.
- **Always set the level explicitly at launch,** and never inherit a model's default. Some defaults are low: in T3, Codex's `gpt-6.1-sol` and `gpt-6.1-terra` default to low.
- **In T3, the option names differ by provider:**
  - Claude: `{"id": "effort", "value": "medium" | "high" | "xhigh"}`. Ultracode is an option of its own beside it, `{"id": "ultracode", "value": true}`, only on models that list it, such as Opus and Fable, not Sonnet. Claude's models default to medium in T3, so always pass the effort.
  - Codex: `{"id": "reasoningEffort", "value": "medium" | "high" | "xhigh" | "ultra"}`.

  Use only values the capability catalog lists for that model.
- **Capacity still applies.** Higher reasoning uses more of a subscription, and the multi-agent modes use a 5-hour window much faster than a single agent, because every sub-agent draws on the same window. Start a multi-agent task early in a window, not when the window is already well used, and expect it to pause for a reset on a long run. Don't step down to a level below what the work needs to save capacity.
- **A budget is set before the call, not after.** A wake can't stop a call already running: on 2026-11-03 four Ultracode tasks started 10 to 97 sub-agent lanes each and took Claude's week from 81% to 97% in about 16 minutes, and one async Argon lane took Argon's week from 0 to 80 points against a budget of 30. So a multi-agent task's brief names its lane cap, and Argon runs only in `wait` mode with a timeout of a few minutes ([Advanced helpers](#advanced-helpers-gemini-4-hydrogen-then-argon)).

## Fable 5.2: the demanding tasks only

Claude Fable 5.2 (`claude-fable-5-2`) is a step above Opus 5.5, and it costs about twice as much: twice Opus's price per token on the API, and on a subscription it uses up the week faster than other models, within a weekly limit of its own. The owner wants it used very sparingly (2026-11-11: "only when the demand is such that it would probably clearly be the best, but otherwise, for most even complex tasks, Opus is more than good enough"). So:

- **The answer is Opus 5.5, complex tasks included.** Opus is the home model for you and every task (section 1). Hard, long, important or many-sided work is still Opus work.
- **Fable only when the contract can say why Opus would probably fall short and Fable would clearly do better:** "Fable 5.2 at high, because <why Opus would probably fall short here>". The usual case is a problem Opus 5.5 has already failed on: a bug whose cause two attempts didn't find, a review that stopped twice on the same design question (a relaunch, with the contract's or the owner's yes). Most runs have no Fable task.
- **For the part that needs it.** A Fable task's later milestones, and any fix-up agent, follow-up task, helper, reviewer or trial reviewer, run on Opus 5.5 (the `review-gate` skill's tables never use Fable), unless the contract says why that part needs Fable too.
- **Not for your own thread, unless the owner set it.** Don't move yourself to Fable; if the owner started you on it, stay on it (never switch your own model during a run), and say in the contract what your wakes will cost of the Fable week (on 2026-11-10, about a point every 15 to 20 minutes with no Fable task running) so they can switch your thread to Opus before they leave.
- **Only on the Claude provider** (`claudeAgent`). Never through OpenCode's `opencode/claude-fable-5-2`, a paid model that bills per request. On the API instance it draws on the credits, about twice as fast as Opus, and not on the Fable week: there the credits' rules and reserve hold it ([Claude API credits](#claude-api-credits-use-what-would-expire)), the contract gives it a budget in dollars of its own, and the Fable week's budget and checks below don't apply.
- **On the subscription, only on a plan that includes it.** On plans where Fable isn't part of the usage limits it bills usage credits from the first token: the profile's Plans line says which, and a live `provider-usage` reading with `weekly_fable` is the sign it is included. Without that, no task runs on Fable on the subscription; a task on the API instance needs only its dollar budget and the credits' reserve.
- **Effort:** high, set explicitly (T3 and Claude Code default Fable to medium). Extra high only with a benefit named in the contract, for the hardest long-running work. Never max, low or medium, and no Ultracode on Fable unless the owner asks for it: every sub-agent would draw on the same Fable week.

### Its weekly limit

`provider-usage` shows Claude's Fable week as `weekly_fable`, read from Claude Code's `/usage` ("Current week (Fable)") beside `weekly`, the week for all models. It is read live only: the harness logs that `--cached` and the sampler's 5-minute readings come from don't carry it, so the sampler records it with its hourly live readings, and a usage check for it runs `provider-usage` live.

- **Fable work counts on both weeks.** It draws on the all-models week, faster than other models, and the Fable week is a cap inside that week, not extra room. Read each one's `resets_at` rather than assuming they reset together. Whether Fable counts toward the 5-hour window more heavily isn't published: judge a Fable task's 5-hour window as any Claude task's.
- **Capacity is judged on both.** A Fable task fits only when the Fable week has room for it within the run's budget and the all-models week still has room for the rest of the run with it. Until the profile has a calibration for Fable, assume a Fable task-hour takes about twice an Opus task-hour of the all-models week.
- **The contract gives Fable work a budget** in points of the Fable week: by default at most a quarter of what is left (the run of 2026-11-10 used that; the owner kept it on 12 Nov 2026), so the owner keeps the rest of their week, and less when the all-models week is short. Name the Fable tasks and their reasons, and record the budget, and the Fable week's reading at the start, in the ledger.
- **Every wake's usage check watches it** while a Fable task runs: compare what the run has used of the Fable week with the budget, and watch the pace as for a 5-hour window (section 3). When the budget will be passed before your next heartbeat at the current pace, treat it as passed.
  - **What the run has used** is a running total kept in the ledger beside the last reading it counted: each wake adds the rise since that reading. When the week has reset since (`resets_at` passed, or `reset_since_observed`), it adds the new reading whole, and for the stretch between the last reading before the reset and the reset, the use at the run's average Fable pace (its total so far over the Fable task time so far), and never less than one point for each Fable task that ran in it. So that stretch stays short, a Fable task running when the Fable week will reset gets a one-off wake about 5 minutes before its `resets_at`, scheduled like a resume wake, which takes that last reading: check that the wake's next run falls before the reset, and when the reset is less than 10 minutes away, take the reading now instead. When no reading came in the last 10 minutes before the reset, the run's budget counts as passed. A reset doesn't refill the run's budget.
  - **A missing reading is no reading.** A live `provider-usage` without `weekly_fable` (the live call failed and the logs it falls back to don't carry it) or with a stale `observed_at` or no `resets_at` (so a reset can't be told from use) can't show the budget: launch no Fable work on it, and when no fresh reading has come for an hour while a Fable task runs, treat the budget as passed.

### When the Fable week runs out or passes its budget

A weekly limit can't be waited out like a 5-hour window, and Opus 5.5 is on the same subscription, so the task moves model instead of pausing. This is the one model change "Quota pauses work; it never moves it" allows; everything else about that rule stands:

1. **The Fable task continues on Opus 5.5, at the same effort, on its own thread.** In T3, once its turn has stopped (the Fable limit stops it; for the budget, `t3_thread_interrupt` its turn and wait until the thread is idle), look for what it started that may still run in its worktree, its background jobs and the reviewers or helpers it launched, as the cleanup after a merge does ([integration.md](integration.md#cleanup-after-a-merge), steps 2 and 3; in T3 also its child threads, `t3_thread_list` with `includeSubagents: true`), and name them in the message below so the task waits for them or stops them first; then set its thread's model between turns: `t3_thread_configure` with the task's `threadId` and a `modelSelection` of `claude-opus-5-5` with its effort ([host-t3.md](host-t3.md#when-a-window-runs-out)), never your own thread, as the last call of your wake. On the next wake, read it back, then send: "Your model is now Claude Opus 5.5, because the run's Fable budget is used up. <Still running from before: …; check them before you change files.> Continue the brief from where you stopped." It keeps its whole conversation. Where a host can't set a running agent's model (a Claude Code subagent), save its uncommitted work as a patch and continue it with a continuation brief on Opus 5.5 in its worktree ([task-brief.md](task-brief.md#continuation-brief)).
2. **The ledger records the switch:** the time, the task, the Fable week's reading against the budget, and why. Launch no more Fable work in this run, and the report names the move.
3. **A Fable task stopped by the all-models week or the 5-hour window pauses** like any other task: Opus draws on the same windows, so moving wouldn't help.

### A Fable second opinion for your own decisions

You run on Opus 5.5, and a few of your decisions shape the whole run. Before those, ask Fable 5.2 for a second opinion (owner, 2026-11-13): one bounded question with the facts it needs, answered once, not Fable running the run. Fable doesn't see your conversation, only the brief you write, so a call costs what that brief and the files it reads cost.

**When:** only at these points, and only where the answer is a real choice:
- **The contract,** before you post it: the split into tasks, the waves and dependencies, the routing, the review levels, and anything you were unsure about.
- **A review that didn't converge,** before the task waits for the owner ([integration.md](integration.md#a-review-that-didnt-converge)): whether the approach itself is wrong, and a concrete fix for each open blocker if it isn't.
- **A blocked or failed task whose cause isn't mechanical,** before you park it or relaunch it: what is wrong and what the next attempt should do differently.

Never for a review of a diff (the review gate does that, and Fable never reviews), never for routine wakes, and not when your own thread runs on Fable.

**The brief,** self-contained: the decision and its options; the facts (the contract draft, or the task's brief, handoff and open findings, with the worktree path and branch for it to read); what you lean towards and why; and what to return: a recommendation, its reasons, what would change it, and its confidence. Tell it to stay read-only, not to commit, run nothing that writes, not to reach the owner's apps or services, and never to ask the user anything.

**How:** in T3, `delegate_task` with target `{providerInstanceId: "claudeAgent", model: "claude-fable-5-2", options: [{id: "effort", value: "high"}]}`, role `"research"`, `interactionMode: "plan"` (Claude's read-only mode), mode `"wait"` with a `timeoutMs` of about 15 minutes. In Claude Code, the `Agent` tool with `subagent_type: "Plan"` (read-only: no edit or write tools; only the brief keeps its shell read-only), `model: "fable"` and `effort: "high"`, in the foreground. In Codex, a command with a time limit: `perl -e 'alarm 900; exec @ARGV' claude -p --model claude-fable-5-2 --effort high --permission-mode plan "<brief>"`, from the worktree when there is one. Not through the API instance unless the contract gives it a dollar budget, and never OpenCode's `opencode/claude-fable-5-2`.

**Its budget:** the contract allows at most 3 second opinions by default (the contract's own, and two later), and always states a Fable budget in points of the Fable week, with the reading it started from, even when no task runs on Fable: then the budget is for the opinions alone, by default 5 points or a quarter of what is left, whichever is less. The contract's own opinion comes before that approval, so take it only while the Fable week has at least 10 points left, and count what it used in the budget the contract states. Read `weekly_fable` live before each one and after it. Each reading updates the run's Fable total as a wake's reading does, from the last reading counted ([Its weekly limit](#its-weekly-limit)), so a Fable task running meanwhile is counted once and the opinion isn't counted twice; record both readings in the ledger, with the opinion's rise (after less before, which includes any Fable task running then) for calibration. Skip it, and decide alone as before, when the count is used, the run's Fable total has reached its budget or would before the opinion ends at its pace, a live reading is missing, the owner's Claude plan doesn't include Fable, or the run's Claude budget or a Claude window has no room for it ([The run's Claude estimate and budget](#the-runs-claude-estimate-and-budget)).

**When it doesn't answer in time:** a wait that returns `waitTimedOut` doesn't stop it. Cancel it (`task_cancel`), check that `task_status` shows it stopped, and only then take the after-reading and decide alone. It counts against the 3. On Claude Code, a foreground `Agent` call ends with its answer or its error; on Codex, the time limit above stops the command.

**You still decide.** It advises; your rules still say what waits for the owner. Weigh its answer against what you know, and record in the ledger's decisions log the question, its answer in a line, your decision, and whether its answer changed it. A concrete fix it names counts as the task naming one ([integration.md](integration.md#a-review-that-didnt-converge)) once the task agrees the fix fits, never for a product decision or a disputed approach, which still wait for the owner. The report says how many second opinions the run asked for and what they changed.

## 2. Measure capacity as plan size times room left

Run `scripts/provider-usage` (in this skill's folder):
- at the start;
- before each wave;
- on every wake while the home 5-hour window is past about half;
- at the finish.

It prints each provider's plan and the usage and reset time of its 5-hour and weekly windows. Record each snapshot in the ledger.

The script asks each provider directly, so the numbers include use from other devices and apps (claude.ai, ChatGPT, Codex elsewhere):
- **Claude:** Claude Code's own `/usage` command, run without a model call (`claude -p /usage`). It uses no quota and works even when the window is used up. Its windows are `five_hour`, `weekly` (all models) and, on plans that include Fable, `weekly_fable`, Fable's own week inside it ([Fable 5.2](#its-weekly-limit)).
- **Codex:** Codex's app server (`account/rateLimits/read`), with Codex's own sign-in.
- **Antigravity:** the Antigravity CLI's own `/usage` command (`agy -p /usage`), which starts no agent turn and uses no quota. Antigravity splits its models into groups, and each group has its own windows:
  - `gemini_models_five_hour` and `gemini_models_weekly`: Gemini 4 Hydrogen, Flash and Pro, so the Hydrogen helper (Antigravity's group note names only Flash and Pro, but a Hydrogen call on 2026-11-13 moved these windows and not Argon's);
  - `gemini_4_argon_weekly`: Gemini 4 Argon. On the Pro plan, Argon has its own weekly window and no 5-hour one;
  - `claude_and_gpt_models_*`: the Claude and GPT models Antigravity also offers, which the run doesn't use.

  Quota is used in proportion to the cost of the tokens, so a call's size matters more than how many calls there are. If `ai_credits_remaining` appears, the owner has paid credits that Antigravity can spend once a window is used up. Never let a run spend them: an Antigravity helper that reports a quota error stops there, even if credits would let it go on.
- **Copilot:** GitHub's own quota endpoint (`gh api /copilot_internal/user`, the one its editors use), which spends nothing. Copilot has one window, `monthly`, with `units_entitled` and `units_remaining`; it resets on the first of the month. It is billed by token cost in fractional units, not per request. If the live read fails, `local_units_used_this_month` gives what this machine's Copilot sessions spent (from `~/.copilot/session-state`), but not what is left. If `overage_permitted` appears, GitHub would bill the owner past the budget: never let a run go past it.
- **OpenCode Go:** the endpoint T3 Code reads (`opencode.ai/zen/go/v1/usage`), with the key OpenCode keeps for its console, which spends nothing. All Go models show as one set of windows, `five_hour`, `weekly` and `monthly`, in whole percents. The endpoint isn't documented, so if it stops answering, watch Go's helpers for errors instead. It is left out without an OpenCode key, and shows an `error` when OpenCode refuses the key.

When a live query fails, for example with no network, the script falls back to the last values Claude and Codex wrote to local logs and says so in `source`. Antigravity and OpenCode Go have no such logs, so they get an `error` instead. Those are only as fresh as the last request made on this machine. `--cached` skips the live queries; `--go-live` beside it still reads OpenCode Go, one web request and no tokens, as the usage sampler does.

Codex may list free rate-limit resets (`reset_credits_available`). Never use one: spending them is the user's decision.

Percentages from different plans are not comparable. 30% left of Claude Max 20x is many times more work than 30% left of ChatGPT Plus. Turn each number into how many tasks still fit:

```
tasks that fit ≈ (100 − used_percent) / percent one task uses on that plan
```

- **Where "percent one task uses" comes from:** the calibration in the user's profile (section 6). With no calibration yet, be conservative on small plans. On a Plus-sized plan, assume one heavy implementation task takes about a whole 5-hour window per hour of work: on 2026-10-15, three Codex tasks at high drained a fresh ChatGPT Plus window in about 20 minutes, twice (about 90% of a window per task-hour). On a Max-sized plan, assume a small share.
- **Learning it:** after each task, update the calibration from the snapshots taken before and after. If several tasks shared the provider, split the change between them by duration. Calibrate only from real runs, with tasks of about 20 minutes or longer. Short tasks and test runs give wildly misleading per-hour rates: a 3-minute task that moves a window by 3 points is not "60% per hour". When a run is too short to calibrate from, say so in the ledger and leave the profile unchanged.
- **The 5-hour window limits a wave; the weekly window limits the whole run.** The weekly window also covers the user's next days, so don't plan to use more than about 80% of a weekly window without saying so in the contract.
- **Staleness:** treat `observed_at` as the age of the number. A window with `reset_since_observed: true` has reset since it was read, so it is near zero again.
- **Missing data:** if a provider's usage can't be read, say so and route by plan size alone. The usage of OpenCode's free tier is never readable, so its helpers are watched for errors and slowdowns instead (section 4). Watch Antigravity's helpers that way too whenever its usage can't be read.
- **Other runs share the windows.** Another orchestrator run on the same machine draws on the same subscriptions. Before the contract and before each wave, look for other ledgers next to yours:

  ```sh
  grep -l -E '^Status: (running|paused)' "${XDG_STATE_HOME:-$HOME/.local/state}"/agent-skills/long-horizon-orchestrator/*.md
  ```

  A ledger without a `Status:` line (from an older version of this skill) is active too while any branch its task rows name still has a worktree (`git worktree list`), whatever its age. For each active run, count its running tasks on each provider and leave room for them. Name them in the contract, and in the report's usage line, because they make the usage numbers a shared total. Then coordinate with it, as below.

### The run's Claude estimate and budget

Estimate the run's Claude use from its own tasks, never from an earlier run's total: on 2026-11-10 a contract judged "a few percent" from a run that had used 9% of the week in 12 hours with four Opus tasks, and nine Claude tasks at once, three on Fable, used 15 points in 77 minutes. Count:
- each Claude task's expected hours by model, at the profile's calibration (points of the all-models week per task-hour), or without one about one point per Opus task-hour and two per Fable task-hour on a Max 20x plan (that night's rate);
- their reviews and fix-ups on Claude, by each task's review level;
- your own wakes, twice as much on Fable;
- the Fable second opinions the contract allows, about twice an Opus call of the same size each, with what the contract's own one used ([A Fable second opinion](#a-fable-second-opinion-for-your-own-decisions)).

Say the estimate in points of the all-models week, and give the run a Claude budget in those points: by default the estimate plus a quarter, and never more than the owner's share of what is left. The ledger keeps what the run has used as a running total, counted as the Fable budget's is ([Fable 5.2](#its-weekly-limit)), and every wake's usage check compares it with the budget. When the run would pass it before the next heartbeat at its pace, launch no more Claude work: later milestones and Claude tasks not started yet are parked for the owner, and running tasks finish what they are on. Record it in the ledger and the report.

### Running beside another orchestrator

The owner sometimes runs two orchestrators at once on one computer, often on the same repository. On 2026-10-15, two runs shared one checkout, one Claude plan and the screen for about four hours without trouble, because they agreed how. When another run is active:

1. **Write to it before your contract.** Its ledger names its thread (in T3, send to that thread with `t3_thread_send` in mode `queue`). Say which run you are, where your ledger is, which code areas and shared resources your tasks will use, your ports and folders, and when you expect to finish. Wait a few minutes for its answer (in T3, `t3_thread_wait` on its thread, then read its last message). Keep the note and its answer in your ledger, and ask it to keep them in its own. If no answer comes (the run is paused, or doesn't know this protocol), go on with safe defaults, however old its ledger (a run that seems dead may still have tasks working, so never treat it as gone): stay out of the code areas its ledger names, use its lease folder if it has one (otherwise make one and tell it), keep clear of its ports and folders, and leave the shared finish to whichever run turns out to be last.
2. **Split the code areas.** Say in your contract which parts of the code your tasks stay out of because the other run works there, and ask it to do the same for yours. Overlap only where both runs agree.
3. **Share one lease folder.** Both runs take turns at the screen and the GPU through the same leases: a folder of its own next to the ledgers (for example `<repo>-<computer>-leases/`, with `bin/lease` and `leases.json`, [machine.md](machine.md#6-shared-resources-and-disk)), with owners named after their run (`app-B`, `ask-F`). If the other run already set one up, use it.
4. **Keep ports and folders apart,** and name the other run's in your briefs as not yours to stop or reuse.
5. **Its merges are normal movement of the integration branch.** Your tasks rebase onto them as onto any other merge. Never revert or rework the other run's merged work; tell it what you found instead.
6. **The user's settings are shared.** Both runs' test builds may write the same settings of the user's app. When your wake's settings check ([machine.md](machine.md#7-during-the-run)) shows a change, find whose build made it, restore it, and tell that run, so it steers its task.
7. **Agree on the shared finish.** Steps that touch what both runs share (relaunching the user's app, the final comparison of their settings) are done once, by whichever run finishes last. If the other run hasn't answered all run (it may have died with its ledger still saying `running`), write to it once more at your finish; with no answer then either, do the shared steps yourself, stop nothing of its own, and say in your report that its ledger still looks active. Each run still runs the quick main check for its own report: the first to finish in a detached worktree, the last in the checkout (SKILL.md, "Finish"). The first to finish tells the other, and the last names both runs in its report.
8. **Forward findings.** Anything one run learns that affects the other (a flaky check, a new rule for the briefs, a shared file that broke) goes to the other run's thread at once.

## 3. When a window runs short or runs out

When a usage window runs out, the work that depends on it pauses. Nothing moves to another subscription: not a task, and not you. (A fast helper that hits its own limit is different: its work switches to another helper, section 4.) Waiting beats a hand-off in two ways:
- the subscriptions stay used the way the user sized them;
- an agent that resumes on its own thread keeps everything it knew, which a successor would have to rebuild from notes.

### Before launching

If a wave won't fit in the home harness's 5-hour window, launch what fits and hold the rest until the reset, with a resume wake scheduled for just after it (below). Tasks that the contract routed to another provider follow that provider's windows in the same way.

On a small plan such as ChatGPT Plus, each hour of a heavy task takes about a whole window (section 2). Launch such tasks one at a time, or together only when the contract accepts a near-certain pause, and schedule the resume wake as soon as they start.

### Watch the pace, not just the level

Compare each snapshot with the previous one. A window can go from comfortable to empty between two heartbeats, especially while a multi-agent task runs. Schedule the resume wake as soon as either is true:
- the home 5-hour window is past about 85%;
- at its current pace, it will run out before your next heartbeat.

Do it early: once the window is empty, you can't act until it resets.

### The resume wake

The resume wake is a one-off wake-up a few minutes after the window's reset time (`resets_at` from `provider-usage`). The host reference shows how to schedule it.
- Record its ID and time in the ledger.
- Once work has stopped, set the ledger's status to `paused until <time>`.
- Remove the wake after it has fired.

Keep the heartbeat too. Its ticks while the window is empty simply fail, and the first tick after the reset resumes the run if the resume wake didn't.

### A running task hits its quota

Signs:
- its thread stops, goes idle or fails with a usage-limit or rate-limit error, without reporting back (an agent with no quota left can't send a report);
- `provider-usage` shows its provider's window at or near 100%.

Then:
1. Leave it exactly as it is: its thread, worktree and uncommitted changes. Don't relaunch it, and don't hand it to another provider. The exceptions: a task on a free model ([below](#a-task-on-a-free-model)), Claude work between the subscription and the owner's API credits as the contract allows ([Claude API credits](#claude-api-credits-use-what-would-expire)), and a Fable task stopped by the Fable week, which continues on Opus 5.5 ([Fable 5.2](#when-the-fable-week-runs-out-or-passes-its-budget)).
2. Make sure the resume wake is scheduled, and mark the task `paused` in the ledger with its expected resume time.
3. On the first wake after the reset, check whether the task is running again. If not, continue it on the same thread: "Your usage limit has reset. Continue the brief from where you stopped." This nudge doesn't count as the task's one nudge for silence.

### A task on a free model

A free model's limit isn't a window the run was sized on, and its reset can't be read or scheduled: on 2026-10-29, OpenCode's free limit stopped DeepSeek and GLM together, for the whole Mac, six minutes into the run, and again 33 minutes after a reset 2h 15m later. Task C waited out both and was parked unfinished. So a task given to a free or Go model doesn't pause; it moves:

1. **It starts on Go, not the free tier** (owner, 2026-11-01). A whole task given to this pool starts on `opencode-go/deepseek-v4.1-flash`, or on `opencode-go/glm-5.3-flash` while DeepSeek "requires Global regions": a stop in the middle of a task costs a handoff, and the free tier can stop at any moment.
2. **Between OpenCode's free tier, OpenCode Go and Antigravity's Gemini models, always** (owner, 2026-10-30, Go added 2026-11-01). They are the run's free and low-cost pool, so a task moves to the next one whenever a limit stops it, in any direction, without a line in the contract and without asking: to Go while either of its two models answers, to Gemini 4 Hydrogen at high while the Gemini windows have room (or Gemini 4 Argon within the run's Argon budget, for work Hydrogen can't do well), and to OpenCode's free models while they answer. OpenCode's free limit covers all its free models at once, so moving to the other free model doesn't get past it.
3. **Then to a paid model, also without asking** (owner, 2026-10-30: the run is mostly on paid subscriptions anyway). When the whole pool is limited, move the task to Codex's GPT-6.1 Terra or Claude Sonnet at high, whichever has more room in its windows. You choose at the time; nothing about it goes to the user before or during the run.
4. **When the limit stops it** (its thread fails or stops on "Free usage limit reached", a quota error, or a rate-limit error that a retry a few minutes later still gets), save its uncommitted changes as a patch in the run directory, note in the ledger what it finished, and launch the next model at once on its own thread with the same brief, the same branch and worktree where the host allows (else a new one with the patch applied), and a handoff note: what is done, what is left, where the patch is.
5. **Don't wait for the limited model,** and don't move the task back when it recovers. If the next one is limited too, take the one after; only when the pool and both paid models are all limited does the task pause, or park at the end of the run.
6. **In the report,** say which model finished the task, and when and why it moved.

### Your own quota

You run on the home subscription too, and you stay there. Never switch your own thread to another provider or model to keep going. In T3, a self-switch ends your turn on the spot and leaves stale records behind (see [host-t3.md](host-t3.md#when-a-window-runs-out)).

Your turns are short, so they rarely run out halfway. When your window is nearly used up, schedule the resume wake, update the ledger and end your turn. After the reset, the resume wake (or the heartbeat) wakes you on the same subscription.

You don't need a stand-in orchestrator on another provider for this, not even a cheap one on Antigravity:
- the host's scheduler wakes you after the reset, with no model running in between;
- a stand-in would itself need a model switch on your thread, or a scheduled wake of its own;
- it would put a weaker model in charge of decisions about the run.

### A weekly limit

If a provider's weekly window runs out with work left (Claude's Fable week is different: its task continues on Opus 5.5, [Fable 5.2](#when-the-fable-week-runs-out-or-passes-its-budget)):
- If it resets within a few hours, wait, as for a 5-hour window.
- Otherwise, park the remaining tasks on that provider, finish the run and report. Whether to wait for the reset or to move the work is the user's decision.

### Always

Never work around a limit silently. The report says which tasks paused, for how long, and why.

### Claude API credits: use what would expire

The owner may have Claude API credits beside the Claude subscription: in T3, a second Claude instance (`claudeAgent_claude_api`) runs the same models, billed to the credits. The credits are dollars that expire, not windows that reset, so:

- **Read them in the usage snapshot.** `provider-usage` reports them under `claude_api`: the owner's grants in `api-credits.json` beside the provider profile (each grant's amount, expiry, and the balance the Console showed, with when), less the API spend T3 has logged since at list prices, soonest-expiring grant first. It is an estimate; say so, with the time of the Console reading. An estimate marked `incomplete`, or an error, counts as nothing left.
- **Choose each task's Claude instance at launch, in the contract.** While a grant expires within about a week with money left, Claude tasks and Claude reviewers run on the API instance first, sized to use what would otherwise expire and no more. Otherwise they run on the subscription. Your own thread stays on the instance it runs on.
- **The account is the safeguard against overspending.** Use the API instance only while the owner's API account has no payment method (the owner's case on 2026-10-30): running out then fails requests instead of billing, and the task moves on as below. If the account has one, the contract must name how much may be billed beyond the credits, or the API instance isn't used. Either way, keep a reserve: launch no new work on it once the estimate is below about $20 for each API task already running: costs reach the logs only as each result ends, so the estimate trails what running tasks spend.
- **Moves, each at most once per task:**
  - to the subscription, when the credits' estimate runs out (or the API instance reports the credits used up): the rest of that task continues on the subscription, on its own thread, as a free model's task moves on ([A task on a free model](#a-task-on-a-free-model));
  - to the API instance, only if the contract allows it (the owner uses the credits as a backup), when the task's Claude subscription window is used up and its reset is hours away, and only within the reserve. A task goes to the API instance at most once, so a task that came back to the subscription when the credits ran out pauses there for the reset.
- **In the contract,** give each grant's estimated balance and expiry, which tasks run on which Claude instance, and whether work may move to the API instance as a backup. In the report's usage line, give the credits' estimated balance at the start and the end, with what expired during the run apart from what was spent.

## 4. Strengths: a soft preference

| Work | Prefer | Applies when | Basis |
|---|---|---|---|
| Computer use: operating a desktop app or real browser, clicking through a UI, checking what is actually on screen | Codex's GPT-6.1 Terra (`gpt-6.1-terra`, at high) | Codex has room for that piece | Owner's assessment, 2026-10: Codex's computer use is stronger. Owner, 2026-10-28: Terra is cheaper than Sol and faster at computer use, so it takes these steps |
| Research and retrieval: web and documentation research, searching a codebase, logs or many files, surveying how others solve a problem, collecting facts and evidence | A fast helper (see "Fast helpers" below), as a sub-task or a research subagent inside the task | the result can be checked against its sources | Owner, 2026-10-16: use them freely for research and retrieval |
| A simple, fully specified step: a mechanical edit from an exact rule, renames, boilerplate from a template, extracting facts from named files | A fast helper | the result is cheap to check | Owner, 2026-10 |
| A bounded sub-task too hard for the flash models: deep research and synthesis, a scoped investigation, a well-specified piece of code | Gemini 4 Hydrogen, then Gemini 4 Argon where Hydrogen's answer fell short or Hydrogen was limited (see "Advanced helpers" below) | the Gemini windows have room (Argon: the run's Argon budget has room), and the agent that asked can check the result | Owner, 2026-10-17; Hydrogen first, owner 2026-11-13 |
| Everything else | Home harness | always | section 1 |

- **A preference, not a rule.** Claude agents can do computer use too. When Codex is short on room, unavailable, or the computer-use part is trivial, keep the work on the home harness.
- **Apply it to the smallest sensible piece.** If only one step of a task needs computer use, keep the task on the home harness and hand that one step to Codex (section 5). Move the whole task only when most of it is computer use, and then to Terra too.
- **Terra, not Sol, for computer use.** Since 2026-10-28 the owner's Codex plan includes GPT-6.1 Terra, which costs less of the plan than GPT-6.1 Sol and is faster at computer use (owner). Use Terra at high for computer-use steps and for a task that is mostly computer use; keep Sol for work where its extra strength is the point. Terra's cost per task-hour on the owner's plan isn't calibrated yet: record the window's change around each Terra hand-off (section 2).
- **The user can override this.** The owner's profile (section 6) wins over this table.

### Fast helpers: Antigravity and OpenCode

Two providers offer fast models that cost the run little. Handing them research and simple steps saves the task agent's context and its subscription for the work that needs judgment:

- **Antigravity:** `gemini-4-hydrogen-high`, Gemini 4 Hydrogen at high reasoning (owner, 2026-11-13), which replaced Gemini 3.8 Flash. While Antigravity still lists `gemini-3.8-flash-high`, it is the fallback for a Hydrogen that Antigravity reports unavailable; never Hydrogen through OpenCode, where `opencode/gemini-4-hydrogen` bills per request.
- **OpenCode:** only its two free models that are good enough (owner, 2026-10-16): `opencode/deepseek-v4.1-flash-free` and `opencode/glm-5.3-flash-free`, each with `{"id": "variant", "value": "high"}`. When the free tier stops them (owner, 2026-11-01): `opencode-go/beam-free`, free for a limited time and outside both the free tier's limit and the Go plan's, then the same two models on the owner's flat-rate OpenCode Go plan, `opencode-go/deepseek-v4.1-flash` and `opencode-go/glm-5.3-flash`, all with the same option. Its other free models, Go's Iceman among them, aren't good enough. Its `opencode/` paid models bill the owner per request (`opencode/deepseek-v4.1-flash`, without `-free`, is one). Go's other models count far more heavily against the plan. Use none of these.

These models stay fast at high reasoning, and the extra reasoning is what makes their results dependable. Don't use these providers' other models or levels (Gemini Pro, Hydrogen at extra high, the Claude and GPT models Antigravity also offers, OpenCode's paid models, Go's larger models) to do bigger work through the back door. That work belongs to the home harness. The one exception is the advanced steps below, on Hydrogen and then Gemini 4 Argon.

**What they take,** as often as it genuinely helps, with no fixed count:
- **Research and retrieval:** web and documentation research, searching a codebase, logs or many files, surveying how other projects solve a problem, collecting facts, API details or evidence, comparing options against named criteria, condensing long material.
- **Simple, fully specified steps:** a mechanical edit across many files from an exact rule, renames, reformatting, boilerplate from a given template, extracting facts from named files, a quick lookup.

**How a task uses them,** in T3 through `delegate_task` (section 5):
- **as a sub-task** (`mode: "wait"`), for a question or a step the task needs before it goes on;
- **as a research subagent** (`mode: "async"`, `role: "research"`), for a longer lane that runs while the task's agent does other work, such as surveying prior art while it reads the code. Its completion wakes the agent. A task may run several lanes at once when their questions are independent.

You may use them too, for the run's own chores: collecting thread times for the report's charts, condensing handoffs, research while planning. On 2026-10-15, one of each did such a read-only collection job correctly.

**What they never take:** a whole task, a design decision, a bug with an unknown cause, code changes that need judgment, the merge gate, or the orchestration, not even as a stand-in while the home window resets (section 3). They are task agents only when the user asks for it ([A task on a free model](#a-task-on-a-free-model)). OpenCode's two flash models review only where the `review-gate` skill's levels put them, and Hydrogen only as its trial reviewer ([Reviews](#reviews-the-review-gate)); no other Gemini model reviews.

**Every result is checked** by the agent that asked, before it relies on it. For research, the helper gives a source for each claim (a link, or a file and line), and the agent checks the claims it builds on. For a step, a diff, a test or a quick read.

**They run with the owner's own setup.** A helper loads the owner's configuration for its harness, including their MCP servers: on 2026-10-15, an OpenCode helper connected to the owner's running app through it. So every helper's prompt says: stay read-only, apart from the files a step names; never commit, merge, or touch the integration checkout; don't use tools that reach the owner's apps or services (speaking, messaging, their app's own tools); never ask the user anything.

**Limits: switch, don't wait.** The usage of OpenCode's free tier can't be read, so watch its helpers themselves. Antigravity's and OpenCode Go's can, so check them as well as watching their helpers.
- **OpenCode's free models are rate-limited, model by model.** Under load, most requests come back `429` and OpenCode quietly retries them, so a helper slows down rather than fails. On 2026-10-16, about 12 of 15 requests to GLM-5.3 Flash between 17:59 and 18:02 failed with `429`. The signs:
  - a step takes several times longer than the same kind of step did earlier;
  - `task_status` stays `working` while its child thread shows nothing new for several minutes;
  - it ends with a rate-limit (`429`) or "Upstream request failed" error.

  OpenCode's log (`~/.local/share/opencode/log/opencode.log`) records only that last error, not the retries before it. The owner's OpenCode console lists every request.
- **OpenCode Go has limits of its own:** per 5 hours, per week and per month. The console shows one set of meters for all models, and the owner's own use counts too, so plan as if every Go model shares one limit. Before each wave, read `opencode_go` in the snapshot: while `five_hour`, `weekly` or `monthly` is past about 85%, leave Go's DeepSeek and GLM out of new briefs, and start a whole task on Gemini 4 Hydrogen instead of Go. When it runs out, Go's requests fail with a quota error. A quota error from one Go model still means trying the other: if the limit is shared, that fails at once. Extra Usage stays off, so it can't bill past the plan: never turn it on. A Go model that "requires Global regions" isn't limited, just unavailable: use the other one. Beam Free's offer can end at any time: when it stops answering, move on.
- **Antigravity has a small plan with its own limits** (the owner's plan is in the profile). Hydrogen draws on the Gemini group's 5-hour and weekly windows, as Flash did: on 2026-11-13 one call with about 28,000 input tokens took the 5-hour window from 0% to 0.2% and the week from 2.4% to 2.5%. Before each wave, read them in the usage snapshot: while `gemini_models_five_hour` is past about 85%, put OpenCode first in new briefs and leave Antigravity out until the reset. A helper that hits the limit anyway says so with a quota or rate-limit error.
- **When a helper is limited,** cancel it (`task_cancel`) and switch. A task calling a helper in `wait` mode sees nothing while it waits, so it passes a `timeoutMs` of a few minutes; `waitTimedOut` is its sign to look at `task_status`. Then:
  1. **Model:** on OpenCode's free tier, delegate the same prompt again to its other good free model, unless the error was "Free usage limit reached", which covers both.
  2. **Go:** then delegate it to `opencode-go/beam-free`, then to `opencode-go/deepseek-v4.1-flash`, then to `opencode-go/glm-5.3-flash`, as far as you need.
  3. **Provider:** if OpenCode is limited too, delegate it to Antigravity. A helper that was on Antigravity goes through OpenCode's models instead, in the order above.
  4. **Backup:** when both are limited, delegate it to Copilot (see "Backup helper" below), if its budget has room.
  5. **Yourself:** when every helper is limited, do the work yourself.

  Try a limited OpenCode model again only on a later step, and drop it for the rest of the task if it is still slow. After an Antigravity quota error, leave that model group alone until its window resets (`resets_at` in the snapshot). Argon and Hydrogen have separate windows, so one running out doesn't stop the other.
- **Switching moves helper work only.** Helpers are free or small, not the subscriptions the user sized for the run, so their work may move between them. The task itself, and you, never move (section 3).
- **Record it.** The ledger gets each task's helper use (provider, model and level, and for what, with counts) and every limit and switch. Where the limits began goes into the profile's calibration.

### Backup helper: GitHub Copilot

Copilot (`acpRegistry_copilot`, model `default`, no options) is a third fast helper, used only when Antigravity's Hydrogen and OpenCode's models on both tiers are limited, or to spread a heavy helper load. On the owner's student plan, Auto routing is the only choice and it picks GPT-5.6 Luna every time (`availableModels` held only that model on 2026-10-17); no reasoning level can be set. It takes the same work as the other fast helpers and nothing more, with the same rules and checks.

- **It is fast and cheap per call, but the budget is monthly.** On 2026-10-17, a lookup in one file (3 model calls, 68,000 input tokens) took 0.7 of the month's 200 units, and a research lane that read three long files (6 calls, 241,000 input tokens, 77% cached) took 1.8 units in 30 seconds. So budget about 0.75 units per 100,000 input tokens. Both answers were right; one line number was 3 lines off, so check citations as for any helper.
- **Give it a budget in the contract,** in units of the monthly window: by default at most a third of what is left, since the window also covers the rest of the owner's month. Before each wave, check `units_remaining` in the snapshot, and leave Copilot out of new briefs once the budget is used.
- **When it is limited** (a quota error, or the budget is used), it drops out of the order like any other helper. Its quota resets only at `resets_at`, so don't try it again this run.
- **Its usage is recorded locally too.** Each Copilot session writes `~/.copilot/session-state/<id>/events.jsonl`: `session.auto_mode_resolved` names the model Auto chose, and the last `session.usage_checkpoint` holds `totalNanoAiu` (units × 10⁹). Use them to attribute the run's Copilot use per helper.

### Advanced helpers: Gemini 4 Hydrogen, then Argon

Some sub-tasks need more judgment than the flash models give, but are still bounded and checkable:
- **Deep research and synthesis:** comparing designs or libraries against the task's criteria, explaining how an unfamiliar part of the code works, condensing a long specification into the decisions it forces.
- **A scoped investigation:** tracing where a failure could come from within named files or logs, and ranking the likely causes with evidence. The task's agent decides what the cause is and how to fix it.
- **A well-specified piece of code:** a self-contained function, module or test suite against a given interface, which the task's agent reads, tests and owns.

What they never take is the same as for the fast helpers: a whole task (unless the user routes one there in the contract), a design decision, the merge gate, or the orchestration.

**Hydrogen first** (owner, 2026-11-13). Antigravity's `gemini-4-hydrogen-high`, the Antigravity fast helper, takes these sub-tasks before Argon: Google puts it about level with Argon, and it draws on the Gemini group's larger windows instead of Argon's small week. That claim is still to be checked on our own work, so:
- **Call it as for a fast helper** (section 5), with the files, paths and question up front, and watch it for limits the same way. But a limited Hydrogen doesn't hand advanced work to the next fast helper, which can't do it well: it goes to Argon while the run's Argon budget has room, otherwise back to the agent that asked.
- **The agent that asked judges its answer.** When it falls short (wrong, shallow, or missing what was asked) and the run's Argon budget has room, the same sub-task goes to Argon; otherwise the agent does it itself.
- **Record each one** in the handoff, and you in the ledger: the kind of sub-task, Hydrogen's outcome (held, fell short, or stopped by a limit before answering), and what finished it (Hydrogen, Argon, or the agent itself). A later study decides from those whether Argon is still worth its budget.

**Argon when Hydrogen fell short or was limited.** Antigravity's `gemini-4-argon-high` has a small quota, so give it a budget. On the Pro plan, Argon has a weekly window of its own (`gemini_4_argon_weekly`) and no 5-hour one, and quota is used by token cost. On 2026-10-17, a one-word reply with a 22,000-token prompt used about 0.9% of the week, so a research lane that reads many files can take a large share. So:
- **In the contract,** give the run an Argon budget in points of its weekly window. The default is at most half of what is left, so the owner keeps the rest of the week. Name the tasks that may use it.
- **Use it only where Hydrogen's answer fell short, or Hydrogen was limited before it answered.** Give Argon the files, paths and question up front, so it doesn't spend its quota searching, and Hydrogen's answer, if any, with what was missing from it.
- **Only in `wait` mode, with a timeout of a few minutes,** never as an async lane: a budget can't stop a call already running, and one async lane once took 80 points of a 30-point budget.
- **Before each wave,** check `gemini_4_argon_weekly` against the budget, and leave Argon out of new briefs once the budget is used.
- **When Argon is limited** (a quota error, or the budget is used), its work goes back to the agent that asked. Don't hand it back to Hydrogen, or to OpenCode, which can't do it well.

Calls, targets and checks work as for the fast helpers (section 5), with `{providerInstanceId: "antigravity", model: "gemini-4-hydrogen-high"}` and then `{providerInstanceId: "antigravity", model: "gemini-4-argon-high"}`.

### Reviews: the review gate

Every task passes the `review-gate` skill before its merge gate. It picks a level from what the task's diff touches (light, standard or deep) and the reviewers for that level: a paid reviewer of another model family, Codex's GPT-6.1 Terra first for a Claude task, with OpenCode's two flash models added where they help most for least. In the contract, give each task the level you expect, from its scope; the task raises it if its diff turns out to touch a deep area.

**Codex is short for reviews** when its weekly window is past about 80%, its 5-hour window past about 85%, or a task reports a Codex reviewer stopped by a limit. Then say so in the common file ("Codex is short: the review gate uses its Claude substitute"), steer the running tasks with the same line, and take it back when Codex has room again. Count the reviews in each subscription's expected use: each task's level says how many paid reviews it takes, and one more for each round after a logic fix.

### Computer use needs the screen

Computer use works only while the Mac is awake and unlocked, and on windows the agent can capture. In the first overnight run, every real-screen check failed: the screen had locked itself, and Stage Manager, which can hide windows from Codex's screen capture, was on. So, whenever a task or helper step will operate the real screen:

1. **Settle it in the contract.** [machine.md](machine.md#2-build-the-permissions-list) reads the settings and lists what to change: automatic screen lock off, Stage Manager off, and the permissions computer use needs. You keep the display awake with `caffeinate -i -d` for the whole run ([machine.md](machine.md#4-keeping-the-computer-awake)).
2. **Check again before the step runs.** The screen is locked when this prints `<true/>`:

   ```sh
   ioreg -n Root -d1 -a | grep -A1 CGSSessionScreenIsLocked
   ```

   If it is locked, or the app's window can't be captured, don't retry. The task lists the check under "Couldn't check" in its handoff, merges on its other checks (unless that check is its main deliverable), and the report asks the user to look.

## 5. Handing work to another provider

This needs T3, which can launch child tasks on other providers. In T3, when a task has work suited to another provider and that provider has room, add a "Help available" section to the brief. For Codex:

```text
Help available: for <the kind of step, for example "checking on the real screen how the app's windows look and behave">, you may hand that step to Codex. Call delegate_task with target {providerInstanceId: "codex", model: "gpt-6.1-terra", options: [{id: "reasoningEffort", value: "high"}]}, mode "wait", and a self-contained description of the step, including what to report back. Use it as often as it genuinely helps, for steps where it does better than you, such as judging what is on the screen or clicking through a flow you can't script. Don't hand it work you can do as well yourself (a scripted check, a screenshot, code), and stop using it if Codex is short on room. If the hand-off fails or Codex is unavailable, do the step yourself.
```

Codex hand-offs have no fixed count. Before each wave, check that Codex has room for the hand-offs you expect, and leave the section out if it doesn't.

- **Codex computer use works under T3.** The owner confirmed this on 2026-10-04. It operates the real screen, so avoid it for steps that would disturb a user who is at the machine, unless the brief allows it. It needs the screen as described in section 4.
- **What it did in the 2026-10-12 run:**
  - Four hand-offs, all to click through and judge screens. Three passed. The fourth couldn't turn VoiceOver on (⌘F5), so leave VoiceOver checks to the task or the user.
  - The tasks did most other screen checks themselves, through the accessibility API and screenshots.
  - Tasks were allowed to hand any permission prompt to Codex, and none did: a task whose command waits on a dialog sees only a hang. Grant permissions in the warm-up instead ([machine.md](machine.md#3-the-warm-up)).

For the fast helpers, add this section, with examples from the task:

```text
Help available (fast helpers): you may hand two kinds of work to a fast helper model, as often as it genuinely helps:
- research and retrieval, such as <examples: how other projects solve X, what the docs of Y say about Z, where this codebase does W>. Ask a self-contained question: what to find, where to look, and the answer's format, with a source (a link, or a file and line) for each claim;
- simple, fully specified steps, such as <example>. Give the exact inputs, rules and expected output.
Call delegate_task with role "research" (or "general" for a step) and either mode "wait" with timeoutMs <n minutes, in milliseconds> for a quick one, or mode "async" for a longer research lane while you keep working; its completion wakes you. Targets, in this order:
1. {providerInstanceId: "<first helper>", model: "<model>"<, options>}
2. {providerInstanceId: "<second>", model: "<model>"<, options>}
3. {providerInstanceId: "<third>", model: "<model>"<, options>}
<one numbered line like these for each further target>
<n>. {providerInstanceId: "<backup>", model: "default"} (the backup: only when the targets above are limited)
Copy these targets exactly and use no other model of these providers: a model name that differs by one word can bill the owner per request. Tell the helper to stay read-only (apart from the files a step names), never to commit or merge, not to use tools that reach the owner's apps or services, and never to ask the user anything. Check every result before you rely on it: check the claims you build on against their sources, and diff or test a step. Never hand a helper a decision, code that needs judgment or the merge gate; reviews go through the review gate.
A helper is limited when it reports a quota or rate-limit (429) error or "Upstream request failed", or when it is far slower than the same kind of work was earlier. A wait that returns waitTimedOut, or an async lane with nothing new in its child thread for <n> minutes, is the sign: look at task_status, and if it is still working without progress, it is limited. Then cancel it with task_cancel and give the same prompt to the next target; when all are limited, do the work yourself. After "Free usage limit reached", skip the other free OpenCode model, since that limit covers both. A model that "requires Global regions" isn't limited, just unavailable: go on to the next target and leave it out from then on. <With Antigravity's Hydrogen among the targets: "If Antigravity reports gemini-4-hydrogen-high unavailable or unknown (not a quota or rate-limit error, which covers Flash too), use {providerInstanceId: "antigravity", model: "gemini-3.8-flash-high"} in its place from then on.">. Note each switch, and which helpers you used for what, in your handoff.
```

Fill in the targets from section 4: Antigravity (`antigravity`, `gemini-4-hydrogen-high`, no options, with the fallback sentence for Flash while Antigravity lists `gemini-3.8-flash-high`) and OpenCode's `opencode/deepseek-v4.1-flash-free` and `opencode/glm-5.3-flash-free` (`opencode`, options `[{id: "variant", value: "high"}]`), the two OpenCode models next to each other, so a limited one switches model first, then `opencode-go/beam-free`, `opencode-go/deepseek-v4.1-flash` and `opencode-go/glm-5.3-flash` with the same provider instance (`opencode`, not `opencode-go`) and options. Put Copilot (`acpRegistry_copilot`, model `default`, no options) last when its budget has room, and leave it out otherwise. Spread the load across the two providers: give about half the tasks Antigravity first, and the others OpenCode first. Leave out a helper that is limited now, and put one that was limited earlier last. Five minutes without anything new suits a quick step (timeoutMs 300000); allow a research lane longer.

When a task may use the advanced helpers, add this section too. The parts in angle brackets that name Argon go in only when the run has an Argon budget for this task:

```text
Help available (advanced helpers): for <the kind of sub-task, for example "comparing the two sync designs against the brief's criteria" or "ranking the likely causes of the failing sync test from the logs in <path>">, you may hand a bounded sub-task to Gemini 4 Hydrogen first: call delegate_task with target {providerInstanceId: "antigravity", model: "gemini-4-hydrogen-high"}, role "research" (or "general" for code), and mode "wait" with timeoutMs <a few minutes, in milliseconds>, or mode "async" for a longer research lane. Give it the files, paths and question up front.< If its answer falls short (wrong, shallow, or missing what you asked), you may give the same sub-task to Gemini 4 Argon: target {providerInstanceId: "antigravity", model: "gemini-4-argon-high"}, mode "wait" with timeoutMs <a few minutes, in milliseconds>, never mode "async", with Hydrogen's answer and what was missing. Argon has a small weekly quota: use it about <n> times in this task at most.> The same rules as for the fast helpers apply to both: read-only apart from named files, no commits or merges, no tools that reach the owner's apps or services, never ask the user. Never use them to review your diff: reviews go through the review gate, where Hydrogen reviews only as its trial reviewer. Check what they return: you decide, and you own any code they write. If Hydrogen reports a quota or rate-limit error, or stalls past its wait, cancel it with task_cancel and <give the sub-task to Argon, within its count above, or else >do it yourself<; if Argon is limited too, do it yourself>. Don't hand advanced work to a fast helper. In your handoff, list each such sub-task with Hydrogen's outcome (held, fell short, or stopped by a limit) and what finished it (Hydrogen, <Argon, >or you).
```

- **A helper is for its step or lane only.** A task must not hand the rest of its work to a helper. When the home window runs out, the task pauses (section 3); it doesn't keep going by handing its work to helpers.
- **Plain Claude Code or Codex:** no cross-provider hand-off exists, so the step stays on the home harness.

## 6. The owner's profile

Personal facts live outside the skill, at:

```
${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/long-horizon-orchestrator/providers.md
```

- **At the start:** read it if it exists. If it doesn't, create it from what `provider-usage` detects.
- **After the warm-up:** update this computer's "Machine" section with what was granted.
- **At the finish:** update its calibration.

**It may live in the owner's private repository.** `scripts/bootstrap` links the file into a private git repository of the owner's state, so it follows them between computers. When it is a link:
- **Edit the file it points to** (`realpath` of the path above), never the link. Some editing tools write a new file and rename it over the old one, which would replace the link with a local copy.
- **At the start,** bring it up to date before reading it: `git -C <its repository> pull --ff-only`.
- **At the finish,** after the last update, commit only this file and push it: `git -C <its repository> commit -m "<run>: provider profile" -- <file>`, then `git -C <its repository> push`. If the push is rejected because another computer pushed first, pull with `--rebase` and push again.
- **Never force-push, and never commit anything else** in that repository. If the pull or push fails (no network, a conflict), go on with the local file and say so in the report.

**Several computers share it.** Plans, preferences and calibration hold for every computer, because they share the subscriptions. Each computer has its own section, `## Machine: <computer>`, named by `scutil --get LocalHostName` on macOS (`hostname -s` elsewhere). Read and update only your own computer's section, and add it if it is missing.

The owner may edit it at any time, and their statements win over this reference. Keep it short:

```markdown
# Providers

## Plans
- Claude: <plan, e.g. Max 20x> (detected <date>); Fable <included, up to <n>% of the week, in its own week `weekly_fable` | not included: usage credits only> (Anthropic's help pages, <date>)
- Codex: <plan, e.g. ChatGPT Plus> (detected <date>)
- Antigravity: <plan> with its own limits (owner, <date>); usage read by `agy -p /usage`, with Gemini 5-hour and weekly windows (Hydrogen, Flash, Pro) and a separate Argon weekly window
- OpenCode: free models (owner, <date>), rate-limited model by model; OpenCode Go <plan and price>, Extra Usage off, as their backup (owner, <date>); the free tier's usage not readable
- Copilot: <plan, e.g. student (free_educational_quota)>, Auto routing only (<model it routes to>), <n> units a month (detected <date>); usage read by `gh api /copilot_internal/user`

## Preferences
- Prefer Codex for computer use when it has room, on <model, e.g. GPT-6.1 Terra> (owner, <date>)
- Fast helpers inside tasks, for research, retrieval and simple steps: Antigravity's Gemini 4 Hydrogen at high; OpenCode's <models good enough> at high, on the free tier and then on Go; never task agents unless the user asks (owner, <date>)
- Advanced helpers inside tasks, for bounded harder sub-tasks: Gemini 4 Hydrogen at high first, then Gemini 4 Argon at high where Hydrogen fell short or was limited, within a weekly budget per run (owner, <date>)
- When a window runs out, pause and resume on the same subscription after the reset; never move work to another subscription (owner, <date>)
- Claude's home model is Opus 5.5, complex tasks included; Fable 5.2 only where Opus would probably fall short, never the default, never for helpers or reviewers (owner, <date>)

## Machine: <computer>
- Automatic screen lock: <off/on> (owner, <date>); Stage Manager off for computer-use runs (owner, <date>)
- Granted (warm-up, <date>): <harness app>: Accessibility, Screen Recording, Developer Tools, Automation of <apps>; Developer mode on; <toolchain license accepted>
- Asks for a password, so never in a run: <commands found to prompt on this computer>

## Calibration (newest first)
- codex/<plan> five_hour: ~<n>% per task-hour, <kind of task> (run <ledger name>)
- claude/<plan> five_hour: ~<n>% per task-hour (run <ledger name>)
- claude/<plan> weekly: ~<n> points per Opus task-hour with its reviews, <m> tasks at once (run <ledger name>)
- claude/<plan> weekly_fable: ~<n> points per Fable task-hour at <effort>, and ~<m> points of the all-models week (run <ledger name>)
- antigravity/gemini_models: <n> Hydrogen hand-offs took the 5-hour window from <a>% to <b>% (run <ledger name>)
- antigravity/gemini_4_argon: <n> Argon hand-offs of <kind> took the week from <a>% to <b>% (run <ledger name>)
- copilot/<plan> monthly: <n> hand-offs of <kind>, <tokens> input tokens, took <a> units (run <ledger name>)
- opencode/<model>: rate-limited after <n> requests in <m> minutes; switched to <model or provider> (run <ledger name>)
```

At the start of a run, read the "Granted" line in this computer's "Machine" section, so the contract asks only for what's new. Update it after the warm-up.

## 7. In the contract and the report

- **In the contract:**
  - Show the usage snapshot in plain words, for example "Claude Max 20x: 9% of the 5-hour window and 23% of the week used, 4% of its Fable week. Codex Plus: 23% and 16%. Antigravity Pro: Gemini 2% and 1%; Argon 1% of its week."
  - Give the expected consumption of the run, and whether it is likely to pause for a reset (and until when).
  - Name any other active run that shares the subscriptions.
  - Give the reason for each task routed away from the home harness.
  - Say which tasks may use the fast helpers, and for what.
  - Say which tasks may use the advanced helpers, and give the run's Argon budget, in points of its weekly window.
  - Give the run's Claude estimate and budget in points of the all-models week, from its tasks ([The run's Claude estimate and budget](#the-runs-claude-estimate-and-budget)).
  - Name each task on Fable 5.2 with why Opus would probably fall short, and give the run's Fable budget in points of the Fable week, or say that no task runs on Fable. Say how many Fable second opinions you may ask for your own decisions (3 by default), the Fable budget they draw on (stated even when no task runs on Fable), and what the contract's own opinion used if it had one ([A Fable second opinion](#a-fable-second-opinion-for-your-own-decisions)). When your own thread runs on Fable, say what your wakes will cost of the Fable week, and that the owner can switch you to Opus 5.5 before they leave.
  - Say which whole tasks start on OpenCode Go, if any, and that helpers and reviews may draw on the plan too.
- **In the report:**
  - Add one line on usage, before and after.
  - Name any task that paused for a reset, and for how long.
  - Give the run's Claude use against its budget, and name any Claude work the budget parked.
  - Give Claude's Fable week before and after when a task or a second opinion ran on Fable, and name any Fable task that moved to Opus 5.5, when and why.
  - Say how many Fable second opinions you asked for, and which decisions they changed.
  - Name other runs that used the same subscriptions meanwhile, because their use is in the numbers.
  - Mention a helper that was rate-limited or ran out, and what the work switched to.
  - Give the advanced sub-tasks Hydrogen took: how many held, fell short or were stopped by a limit, and how many Argon or the task's agent then finished.
  - Say what used OpenCode Go (helpers, reviews, whole tasks), with its weekly and monthly windows before and after.
