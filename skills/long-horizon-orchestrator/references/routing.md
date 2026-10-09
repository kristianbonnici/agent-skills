# Routing and capacity

Each task needs a provider and model. The default is simple: use the harness you are running on. Deviate only for a concrete reason, and never because a percentage looks better somewhere else.

## 1. Home harness first

The home harness is the harness and model the orchestrator itself runs on:
- **T3:** `inheritedProviderInstanceId` and `inheritedModel` from `orchestrator_capabilities`.
- **Plain Claude Code:** Claude.
- **Plain Codex:** Codex.

Route every task there by default. The user chose this harness for the run, its tools and installed skills are known to work, and it is usually the subscription the user sized for this kind of work.

The one exception: if you yourself run on Antigravity, don't treat it as the home harness for complex tasks. Route those to Claude Code or Codex (see "Antigravity" below).

Route a task elsewhere only when one of these applies, and only in the contract the user approves:
1. **Strength:** another provider clearly does a particular piece of work better and has room for it (section 4).
2. **The user asked**, in the request or the contract.

Running short of capacity is not a reason to route elsewhere. The home subscription is the one the user started the run on and sized for it; the others are usually smaller and kept for the work they were given. If the home harness can't fit the whole run, say so in the contract and plan for pauses (section 3).

Once the run has started, nothing changes subscription: not the tasks, and not you.

## Reasoning level: err on the side of more

An under-powered agent on important work costs more than an over-powered one: wrong turns, rework, review findings, and failures discovered in the morning. So never under-power a task. High is the default for real work, and you go above it only when you can name the benefit:

| The work | Reasoning level |
|---|---|
| Very simple and fully specified (a mechanical edit, a rename, a lookup) | medium |
| Any real task that is not trivially simple: the default | high |
| A task where you see a real benefit from extra thinking (for example subtle correctness or security logic, a bug with an unknown cause, a design choice with no precedent in the project). Name the benefit in the contract | extra high |
| Sparingly: large or many-sided work that clearly gains from parallel sub-agents inside the task (several independent lanes, a broad review, a big refactor). Name the gain in the contract | the harness's multi-agent mode: Ultracode in Claude Code, Ultra in Codex |
| An Antigravity helper step | high (see "Antigravity" below) |

- **Never use low reasoning.** If a task feels too small for medium, it is probably a step to hand off, not a task.
- **Always set the level explicitly at launch,** and never inherit a model's default. Some defaults are low: in T3, Codex's `gpt-6.1-sol` defaults to low.
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

When a live query fails, for example with no network, the script falls back to the last values the providers wrote to local logs and says so in `source`. Those are only as fresh as the last request made on this machine. `--cached` skips the live queries.

Codex may list free rate-limit resets (`reset_credits_available`). Never use one: spending them is the user's decision.

Percentages from different plans are not comparable. 30% left of Claude Max 20x is many times more work than 30% left of ChatGPT Plus. Turn each number into how many tasks still fit:

```
tasks that fit ≈ (100 − used_percent) / percent one task uses on that plan
```

- **Where "percent one task uses" comes from:** the calibration in the user's profile (section 6). With no calibration yet, be conservative on small plans. On a Plus-sized plan, assume one multi-hour implementation task can take most of a 5-hour window. On a Max-sized plan, assume a small share.
- **Learning it:** after each task, update the calibration from the snapshots taken before and after. If several tasks shared the provider, split the change between them by duration. Calibrate only from real runs, with tasks of about 20 minutes or longer. Short tasks and test runs give wildly misleading per-hour rates: a 3-minute task that moves a window by 3 points is not "60% per hour". When a run is too short to calibrate from, say so in the ledger and leave the profile unchanged.
- **The 5-hour window limits a wave; the weekly window limits the whole run.** The weekly window also covers the user's next days, so don't plan to use more than about 80% of a weekly window without saying so in the contract.
- **Staleness:** treat `observed_at` as the age of the number. A window with `reset_since_observed: true` has reset since it was read, so it is near zero again.
- **Missing data:** if a provider's usage can't be read, say so and route by plan size alone. Antigravity's is never readable, so it runs on a hand-off budget instead.
- **Other runs share the windows.** Another orchestrator run on the same machine draws on the same subscriptions. Before the contract and before each wave, look for other ledgers next to yours:

  ```sh
  grep -l -E '^Status: (running|paused)' "${XDG_STATE_HOME:-$HOME/.local/state}"/agent-skills/long-horizon-orchestrator/*.md
  ```

  A ledger without a `Status:` line that was changed in the last day may also be active. For each active run, count its running tasks on each provider and leave room for them. Name them in the contract, and in the report's usage line, because they make the usage numbers a shared total.

