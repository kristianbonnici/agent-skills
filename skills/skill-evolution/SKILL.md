---
name: skill-evolution
description: Evolve agent skills from what runs teach them, with the owner deciding every change. Turn what went wrong with a skill into proposed changes the owner accepts or declines. Collect incidents (from a long-horizon-orchestrator run's ledger, or what the user or you just saw), check each against the skill's current text and the record of earlier proposals, and propose at most three concrete rule changes with their evidence and version bump. Never changes a skill without the owner's yes; an accepted proposal is applied with a version bump and the review gate. Use at the finish of an orchestrator run, whenever the user says a skill misbehaved or to "note this for the skill", and when they ask to see, apply or decline proposed skill changes.
metadata:
  version: 1.0.0
---

# Skill Evolution

Skills evolve from what actually happened to them, never on their own. You collect incidents, judge whether a change to a skill would have prevented them, and propose the few changes worth making. The owner decides. You never edit a skill on your own, not even a typo: one odd night must not drift a skill.

## 1. Find the files

- **The skills repository:** where the skill you are judging comes from. Installed skills are links: `git -C "$(realpath <skill folder>)" rev-parse --show-toplevel`. It holds `docs/VERSIONING.md` and `docs/skills/<skill>/`. A skill that isn't from a repository with those can still get proposals; say where it lives.
- **The lessons file:** open it with `<this skill's folder>/scripts/lessons begin` before reading or writing, and close it with `lessons end -m "skill evolution: <source>"` after, in the same turn, even if you only read. The script does the file's git work, so never commit, pull or push it yourself: it takes a lock (another run waits), pulls the owner's private state repository, creates and links the file there if it is missing (a plain local file only without that repository), and prints the file to edit (`file:`) and the number for a new entry (`next:`). `end` commits and pushes only that file. Both print `renumbered: L<a> -> L<b>` when another computer had taken one of this computer's unshown numbers: use the new number. Exit 3 means saved here but not pushed: say so, and that the numbers shown may still change; the next `begin` sends it, and any renumbering it prints goes to the owner too. Exit 2 means a number written twice (fix it and run `end` again). The entries' format is in [references/lessons-file.md](references/lessons-file.md).

## 2. Collect incidents

An incident is something a skill's rules caused, or didn't prevent, that cost the owner:

- time: an hour or more of waiting, or work redone;
- work lost, or files the owner had to clean up;
- an interruption: a prompt, a question, a dialog the owner had to answer;
- a workaround outside the skill's rules, or a rule followed exactly that gave a wrong result;
- a correction from the owner ("don't do that", "why didn't you…").

Sources: the run's ledger ("Incidents", "Decisions log", "Side effects", nudges, relaunches, reviews that didn't converge) and the tasks' handoffs ("Couldn't check", reviews); or, outside a run, what the user just told you and what you saw. A task's own bug, a provider outage seen once, or a check that was flaky once is not an incident of a skill, unless the lessons file shows it before.

## 3. Judge each one

For each incident:

1. **Find the rule.** The skill, file and section that govern what happened. Read the current text, not your memory of it: the skill may have changed since.
2. **Would a change have prevented it?** If the text already covers it and was ignored, propose only a change that makes it hard to ignore: a script check instead of prose, the rule moved to where the agent reads it at that moment, a shorter rule. If nothing in a skill would have helped, record it as `seen` and stop.
3. **Check the lessons file.** A proposal already `declined` comes back only with new evidence (a new incident of the same kind), and says it was declined before and why. One already `applied` that recurred is a lesson about that change: propose a fix to it. A `seen` entry of the same kind makes this a repeat: count it as evidence.
4. **Write the change small.** The rule as it would read, one or two sentences, and where it goes. Prefer tightening or replacing a rule to adding one, and a script check to prose when the check is mechanical. Every line added to a skill costs every future run some context.

## 4. Record and propose

Between `lessons begin` and `lessons end` (section 1): new entries get the number `begin` printed, and the ones after it. Show the proposals only after `end`, with the numbers it left, so the owner sees what the file holds.

- **Record every incident** in the lessons file: a proposal as `proposed`, the rest as `seen` (so a repeat later becomes evidence). The lessons file is private: run names, projects and details are fine there.
- **Propose at most three,** the ones with the highest cost prevented, chosen from this time's and the earlier ones still `proposed` in the file (check each earlier one against the skill's current text first: one the skill now covers becomes `seen`, with why). Each in this form:

  ```text
  **L<n>. <skill>: <short title>.** <What happened, with when and what it cost, in one or two sentences.> <The change, as the rule would read.> (<file and section>; <major|minor|patch> by docs/VERSIONING.md.)
  **Recommended:** apply, because <one sentence>. <Or: "skip, because <…>".>
  ```

  The rest stay `proposed` in the lessons file; say in one line how many wait there, so they come up again next time. With nothing worth proposing, say so in one line, or, for an orchestrator's report, return nothing.

## 5. When the owner decides

Only the owner's explicit answer about a proposal counts ("apply L3", "skip L4"). A general "sounds good" to a report applies nothing. Record each decision between `lessons begin` and `lessons end`, so another computer sees it.

- **Declined:** set it to `declined <date>`, with their reason if they gave one.
- **Accepted:** apply it in the skills repository, as a change of its own:
  1. Make the change. Raise the version and add the changelog entry as `docs/VERSIONING.md` says, in plain words, with the evidence in aggregate. The public repository never gets private details: no project names, people or paths from the owner's work. Longer evidence goes in `docs/skills/<skill>/evidence.md`.
  2. Run the repository's checks (its AGENTS.md lists them).
  3. Pass the `review-gate` skill at the level the diff calls for.
  4. Commit, and tag the version. Never push unless the owner asks.
  5. Set the proposal to `applied <skill> <version> <date>`, between `lessons begin` and `lessons end`.

  In an orchestrator run, the orchestrator gives this to a small follow-up task in the skills repository instead of doing it itself.

## Never

- Change a skill without the owner's yes for that proposal.
- Propose more than three at once, or the same declined change without new evidence.
- Propose from something you didn't verify: read the ledger, the thread or the file.
- Put private details in the public skills repository, or push it unasked.
