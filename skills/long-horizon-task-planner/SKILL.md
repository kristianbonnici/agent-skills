---
name: long-horizon-task-planner
description: Propose a maturity-aware, evidence-backed portfolio of project-specific, genuinely multi-hour or overnight agent tasks with calibrated workload ranges, ready-to-paste prompts, model recommendations, and safe parallel groups. Use when the user wants autonomous long-running work ideas or asks what several agents could do in parallel. Do not use to launch or execute the proposed tasks.
---

# Long-Horizon Task Planner

Produce a reviewable task portfolio. Inspect the current project, but do not change it and do not start any proposed task.

## Agent Host

Use the current agent host as the execution target unless the user names another. State the target and use its available models, effort controls, permissions, delegation, and installed skills. Read the host guidance in [references/discovery-and-ranking.md](references/discovery-and-ranking.md#configuration-selection) before recommending launch settings.

Both Codex and Claude Code support native `/goal`; do not treat it as Codex-only or substitute `/loop` merely because the target is Claude Code. For Claude Code, use a compact, verifiable completion condition within its 4,000-character limit. Honor explicit runtime restrictions without starting a goal to probe support. For another host, verify its persistent-execution command or provide a plain task prompt and disclose that persistence is unverified.

## Inputs

Infer natural-language preferences. Use these defaults when the user does not specify them:

- Task count ceiling: 6
- Target wall-clock horizon: 2–8 hours per task
- Maximum concurrency: the smaller of the task count and 4
- Risk tolerance: balanced, favoring high-value, reversible work that is ready now
- Portfolio lens: the current project critical path, unless the user requests a category

Honor requested categories, exclusions, horizons, risk tolerance, and read-only versus implementation preferences. Treat the requested count as a maximum, not a quota. Treat a horizon as a workload-sizing target, not a promise or a timer. Never pad a proposal with unrelated work, repeated checks, waiting, or instructions to consume time.

## Workflow

1. Ground in the current project.
   - Read every applicable project instruction file, including `AGENTS.md` and `CLAUDE.md` when present, and relevant project documentation first.
   - Identify the current project phase, explicit decisions, lifecycle statuses, active work, nearest open questions, deferred areas, and unmet prerequisites before treating repository gaps as candidates.
   - Inspect repository status, workspace structure, manifests, CI, tests, recent history, hotspots, TODOs, documentation, and non-code assets relevant to the chosen portfolio lens.
   - Preserve dirty worktrees. Run only safe, non-mutating diagnostics needed to substantiate a candidate.
   - Use only already-installed local tooling. Do not invoke package runners or commands that can download, install, update, or rewrite dependencies during discovery.

2. Read [references/discovery-and-ranking.md](references/discovery-and-ranking.md).
   - Generate more candidates than requested within the chosen portfolio lens. Cross domains only when the current critical path genuinely does.
   - Reject work that is premature, off the current critical path, blocked by upstream decisions, merely supportive without being a blocker, or unnaturally enlarged to meet the horizon.
   - Rank the survivors and select a portfolio that maximizes present usefulness, information gain, natural horizon sufficiency, and safe parallelism rather than filling a generic backlog.

3. Read [references/task-packet-format.md](references/task-packet-format.md).
   - Return portfolio framing, ready-now tasks, safe execution waves, and a complete task packet only for work whose prerequisites are already satisfied.
   - List worthwhile but premature candidates separately with their unmet prerequisite and reevaluation trigger. Do not give them runnable prompts.
   - Cite concrete project evidence for every task.
   - Recommend settings from the models, effort controls, modes, permissions, tools, and installed skills actually available in the target agent environment. Omit unsupported controls and mark unknown availability instead of inventing exact values.
   - Keep launch-time configuration outside the ready-to-paste prompt. Treat recommendations as advisory unless a setting is explicitly marked required for safety or correctness.
   - Make every prompt configuration-independent: it must remain coherent if the user chooses a different model, reasoning level, delegation mode, permission mode, project selector, or environment than recommended.
   - Write a complete ready-to-paste prompt for each ready-now task using the target host's goal command and limits, including its workload and readiness boundaries. Replace every placeholder with project-specific content.

4. Stop after presenting the portfolio.
   - Never create a goal, task, thread, worktree, branch, commit, or external record.
   - Never edit the inspected project while planning.
   - The user decides which proposals to run and when.

## Portfolio Rules

- Return up to the requested number of ready-now tasks. If fewer clear every gate, return fewer and explain the readiness, priority, or sizing gap instead of inventing filler.
- Make each proposal one durable objective, not a bundle of unrelated cleanup work.
- Require critical-path relevance, readiness, autonomy, verifiability, and natural long-horizon sufficiency scores of at least 4 out of 5.
- Reject naturally short candidates rather than deepening or combining them merely to meet the requested horizon. Combine work only when it already forms one necessary, coherent program independent of duration.
- Treat draft, hypothesis, exploratory, candidate, selected, and locked statuses as real maturity constraints. Do not turn research into architecture, implementation, product flows, or accepted decisions without explicit authorization and satisfied prerequisites.
- Do not substitute agent synthesis for customer evidence, expert validation, founder judgment, or product decisions. Research may compare options and recommend a next step while preserving who must decide.
- Exclude maintenance, validation, documentation, CI, catalog, and other supporting work by default unless the user requests that category or the work removes a demonstrated blocker on the chosen critical path.
- Report a wall-clock range, confidence level, calibration basis, and natural substantive workload for every ready-now proposal. Do not present unsupported hour estimates as fact.
- Include required work items only when they are intrinsically necessary to the objective. Do not manufacture mandatory depth lanes to make a task appear long.
- Exclude tasks that predictably require missing credentials, an unresolved product decision, destructive external action, or authorization outside the user's request.
- Recommend delegation only when the target host supports it and independent subagent lanes materially improve the task. Do not use delegation or higher effort to inflate duration; parallel execution can reduce wall-clock time.
- Put concurrent write-heavy tasks in separate Git worktrees and disclose shared lockfiles, root configuration, generated assets, external systems, and other likely collision surfaces.
- Mention another skill only when it is installed and materially improves the task.
- Broader permissions can reduce tool approval friction; they do not authorize deployment, publishing, deletion, messaging, purchases, or other externally consequential actions. A goal command does not change permissions.
- Never copy launch recommendations into the runnable prompt. Model names or slugs, effort levels, delegation choices, permission-mode labels, and project or worktree selection belong only in the configuration section. The host's goal command is the only launch control included in the prompt.
- Express actual task authorization and safety boundaries behaviorally inside the prompt. For example, state which files may change and which external actions are forbidden; do not claim that the prompt grants permissions.
