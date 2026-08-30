# Discovery and Ranking

Use this reference to turn project evidence into a defensible portfolio of autonomous work. Keep discovery read-only.

## Project Survey

Start with the instructions and sources of truth closest to the working directory. Inspect only what is relevant enough to change candidate selection:

- Applicable `AGENTS.md`, README files, roadmaps, architecture notes, and contribution guidance
- Repository status, branches, recent history, frequently changed files, and abandoned or partially completed areas
- Workspace and package manifests, dependency files, build scripts, CI, release configuration, and deployment boundaries
- Tests, fixtures, coverage configuration, linting, type checking, benchmarks, profiling hooks, logs, and known failure records
- TODO, FIXME, deprecated paths, compatibility layers, duplicated implementations, weak boundaries, and oversized modules
- Design systems, screenshots, prototypes, content, brand assets, motion assets, social workflows, research notes, data, and operational playbooks when present
- Available local tools and installed skills that can provide a real validation loop

Prefer targeted searches and representative file reads over indiscriminate repository dumps. Safe diagnostics may populate ignored caches or build outputs, but must not edit tracked files, install dependencies, rewrite lockfiles, or repair the project. Use only executables already present in the repository or system. Do not use auto-download or ephemeral-install commands such as `npx -y`, `npm exec` when the package is absent, `pnpm dlx`, `yarn dlx`, `bunx`, `uvx`, or equivalent package runners during discovery.

## Candidate Generation

Generate more candidates than requested, using only domains supported by evidence. Candidate families can include:

- Correctness, reliability, test depth, type safety, or migration work
- Architecture, maintainability, dependency reduction, or build and CI improvements
- Performance, rendering, accessibility, browser compatibility, or developer experience
- Documentation, onboarding, operational runbooks, or reproducible evaluation systems
- Product design, design-system consistency, visual QA, brand systems, content systems, or social production workflows
- Research, benchmarking, data quality, automation, or tooling that leaves a reviewable artifact

Do not propose generic tasks such as "improve tests" or "refactor the codebase." Tie each candidate to named paths, observed behavior, an existing gap, or a reproducible signal.

## Autonomy Gate

A task is autonomous only when all of the following are true:

- One objective and one verifiable stopping condition can be stated before work begins.
- The project contains enough evidence to choose a defensible approach without inventing product intent.
- The agent can validate progress through tests, builds, screenshots, benchmarks, audits, diffs, or another observable artifact.
- Necessary tools, runtimes, and credentials are already available, or the task explicitly avoids the missing dependency.
- The work can remain reviewable and reversible until the user chooses to merge, publish, deploy, delete, message, or otherwise affect an external system.

Reject or narrow candidates that require stakeholder taste, unresolved policy, production credentials, purchases, irreversible data changes, or external approval. A research task may replace an implementation task when it can resolve uncertainty without crossing those boundaries.

## Long-Horizon Sufficiency Gate

A task is long-horizon only when the complete success condition contains enough useful, sequential work to plausibly reach the user's requested lower bound on the recommended model and execution mode. A broad-looking objective, large repository, high reasoning setting, or expensive model is not sizing evidence.

Substantiate the workload with project-specific evidence such as:

- The number and diversity of concrete artifacts, packages, components, workflows, environments, or datasets that must be inspected or changed
- Multiple necessary phases that each leave a reviewable artifact or independently validated checkpoint
- Known setup, execution, benchmark, render, browser, migration, or test-matrix costs that cannot be safely parallelized away
- Edge cases, negative cases, compatibility surfaces, or adversarial scenarios already implied by the project
- Comparable completed Codex tasks when the user supplies or references their elapsed time, configuration, scope, and outcome

Define bounded **required depth lanes** when they are necessary to make the objective complete. Examples include exhaustive inventory, core implementation, adversarial or negative testing, cross-environment validation, performance or visual QA, integration and reproducibility, and an independent review-and-remediation pass. Use only lanes supported by project evidence. Every lane must be required for success, not optional filler.

If the core objective is likely to finish below the requested lower bound, choose one of these outcomes:

1. Combine it with closely related work that shares the same objective, evidence, and validation surface.
2. Deepen it with bounded required lanes that close real project gaps.
3. Reject it as undersized and select another candidate.

