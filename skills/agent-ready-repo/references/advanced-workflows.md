# Readiness for loops and concurrent agents

Read only for repositories already using automated iteration or multiple workers, or when the user asks to assess their readiness. This reference supports an audit or design; it does not launch agents, create goals, schedule jobs, merge changes, or authorize external actions.

## Establish the need

Identify the limitation of the current workflow. A reliable linear sequence may need only a script. A bounded task with repeated feedback needs an explicit finish condition. Multiple workers become useful when responsibilities, branching, or isolation bring a concrete benefit greater than coordination and review cost. Do not choose a framework based on terminology or an arbitrary maturity score.

Inspect actual host capabilities before proposing host commands. A worktree isolates source checkouts, not shared databases, ports, credentials, caches, or remote side effects.

## Review the execution contract

For each loop or worker, identify its objective, input artifact, writable scope, output artifact, verification, resource ownership, stopping condition, and recovery point. Differentiate finite completion from recurring monitoring. Keep goal and acceptance ownership outside any worker allowed to modify the candidate solution.

A verification step receives the task contract, candidate snapshot, and relevant evidence; it should establish behavior itself rather than accepting an implementer's success summary. Independent review is conditional, and deterministic checks are preferable when they can judge the requirement reliably.

Define bounded retry behavior from the workflow's risk and available budget. Repeated identical failure with no new evidence should produce a blocker and a resumable record, not unlimited retries or success by timeout. Budget exhaustion and missing prerequisites are not completion.

## Inspect handoffs and routing

An illustrative route is:

| Result | Next action |
|---|---|
| Required checks pass for the candidate snapshot | Return it for the repository's existing integration/review policy |
| Candidate behavior fails a check | Return the specific evidence to implementation |
| Requirement is ambiguous or mutually inconsistent | Return to the requirement owner |
| Environment/tool unavailable | Record a blocked prerequisite |
| Retry or resource limit reached | Stop with checkpoint and remaining work |

For a real graph, map each node's responsibilities, allowed state writes, outgoing conditions, and failure paths to the running implementation. A diagram is not an enforced protocol. Nodes may be deterministic commands, agents, or human decisions; a graph shape alone does not make a workflow agentic or reliable.

## Checkpoint and concurrency requirements

- Give each active task a stable identity and a known candidate revision. Detect stale results before integrating them.
- Prefer isolated checkouts for concurrent writes and explicit ownership for shared files or services. Decide who reconciles root manifests, lockfiles, schema changes, and conflicting patches.
- Define how shared state updates are serialized or merged. Multiple writers to a single Markdown file are not a concurrency protocol.
- Checkpoint sufficient state to resume. A persisted checkpoint does not make external side effects exactly-once: retries need idempotency or reconciliation where the workflow can repeat an action.
- Verify the combined result after integration; independent passing branches do not prove their combination works.

Audit the actual failure routes before recommending additional workers. Include representative interruption/resume and conflicting-result scenarios in a proposed validation plan.

## Outcome and review capacity

Keep the evaluation tied to the user's outcome and immutable acceptance criteria. A rising throughput number can conceal omitted tests or unresolved work. Compare representative correctness, rework, time, cost, and reviewer burden where measured; leave absent measurements unknown. Propose simplifying a component only after checking its purpose and results. Readiness findings may recommend future orchestration work, but ordinary repository maintenance remains on demand.
