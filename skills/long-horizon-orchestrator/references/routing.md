# Routing and capacity

Each task needs a provider and model. The default is simple: use the harness you are running on. Deviate only for a concrete reason, and never because a percentage looks better somewhere else.

## 1. Home harness first

The home harness is the harness and model the orchestrator itself runs on:
- **T3:** `inheritedProviderInstanceId` and `inheritedModel` from `orchestrator_capabilities`.
- **Plain Claude Code:** Claude.
- **Plain Codex:** Codex.

Route every task there by default. The user chose this harness for the run, its tools and installed skills are known to work, and it is usually the subscription the user sized for this kind of work.

The one exception: if you yourself run on Antigravity or on one of OpenCode's free models, don't treat it as the home harness for complex tasks. Route those to Claude Code or Codex (see "Fast helpers" below).

Route a task elsewhere only when one of these applies, and only in the contract the user approves:
1. **Strength:** another provider clearly does a particular piece of work better and has room for it (section 4).
2. **The user asked**, in the request or the contract.

Running short of capacity is not a reason to route elsewhere. The home subscription is the one the user started the run on and sized for it; the others are usually smaller and kept for the work they were given. If the home harness can't fit the whole run, say so in the contract and plan for pauses (section 3).

Once the run has started, nothing changes subscription: not the tasks, and not you. Only a fast helper's work may switch between helpers (section 4).

## Reasoning level: err on the side of more

An under-powered agent on important work costs more than an over-powered one: wrong turns, rework, review findings, and failures discovered in the morning. So never under-power a task. High is the default for real work, and you go above it only when you can name the benefit:

| The work | Reasoning level |
|---|---|
| Very simple and fully specified (a mechanical edit, a rename, a lookup) | medium |
| Any real task that is not trivially simple: the default | high |
| A task where you see a real benefit from extra thinking (for example subtle correctness or security logic, a bug with an unknown cause, a design choice with no precedent in the project). Name the benefit in the contract | extra high |
| Sparingly: large or many-sided work that clearly gains from parallel sub-agents inside the task (several independent lanes, a broad review, a big refactor). Name the gain in the contract | the harness's multi-agent mode: Ultracode in Claude Code, Ultra in Codex |
| A fast helper's step or research lane, on Antigravity or OpenCode | high (see "Fast helpers" below) |
| An advanced helper step on Gemini 4 Argon | high: `gemini-4-argon-high` (see "Advanced helper" below) |

- **Never use low reasoning.** If a task feels too small for medium, it is probably a step to hand off, not a task.
- **Always set the level explicitly at launch,** and never inherit a model's default. Some defaults are low: in T3, Codex's `gpt-6.1-sol` and `gpt-6.1-terra` default to low.
- **In T3, the option names differ by provider:**
  - Claude: `{"id": "effort", "value": "high" | "xhigh" | "ultracode"}`. Ultracode exists only on models that list it, such as Opus and Fable, not Sonnet.
  - Codex: `{"id": "reasoningEffort", "value": "high" | "xhigh" | "ultra"}`.

  Use only values the capability catalog lists for that model.
- **Capacity still applies.** Higher reasoning uses more of a subscription, and the multi-agent modes use a 5-hour window much faster than a single agent, because every sub-agent draws on the same window. Start a multi-agent task early in a window, not when the window is already well used, and expect it to pause for a reset on a long run. Don't step down to a level below what the work needs to save capacity.

## 2. Measure capacity as plan size times room left

