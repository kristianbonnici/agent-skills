# Task Packet Format

Use this format to make the portfolio comparable at a glance and every proposal runnable without another planning conversation.

## 1. Portfolio Summary

Start with a compact table containing one row per task:

| ID | Task | Why now | Horizon | Value | Autonomy | Write surface | Model | Reasoning / mode | Wave |
|---|---|---|---|---:|---:|---|---|---|---:|

Use rough horizons rather than false precision. `Why now` must name the strongest project signal, not a generic benefit.

## 2. Concurrency Plan

List safe execution waves and explain only material constraints:

- Which tasks may start together
- Whether each task needs a separate worktree, the current checkout, or a read-only environment
- Shared files, lockfiles, generated outputs, services, ports, accounts, or other collision surfaces
- Dependencies that force a later wave

If the requested concurrency is unsafe, state the maximum safe width and why.

## 3. Full Task Packets

For each task, include the following sections.

### Task and rationale

- **Objective:** one outcome
- **Why it matters:** expected project value
- **Evidence:** concrete paths, symbols, commands, failures, screenshots, or project artifacts
- **Scope:** allowed work surface
- **Out of scope:** tempting adjacent work that would make the goal drift
- **Expected horizon:** rough sizing
- **Risks and assumptions:** only material items
- **Definition of done:** observable completion criteria

### Recommended Codex configuration

Provide exact values for:

- Project or working directory
- Environment: current checkout, read-only, or new worktree
- Model, using the full selectable label and slug when known (for example, GPT-5.6 Terra / `gpt-5.6-terra` rather than only "Terra")
- Reasoning level
- Intelligence/delegation mode: single agent, explicit subagents, or Ultra
- Goal mode: yes
- Permission mode
- Useful installed skills or tools
- Parallel compatibility and likely merge-conflict surfaces

Do not recommend a model, mode, skill, or tool that is unavailable in the current environment. Do not recommend maximum settings merely because the task is long.

### Ready-to-paste prompt

Write one self-contained prompt in a fenced text block. It must begin with a concrete `/goal` command and fully instantiate this contract:

```text
/goal Complete <specific objective> without stopping until <verifiable end state>.

Read first:
- <project-specific instruction and evidence paths>

Objective:
<single cohesive outcome>

Scope:
- <allowed paths and systems>

Out of scope:
- <adjacent changes, external actions, and protected areas>

Constraints and authorization:
- Preserve existing unrelated changes.
- Keep work reviewable and reversible.
- Do not deploy, publish, delete, purchase, message, or mutate external systems unless this task explicitly authorizes that exact action.
- <task-specific constraints>

Work loop:
1. Establish the baseline and record the current result.
2. Work in coherent checkpoints toward the objective.
3. Run the specified validation after each meaningful checkpoint.
4. Keep a short progress log naming what changed, what passed, what remains, and any blocker.
5. If an approach fails, inspect the evidence and try another safe in-scope approach instead of waiting for routine guidance.

Validation:
- <exact project commands, visual checks, benchmarks, audits, or artifact checks>

Decision policy:
- Prefer meaningful forward progress and make evidence-backed, reversible choices when the repository provides enough support.
- Stop and report the blocker only when progress requires missing credentials, an externally consequential action, a destructive operation, or a product/policy decision that would materially change the objective.

Stop conditions:
- Success: <complete observable end state>.
- Blocked: <specific conditions that genuinely require the user>.

Final handoff:
- Summarize changes and validation evidence.
- List remaining risks, assumptions, and follow-up work without performing that follow-up.
```

Replace every angle-bracketed item with project-specific content. Include validation commands only after confirming they exist or deriving a safe equivalent from project configuration. A read-only task should request a durable report or other reviewable artifact rather than code changes.

## 4. Portfolio Caveats

End with only caveats that affect selection or scheduling, such as missing credentials, an unavailable tool, an uncertain build baseline, or unavoidable merge conflicts. Do not append generic advice and do not start any task.
