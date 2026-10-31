# An entry

Each incident and proposal is one entry, in a file of its own that `scripts/lessons` keeps. The owner may edit an entry; their words win.

Write a new entry to a file of your own, in this form, and pass it to `lessons add`:

```markdown
## L?. <skill>: <short title>
- Status: proposed | seen
- Incidents: <date> <run or session>: <what happened and what it cost>
- Change: <the rule as it would read>; where: <file and section>
- Bump: <major|minor|patch>
- Recommended: <apply|skip>, because <one sentence>
```

- **The ID:** `add` replaces `L?` with the entry's ID (`L-K7QM`) and adds a `Recorded:` date. The ID never changes, so the owner can answer "apply L-K7QM" days later, from any computer.
- **A `seen` entry** needs only Status and Incidents. When another incident of the same kind comes, `lessons note <ID> "<run or session>: <what happened>"` adds it, and you judge the entry again.
- **The owner's decision** replaces the status, with `lessons set <ID> "<status>"`: `applied <skill> <version> <date>`, or `declined <date>: <reason>`.
- **Keep entries short:** a line per incident. The run's ledger and report hold the detail.