Run `scripts/provider-usage` (in this skill's folder):
- at the start;
- before each wave;
- on every wake while the home 5-hour window is past about half;
- at the finish.

It prints each provider's plan and the usage and reset time of its 5-hour and weekly windows. Record each snapshot in the ledger.

The script asks each provider directly, so the numbers include use from other devices and apps (claude.ai, ChatGPT, Codex elsewhere):
- **Claude:** Claude Code's own `/usage` command, run without a model call (`claude -p /usage`). It uses no quota and works even when the window is used up.
- **Codex:** Codex's app server (`account/rateLimits/read`), with Codex's own sign-in.
- **Antigravity:** the Antigravity CLI's own `/usage` command (`agy -p /usage`), which starts no agent turn and uses no quota. Antigravity splits its models into groups, and each group has its own windows:
  - `gemini_models_five_hour` and `gemini_models_weekly`: Gemini Flash and Pro, so the Flash helper;
  - `gemini_4_argon_weekly`: Gemini 4 Argon. On the Pro plan, Argon has its own weekly window and no 5-hour one;
  - `claude_and_gpt_models_*`: the Claude and GPT models Antigravity also offers, which the run doesn't use.

  Quota is used in proportion to the cost of the tokens, so a call's size matters more than how many calls there are. If `ai_credits_remaining` appears, the owner has paid credits that Antigravity can spend once a window is used up. Never let a run spend them: an Antigravity helper that reports a quota error stops there, even if credits would let it go on.
- **Copilot:** GitHub's own quota endpoint (`gh api /copilot_internal/user`, the one its editors use), which spends nothing. Copilot has one window, `monthly`, with `units_entitled` and `units_remaining`; it resets on the first of the month. It is billed by token cost in fractional units, not per request. If the live read fails, `local_units_used_this_month` gives what this machine's Copilot sessions spent (from `~/.copilot/session-state`), but not what is left. If `overage_permitted` appears, GitHub would bill the owner past the budget: never let a run go past it.

When a live query fails, for example with no network, the script falls back to the last values Claude and Codex wrote to local logs and says so in `source`. Antigravity has no such logs, so it gets an `error` instead. Those are only as fresh as the last request made on this machine. `--cached` skips the live queries.

Codex may list free rate-limit resets (`reset_credits_available`). Never use one: spending them is the user's decision.

Percentages from different plans are not comparable. 30% left of Claude Max 20x is many times more work than 30% left of ChatGPT Plus. Turn each number into how many tasks still fit:

```
tasks that fit ≈ (100 − used_percent) / percent one task uses on that plan
```

- **Where "percent one task uses" comes from:** the calibration in the user's profile (section 6). With no calibration yet, be conservative on small plans. On a Plus-sized plan, assume one heavy implementation task takes about a whole 5-hour window per hour of work: on 2026-10-15, three Codex tasks at high drained a fresh ChatGPT Plus window in about 20 minutes, twice (about 90% of a window per task-hour). On a Max-sized plan, assume a small share.
- **Learning it:** after each task, update the calibration from the snapshots taken before and after. If several tasks shared the provider, split the change between them by duration. Calibrate only from real runs, with tasks of about 20 minutes or longer. Short tasks and test runs give wildly misleading per-hour rates: a 3-minute task that moves a window by 3 points is not "60% per hour". When a run is too short to calibrate from, say so in the ledger and leave the profile unchanged.
- **The 5-hour window limits a wave; the weekly window limits the whole run.** The weekly window also covers the user's next days, so don't plan to use more than about 80% of a weekly window without saying so in the contract.
- **Staleness:** treat `observed_at` as the age of the number. A window with `reset_since_observed: true` has reset since it was read, so it is near zero again.
- **Missing data:** if a provider's usage can't be read, say so and route by plan size alone. OpenCode's is never readable, so its helpers are watched for errors and slowdowns instead (section 4). Watch Antigravity's helpers that way too whenever its usage can't be read.
- **Other runs share the windows.** Another orchestrator run on the same machine draws on the same subscriptions. Before the contract and before each wave, look for other ledgers next to yours:

  ```sh
  grep -l -E '^Status: (running|paused)' "${XDG_STATE_HOME:-$HOME/.local/state}"/agent-skills/long-horizon-orchestrator/*.md
  ```

  A ledger without a `Status:` line (from an older version of this skill) is active too while any branch its task rows name still has a worktree (`git worktree list`), whatever its age. For each active run, count its running tasks on each provider and leave room for them. Name them in the contract, and in the report's usage line, because they make the usage numbers a shared total. Then coordinate with it, as below.

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
1. Leave it exactly as it is: its thread, worktree and uncommitted changes. Don't relaunch it, and don't hand it to another provider. The exceptions: a task on a free model ([below](#a-task-on-a-free-model)), and Claude work between the subscription and the owner's API credits as the contract allows ([Claude API credits](#claude-api-credits-use-what-would-expire)).
2. Make sure the resume wake is scheduled, and mark the task `paused` in the ledger with its expected resume time.
3. On the first wake after the reset, check whether the task is running again. If not, continue it on the same thread: "Your usage limit has reset. Continue the brief from where you stopped." This nudge doesn't count as the task's one nudge for silence.

### A task on a free model

A free model's limit isn't a window the run was sized on, and its reset can't be read or scheduled: on 2026-10-29, OpenCode's free limit stopped DeepSeek and GLM together, for the whole Mac, six minutes into the run, and again 33 minutes after a reset 2h 15m later. Task C waited out both and was parked unfinished. So a task given to a free model doesn't pause; it moves:

1. **Between OpenCode's and Antigravity's Gemini models, always** (owner, 2026-10-30). They are the run's free and low-cost pool, so a task moves from one to the other whenever a limit stops it, in either direction, without a line in the contract and without asking: from OpenCode to Gemini Flash at high while the Gemini windows have room (or Gemini 4 Argon within the run's Argon budget, for work Flash can't do well), and from Gemini to OpenCode's free models while they answer. OpenCode's free limit covers all its free models at once, so moving to the other OpenCode model doesn't get past it.
2. **Then to a paid model, also without asking** (owner, 2026-10-30: the run is mostly on paid subscriptions anyway). When the whole pool is limited, move the task to Codex's GPT-6.1 Terra or Claude Sonnet at high, whichever has more room in its windows. You choose at the time; nothing about it goes to the user before or during the run.
3. **When the limit stops it** (its thread fails or stops on "Free usage limit reached", a quota error, or a rate-limit error that a retry a few minutes later still gets), save its uncommitted changes as a patch in the run directory, note in the ledger what it finished, and launch the next model at once on its own thread with the same brief, the same branch and worktree where the host allows (else a new one with the patch applied), and a handoff note: what is done, what is left, where the patch is.
4. **Don't wait for the limited model,** and don't move the task back when it recovers. If the next one is limited too, take the one after; only when the pool and both paid models are all limited does the task pause, or park at the end of the run.
5. **In the report,** say which model finished the task, and when and why it moved.

### Your own quota

You run on the home subscription too, and you stay there. Never switch your own thread to another provider or model to keep going. In T3, a self-switch ends your turn on the spot and leaves stale records behind (see [host-t3.md](host-t3.md#when-a-window-runs-out)).

Your turns are short, so they rarely run out halfway. When your window is nearly used up, schedule the resume wake, update the ledger and end your turn. After the reset, the resume wake (or the heartbeat) wakes you on the same subscription.

You don't need a stand-in orchestrator on another provider for this, not even a cheap one on Antigravity:
- the host's scheduler wakes you after the reset, with no model running in between;
- a stand-in would itself need a model switch on your thread, or a scheduled wake of its own;
- it would put a weaker model in charge of decisions about the run.

### A weekly limit

If a provider's weekly window runs out with work left:
- If it resets within a few hours, wait, as for a 5-hour window.
- Otherwise, park the remaining tasks on that provider, finish the run and report. Whether to wait for the reset or to move the work is the user's decision.

### Always

Never work around a limit silently. The report says which tasks paused, for how long, and why.

### Claude API credits: use what would expire

The owner may have Claude API credits beside the Claude subscription: in T3, a second Claude instance (`claudeAgent_claude_api`) runs the same models, billed to the credits. The credits are dollars that expire, not windows that reset, so:

- **Read them in the usage snapshot.** `provider-usage` reports them under `claude_api`: the owner's grants in `api-credits.json` beside the provider profile (each grant's amount, expiry, and the balance the Console showed, with when), less the API spend T3 has logged since at list prices, soonest-expiring grant first. It is an estimate; say so, with the time of the Console reading. An estimate marked `incomplete`, or an error, counts as nothing left.
- **Choose each task's Claude instance at launch, in the contract.** While a grant expires within about a week with money left, Claude tasks and Claude reviewers run on the API instance first, sized to use what would otherwise expire and no more. Otherwise they run on the subscription. Your own thread stays on the instance it runs on.
- **Keep a reserve.** Launch no new work on the API instance once the estimate is below about $20 for each API task already running: costs reach the logs only as each result ends, so the estimate trails what running tasks spend. With no payment method on the account (the owner's case on 2026-10-30), running out ends in errors, not charges; with one, it would bill, so keep to the reserve strictly.
- **Moves, at most once each way per task, never back:**
  - to the subscription, when the credits' estimate runs out (or the API instance reports the credits used up): the rest of that task continues on the subscription, on its own thread, as a free model's task moves on ([A task on a free model](#a-task-on-a-free-model));
  - to the API instance, only if the contract allows it (the owner uses the credits as a backup), when the task's Claude subscription window is used up and its reset is hours away, and only within the reserve. A task that came from the API instance never goes back to it.
- **In the contract,** give each grant's estimated balance and expiry, which tasks run on which Claude instance, and whether work may move to the API instance as a backup. In the report's usage line, give the credits' estimated balance at the start and the end, with what expired during the run apart from what was spent.

## 4. Strengths: a soft preference

| Work | Prefer | Applies when | Basis |
|---|---|---|---|
| Computer use: operating a desktop app or real browser, clicking through a UI, checking what is actually on screen | Codex's GPT-6.1 Terra (`gpt-6.1-terra`, at high) | Codex has room for that piece | Owner's assessment, 2026-10: Codex's computer use is stronger. Owner, 2026-10-28: Terra is cheaper than Sol and faster at computer use, so it takes these steps |
| Research and retrieval: web and documentation research, searching a codebase, logs or many files, surveying how others solve a problem, collecting facts and evidence | A fast helper (see "Fast helpers" below), as a sub-task or a research subagent inside the task | the result can be checked against its sources | Owner, 2026-10-16: use them freely for research and retrieval |
| A simple, fully specified step: a mechanical edit from an exact rule, renames, boilerplate from a template, extracting facts from named files | A fast helper | the result is cheap to check | Owner, 2026-10 |
| A bounded sub-task too hard for Flash: deep research and synthesis, a scoped investigation, a well-specified piece of code | Gemini 4 Argon (see "Advanced helper" below) | the run's Argon budget has room, and the agent that asked can check the result | Owner, 2026-10-17 |
| Everything else | Home harness | always | section 1 |

- **A preference, not a rule.** Claude agents can do computer use too. When Codex is short on room, unavailable, or the computer-use part is trivial, keep the work on the home harness.
- **Apply it to the smallest sensible piece.** If only one step of a task needs computer use, keep the task on the home harness and hand that one step to Codex (section 5). Move the whole task only when most of it is computer use, and then to Terra too.
- **Terra, not Sol, for computer use.** Since 2026-10-28 the owner's Codex plan includes GPT-6.1 Terra, which costs less of the plan than GPT-6.1 Sol and is faster at computer use (owner). Use Terra at high for computer-use steps and for a task that is mostly computer use; keep Sol for work where its extra strength is the point. Terra's cost per task-hour on the owner's plan isn't calibrated yet: record the window's change around each Terra hand-off (section 2).
- **The user can override this.** The owner's profile (section 6) wins over this table.

### Fast helpers: Antigravity and OpenCode

Two providers offer fast models that cost the run little. Handing them research and simple steps saves the task agent's context and its subscription for the work that needs judgment:

- **Antigravity:** `gemini-3.8-flash-high`, Gemini Flash at high reasoning.
- **OpenCode:** only its two free models that are good enough (owner, 2026-10-16): `opencode/deepseek-v4.1-flash-free` and `opencode/glm-5.3-flash-free`, each with `{"id": "variant", "value": "high"}`. Its other free models aren't good enough, and its paid models bill the owner per request: use neither.

Flash models stay fast at high reasoning, and since they are less capable to begin with, the extra reasoning is what makes their results dependable. Don't use these providers' other larger models (Gemini Pro, the Claude and GPT models Antigravity also offers, OpenCode's paid models) to do bigger work through the back door. That work belongs to the home harness. The one exception is Gemini 4 Argon, for the advanced steps below.

**What they take,** as often as it genuinely helps, with no fixed count:
- **Research and retrieval:** web and documentation research, searching a codebase, logs or many files, surveying how other projects solve a problem, collecting facts, API details or evidence, comparing options against named criteria, condensing long material.
- **Simple, fully specified steps:** a mechanical edit across many files from an exact rule, renames, reformatting, boilerplate from a given template, extracting facts from named files, a quick lookup.

**How a task uses them,** in T3 through `delegate_task` (section 5):
- **as a sub-task** (`mode: "wait"`), for a question or a step the task needs before it goes on;
- **as a research subagent** (`mode: "async"`, `role: "research"`), for a longer lane that runs while the task's agent does other work, such as surveying prior art while it reads the code. Its completion wakes the agent. A task may run several lanes at once when their questions are independent.

You may use them too, for the run's own chores: collecting thread times for the report's charts, condensing handoffs, research while planning. On 2026-10-15, one of each did such a read-only collection job correctly.

**What they never take:** a whole task, a design decision, a bug with an unknown cause, code changes that need judgment, the merge gate, or the orchestration, not even as a stand-in while the home window resets (section 3). They are task agents only when the user asks for it ([A task on a free model](#a-task-on-a-free-model)). OpenCode's free models review only where the `review-gate` skill's levels put them ([Reviews](#reviews-the-review-gate)); Gemini doesn't review.

**Every result is checked** by the agent that asked, before it relies on it. For research, the helper gives a source for each claim (a link, or a file and line), and the agent checks the claims it builds on. For a step, a diff, a test or a quick read.

**They run with the owner's own setup.** A helper loads the owner's configuration for its harness, including their MCP servers: on 2026-10-15, an OpenCode helper connected to the owner's running app through it. So every helper's prompt says: stay read-only, apart from the files a step names; never commit, merge, or touch the integration checkout; don't use tools that reach the owner's apps or services (speaking, messaging, their app's own tools); never ask the user anything.

**Limits: switch, don't wait.** OpenCode's usage can't be read, so watch its helpers themselves. Antigravity's can, so check it as well as watching its helpers.
- **OpenCode's free models are rate-limited, model by model.** Under load, most requests come back `429` and OpenCode quietly retries them, so a helper slows down rather than fails. On 2026-10-16, about 12 of 15 requests to GLM-5.3 Flash between 17:59 and 18:02 failed with `429`. The signs:
  - a step takes several times longer than the same kind of step did earlier;
  - `task_status` stays `working` while its child thread shows nothing new for several minutes;
  - it ends with a rate-limit (`429`) or "Upstream request failed" error.

  OpenCode's log (`~/.local/share/opencode/log/opencode.log`) records only that last error, not the retries before it. The owner's OpenCode console lists every request.
- **Antigravity has a small plan with its own limits** (the owner's plan is in the profile). Flash draws on the Gemini group's 5-hour and weekly windows. Before each wave, read them in the usage snapshot: while `gemini_models_five_hour` is past about 85%, put OpenCode first in new briefs and leave Antigravity out until the reset. A helper that hits the limit anyway says so with a quota or rate-limit error.
- **When a helper is limited,** cancel it (`task_cancel`) and switch. A task calling a helper in `wait` mode sees nothing while it waits, so it passes a `timeoutMs` of a few minutes; `waitTimedOut` is its sign to look at `task_status`. Then:
  1. **Model:** on OpenCode, delegate the same prompt again to its other good free model.
  2. **Provider:** if that one is limited too, or the helper was on Antigravity, delegate it to the other provider.
  3. **Backup:** when both are limited, delegate it to Copilot (see "Backup helper" below), if its budget has room.
  4. **Yourself:** when every helper is limited, do the work yourself.

  Try a limited OpenCode model again only on a later step, and drop it for the rest of the task if it is still slow. After an Antigravity quota error, leave that model group alone until its window resets (`resets_at` in the snapshot). Argon and Flash have separate windows, so one running out doesn't stop the other.
- **Switching moves helper work only.** Helpers are free or small, not the subscriptions the user sized for the run, so their work may move between them. The task itself, and you, never move (section 3).
- **Record it.** The ledger gets each task's helper use (provider, model and level, and for what, with counts) and every limit and switch. Where the limits began goes into the profile's calibration.

### Backup helper: GitHub Copilot

Copilot (`acpRegistry_copilot`, model `default`, no options) is a third fast helper, used only when Antigravity's Flash and both OpenCode models are limited, or to spread a heavy helper load. On the owner's student plan, Auto routing is the only choice and it picks GPT-5.6 Luna every time (`availableModels` held only that model on 2026-10-17); no reasoning level can be set. It takes the same work as the other fast helpers and nothing more, with the same rules and checks.

- **It is fast and cheap per call, but the budget is monthly.** On 2026-10-17, a lookup in one file (3 model calls, 68,000 input tokens) took 0.7 of the month's 200 units, and a research lane that read three long files (6 calls, 241,000 input tokens, 77% cached) took 1.8 units in 30 seconds. So budget about 0.75 units per 100,000 input tokens. Both answers were right; one line number was 3 lines off, so check citations as for any helper.
- **Give it a budget in the contract,** in units of the monthly window: by default at most a third of what is left, since the window also covers the rest of the owner's month. Before each wave, check `units_remaining` in the snapshot, and leave Copilot out of new briefs once the budget is used.
- **When it is limited** (a quota error, or the budget is used), it drops out of the order like any other helper. Its quota resets only at `resets_at`, so don't try it again this run.
- **Its usage is recorded locally too.** Each Copilot session writes `~/.copilot/session-state/<id>/events.jsonl`: `session.auto_mode_resolved` names the model Auto chose, and the last `session.usage_checkpoint` holds `totalNanoAiu` (units × 10⁹). Use them to attribute the run's Copilot use per helper.

### Advanced helper: Gemini 4 Argon

Antigravity's `gemini-4-argon-high` is clearly stronger than Flash and much cheaper for the run than another home-harness agent. It takes sub-tasks that need more judgment than Flash can give, but are still bounded and checkable:
- **Deep research and synthesis:** comparing designs or libraries against the task's criteria, explaining how an unfamiliar part of the code works, condensing a long specification into the decisions it forces.
- **A scoped investigation:** tracing where a failure could come from within named files or logs, and ranking the likely causes with evidence. The task's agent decides what the cause is and how to fix it.
- **A well-specified piece of code:** a self-contained function, module or test suite against a given interface, which the task's agent reads, tests and owns.

What it never takes is the same as for the fast helpers: a whole task (unless the user routes one there in the contract), a design decision, the merge gate, or the orchestration.

**Its quota is small, so give it a budget.** On the Pro plan, Argon has a weekly window of its own (`gemini_4_argon_weekly`) and no 5-hour one, and quota is used by token cost. On 2026-10-17, a one-word reply with a 22,000-token prompt used about 0.9% of the week, so a research lane that reads many files can take a large share. So:
- **In the contract,** give the run an Argon budget in points of its weekly window. The default is at most half of what is left, so the owner keeps the rest of the week. Name the tasks that may use it.
- **Use it where Flash isn't enough.** Give Argon the files, paths and question up front, so it doesn't spend its quota searching; send plain lookups to Flash or OpenCode.
- **Before each wave,** check `gemini_4_argon_weekly` against the budget, and leave Argon out of new briefs once the budget is used.
- **When Argon is limited** (a quota error, or the budget is used), its work goes back to the agent that asked. Don't hand it to Flash or OpenCode, which can't do it well.

Calls, targets and checks work as for the fast helpers (section 5), with `{providerInstanceId: "antigravity", model: "gemini-4-argon-high"}`.

### Reviews: the review gate

Every task passes the `review-gate` skill before its merge gate. It picks a level from what the task's diff touches (light, standard or deep) and the reviewers for that level: a paid reviewer of another model family, Codex's GPT-6.1 Terra first for a Claude task, with OpenCode's free models added where they help most for least. In the contract, give each task the level you expect, from its scope; the task raises it if its diff turns out to touch a deep area.

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
4. {providerInstanceId: "<backup>", model: "default"} (the backup: only when the targets above are limited)
Use no other model of these providers. Tell the helper to stay read-only (apart from the files a step names), never to commit or merge, not to use tools that reach the owner's apps or services, and never to ask the user anything. Check every result before you rely on it: check the claims you build on against their sources, and diff or test a step. Never hand a helper a decision, code that needs judgment or the merge gate; reviews go through the review gate.
A helper is limited when it reports a quota or rate-limit (429) error or "Upstream request failed", or when it is far slower than the same kind of work was earlier. A wait that returns waitTimedOut, or an async lane with nothing new in its child thread for <n> minutes, is the sign: look at task_status, and if it is still working without progress, it is limited. Then cancel it with task_cancel and give the same prompt to the next target; when all are limited, do the work yourself. Note each switch, and which helpers you used for what, in your handoff.
```

Fill in the targets from section 4: Antigravity (`antigravity`, `gemini-3.8-flash-high`, no options) and OpenCode's `opencode/deepseek-v4.1-flash-free` and `opencode/glm-5.3-flash-free` (`opencode`, options `[{id: "variant", value: "high"}]`), the two OpenCode models next to each other, so a limited one switches model first. Put Copilot (`acpRegistry_copilot`, model `default`, no options) fourth when its budget has room, and leave it out otherwise. Spread the load across the two providers: give about half the tasks Antigravity first, and the others OpenCode first. Leave out a helper that is limited now, and put one that was limited earlier last. Five minutes without anything new suits a quick step (timeoutMs 300000); allow a research lane longer.

When a task may use Argon, add this section too:

```text
Help available (advanced helper): for <the kind of sub-task, for example "comparing the two sync designs against the brief's criteria" or "a second review of your diff before you hand off">, you may hand a bounded sub-task to Gemini 4 Argon: call delegate_task with target {providerInstanceId: "antigravity", model: "gemini-4-argon-high"}, role "research" (or "general" for code), and mode "wait" with timeoutMs <n> or mode "async". It has a small weekly quota: use it about <n> times in this task at most, only where a fast helper wouldn't do, and give it the files, paths and question up front so it doesn't spend its quota searching. The same rules as for the fast helpers apply: read-only apart from named files, no commits or merges, no tools that reach the owner's apps or services, never ask the user. Check what it returns: you decide, and you own any code it writes. If it reports a quota or rate-limit error, do that work yourself; don't hand it to a fast helper.
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
- Claude: <plan, e.g. Max 20x> (detected <date>)
- Codex: <plan, e.g. ChatGPT Plus> (detected <date>)
- Antigravity: <plan> with its own limits (owner, <date>); usage read by `agy -p /usage`, with Gemini 5-hour and weekly windows and a separate Argon weekly window
- OpenCode: free models only (owner, <date>); rate-limited model by model, usage not readable locally
- Copilot: <plan, e.g. student (free_educational_quota)>, Auto routing only (<model it routes to>), <n> units a month (detected <date>); usage read by `gh api /copilot_internal/user`

## Preferences
- Prefer Codex for computer use when it has room, on <model, e.g. GPT-6.1 Terra> (owner, <date>)
- Fast helpers inside tasks, for research, retrieval and simple steps: Antigravity's Gemini Flash at high; OpenCode's <models good enough> at high; never task agents (owner, <date>)
- Advanced helper inside tasks, for bounded harder sub-tasks: Gemini 4 Argon at high, within a weekly budget per run (owner, <date>)
- When a window runs out, pause and resume on the same subscription after the reset; never move work to another subscription (owner, <date>)

## Machine: <computer>
- Automatic screen lock: <off/on> (owner, <date>); Stage Manager off for computer-use runs (owner, <date>)
- Granted (warm-up, <date>): <harness app>: Accessibility, Screen Recording, Developer Tools, Automation of <apps>; Developer mode on; <toolchain license accepted>
- Asks for a password, so never in a run: <commands found to prompt on this computer>

## Calibration (newest first)
- codex/<plan> five_hour: ~<n>% per task-hour, <kind of task> (run <ledger name>)
- claude/<plan> five_hour: ~<n>% per task-hour (run <ledger name>)
- antigravity/gemini_models: <n> Flash hand-offs took the 5-hour window from <a>% to <b>% (run <ledger name>)
- antigravity/gemini_4_argon: <n> Argon hand-offs of <kind> took the week from <a>% to <b>% (run <ledger name>)
- copilot/<plan> monthly: <n> hand-offs of <kind>, <tokens> input tokens, took <a> units (run <ledger name>)
- opencode/<model>: rate-limited after <n> requests in <m> minutes; switched to <model or provider> (run <ledger name>)
```

At the start of a run, read the "Granted" line in this computer's "Machine" section, so the contract asks only for what's new. Update it after the warm-up.

## 7. In the contract and the report

- **In the contract:**
  - Show the usage snapshot in plain words, for example "Claude Max 20x: 9% of the 5-hour window and 23% of the week used. Codex Plus: 23% and 16%. Antigravity Pro: Gemini 2% and 1%; Argon 1% of its week."
  - Give the expected consumption of the run, and whether it is likely to pause for a reset (and until when).
  - Name any other active run that shares the subscriptions.
  - Give the reason for each task routed away from the home harness.
  - Say which tasks may use the fast helpers, and for what.
  - Give the run's Argon budget, in points of its weekly window, and which tasks may use it.
- **In the report:**
  - Add one line on usage, before and after.
  - Name any task that paused for a reset, and for how long.
  - Name other runs that used the same subscriptions meanwhile, because their use is in the numbers.
  - Mention a helper that was rate-limited or ran out, and what the work switched to.
