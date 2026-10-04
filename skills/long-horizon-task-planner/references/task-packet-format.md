# Task Packet Format

Use this format to make the portfolio comparable at a glance and every proposal runnable without another planning conversation.

## 0. Portfolio Framing

State the selection context before listing tasks:

- **Portfolio lens:** the user-requested or explicitly stated assumption
- **Current phase:** the maturity state relevant to this portfolio
- **Locked decisions:** only choices supported by an authoritative project source or explicit user statement
- **Active work:** tasks or changes that affect priority, readiness, or collision risk
- **Nearest critical-path questions:** the uncertainties or blockers ready work should address
- **Deferred boundaries:** areas that remain premature or outside the requested lens

## 1. Portfolio Summary

Use a compact table containing only ready-now tasks:

| ID | Task | Why now | Readiness evidence | Horizon / confidence | Critical path | Natural horizon | Write surface | Model | Reasoning / mode | Wave |
|---|---|---|---|---|---:|---:|---|---|---|---:|

Use calibrated ranges rather than false precision. `Why now` must explain why doing the task now is better than preserving the option for later. `Readiness evidence` must name satisfied prerequisites, not merely a repository gap. A low-confidence range must be visibly labeled.

## 2. Concurrency Plan

List safe execution waves for ready-now tasks and explain only material constraints:

- Which tasks may start together
- Whether each task needs a separate worktree, the current checkout, or a read-only environment
- Shared files, lockfiles, generated outputs, services, ports, accounts, or other collision surfaces
- Dependencies that force a later wave

If the requested concurrency is unsafe or not useful, state the maximum useful safe width and why. Do not add deferred or lower-priority tasks to fill slots.

## 3. Full Task Packets

For each ready-now task, include the following sections.

### Task and rationale

- **Objective:** one outcome
- **Portfolio lens and current phase:** the context that makes this task relevant
- **Critical-path contribution:** how the output will be used now and by whom
- **Prerequisites satisfied:** concrete evidence that the task is ready
- **Decisions not preempted:** unresolved choices and their owner
- **Why it matters:** expected project value
- **Why now instead of later:** timing rationale
- **Evidence:** concrete paths, symbols, commands, failures, screenshots, or project artifacts
- **Scope:** allowed work surface
- **Out of scope:** tempting adjacent work that would make the goal drift
- **Expected wall-clock horizon:** calibrated range, not a guarantee
- **Runtime confidence:** low, medium, or high
- **Calibration basis:** dominant work units, sequential costs, and comparable completed agent runs when available
- **Natural substantive workload:** only work intrinsically required for the objective
- **Risks and assumptions:** only material items
- **Definition of done:** observable completion criteria for the natural objective

### Recommended agent configuration

Name the execution target, then provide launch-time metadata for the user to select before sending the prompt. These values are advisory unless safety or correctness makes one necessary; label any such value **Required** and explain why. Use exact values only when known and supported by that host; omit unsupported controls and label unknown availability. Include:

- Project or working directory
- Environment: current checkout, read-only, or new worktree
- Model, using the selectable label and model ID or alias when known
- Reasoning or effort level, if exposed
- Execution/delegation choice using the host's supported terminology
- Persistent execution: native `/goal` for Codex and Claude Code; verified equivalent or an explicit persistence limitation for another host
- Permission or approval mode using the host's actual labels
- Useful installed skills or tools
- Parallel compatibility and likely merge-conflict surfaces

Do not recommend a model, mode, skill, or tool that is unavailable in the current environment. Do not recommend maximum settings merely because the task is long.

Keep this entire configuration outside the ready-to-paste prompt. The user may override any recommendation, so the prompt must not restate or assume it.

### Ready-to-paste prompt

Write one self-contained prompt in a fenced text block. For Codex and Claude Code, begin with `/goal` and a measurable completion condition; use a verified equivalent or a plain task prompt for another host. Preserve the execution contract below while adapting its length and structure to the host.

For Claude Code, the entire condition after `/goal` must be at most 4,000 characters, including subsequent lines. Use the compact form below instead of copying every heading from the expanded template. Include project-specific scope, readiness boundaries, required work, validation, authorization, stop conditions, and handoff evidence; keep detailed rationale and calibration in the surrounding task packet. If essential instructions cannot fit, provide a separate instruction prompt for the user to send first, followed by a short `/goal` condition that refers to that brief. Label the two messages and their order explicitly; do not write a planning file into the project.

```text
/goal <observable outcome> is complete, <specified checks> pass, and the handoff shows completion evidence; or a stated blocker is documented with evidence.

Read <instruction and evidence paths>. Work only in <allowed scope> toward <one objective>. Preserve <readiness and decision boundaries> and unrelated changes. Complete <intrinsically required work>. Validate with <confirmed commands or artifact checks> and surface results in the conversation. Retry safe in-scope approaches when they fail. Stop if <specific missing prerequisite or decision blocker>; report the evidence and required next step. Do not <unauthorized external actions or protected changes>. The <range> workload estimate is not a timer; do not wait or add scope to fill it. Hand off <artifacts, required-work evidence, checks, unresolved decisions, and available runtime usage>.
```

