# skill-evolution

Skills evolve from what actually happened to them, never on their own. This skill turns incidents (what cost the owner
time, work or an interruption because a skill's rules caused it or didn't prevent it) into at most
three proposed changes, each with its evidence and version bump. The owner decides; nothing changes
until they name a proposal. The long-horizon orchestrator runs it at every finish, from the incidents
its ledger records during the run; anyone can also ask for it after a skill misbehaved.

Version and history: [CHANGELOG.md](CHANGELOG.md).

## The flow

```mermaid
flowchart TD
  src(["Incidents: a run's ledger and handoffs,<br/>what the user just saw, or a newer model"]) --> rule["Find the rule in the skill's<br/>current text"]
  rule --> help{Would a change<br/>have prevented it?}
  help -->|no| seen["Record as seen<br/>(a repeat later is evidence)"]
  help -->|yes| past{Already in the lessons?}
  past -->|"declined, nothing new"| seen
  past -->|"new, a repeat, or an applied<br/>change that recurred"| prop["Write the change small:<br/>the rule as it would read, where, bump"]
  prop --> top["Propose at most three, with their IDs;<br/>the rest wait in the lessons"]
  top --> owner{The owner}
  owner -->|"apply L-K7QM"| apply["Change, version, changelog,<br/>checks, review gate, tag;<br/>no push"]
  owner -->|"skip L-M3DX"| declined["Recorded as declined"]
  owner -->|no answer| wait["Stays proposed"]
```

## Where things live

- **The lessons** are private: one file per entry in the owner's state repository
  (`skill-evolution/lessons/<ID>.md`), so run names and project details stay out of this public
  repository. `skills/skill-evolution/scripts/lessons` is the only writer: each entry's own file
  and a random ID that never changes mean two computers never edit the same text, nothing is
  renumbered, and an ID shown to the owner holds for good.
- **An applied change** lands here like any other: the skill's version raised, its changelog entry
  with the evidence in aggregate, and longer evidence in `docs/skills/<skill>/evidence.md`.

## Why

Until 2026-10-31 every improvement to the skills came from the owner noticing a problem and asking:
for example, run folders grew to 14.6 GB over three weeks while the incident that showed it sat in
a run's notes. Asking for proposals at every finish catches these while the evidence is fresh, and
the owner's yes per proposal keeps one odd night from drifting a skill.

A rule that is no longer needed never causes an incident, so the newer-model check looks for those
directly. Rules written to patch an older model's weaknesses go stale as models improve: Anthropic
removed over 80% of Claude Code's system prompt for newer models with no measurable loss on its
coding evaluations ([Thariq Shihipar, July 2026](https://claude.dev/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models/)),
and in one migration test, six prompts each planted with one of the patterns that "hobble frontier Claude models",
removing them cut cost by a further 9% on average
([Lance Martin, September 2026](https://claude.com/blog/reducing-cost-and-improving-performance-with-claude-platform)).
