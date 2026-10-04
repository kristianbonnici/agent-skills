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

## Portfolio Framing

Frame the portfolio before generating candidates. Record:

- The user's requested lens, categories, and exclusions
- The current project phase or phases, such as exploration, validation, prototype, implementation, production, or optimization
- Explicitly locked decisions and the source that records each one
- Drafts, hypotheses, exploratory concepts, candidates, deferred work, and rejected directions
- Active or recently completed work that changes prerequisites or creates collision risk
- The nearest unresolved questions or blockers on the current critical path
- Decisions that remain with the user, a founder, customers, domain experts, or another authority

Do not assume the most complete or heavily documented area is the current priority. Repository size, missing tests, TODOs, and available validation commands are discovery signals, not evidence that work should happen now.

If the project contains materially different domains and the user's lens cannot be inferred from the request, current conversation, source-of-truth documents, or active work, ask one concise framing question before expensive discovery. If proceeding with an assumption is reasonable, state it visibly and return fewer tasks rather than spanning unrelated domains.

## Candidate Generation

Generate more candidates than requested within the chosen portfolio lens, using only domains supported by evidence. Candidate families can include:

- Evidence gathering, experiments, research, or prototypes that resolve the next important uncertainty
- Product, design, content, business, or technical work already supported by the project's current phase and explicit decisions
- Implementation, migration, or architecture work whose prerequisites and ownership are already settled
- Reliability, performance, accessibility, automation, documentation, testing, or CI work when explicitly requested or when it removes a demonstrated critical-path blocker

Do not propose generic tasks such as "improve tests" or "refactor the codebase." Tie each candidate to named paths, observed behavior, an existing gap, or a reproducible signal. Also explain how its output will be used now. A durable artifact with no present consumer is not automatically valuable.

## Priority and Readiness Gate

A ready-now task must satisfy all of the following:

- It directly advances the user's requested lens, resolves the nearest blocking uncertainty, or removes a demonstrated blocker on that path.
- Its prerequisites are already satisfied or are entirely inside the task without requiring a prior product, policy, architecture, customer, scientific, legal, or commercial decision.
- Its output remains useful even if unresolved downstream choices change.
- It respects recorded lifecycle states and does not silently promote a draft, hypothesis, exploratory concept, or candidate into committed execution.
- It does not replace customer evidence, expert review, founder judgment, or product authority with agent confidence.
- It is preferable now to preserving the option and revisiting it after more evidence.

Reject or defer candidates that exhibit any of these patterns unless the user explicitly requests them:

- Building architecture, product flows, production code, schemas, or operating plans around exploratory requirements
- Choosing an entire technology ecosystem when only one or two near-term choices are forced
- Turning a research concept into a conformance suite, framework adoption, or implementation before usefulness and ownership are established
- Producing maintenance, validation, catalog, documentation, or CI work because the repository can verify it rather than because it blocks current progress
- Making a strategic or commercial decision from desk research when upstream customer, market, expert, or founder input is still outstanding
- Preparing follow-on work whose required upstream task is active, incomplete, or not yet accepted
- Creating a future-proof system for hypothetical scale, integrations, compliance, or operations not required by the current phase

Keep worthwhile but not-ready candidates in a short deferred list. Name the unmet prerequisite and the observable trigger for reconsideration. Do not score them as ready, place them in an execution wave, or provide a runnable prompt.

## Autonomy Gate

A task is autonomous only when all of the following are true:

- One objective and one verifiable stopping condition can be stated before work begins.
- The project contains enough evidence to choose a defensible approach without inventing product intent.
- The agent can validate progress through tests, builds, screenshots, benchmarks, audits, diffs, or another observable artifact.
- Necessary tools, runtimes, and credentials are already available, or the task explicitly avoids the missing dependency.
- The work can remain reviewable and reversible until the user chooses to merge, publish, deploy, delete, message, or otherwise affect an external system.

Reject or narrow candidates that require stakeholder taste, unresolved policy, production credentials, purchases, irreversible data changes, or external approval. A research task may prepare options, evidence, and a recommendation when it can resolve uncertainty without crossing those boundaries, but it must preserve who owns the final decision and must not encode an unaccepted choice into architecture or implementation.

## Long-Horizon Sufficiency Gate

A task is long-horizon only when the ready-now objective naturally contains enough useful work to plausibly reach the user's requested lower bound on the recommended model and execution mode. Apply the priority and readiness gate first. A broad-looking objective, large repository, high reasoning setting, expensive model, or long checklist is not sizing evidence.

Substantiate the workload with project-specific evidence such as:

- The number and diversity of concrete artifacts, packages, components, workflows, environments, or datasets that must be inspected or changed
- Intrinsically necessary phases that each leave a reviewable artifact or independently validated checkpoint
- Known setup, execution, benchmark, render, browser, migration, or test-matrix costs that cannot be safely parallelized away
- Edge cases, negative cases, compatibility surfaces, or adversarial scenarios already implied by the project
- Comparable completed agent tasks when the user supplies or references their host, elapsed time, configuration, scope, and outcome

Reject naturally short work. Never enlarge a task with exhaustive inventories, unrelated cleanup, arbitrary file or test quotas, speculative edge cases, repeated validation that adds no evidence, deliberate waiting, or instructions to keep working merely to consume time. If the repository does not support enough naturally sized candidates, return fewer tasks and explain the sizing gap.

## Runtime Calibration

For every surviving candidate, report:

- A wall-clock range whose lower bound is plausible for the complete workload on the recommended configuration
- Confidence: **low**, **medium**, or **high**
- A short calibration basis naming the dominant work units and any comparable completed runs
- The natural substantive workload and required work items that must all be completed

