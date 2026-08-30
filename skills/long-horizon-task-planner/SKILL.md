---
name: long-horizon-task-planner
description: Propose an evidence-backed portfolio of project-specific, multi-hour or overnight Codex tasks with ready-to-paste prompts, model and reasoning recommendations, and safe parallel execution groups. Use when the user wants autonomous long-running work ideas or asks what several agents could do in parallel. Do not use to launch or execute the proposed tasks.
---

# Long-Horizon Task Planner

Produce a reviewable task portfolio. Inspect the current project, but do not change it and do not start any proposed task.

## Inputs

Infer natural-language preferences. Use these defaults when the user does not specify them:

- Task count: 6
- Expected horizon: 2–8 hours per task
- Maximum concurrency: the smaller of the task count and 4
- Risk tolerance: balanced, favoring ambitious work when it remains reversible and verifiable
- Work type: any category supported by project evidence

Honor requested categories, exclusions, horizons, risk tolerance, and read-only versus implementation preferences. Treat durations as rough sizing, not promises.

## Workflow

1. Ground in the current project.
   - Read every applicable `AGENTS.md` and relevant project documentation first.
   - Inspect repository status, workspace structure, manifests, CI, tests, recent history, hotspots, TODOs, documentation, and non-code assets relevant to the project.
   - Preserve dirty worktrees. Run only safe, non-mutating diagnostics needed to substantiate a candidate.
   - Use only already-installed local tooling. Do not invoke package runners or commands that can download, install, update, or rewrite dependencies during discovery.

2. Read [references/discovery-and-ranking.md](references/discovery-and-ranking.md).
   - Generate more candidates than requested across the domains the project actually contains.
   - Reject work that lacks a coherent objective, a reliable validation loop, or enough autonomy.
   - Rank the survivors and select a portfolio that maximizes value and safe parallelism rather than filling a generic backlog.

3. Read [references/task-packet-format.md](references/task-packet-format.md).
   - Return a portfolio summary, safe execution waves, and a complete task packet for every proposal.
   - Cite concrete project evidence for every task.
   - Recommend settings from the models, reasoning levels, modes, permissions, tools, and installed skills actually available in the current Codex environment.
   - Write a complete ready-to-paste `/goal` prompt for each task. Replace every placeholder with project-specific content.

4. Stop after presenting the portfolio.
   - Never create a goal, task, thread, worktree, branch, commit, or external record.
   - Never edit the inspected project while planning.
   - The user decides which proposals to run and when.

## Portfolio Rules

- Return the requested number of tasks when that many defensible candidates exist. If not, return the maximum defensible set and explain the evidence gap instead of inventing filler.
- Make each proposal one durable objective, not a bundle of unrelated cleanup work.
- Require autonomy and verifiability scores of at least 4 out of 5.
- Exclude tasks that predictably require missing credentials, an unresolved product decision, destructive external action, or authorization outside the user's request.
- Recommend Ultra only when independent subagent lanes materially improve the task. Do not equate duration with reasoning difficulty.
- Put concurrent write-heavy tasks in separate Git worktrees and disclose shared lockfiles, root configuration, generated assets, external systems, and other likely collision surfaces.
- Mention another skill only when it is installed and materially improves the task.
- Full access removes local approval friction; it does not authorize deployment, publishing, deletion, messaging, purchases, or other externally consequential actions.
