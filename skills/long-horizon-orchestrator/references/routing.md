# Routing and capacity

Each task needs a provider and model. The default is simple: use the harness you are running on. Deviate only for a concrete reason, and never because a percentage looks better somewhere else.

## 1. Home harness first

The home harness is the harness and model the orchestrator itself runs on:
- **T3:** `inheritedProviderInstanceId` and `inheritedModel` from `orchestrator_capabilities`.
- **Plain Claude Code:** Claude.
- **Plain Codex:** Codex.

Route every task there by default. The user chose this harness for the run, its tools and installed skills are known to work, and it is usually the subscription the user sized for this kind of work.

The one exception: if you yourself run on Antigravity, don't treat it as the home harness for complex tasks. Route those to Claude Code or Codex (see "Antigravity" below).

Move a task elsewhere only when one of these applies:
1. **Capacity:** the home harness can't fit the work (section 3).
2. **Strength:** another provider clearly does a particular piece of work better and has room for it (section 4).
3. **The user asked**, in the request or the contract.

## Reasoning level: err on the side of more

An under-powered agent on important work costs more than an over-powered one: wrong turns, rework, review findings, and failures discovered in the morning. So bias every choice upward:

| The work | Reasoning level |
|---|---|
| Very simple and fully specified (a mechanical edit, a rename, a lookup) | medium |
| Any real task that is not trivially simple: the default | high or extra high |
| Large or many-sided work that gains from parallel sub-agents inside the task (several independent lanes, a broad review, a big refactor) | the harness's multi-agent mode: Ultracode in Claude Code, Ultra in Codex |
| An Antigravity helper step | high (see "Antigravity" below) |

- **Never use low reasoning.** If a task feels too small for medium, it is probably a step to hand off, not a task.
- **Always set the level explicitly at launch,** and never inherit a model's default. Some defaults are low: in T3, Codex's `gpt-6.1-sol` defaults to low.
- **In T3, the option names differ by provider:**
  - Claude: `{"id": "effort", "value": "high" | "xhigh" | "ultracode"}`. Ultracode exists only on models that list it, such as Opus and Fable, not Sonnet.
  - Codex: `{"id": "reasoningEffort", "value": "high" | "xhigh" | "ultra"}`.

  Use only values the capability catalog lists for that model.
- **Capacity still applies.** Higher reasoning and the multi-agent modes use more of a subscription. If the level a task deserves doesn't fit the capacity left, move the task to a harness with room, or wait for a reset. Don't step down to a level below what the work needs.

## 2. Measure capacity as plan size times room left

