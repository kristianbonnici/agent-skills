# long-horizon-orchestrator

Runs a set of long agent tasks while the user is away: one approval at the start, each task as its own
agent, reviewed and merged by itself, and a plain-language report at the end. Version and history:
[CHANGELOG.md](CHANGELOG.md).

## A run

```mermaid
flowchart TD
  plan([Task list, or plan one]) --> contract["Contract: tasks, waves, models,<br/>review levels, usage, permissions"]
  contract -->|one approval| prep["Prepare: ledger, warm-up,<br/>leases, usage sampler, common file"]
  prep --> launch["Launch a wave: one agent per task,<br/>own worktree, own brief"]
  launch --> work["Task works; may hand research<br/>and simple steps to fast helpers"]
  work --> gate["review-gate: level by what the diff touches,<br/>reviewers of another family"]
  gate -->|review stopped converging| ready([Report ready: orchestrator decides])
  gate --> checks["Rebase, full checks"]
  checks -->|pass| merge["Fast-forward the integration branch"]
  checks -->|narrow miss| ready
  merge --> report["Report back to the orchestrator"]
  report --> wake{"Orchestrator wakes:<br/>report, heartbeat or resume wake"}
  wake -->|dependents now unblocked| launch
  wake -->|"limit: paid window"| pause["Pause; resume on the same<br/>thread after the reset"]
  pause --> work
  wake -->|"limit: free model"| move["Move on: OpenCode ⇄ Gemini,<br/>then Terra or Sonnet"]
  move --> work
  wake -->|all tasks done or parked| finish["Finish: final checks, restore the<br/>user's state, run map and report"]
```

## Where the rules are

- `SKILL.md`: the workflow, the contract and what every wake checks.
- `references/routing.md`: which model does what, capacity, limits and the review gate's place.
- `references/task-brief.md`: the brief and the common file every task reads.
- `references/final-report.md`: the report and its charts.
- `references/host-*.md`: launching and waking on T3, Claude Code and Codex.
- `../review-gate`: the review each task passes before it merges.
