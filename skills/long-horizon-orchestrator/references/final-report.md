# Final report

The reader is returning after hours away, and probably after several tasks' worth of activity. They want to know whether it worked, what is new, and what they need to decide. Write for that person, not for a reviewer.

## Rules

- Use plain language. Describe each new thing by what the user can now do, and where to find it. Leave out file names, function names, test counts, commit IDs and review mechanics unless the user needs them to act.
- Gather open decisions from every task's handoff and from your decisions log. Remove duplicates, and phrase each one as a question with one sentence of context.
- Keep recommendations separate from decisions. Never present something a task chose on its own as settled.
- Be honest about anything that didn't finish, was blocked or wasn't verified, such as untested operating systems or a skipped check. One line each is enough.
- Offer the technical detail rather than including it. Each task's full handoff is in its thread, and the ledger holds the rest.

## Template

```markdown
<One or two sentences: is everything merged into <integration branch>, was anything pushed, and the one thing to do to see it (for example "restart the API server").>

## What was built

**1. <Plain name> (Task A)**
<Two or three sentences in everyday language: what you can now do, and where to find it.>

**2. ...**

## How it ran

<A Mermaid diagram of the run as it actually happened; see "Run diagram" below.>

## Not finished
<Only if some tasks are blocked, parked or failed.>
- **<Task>:** what's missing, why, and what it needs from you.

## Open decisions

1. **<Short label>.** <One sentence of context.> <The question?>
2. ...

## Suggested next steps
- <Follow-ups the tasks recommended, or that you noticed. One line each.>

<One closing line: checks passed on <OS>, <other OSes> untested; branches and worktrees cleaned up (or what was kept, and how to restore); ledger at <path>; detailed technical notes available on request.>

<One usage line, for example: "Usage: Claude Max 20x went from 9% to 31% of the week; Codex Plus from 16% to 22%." Add any task that moved provider or waited for a reset.>
```

## Run diagram

The diagram shows the run that actually happened, not the plan, including who did what. Build it from the ledger: take each agent's harness, model and reasoning level from your own launch record, never from an agent's description of itself. Take helper hand-offs from the tasks' `helpers` report lines.

- **Orchestrator:** one node, with its harness, model and reasoning level. If it moved itself to another provider mid-run, show both, with the time of the switch.
- **Tasks:** one node per agent that worked on a task. Each node has three lines:
  - the task ID and a plain name;
  - the harness, model and reasoning level, such as `Claude Code · Opus 5.5 (High)`. Always include the reasoning level, for every provider, because the same model at a different level is a different worker;
  - the outcome and duration.
- **Helper hand-offs:** a rounded node for each helper harness, model and reasoning level a task used, linked by a dotted arrow. The arrow says what was handed over and how many times.
- **Provider hand-offs:** when a task moved to another harness (because of quota, or a relaunch after a crash), draw a node for each agent, joined by a thick arrow labeled with the reason.
- **Dependencies:** a "needed by" arrow from each prerequisite to the task that waited for it. Arrows from the orchestrator go only to tasks in the first wave.
- **Integration branch:** a final node, with an arrow from every merged task.
- **Small events:** note a nudge or a rebase follow-up in the node itself.

Keep the labels in the same plain language as the report.

```mermaid
flowchart LR
  O(["Orchestrator<br/>Claude Code · Opus 5.5 (Extra High)"]) --> A & B1 & D
  A["A · Settings screen<br/>Claude Code · Opus 5.5 (High)<br/>merged · 35 min"]
  A -.->|"computer-use check ×1"| HA(["Codex · GPT-6.1 Sol (Medium)"])
  A -.->|"rename in 12 files ×2"| HB(["Antigravity · Gemini 3.8 Flash (High)"])
  B1["B · Word counts<br/>Claude Code · Sonnet 5.5 (Medium)<br/>stopped: Claude quota"] ==>|"handed off: quota"| B2["B · Word counts, continued<br/>Codex · GPT-6.1 Sol (High)<br/>merged · 20 min"]
  A -->|"needed by"| C["C · Command line<br/>Claude Code · Sonnet 5.5 (Medium)<br/>merged · 5 min"]
  D["D · Spell check<br/>Claude Code · Opus 5.5 (High)<br/>blocked: needs API key"] -.->|"needed by"| E["E · Docs for D<br/>parked, never started"]
  A --> M[(main)]
  B2 --> M
  C --> M
  classDef merged fill:#d3f9d8,stroke:#2b8a3e,color:#000
  classDef blocked fill:#ffe3e3,stroke:#c92a2a,color:#000
  classDef parked fill:#f1f3f5,stroke:#868e96,stroke-dasharray:4 3,color:#000
  classDef failed fill:#fff3bf,stroke:#e67700,color:#000
  classDef handedoff fill:#e7f5ff,stroke:#1971c2,color:#000
  classDef helper fill:#f3f0ff,stroke:#7048e8,color:#000
  class A,B2,C merged
  class D blocked
  class E parked
  class B1 handedoff
  class HA,HB helper
```

| Outcome | Style |
|---|---|
| Merged | green |
| Blocked | red |
| Parked | dashed grey |
| Failed | amber |
| Handed off to another harness | blue |
| Helper | purple |

Use the same class definitions in every run, so diagrams look alike from one run to the next. If the user's chat view doesn't render Mermaid, the block still reads as a list of nodes and edges, so include it either way.

## Example of the right level

> **4. Approvals (Task C)**
> You can mark tools as "ask first". When the model calls one, the run pauses and shows a card where you Approve or Deny. Experiments never approve on their own; they deny unless the experiment file lists the tools to approve.

Not:

> **Approvals:** added `ApprovalRequested`/`ApprovalDecided` events, a `POST /api/runs/{id}/approvals/{op}` endpoint, 268 tests passing, and a fix for a focus regression found in review round 2.