## 3. When a window runs short or runs out

When a usage window runs out, the work that depends on it pauses. Nothing moves to another subscription: not a task, and not you. Waiting beats a hand-off in two ways:
- the subscriptions stay used the way the user sized them;
- an agent that resumes on its own thread keeps everything it knew, which a successor would have to rebuild from notes.

### Before launching

If a wave won't fit in the home harness's 5-hour window, launch what fits and hold the rest until the reset, with a resume wake scheduled for just after it (below). Tasks that the contract routed to another provider follow that provider's windows in the same way.

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
1. Leave it exactly as it is: its thread, worktree and uncommitted changes. Don't relaunch it, and don't hand it to another provider.
2. Make sure the resume wake is scheduled, and mark the task `paused` in the ledger with its expected resume time.
3. On the first wake after the reset, check whether the task is running again. If not, continue it on the same thread: "Your usage limit has reset. Continue the brief from where you stopped." This nudge doesn't count as the task's one nudge for silence.

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

## 4. Strengths: a soft preference

| Work | Prefer | Applies when | Basis |
|---|---|---|---|
| Computer use: operating a desktop app or real browser, clicking through a UI, checking what is actually on screen | Codex | Codex has room for that piece | Owner's assessment, 2026-10: Codex's computer use is stronger |
| A small, fully specified step a fast model can do (see "Antigravity" below) | Antigravity, Gemini Flash | the step is simple, the hand-off budget isn't spent, and the result can be checked | Owner, 2026-10: a fast, less capable helper, to be used sparingly |
| Everything else | Home harness | always | section 1 |

### Antigravity: a fast helper for simple steps

Antigravity is never a task agent for complex work. Don't give it a whole task, a design or debugging problem, a review, or a merge gate, and don't use it to save capacity on work that needs judgment. It never orchestrates either, not even as a stand-in while the home window resets (section 3). Its role is the occasional simple step inside a task run by a stronger agent. Such a step:

- **Has a fully specified input and output:** a mechanical edit across many files from an exact rule, renames, reformatting, boilerplate from a given template, extracting facts from named files, or a quick lookup.
- **Is cheap to check:** the delegating agent reviews the result, for example with a diff, a test or a quick read, before relying on it.

Settings:

- **Model:** a Gemini Flash model at high reasoning, for example `gemini-3.8-flash-high`, even for quick steps. Flash stays fast at high reasoning, and since it is a less capable model to begin with, the extra reasoning is what makes its results dependable. Don't use Antigravity's larger models (Gemini Pro, or the Claude and GPT models it also offers) to do bigger work through the back door. That work belongs to the home harness.
- **Budget:** treat Antigravity's plan as small, with its own limits (the owner's plan is in the profile), and Antigravity doesn't record its quota locally, so `provider-usage` can't show it. Limit the number of hand-offs instead. The default is at most 5 small steps per 5-hour window for the whole run, unless the profile's calibration says otherwise. Count them in the ledger.
- **Quota errors:** after a quota or rate-limit error, stop using Antigravity until its window resets, and note the error in the profile. The point at which errors start is the calibration.

- **A preference, not a rule.** Claude agents can do computer use too. When Codex is short on room, unavailable, or the computer-use part is trivial, keep the work on the home harness.
- **Apply it to the smallest sensible piece.** If only one step of a task needs computer use, keep the task on the home harness and hand that one step to Codex (section 5). Move the whole task only when most of it is computer use.
- **The user can override this.** The owner's profile (section 6) wins over this table.

### Computer use needs the screen

Computer use works only while the Mac is awake and unlocked, and on windows the agent can capture. In the first overnight run, every real-screen check failed: the screen had locked itself, and Stage Manager, which can hide windows from Codex's screen capture, was on. So, whenever a task or helper step will operate the real screen:

