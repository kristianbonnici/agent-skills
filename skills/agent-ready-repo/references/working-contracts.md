# Working contracts

Use these contracts to make the selected repository layout operational. Adapt their content into existing docs, commands, and task records. Examples describe hypothetical projects; replace paths and commands with inspected project facts before proposing or applying them.

## Initialization and session startup are different operations

Initialization establishes the chosen environment and first meaningful verification path. Session startup recovers current context and checks whether that path remains usable; it should not blindly reinstall dependencies or recreate data every time.

Specify these operations using the project's task runner or documented commands:

| Operation | Contract to document |
|---|---|
| Setup | Working directory, supported runtime, locked dependencies, configuration prerequisites, expected mutations, safe rerun behavior |
| Start | Required services/fixtures, readiness signal, chosen port or resource namespace, stop/cleanup procedure |
| Verify | Exact command, tested behavior, expected result, exit behavior, relevant failure output |
| Diagnose | Where to inspect the failure and a reproducible workload or focused check |

Before starting broader implementation, establish four capabilities: the relevant entry workflow runs, a meaningful check can judge it, current state is discoverable, and a bounded next task has acceptance criteria. If one is blocked, say which capability is unverified and why. This is a phase boundary, not a requirement to spend an entire session on setup or create an arbitrary number of tasks.

At later session start, confirm the correct checkout and dirty state, read applicable instructions and the current task record, reconcile relevant changes since the last evidence, and run a suitable baseline check within the authorized mode. A historical failure must be disclosed; fix it first only if it blocks the requested work and is within scope. Preserve unrelated baseline defects as explicit limitations.

## A bounded task contract

For multi-session or cross-component work, record these fields in the existing plan or tracker. For a simple one-session change, the conversation may suffice.

```text
Outcome: CSV export preserves non-ASCII customer names.
Change surface: export formatter, its tests, export behavior documentation.
Exclusions: storage migration and redesign of the export UI.
Dependencies: existing CSV fixture and supported CLI entrypoint.
Acceptance: accented names survive export and parse-back; existing quoting remains valid.
Verification: inspect and use the repository's formatter and public CLI tests.
State: active; no passing evidence recorded yet.
Next step: reproduce the encoding failure with the existing fixture.
```

Derive the scope from authorized requirements, not an expansive product backlog. Prefer completing a coherent unit before activating coupled work. An explicitly blocked item need not prevent another independent, authorized task from progressing; record the switch and ownership rather than hiding unfinished work.

Use machine-readable state only when an actual consumer benefits. Reuse the current schema. Without one, a small table of identifier, outcome, dependencies, state, verification, evidence, and next step is enough. Do not introduce a scheduler merely to consume that table.

## Evidence and state transitions

Before claiming a check establishes completion, record or be able to identify:

- The acceptance criterion and what the check actually covers.
- Command and working directory, relevant environment/fixture, execution time, and result.
- Tested revision plus dirty-diff identity or relevant file hashes when the checkout is modified.
- A concise observation or accessible evidence reference, and paths deliberately not tested.

Keep private logs outside version control and summarize useful findings. A command printing `false` can still exit zero; an HTTP response can succeed while its body or side effects are wrong. Check assertions and exit propagation. When adding a verifier, exercise both a known valid case and a deliberately invalid case in an isolated fixture. Missing tools, skipped tests, or zero collected cases cannot establish a behavioral pass.

Work is pending until started, active while being changed or repaired, blocked when a prerequisite is unavailable, and verified only for the criteria actually satisfied. Use equivalent existing project states. If requirements, relevant code, inputs, or environment change, reassess the evidence and reopen affected work as unverified or active. Preserve the old result as history, not current proof. Do not rerun unrelated checks without reason.

A prose rule cannot prevent an agent from editing a status field. If automated gating is required, identify the actual verifier/CI job, its controlled inputs, and the transition it authorizes. Review changes to acceptance criteria separately from the implementation being graded. Do not change the oracle simply to accept a failing result.

## Completion and runtime validation

Choose verification layers from the actual risk: static checks for structure, direct behavioral checks for logic, and integration or user journeys for changed boundaries. A cross-component export change needs to exercise the exported artifact through the public interface, including representative error handling; isolated formatter tests alone do not establish that workflow.

Trace a representative journey from its entry conditions to its visible result and side effects. Capture the failure, identify the responsible boundary, make the scoped correction, restart affected components when needed, and repeat the same journey. Inspect resulting data or files, not only status text. For UI work, use the available browser/native inspection tool and check interaction, visible output, and relevant runtime errors. Observability should answer a diagnosis question, not just accumulate logs.

Tests establish evidence for exercised behavior, not the absence of all defects. Use independent review when its expected benefit warrants it and it is available and authorized. For subjective quality, agree on concrete criteria and reference examples; calibrate reviewer conclusions against human judgments. Neither a second agent nor a rubric guarantees correctness.

## Handoff and interrupted work

Leave one discoverable record when needed, not three overlapping logs. A compact example:

```text
Objective: preserve names in CSV exports; storage format remains unchanged.
Checkpoint: identify tested revision and any current uncommitted changes.
Decision: retain the existing CSV library; the defect is encoding at the file boundary.
Verified: formatter cases pass on the recorded snapshot.
Unverified: public CLI export on the current patch; no claim of completion.
Blocker: required local fixture is unavailable; record its approved source.
Resume: obtain the fixture, then run the documented CLI round trip.
Resources: identify only processes/temp files owned by this task and their cleanup.
```

At exit, check the affected build/tests and startup path as applicable, update state and decisions, and clean task-owned temporary resources. Archive completed plans with their outcome and unresolved follow-ups when repository policy allows. If interrupted, record the partial diff, failing or skipped checks, and recovery step. Do not mark incomplete work done or discard user changes to manufacture a clean handoff.