For hosts that accept a longer goal directive, expand the same contract as needed:

#### Launch-configuration boundary

The fenced prompt is an execution contract, not a second configuration panel. It must remain correct if the user changes every recommended setting.

Do not put any of the following inside the prompt:

- Model labels, model slugs, or instructions to use a particular model
- Reasoning-effort labels
- Agent or delegation mode selections
- Permission-mode names
- Goal-mode selection language beyond the opening command
- Instructions to select a project, create or select a worktree, or switch execution environments
- A `Recommended configuration`, `Project and environment`, or equivalent launch-settings block

Refer to the current execution context neutrally, such as `the active task workspace`. Absolute project and evidence paths may still appear where they identify material to read or constrain the write surface. Safety constraints such as keeping other checkouts read-only may remain because they govern behavior rather than select an environment.

Translate launch capabilities into task semantics. State the exact allowed and forbidden actions instead of asserting a permission mode. Describe the substantive work lanes without telling the agent whether to delegate them. A named installed skill may appear inside the prompt only when invoking that workflow is intrinsically required by the objective; do not repeat it as configuration metadata.

```text
/goal Complete <specific objective> until <verifiable end state and handoff evidence>, or stop with evidence of <specific blocker>.

Read first:
- <project-specific instruction and evidence paths>

Objective:
<single cohesive outcome>

Readiness boundaries:
- Current phase: <project maturity relevant to this task>.
- Locked decisions: <only explicitly accepted choices this task may rely on>.
- Satisfied prerequisites: <evidence that the work is ready now>.
- Decisions this task must not make: <unresolved product, founder, customer, expert, policy, architecture, or external choices and their owner>.
- Deferred adjacent work: <premature follow-on work that must remain untouched>.

Workload contract:
- Target wall-clock range: <range and confidence>.
- Calibration basis: <project evidence, work units, sequential costs, and comparable agent history when available>.
- Natural substantive workload: <work intrinsically required for this objective>.
- This range is a sizing estimate, not a timer. Do not wait, repeat work solely to consume time, or add unrelated scope.

Required work:
- <intrinsically necessary work item with an observable result>
- <additional work item only when required by the objective>

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
1. Establish the baseline, confirm that the readiness assumptions and planned workload still hold, and record the current result.
2. Complete the required work in coherent checkpoints without broadening into deferred decisions or supporting machinery.
3. Run the specified validation after each meaningful checkpoint.
4. Keep a short progress log naming what changed, what passed, what remains, and any blocker.
5. If an approach fails, inspect the evidence and try another safe in-scope approach instead of waiting for routine guidance.
6. If a prerequisite is missing, a maturity assumption is false, or existing work has already satisfied the material objective, do not invent replacement scope to preserve the estimate. Stop and report the changed readiness evidence.

Validation:
- <exact project commands, visual checks, benchmarks, audits, or artifact checks>

Decision policy:
- Prefer meaningful forward progress and make evidence-backed, reversible choices when the repository provides enough support.
- Treat readiness and decision boundaries as hard constraints. A recommendation does not become an accepted decision.
- Stop and report the blocker only when progress requires missing credentials, an externally consequential action, a destructive operation, or a product/policy decision that would materially change the objective.

Stop conditions:
- Success: <complete observable end state for the natural objective>.
- Blocked: <specific conditions that genuinely require the user>.

Final handoff:
- Summarize changes and validation evidence.
- Report completion evidence for every required work item.
- Distinguish recommendations from accepted decisions and identify the owner of every unresolved choice.
- Report elapsed time and token usage when the agent host makes them available so future planning can be calibrated.
- List remaining risks, assumptions, and follow-up work without performing that follow-up.
```

Replace every angle-bracketed item with project-specific content. If the natural required work does not support the requested lower bound, reject the task instead of adding work. Include validation commands only after confirming they exist or deriving a safe equivalent from project configuration. A read-only task should request a durable report or other immediately usable artifact rather than code changes.

Before presenting a task packet, compare the fenced prompt with its recommended configuration and remove all duplicated or assumed launch choices. In particular, check for model names or slugs, reasoning labels, mode names, permission labels, worktree-selection instructions, and configuration headings. Confirm that changing the external recommendation would not make any instruction in the prompt contradictory or misleading. For Claude Code, count the characters after `/goal` and confirm the condition fits its limit. Ensure the completion or blocker evidence will appear in the conversation for its evaluator.

## 4. Deferred Candidates

List only worthwhile candidates that failed readiness because a concrete prerequisite is missing. For each, provide:

- Title
- Why it may matter later
- Unmet prerequisite or maturity boundary
- Observable reevaluation trigger

Do not score deferred candidates as selected work, place them in execution waves, estimate them as ready, or provide `/goal` prompts.

## 5. Portfolio Caveats

End with only caveats that affect selection or scheduling, such as missing credentials, an unavailable tool, low-confidence runtime calibration, an uncertain build baseline, unresolved portfolio framing, or unavoidable merge conflicts. State once that ranges are workload estimates rather than guarantees. Do not append generic advice and do not start any task.