1. **Read the settings before the contract** (all read-only):

   ```sh
   sysadminctl -screenLock status 2>&1 | tail -1                # want "screenLock is off"
   defaults read com.apple.WindowManager GloballyEnabled 2>&1   # Stage Manager: want 0 (or "does not exist")
   pmset -g | grep -E '^ *(sleep|displaysleep) '                # system and display sleep, in minutes (0 = never)
   ```

2. **Remind the user in the contract**, saying what you found:
   - keep the Mac awake and unlocked for the whole run: automatic screen lock off, no locking it by hand, and the display kept awake (for example with `caffeinate -d` running for the night);
   - turn off Stage Manager for the run, because it hides windows from Codex's screen capture.
3. **Check again before the step runs.** The screen is locked when this prints `<true/>`:

   ```sh
   ioreg -n Root -d1 -a | grep -A1 CGSSessionScreenIsLocked
   ```

   If it is locked, or the app's window can't be captured, don't retry. The task lists the check under "Couldn't check" in its handoff, merges on its other checks (unless that check is its main deliverable), and the report asks the user to look.

## 5. Handing one step to another provider

This needs T3, which can launch child tasks on other providers. In T3, when a task has a step suited to another provider and that provider has room, add a "Help available" section to the brief:

```text
Help available: for <the step, for example "checking the settings screen in the running desktop app">, you may hand that step to Codex. Call delegate_task with target {providerInstanceId: "codex", model: "<model id>"}, mode "wait", and a self-contained description of the step, including what to report back. Use at most <n> such hand-offs. If the hand-off fails or Codex is unavailable, do the step yourself.
```

For an Antigravity step, the same pattern applies with its own budget and a check:

```text
Help available: for simple, fully specified steps such as <example>, you may hand the step to a fast helper. Call delegate_task with target {providerInstanceId: "antigravity", model: "gemini-3.8-flash-high"}, mode "wait", and exact inputs, rules and the expected output. Use at most <n> such hand-offs. Check every result before using it. If it is wrong, or the helper reports a quota error, do the step yourself and don't use the helper again in this task.
```

Divide the run's Antigravity budget across the tasks that get this section, and record each task's share in the ledger.

- **Codex computer use works under T3.** The owner confirmed this on 2026-10-04. It operates the real screen, so avoid it for steps that would disturb a user who is at the machine, unless the brief allows it. It needs the screen as described in section 4.
- **A helper is for its step only.** A task must not hand the rest of its work to a helper, and neither a task nor a helper moves work to another subscription because the home window ran out (section 3).
- **Plain Claude Code or Codex:** no cross-provider hand-off exists, so the step stays on the home harness.

## 6. The owner's profile

Personal facts live outside the skill, at:

```
${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/long-horizon-orchestrator/providers.md
```

- **At the start:** read it if it exists. If it doesn't, create it from what `provider-usage` detects.
- **At the finish:** update its calibration.

The owner may edit it at any time, and their statements win over this reference. Keep it short:

```markdown
# Providers

## Plans
- Claude: <plan, e.g. Max 20x> (detected <date>)
- Codex: <plan, e.g. ChatGPT Plus> (detected <date>)
- Antigravity: <plan> with its own limits (owner, <date>; usage not readable locally)

## Preferences
- Prefer Codex for computer use when it has room (owner, <date>)
- Antigravity only for simple, checkable steps, sparingly (owner, <date>)
- When a window runs out, pause and resume on the same subscription after the reset; never move work to another subscription (owner, <date>)

## Machine
- Automatic screen lock: <off/on> (owner, <date>); Stage Manager off for computer-use runs (owner, <date>)

## Calibration (newest first)
- codex/<plan> five_hour: ~<n>% per task-hour, <kind of task> (run <ledger name>)
- claude/<plan> five_hour: ~<n>% per task-hour (run <ledger name>)
- antigravity: <n> Flash hand-offs in one 5-hour window before a quota error (run <ledger name>)
```

## 7. In the contract and the report

- **In the contract:**
  - Show the usage snapshot in plain words, for example "Claude Max 20x: 9% of the 5-hour window and 23% of the week used. Codex Plus: 23% and 16%."
  - Give the expected consumption of the run, and whether it is likely to pause for a reset (and until when).
  - Name any other active run that shares the subscriptions.
  - Give the reason for each task routed away from the home harness.
- **In the report:**
  - Add one line on usage, before and after.
  - Name any task that paused for a reset, and for how long.
  - Name other runs that used the same subscriptions meanwhile, because their use is in the numbers.
