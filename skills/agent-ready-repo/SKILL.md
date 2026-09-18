---
name: agent-ready-repo
description: Assess and improve repository readiness for AI coding agents when initializing a project, onboarding agents to an existing codebase, or maintaining its working environment. Audit setup, instructions, verification, architecture, and session continuity; propose evidence-backed changes and implement them only when explicitly requested. Use for repository-wide agent readiness or recurring workflow failures, not ordinary feature implementation or isolated prompt tuning.
---

# Agent-Ready Repo

Make it easy for an agent to discover relevant constraints, start work, verify outcomes, and resume unfinished work. Optimize for the project's actual tasks and maturity, not the number of harness files it contains.

## Choose the action and lifecycle

**Audit is the default**, including broad requests to make a repository agent-ready. Inspect and propose without changing project files. Return the assessment in the conversation; write a report only when the user requests one.

**Apply requires an explicit request to implement, create, fix, or apply changes.** Honor the scope and authorization already given in the conversation. An instruction such as "implement the recommendations" authorizes that work; do not ask for the same approval again. A request to save an audit authorizes only the report, not its proposed improvements.

Infer the lifecycle from the request and repository evidence:

| Lifecycle | Focus |
|---|---|
| New project | Establish a minimal usable foundation while preserving unresolved product and stack choices. |
| Existing project | Remove demonstrated obstacles incrementally, reusing existing conventions and tools. |
| Maintenance | Compare available prior evidence, repair drift, address recurring failures, and simplify unnecessary scaffolding. |

Read [lifecycle procedures](references/lifecycle.md) for the selected path. Maintenance is an on-demand pass, not permission to schedule jobs, create autonomous loops, or open external records.

## Workflow

1. **Establish scope and baseline.** Read applicable repository instructions and relevant docs. Inspect worktree status, including staged and untracked work; manifests; entrypoints; development commands; CI; tests; and existing plans. Identify project phase, known decisions, and the agent workflow being improved. Ask only for consequential information that inspection cannot resolve. Preserve unrelated work.
2. **Assess with evidence.** Read [assessment and reporting](references/assessment.md). Inspect enough to identify real obstacles across its six areas; do not scan every file or run every test automatically. Separate observed facts, documented claims, and unverified hypotheses. A missing artifact alone is not a finding.
3. **Choose the smallest useful interventions.** Consult only the relevant sections of [improvement patterns](references/patterns.md). Prefer an existing command, document, tracker, or check over a parallel mechanism. Rank changes by demonstrated consequence, effort, and readiness; retain worthwhile but blocked work as deferred. "No change needed" is a valid result.
4. **Audit: report and stop.** Give concise findings and ordered, implementation-ready actions with acceptance checks. Do not write a plan, scaffold, report, branch, or commit into the project unless specifically requested.
5. **Apply: implement and verify the requested scope.** Recheck assumptions and worktree state if an earlier audit is no longer current. Make coherent, minimal changes. Run appropriate checks, inspect the diff, and report actual results, remaining blockers, and how the next session can proceed. Follow the target repository's Git conventions; readiness work alone does not authorize pushing, publishing, or changing remote settings.

## Evidence and execution boundaries

- Before running a repository command, inspect its implementation and prerequisites. A name such as `check`, `test`, or `init` does not make it non-mutating or safe. In audit mode, use installed tooling and bounded checks that leave project files and external state unchanged; isolate caches/output outside the project when possible, otherwise skip the command and explain what remains unverified. Do not install dependencies, run migrations, regenerate files, or start persistent services during an audit.
- Do not treat an unavailable dependency, service, credential, or tool as a test failure. Distinguish a blocked check from an executed check that failed, and existing failures from regressions introduced by applied changes.
- Preserve user changes and sensitive local configuration. "Clean handoff" means understandable and resumable, not permission to reset the worktree, remove unrelated files, or manufacture a clean Git status.
- Use repository-specific instructions for non-obvious constraints and reliable commands. Avoid repeating facts already obvious from code, duplicating host instructions, or imposing a fixed instruction length.
- Keep project knowledge in existing authoritative project records. Store private run output and temporary artifacts outside versioned content. Recommend a new progress file or feature ledger only when current mechanisms cannot support the needed handoff.
- Scale verification to the change and the product's failure modes. A browser suite, observability stack, architecture linter, feature ledger, container, and multi-agent system are options, not baseline requirements. Do not weaken existing checks or completion criteria to claim improvement.
- Evaluate substantial harness changes through representative task outcomes when practical. Keep correctness, time, and token cost separate; file presence is not a reliability score. Do not claim measured gains without measurements.

## References for maintaining this skill

- Read [source rationale](references/sources.md) when checking provenance, updating recommendations, or explaining evidence and limitations. It is not required for every repository audit.
- Read [behavioral evaluation scenarios](references/evaluation.md) when changing this skill or testing its behavior. These scenarios validate the skill, not the readiness of every target project.
