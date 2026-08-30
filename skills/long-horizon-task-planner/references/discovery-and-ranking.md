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

## Scoring

Score each candidate from 1–5 on:

- **Value:** expected improvement to the project or workflow
- **Evidence:** strength and specificity of the observed need
- **Autonomy:** ability to proceed without user intervention
- **Verifiability:** quality of the validation loop and stopping condition
- **Parallel safety:** ability to run alongside the other selected tasks

Also score **risk** and **unresolved dependencies** from 1–5. Compare candidates with:

```text
value + evidence + autonomy + verifiability + parallel safety
- risk - unresolved dependencies
```

Use the calculation to discipline comparisons, not to imply false precision. Exclude every candidate with autonomy or verifiability below 4. Prefer a diverse, high-value portfolio when candidates have comparable scores.

At the default balanced risk tolerance, do not reject a candidate merely because it is broad, cross-cutting, or technically difficult. Prefer ambitious migrations, architectural improvements, and repo-wide quality work when they have strong evidence, isolated execution, reversible checkpoints, and a convincing validation loop. Use risk to strengthen the worktree strategy, checkpoints, and validation rather than automatically shrinking the objective. Reserve conservative selection for users who request low-risk work or for repositories where rollback and verification are weak.

## Configuration Selection

Recommend exact settings that are available in the current Codex client. Apply these roles when the corresponding GPT-5.6 models are available:

- **Sol / flagship:** ambiguous, demanding implementation, architecture, difficult debugging, or high-value synthesis
- **Terra / balanced:** read-heavy exploration, audits, large-file review, test analysis, and moderate implementation
- **Luna / efficient:** narrow, mechanical, repeatable, or high-volume transformations

Use medium reasoning as the balanced default. Use high when the task must trace complex behavior or edge cases, Extra High (`xhigh`) for especially demanding agentic work, and Max only when the expected quality gain justifies the additional time and usage. Recommend Ultra only when the task divides into useful independent subagent lanes; otherwise recommend a single agent at the appropriate reasoning level.

Use `/goal` for the persistent execution loop. Recommend read-only permissions for audits, workspace write for ordinary implementation when sufficient, and Full access only when the validated workflow needs network access, dependency installation, browser or system tooling, or writes beyond the workspace.

## Parallel Portfolio

Record each candidate's likely write surface and shared resources before selecting the final set.

- Concurrent write tasks in one Git repository require separate worktrees.
- Root manifests, lockfiles, generated schemas, shared snapshots, design tokens, and repository-wide formatting are collision surfaces even when feature directories differ.
- Connected documents, production systems, publishing accounts, and external records must have at most one writer unless the task explicitly provides safe partitioning.
- Read-heavy exploration, audits, benchmarks, and summarization are preferred parallel companions.

Create a first wave containing at least the requested maximum concurrency when enough compatible tasks exist. If that is impossible, state the maximum safe concurrency and the concrete collision or dependency that prevents the requested width. Put dependent or conflicting work in later waves.
