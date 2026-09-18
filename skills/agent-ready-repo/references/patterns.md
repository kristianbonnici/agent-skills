# Improvement patterns

Use only the patterns justified by the assessment. These are decision aids, not a scaffold checklist.

For concrete layouts and artifact placement, use [repository structure](repository-structure.md). For executable acceptance and state/evidence rules, use [working contracts](working-contracts.md). This reference covers how to choose and improve the mechanisms inside that structure.

## Context that earns its place

Use an entry instruction file for non-obvious commands, constraints, and pointers to authoritative knowledge. Keep stable architectural rationale in the project's established design documentation. Prefer links to restating changing facts such as dependency versions, package inventories, or task status.

Use scoped instructions when packages genuinely require different guidance and the target agent supports that scope. Preserve intentional differences. For another host, prefer a thin pointer or its documented import mechanism over copied instructions; verify host behavior before promising compatibility. AGENTS.md is a portable convention, not a guarantee of identical discovery semantics.

Remove demonstrably stale or duplicate guidance within the authorized scope. Do not delete a useful instruction merely to meet a line budget or reproduce an article's directory tree. Distinguish accepted project decisions from proposals and experiments.

## Reproducible setup and usable commands

Prefer the repository's package scripts or task runner. Add wrappers only when they eliminate real repeated setup work. A wrapper should expose prerequisites, use meaningful exit statuses, fail clearly, and be safe to rerun within its documented effects.

Separate dependency installation, local service startup, checks, and destructive resets so the agent can choose the intended operation. Document working directory, runtime requirements, required configuration names, and expected outputs. Use example values, not secrets. Pin tools according to the ecosystem's conventions; do not upgrade dependencies incidentally.

Introduce isolated ports, temporary data directories, or per-worktree service configuration when concurrent tasks demonstrably collide. Worktrees separate source changes but do not automatically isolate ports, databases, caches, or external resources. A container or new orchestration layer needs more justification than "agents might use it."

## Verification with useful feedback

Connect each proposed change to a behavior an agent can observe. Use the narrowest reliable checks that establish the requirement, plus checks required by project policy. Align local and CI commands where they have the same purpose.

Choose the relevant layer: static checks for structural rules, unit tests for isolated logic, integration tests for boundaries, and end-to-end checks for critical user workflows. Libraries and CLI tools need relevant public-interface checks, not a browser suite. A documentation-only repository may need link or example validation.

Check that verification actually exercises something: test discovery, exit-code propagation, failure handling, and relevant assertions matter more than a green command label. Never swallow a failure or weaken assertions to manufacture success. Keep flakes and unavailable dependencies visible.

Verify a newly introduced gate with both a deliberately bad input and a valid input outside the live project. Prefer semantic lint/test facilities over brittle text searches that miss alternate syntax. Choose expected outcomes before evaluating the implementation, and bind the result to the candidate snapshot.

Provide failure output that identifies the affected invariant and points to a valid repair example when useful. Add architecture checks for stable, repeatedly violated boundaries; do not freeze incidental implementation choices into policy.

## Runtime visibility

Start with the evidence the agent needs to diagnose the project's actual failures: reproducible commands, useful error output, local logs, health checks, or inspection of resulting data. Prefer existing interfaces.

Recommend structured logs, metrics, traces, or browser inspection only when they resolve an observed visibility gap. Define the behavior to inspect and its acceptance condition before adding tools. Keep credentials and private runtime artifacts out of repository documentation; identify where authorized users can access them without copying their contents.

Separate runtime evidence (what executed, failed, or changed) from process records (scope, decisions, acceptance, result). A useful diagnostic record correlates a task/check with its checkout and workload. Record concise rationale and artifacts, not hidden reasoning or full conversation transcripts. Check startup, readiness, relevant side effects, and shutdown when those phases matter to the defect.

## Task state and work boundaries

Use the current plan or tracker to express the requested outcome and verification. Add durable task state only if another session needs it and existing mechanisms cannot supply it. A machine-readable feature list is useful when actual automation consumes its states; its mere existence does not enforce completion.

Prefer one coherent change at a time when work is coupled. Recommend explicit ownership and resource isolation when concurrency is already part of the workflow. Do not launch agents, loops, or background work as a side effect of a readiness assessment.

## Measure usefulness and simplify

For a substantial change, choose representative tasks tied to the identified problem: first setup, a typical modification, diagnosis of a failure, or resuming partial work. Define success before changing the harness.

Compare baseline and candidate under comparable repository revision, model/tool configuration, permissions, and starting state. Keep fixtures and evaluation artifacts disposable. Check the actual outcome with tests or independent review appropriate to the task, not the implementer's confidence.

Record correctness separately from elapsed time and token/cost data when available. Missing telemetry stays missing. Include failures and retries, and disclose small samples and infrastructure differences. A quicker run that omits verification is not an improvement.

For a costly or disputed component, change one thing at a time in an isolated comparison. Retain, simplify, or retire it based on evidence and its actual purpose. Do not remove mandatory checks or justify new machinery using unmeasured productivity claims.