Run `scripts/provider-usage` (in this skill's folder):
- at the start;
- before each wave;
- at the finish.

It prints each provider's plan and the last observed usage of its 5-hour and weekly windows. Record each snapshot in the ledger.

Percentages from different plans are not comparable. 30% left of Claude Max 20x is many times more work than 30% left of ChatGPT Plus. Turn each number into how many tasks still fit:

```
tasks that fit ≈ (100 − used_percent) / percent one task uses on that plan
```

- **Where "percent one task uses" comes from:** the calibration in the user's profile (section 6). With no calibration yet, be conservative on small plans. On a Plus-sized plan, assume one multi-hour implementation task can take most of a 5-hour window. On a Max-sized plan, assume a small share.
- **Learning it:** after each task, update the calibration from the snapshots taken before and after. If several tasks shared the provider, split the change between them by duration. Calibrate only from real runs, with tasks of about 20 minutes or longer. Short tasks and test runs give wildly misleading per-hour rates: a 3-minute task that moves a window by 3 points is not "60% per hour". When a run is too short to calibrate from, say so in the ledger and leave the profile unchanged.
- **The 5-hour window limits a wave; the weekly window limits the whole run.** The weekly window also covers the user's next days, so don't plan to use more than about 80% of a weekly window without saying so in the contract.
- **Staleness:** treat `observed_at` as the age of the number. A window with `reset_since_observed: true` has reset since it was read, so it is near zero again.
- **Missing data:** if a provider's usage can't be read, say so and route by plan size alone. For example, Claude's usage isn't recorded outside T3, and Antigravity's is never recorded, so it runs on a hand-off budget instead.

## 3. When a provider runs short or runs out

### Before launching

If a wave won't fit in the home harness's 5-hour window:
- If the window resets within about an hour, hold the wave until then. The heartbeat or the next report will wake you.
- Otherwise, move individual tasks to a provider that has room, starting with the tasks that suit it best.

### A running task hits its quota

Any provider can run out mid-task. Signs of this:
- the task's thread fails or stalls with a usage-limit or rate-limit error;
- `provider-usage` shows that provider's window at or near 100%, or with status `rejected`;
- the task reports that it is blocked on quota.

Don't let the task sit until the reset. Hand it off to another harness that still has room, continuing from where it stopped:

1. **Choose the successor.** Use sections 1–2: capacity measured against plan size, and how well the task suits the harness. A complex task may go only to Claude Code or Codex, never to Antigravity. If the exhausted window resets within about 30 minutes, waiting is cheaper than a hand-off, so wait for the heartbeat instead.
2. **Stop the old agent from resuming.** Cancel anything still queued on it, such as its goal, which would otherwise start when its quota resets and collide with the successor. Leave its worktree exactly as it is, uncommitted changes included.
3. **Start the successor in the same worktree and branch,** with a continuation brief (see [task-brief.md](task-brief.md#continuation-brief)). Give it the original brief, a short summary of the old agent's last progress, and a goal if its harness supports one. The report-back stays the same.
4. **Retire the old thread** once the successor is running. Record the hand-off in the ledger: from which harness and model to which, when, and why.

Host mechanics are in the host reference. Without T3 there is no other harness to hand off to. Use another model on the same host if its limits are separate; otherwise wait for the reset and record the delay.

### The orchestrator's own quota

You run on a subscription too. On every wake, check your own provider's windows. If one is past about 85% and work is still pending, move yourself to a provider with room before you run out, because an exhausted orchestrator cannot wake up to fix anything. The ledger holds the run's state, so nothing is lost. In T3, this means switching your own thread's model and recreating the heartbeat (see [host-t3.md](host-t3.md)). Note the switch in the ledger and the report.

### Always

Never work around a weekly limit silently. The report says which tasks moved, waited or changed hands, and why.

## 4. Strengths: a soft preference

| Work | Prefer | Applies when | Basis |
|---|---|---|---|
| Computer use: operating a desktop app or real browser, clicking through a UI, checking what is actually on screen | Codex | Codex has room for that piece | Owner's assessment, 2026-10: Codex's computer use is stronger |
| A small, fully specified step a fast model can do (see "Antigravity" below) | Antigravity, Gemini Flash | the step is simple, the hand-off budget isn't spent, and the result can be checked | Owner, 2026-10: a fast, less capable helper, to be used sparingly |
| Everything else | Home harness | always | section 1 |

### Antigravity: a fast helper for simple steps

Antigravity is never a task agent for complex work. Don't give it a whole task, a design or debugging problem, a review, or a merge gate, and don't use it to save capacity on work that needs judgment. Its role is the occasional simple step inside a task run by a stronger agent. Such a step:

- **Has a fully specified input and output:** a mechanical edit across many files from an exact rule, renames, reformatting, boilerplate from a given template, extracting facts from named files, or a quick lookup.
- **Is cheap to check:** the delegating agent reviews the result, for example with a diff, a test or a quick read, before relying on it.

Settings:

- **Model:** a Gemini Flash model at high reasoning, for example `gemini-3.8-flash-high`, even for quick steps. Flash stays fast at high reasoning, and since it is a less capable model to begin with, the extra reasoning is what makes its results dependable. Don't use Antigravity's larger models (Gemini Pro, or the Claude and GPT models it also offers) to do bigger work through the back door. That work belongs to the home harness.
- **Budget:** treat Antigravity's plan as small, with its own limits (the owner's plan is in the profile), and Antigravity doesn't record its quota locally, so `provider-usage` can't show it. Limit the number of hand-offs instead. The default is at most 5 small steps per 5-hour window for the whole run, unless the profile's calibration says otherwise. Count them in the ledger.
- **Quota errors:** after a quota or rate-limit error, stop using Antigravity until its window resets, and note the error in the profile. The point at which errors start is the calibration.

- **A preference, not a rule.** Claude agents can do computer use too. When Codex is short on room, unavailable, or the computer-use part is trivial, keep the work on the home harness.
- **Apply it to the smallest sensible piece.** If only one step of a task needs computer use, keep the task on the home harness and hand that one step to Codex (section 5). Move the whole task only when most of it is computer use.
- **The user can override this.** The owner's profile (section 6) wins over this table.

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

- **Codex computer use works under T3.** The owner confirmed this on 2026-10-04. It operates the real screen, so avoid it for steps that would disturb a user who is at the machine, unless the brief allows it.
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

## Calibration (newest first)
- codex/<plan> five_hour: ~<n>% per task-hour, <kind of task> (run <ledger name>)
- claude/<plan> five_hour: ~<n>% per task-hour (run <ledger name>)
- antigravity: <n> Flash hand-offs in one 5-hour window before a quota error (run <ledger name>)
```

## 7. In the contract and the report

- **In the contract:**
  - Show the usage snapshot in plain words, for example "Claude Max 20x: 9% of the 5-hour window and 23% of the week used. Codex Plus: 23% and 16%."
  - Give the expected consumption of the run.
  - Give the reason for each task routed away from the home harness.
- **In the report:**
  - Add one line on usage, before and after.
  - Name any task that moved or waited for a reset.
