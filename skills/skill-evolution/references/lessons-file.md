# The lessons file

`${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/skill-evolution/lessons.md`, newest first. It holds every incident and proposal, so repeats count as evidence and declined proposals don't come back without new evidence. The owner may edit it; their words win.

```markdown
# Skill lessons

Kept by the skill-evolution skill. Newest first. Status: proposed, applied, declined or seen.

## L<n>. <skill>: <short title>
- Status: proposed <date> | applied <skill> <version> <date> | declined <date>: <reason> | seen
- Incidents: <date> <run or session>: <what happened and what it cost>; <date> …: <a repeat>
- Change: <the rule as it would read>; where: <file and section>
- Bump: <major|minor|patch>
- Recommended: <apply|skip>, because <one sentence>
```

- **Numbering:** `L<n>` counts up across the whole file and never reuses a number, so the owner can answer "apply L7" days later.
- **A `seen` entry** needs only Status and Incidents. When another incident of the same kind comes, add it to the same entry's Incidents and judge again.
- **Keep entries short:** a line per incident. The run's ledger and report hold the detail.
