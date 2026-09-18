# Lifecycle procedures

Read the section matching the repository and request. Lifecycle and action mode are independent: each lifecycle can produce an audit or explicitly requested implementation.

## New project

Establish the intended product or repository purpose, known stack decisions, supported development environment, and the first meaningful task. Inspect existing scaffolding before calling the project empty. Ask about unresolved choices only when they block a useful proposal or authorized implementation; do not silently select a stack or invent product requirements.

Recommend the smallest foundation needed for that first task:

- A discoverable setup and verification path using the selected stack's existing conventions.
- Runtime and dependency constraints appropriate to the ecosystem; retain existing lockfiles and tooling choices.
- A concise entry instruction file only where agent-specific guidance adds value, pointing to established project documentation.
- Configuration examples and representative non-secret test inputs where the project needs them.
- One meaningful smoke check for the initial runnable behavior, or an appropriate document/artifact check for a non-application repository.
- A next task with observable acceptance criteria; reuse an existing plan rather than inventing a full feature backlog.

In audit mode, distinguish proposed foundation work from decisions the user still owns. In apply mode, implement the authorized foundation and verify startup or the equivalent entry workflow plus the relevant check. If dependencies or services prevent verification, identify what remains unproven. Do not substitute a vacuous passing test for usable behavior.

Acceptance: a new session can determine how to start, what to verify, the constraints that matter, and the next meaningful task. Only claim setup was reproduced from scratch when it actually was.

## Existing project

Inspect the current workflow before proposing a replacement. Trace documented commands to their implementations and CI equivalents. Use a representative task, recent failure, or onboarding obstacle to focus the review. If no such example is available, use a lightweight static assessment and label behavioral confidence accordingly.

Map existing artifacts to their purposes. A package script may already supply initialization; an issue tracker may already capture scope and acceptance; a contributing guide may already document tests. Recommend a pointer, correction, or small extension before introducing a second system.

For multi-package projects, distinguish intentional scoped differences from contradictory or ineffective instructions. Check the actual host's loading behavior when a proposed fix depends on it. Do not assume every host automatically reads every nested instruction file or Markdown link.

In apply mode:

1. Preserve the current public commands and supported workflows unless changing them is part of the request.
2. Address the highest-impact ready change in a coherent batch; avoid mixing unrelated refactors into the work.
3. Verify the affected workflow and required checks. Inspect the resulting diff for accidental generated files or unrelated edits.
4. Make the resulting command or guidance discoverable at the existing entry point, and remove or update conflicting guidance within scope.

Acceptance: the identified obstacle is resolved with evidence, existing workflow behavior is preserved where required, and the documentation points to working commands. Report baseline failures separately from new regressions.

## Maintenance

Use this path after workflow changes, project milestones, recurring failures, or model/tool upgrades, or whenever the user requests a health review. These are reevaluation triggers, not a schedule to create.

Compare current files and behavior with available prior evidence. Check relevant links, commands, dependency assumptions, scoped instructions, acceptance checks, and handoff records against the implementation. Confirm recurring failure patterns from multiple observations before treating them as systemic.

For each recurring issue, identify the likely missing capability: an unclear constraint, unavailable tool, broken setup, weak check, poor failure output, or lost state. Prefer a narrow durable fix. Promote a repeated review finding into an executable check only when the invariant is stable and the check has useful signal. Do not encode every one-off preference as a permanent rule.

Look for deletions as well as additions: obsolete rules, duplicate tracking, unused wrappers, or expensive rituals. Inspect callers and purpose before proposing removal. For uncertain scaffolding, recommend a reversible comparison on representative tasks; do not temporarily disable mandatory safeguards in the live repository.

Acceptance: report which issues are new, resolved, unchanged, or unverified when a real prior baseline exists. Otherwise establish today's baseline without inventing a trend. Include a sensible next reevaluation trigger if useful, but do not schedule work or maintain a new report unless requested.

## Session continuity and recovery

Recommend continuity artifacts when work spans sessions or existing state has proved insufficient. Prefer updating an authoritative plan or task record over adding overlapping progress, feature, and handoff files.

A useful handoff identifies the objective, current scope, relevant decisions, work completed, checks and their results, blockers, and the next executable step. For interrupted work, also describe partial changes and how to recover the supported workflow. Reference evidence rather than appending raw terminal histories.

Keep task state honest: done requires the agreed evidence; blocked and unverified remain distinct from done. Requirements may evolve through authorized decisions, with the change recorded; never silently weaken them to obtain a pass.

Recommend commits or other checkpoints according to project conventions and the user's request. Do not equate a resumable state with zero uncommitted changes. Preserve unrelated staged, tracked, untracked, and local configuration files, and clean up only artifacts created by the current work that are safe to remove.
