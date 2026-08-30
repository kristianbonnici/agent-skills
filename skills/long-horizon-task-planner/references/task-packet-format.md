# Task Packet Format

Use this format to make the portfolio comparable at a glance and every proposal runnable without another planning conversation.

## 1. Portfolio Summary

Start with a compact table containing one row per task:

| ID | Task | Why now | Horizon / confidence | Long-horizon score | Value | Autonomy | Write surface | Model | Reasoning / mode | Wave |
|---|---|---|---|---:|---:|---:|---|---|---|---:|

Use calibrated ranges rather than false precision. `Why now` must name the strongest project signal, not a generic benefit. A low-confidence range must be visibly labeled.

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
- **Expected wall-clock horizon:** calibrated range, not a guarantee
- **Runtime confidence:** low, medium, or high
- **Calibration basis:** dominant work units, sequential costs, and comparable completed agent runs when available
- **Minimum substantive workload:** the bounded work that supports the lower estimate
- **Required depth lanes:** every cohesive, evidence-backed lane that must be completed before success
- **Risks and assumptions:** only material items
- **Definition of done:** observable completion criteria covering every required depth lane

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

Workload contract:
- Target wall-clock range: <range and confidence>.
- Calibration basis: <project evidence, work units, sequential costs, and comparable agent history when available>.
- Minimum substantive workload: <bounded work that supports the lower estimate>.
- This range is a sizing estimate, not a timer. Do not wait, repeat work solely to consume time, or add unrelated scope.
- Do not stop after the core implementation. Complete every required depth lane and include its validation evidence in the final handoff.

Required depth lanes:
- <bounded, evidence-backed lane with an observable result>
- <additional required lane>
- <continue only as needed to substantiate the requested horizon>

Baseline fallback:
- <bounded project-specific fallback if existing work has already satisfied or invalidated a lane, or state that no fallback is authorized>

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
1. Establish the baseline, confirm that the planned workload still exists, and record the current result.
2. Complete every required depth lane in coherent checkpoints; the core implementation alone is not success.
3. Run the specified validation after each meaningful checkpoint.
4. Keep a short progress log naming what changed, which lanes are complete, what passed, what remains, and any blocker.
5. If an approach fails, inspect the evidence and try another safe in-scope approach instead of waiting for routine guidance.
6. If existing work has already satisfied or invalidated a lane, verify that evidence and use only a project-specific fallback explicitly authorized in this prompt. Do not invent unrelated work to preserve the estimate.

Validation:
- <exact project commands, visual checks, benchmarks, audits, or artifact checks>

Decision policy:
- Prefer meaningful forward progress and make evidence-backed, reversible choices when the repository provides enough support.
- Stop and report the blocker only when progress requires missing credentials, an externally consequential action, a destructive operation, or a product/policy decision that would materially change the objective.

Stop conditions:
- Success: <complete observable end state covering every required depth lane>.
- Blocked: <specific conditions that genuinely require the user>.

Final handoff:
- Summarize changes and validation evidence.
- Report completion evidence for every required depth lane.
- Report elapsed time and token usage when Codex makes them available so future planning can be calibrated.
- List remaining risks, assumptions, and follow-up work without performing that follow-up.
```

Replace every angle-bracketed item with project-specific content. Include enough required lanes to support the requested lower bound, but never add a lane solely to make the task longer. Include validation commands only after confirming they exist or deriving a safe equivalent from project configuration. A read-only task should request a durable report or other reviewable artifact rather than code changes.

## 4. Portfolio Caveats

End with only caveats that affect selection or scheduling, such as missing credentials, an unavailable tool, low-confidence runtime calibration, an uncertain build baseline, or unavoidable merge conflicts. State once that ranges are workload estimates rather than guarantees. Do not append generic advice and do not start any task.
