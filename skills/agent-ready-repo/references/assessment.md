# Assessment and reporting

## Ground the assessment

Start with the user's intended agent workflow and the project's maturity. Use repository instructions, manifests, CI, code, and available task history to establish what already works. Follow relevant documentation links rather than reading the entire knowledge base. Inspect recent history or failures when they can explain a suspected obstacle.

For a new repository, distinguish decisions still needed from missing implementation. For an existing repository, an unfamiliar convention is not a defect. For maintenance, use earlier reports or task records only if they are available; do not invent a historical baseline.

Record command provenance and execution context: what the command invokes, working directory, prerequisites, and the result if run. Inspect wrappers and lifecycle hooks too. Prefer focused, non-interactive checks with a bounded runtime. Stop a hung check and report the limit rather than retrying indefinitely.

## Trace the fresh-session questions

Use the repository and approved accessible records to answer these questions without relying on prior conversation. Cite the route to each answer, not just a filename that appears relevant.

| Question | Evidence to locate |
|---|---|
| What is this system for? | Purpose, intended users or consumers, current product constraints |
| Where would the requested change belong? | Relevant domain/package, entrypoints, boundaries and applicable instructions |
| How can work start? | Supported setup/start operations, working directories and prerequisites |
| How is the result judged? | Actual verification commands, assertions and acceptance criteria |
| What is the current state and next step? | Current task/plan, relevant Git changes, valid evidence and blockers; or an explicit absence of active work |

A missing answer is a discovery gap; choose its durable home using [repository structure](repository-structure.md). An answer that exists but cannot be accessed by the intended agent is an access gap. Do not copy private external records into Git to solve it. An author walkthrough can establish links and facts; label an independent fresh-session trial only when it was actually performed.

## Diagnose before prescribing

Trace one representative failure through task specification, available context, tool operations, runtime environment, verification feedback, and durable state. Identify the earliest supported cause, distinguish downstream symptoms, and propose a check when causation remains uncertain. For example, repeated wrong-package commands may need better routing, while an integration check that cannot distinguish bad output needs a stronger assertion. Adding more prose does not solve both problems.

## Six assessment areas

| Area | Evidence to inspect | Useful readiness question |
|---|---|---|
| Context and instructions | Applicable instruction files, authoritative docs, domain constraints, linked decisions, scoped overrides | Can an agent find the unusual rules and relevant knowledge without loading unrelated material? |
| Environment | Manifests, lockfiles, runtime requirements, setup/start commands, example configuration, fixtures | Can the supported workflow be reproduced without rediscovering hidden prerequisites? |
| Verification | Test/check implementations, CI, acceptance criteria, recent failures, integration boundaries | Can an agent tell whether the requested behavior works, and diagnose a failure? |
| Architecture and tools | Package boundaries, dependency direction, reusable patterns, command interfaces, generated-code ownership | Can an agent locate the right change surface and use existing tools correctly? |
| Continuity | Existing plans or task records, Git history, decisions, blockers, verification evidence | Can another session identify the remaining work and resume without guessing? |
| Maintenance | Stale links and commands, duplicate rules, recurring failure classes, flakes, abandoned scaffolding | Does the environment still match the code and earn its maintenance cost? |

Inspect all six at a level appropriate to the task; elaborate only where evidence warrants it. Use non-code verification for documentation or asset repositories. For monorepos, sample the relevant packages and disclose coverage instead of claiming repository-wide verification from one package.

## Evidence language

- **Observed:** A concrete repository fact or command result. Cite the file and relevant lines, or the command, working directory, exit status, and concise result.
- **Documented, unverified:** The repository describes the behavior, but it was not executed or confirmed. State what would establish it.
- **Blocked or unknown:** A prerequisite or missing information prevents assessment. Identify it without treating it as a failed test.
- **Hypothesis:** A plausible cause of an observed problem. Specify the check or experiment that would confirm or reject it.

Do not infer flakiness from a single failure, causation from the lowest assessment rating, or quality from a count of tests or files. A passing wrapper that executes no checks is evidence about the wrapper, not product correctness.

## Rank by consequence and readiness

Prioritize demonstrated blockers to setup, correct changes, verification, and recovery. Then consider repeated avoidable effort and maintainability. Explain the effect in project terms, such as a documented test command that skips the only integration suite.

Use relative effort when justified: a focused edit, a coordinated change, or a larger migration. Avoid unsupported hour estimates. Defer changes requiring unresolved architecture, product decisions, credentials, or authorization. Optional complexity needs a demonstrated use case; there is no quota of findings or required set of artifacts.

## Audit output contract

Lead with the most consequential conclusion and the assessed scope. Scale the report to the evidence; a healthy small repository can receive a short response.

1. **Current readiness:** What works, what materially obstructs the intended workflow, and what was not verified.
2. **Findings:** For each actionable issue, include evidence, consequence, smallest useful change, prerequisites, and acceptance checks. Cite exact project paths and commands; keep conjecture visibly separate.
3. **Ordered action plan:** Group related changes, specify their target surfaces and resulting behavior, and name verification steps. For structural work, name the selected repository pattern, map existing artifacts to responsibilities, and show the proposed changes to layout/routing. For operational work, specify the relevant [working contract](working-contracts.md). Explain dependency order. An action must be implementable without rediscovering its purpose or guessing its success criteria. Brief findings and actions can share a table to avoid repetition.
4. **Deferred work and limits:** Include only meaningful blocked or premature work, the condition for reconsideration, and relevant inspection gaps.

Do not output a synthetic overall percentage or attach numeric grades based on file presence. Do not claim the repository is globally optimal. Provide commands as proposed checks when they have not been run.

For apply mode, replace the proposal with a concise account of implemented behavior, completed verification, unresolved limitations, and next steps. If the user requested a saved report, reuse their chosen location or the repository's existing reporting convention; keep private logs and screenshots out of versioned reports.