Never enlarge a task with unrelated cleanup, arbitrary file or test quotas, repeated validation that adds no evidence, deliberate waiting, or instructions to keep working merely to consume time. If the repository does not support enough properly sized candidates, return fewer tasks and explain the sizing evidence gap.

## Runtime Calibration

For every surviving candidate, report:

- A wall-clock range whose lower bound is plausible for the complete workload on the recommended configuration
- Confidence: **low**, **medium**, or **high**
- A short calibration basis naming the dominant work units and any comparable completed runs
- The minimum substantive workload and required depth lanes that must all be completed

Use low confidence when no comparable agent history exists, the work depends on unknown baseline failures, or external tool latency dominates. Avoid narrow hour ranges when confidence is low. Give directly comparable completed Codex runs more weight than human engineering estimates, issue labels, repository size, or intuition. Treat actual elapsed time and token usage as calibration evidence only when the completed scope and model configuration are also known. If a comparable prior task finished far below the proposed lower bound, do not reuse that range unless the new required workload contains clearly additional sequential work commensurate with the gap.

Reasoning effort and runtime are separate. Higher reasoning can improve difficult decisions, while Ultra or other parallel delegation can reduce wall-clock time. Do not increase either setting to make a task appear longer. Size the work itself for the requested horizon, and state that elapsed time remains an estimate rather than a guarantee.

## Scoring

Score each candidate from 1–5 on:

- **Value:** expected improvement to the project or workflow
- **Evidence:** strength and specificity of the observed need
- **Autonomy:** ability to proceed without user intervention
- **Verifiability:** quality of the validation loop and stopping condition
- **Long-horizon sufficiency:** strength of the evidence that completing every required lane plausibly reaches the requested lower bound
- **Parallel safety:** ability to run alongside the other selected tasks

Also score **risk** and **unresolved dependencies** from 1–5. Compare candidates with:

```text
value + evidence + autonomy + verifiability + long-horizon sufficiency + parallel safety
- risk - unresolved dependencies
```

Use the calculation to discipline comparisons, not to imply false precision. Exclude every candidate with autonomy, verifiability, or long-horizon sufficiency below 4. Prefer a diverse, high-value portfolio when candidates have comparable scores.

At the default balanced risk tolerance, do not reject a candidate merely because it is broad, cross-cutting, or technically difficult. Prefer ambitious migrations, architectural improvements, and repo-wide quality work when they have strong evidence, isolated execution, reversible checkpoints, and a convincing validation loop. Use risk to strengthen the worktree strategy, checkpoints, and validation rather than automatically shrinking the objective. Reserve conservative selection for users who request low-risk work or for repositories where rollback and verification are weak.

## Configuration Selection

Recommend exact settings that are available in the current Codex client. Apply these roles when the corresponding GPT-5.6 models are available:

- **Sol / flagship:** ambiguous, demanding implementation, architecture, difficult debugging, or high-value synthesis
- **Terra / balanced:** read-heavy exploration, audits, large-file review, test analysis, and moderate implementation
- **Luna / efficient:** narrow, mechanical, repeatable, or high-volume transformations

Use medium reasoning as the balanced default. Use high when the task must trace complex behavior or edge cases, Extra High (`xhigh`) for especially demanding agentic work, and Max only when the expected quality gain justifies the additional time and usage. Recommend Ultra only when the task divides into useful independent subagent lanes; otherwise recommend a single agent at the appropriate reasoning level. Recalculate the wall-clock range when parallel lanes are recommended because concurrency may shorten elapsed time.

Use `/goal` for the persistent execution loop. Recommend read-only permissions for audits, workspace write for ordinary implementation when sufficient, and Full access only when the validated workflow needs network access, dependency installation, browser or system tooling, or writes beyond the workspace.

## Parallel Portfolio

Record each candidate's likely write surface and shared resources before selecting the final set.

- Concurrent write tasks in one Git repository require separate worktrees.
- Root manifests, lockfiles, generated schemas, shared snapshots, design tokens, and repository-wide formatting are collision surfaces even when feature directories differ.
- Connected documents, production systems, publishing accounts, and external records must have at most one writer unless the task explicitly provides safe partitioning.
- Read-heavy exploration, audits, benchmarks, and summarization are preferred parallel companions.

Create a first wave containing at least the requested maximum concurrency when enough compatible tasks exist. If that is impossible, state the maximum safe concurrency and the concrete collision or dependency that prevents the requested width. Put dependent or conflicting work in later waves.