Use low confidence when no comparable agent history exists, the work depends on unknown baseline failures, or external tool latency dominates. Avoid narrow hour ranges when confidence is low. Give directly comparable completed agent runs more weight than human engineering estimates, issue labels, repository size, or intuition. Treat actual elapsed time and token usage as calibration evidence only when the completed scope, host, and model configuration are also known. If a comparable prior task finished far below the proposed lower bound, do not reuse that range unless the new required workload contains clearly additional sequential work commensurate with the gap.

Reasoning effort and runtime are separate. Higher effort can improve difficult decisions, while parallel delegation can reduce wall-clock time. Do not increase either setting to make a task appear longer. Size the work itself for the requested horizon, and state that elapsed time remains an estimate rather than a guarantee.

Do not deepen a candidate merely to satisfy duration. Combine candidates only when their parts already form one necessary program with the same current objective, consumer, maturity level, and validation surface, and the combined task would still be preferable if no horizon had been requested. Required work items are optional structure, not a quota; include only work intrinsically necessary for success.

## Scoring

Score each candidate from 1–5 on:

- **Value:** expected improvement to the project or workflow
- **Critical-path relevance:** directness of its contribution to the current portfolio lens
- **Readiness:** strength of prerequisite, maturity, timing, and ownership evidence
- **Evidence:** strength and specificity of the observed need
- **Autonomy:** ability to proceed without user intervention
- **Verifiability:** quality of the validation loop and stopping condition
- **Natural long-horizon sufficiency:** strength of the evidence that the uninflated objective plausibly reaches the requested lower bound
- **Parallel safety:** ability to run alongside the other selected tasks

Also score these penalties from 0–5:

- **Risk:** potential harm or costly rework despite safeguards
- **Unresolved dependencies:** prerequisites not fully controlled by the task
- **Prematurity:** distance between current maturity and the state the task assumes
- **Assumption load:** important choices the task would have to invent
- **Support detour:** effort spent improving machinery rather than advancing the requested outcome

Compare candidates with:

```text
value + critical-path relevance + readiness + evidence + autonomy
+ verifiability + natural long-horizon sufficiency + parallel safety
- risk - unresolved dependencies - prematurity - assumption load - support detour
```

Use the calculation to discipline comparisons, not to imply false precision. Exclude every candidate with critical-path relevance, readiness, autonomy, verifiability, or natural long-horizon sufficiency below 4. A high total cannot override a failed gate. Prefer a focused portfolio over artificial diversity when current priorities are narrow.

At the default balanced risk tolerance, consider ambitious or cross-cutting work only after it clears readiness and critical-path gates. Reversibility and verification mitigate execution risk; they do not cure prematurity. During exploration or validation phases, prefer information gain, option preservation, and bounded experiments over architecture, exhaustive stack selection, or production machinery. Reserve conservative selection for users who request low-risk work or for repositories where rollback and verification are weak.

## Configuration Selection

Identify the execution target from the user's request or current host. Use its live capability catalog, session metadata, or documented controls to establish available settings. Do not assume the planning host and execution target have the same capabilities. When exact availability cannot be inspected, state the uncertainty and give a conditional recommendation rather than a fabricated model ID or control.

- **Most capable available model:** ambiguous implementation, difficult debugging, architecture, or high-value synthesis
- **Balanced available model:** read-heavy exploration, audits, test analysis, and moderate implementation
- **Efficient available model:** narrow, mechanical, repeatable transformations

Keep the host's default effort unless the task justifies a supported alternative. Higher effort must offer an expected quality gain for difficult decisions. Recommend delegation only for useful independent lanes, using controls exposed by the target host. Recalculate the wall-clock range when parallel lanes may shorten elapsed time.

### Host-specific controls

- **Codex:** use the current client or harness catalog for selectable models, reasoning levels, permission settings, and delegation. Use native `/goal` for persistent execution. Recommend Ultra only if that client exposes it and independent lanes justify it; do not assume every Codex host has that control.
- **Claude Code:** use the session's available models or `/model` catalog and its supported effort and permission controls. Model aliases resolve by provider and can change; do not hard-code a model version from memory. Use native `/goal <condition>` for persistent execution. Do not recommend Codex model slugs, Ultra, or Codex permission labels. Recommend Claude subagents or teams only when available and justified by independent work.
- **Other hosts:** verify the supported controls and persistent-execution mechanism. If unavailable or unknown, provide a plain task prompt and disclose the persistence limitation.

Claude Code's goal evaluator judges evidence surfaced in the conversation; it does not independently inspect files or run checks. Require completion evidence in the final handoff. A goal condition is limited to 4,000 characters, and `/goal` does not alter permission settings. Workspace trust and hook settings can restrict availability; honor an explicit restriction without modifying those settings. Consult the task-packet reference for the compact prompt format.

Upstream behavioral references (checked 2026-10-04 against Claude Code 2.1.289): [Claude Code goals](https://code.claude.com/docs/en/goal), [model and effort configuration](https://code.claude.com/docs/en/model-config), and [permission modes](https://code.claude.com/docs/en/permission-modes). Recheck these sources if the target version or exposed controls differ.

## Parallel Portfolio

Record each candidate's likely write surface and shared resources before selecting the final set.

- Concurrent write tasks in one Git repository require separate worktrees.
- Root manifests, lockfiles, generated schemas, shared snapshots, design tokens, and repository-wide formatting are collision surfaces even when feature directories differ.
- Connected documents, production systems, publishing accounts, and external records must have at most one writer unless the task explicitly provides safe partitioning.
- Read-heavy exploration, audits, benchmarks, and summarization are preferred parallel companions.

Create a first wave containing up to the requested maximum concurrency using only ready-now tasks. Never promote deferred or lower-value work merely to fill a concurrency slot. State the maximum useful safe width and the concrete readiness, collision, or dependency constraints that prevent a wider wave.
