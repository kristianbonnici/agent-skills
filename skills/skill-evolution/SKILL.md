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
- **The lessons file:** `${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/skill-evolution/lessons.md`. It may be a link into the owner's private state repository (`${AGENT_SKILLS_STATE:-<the skills repository's parent folder>/agent-skills-state}`, a git repository): then edit the file it points to (`realpath`), never the link, and run `git -C <its repository> pull --ff-only` before reading it.
- **If it is missing:** when that state repository exists, pull it first; if it still has no `skill-evolution/lessons.md`, create that from [references/lessons-file.md](references/lessons-file.md) there and link it (`ln -s <that file> <the path above>`), as the skills repository's `scripts/bootstrap` would, so it is committed with everything else. Only without a state repository create a plain local file.

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

Every change to the lessons file (new entries, and the owner's decisions in section 5) happens under its lock, and is committed in the same turn:

1. **Take the lock:** `mkdir <the file's real path>.lock`. If it already exists, another run on this computer is writing: wait a minute and try again, for up to 15 minutes. A lock older than an hour was left by a turn that died: remove it (`rmdir`) and take it.
2. **Read the newest file:** pull the state repository (`pull --ff-only`), then read the file.
3. **Write:** new entries get the next numbers after the highest `L<n>` in the file.
4. **Commit and push it** when it is in the private state repository: commit only that file (`git -C <its repository> commit -m "skill evolution: <source>" -- <file>`), then `push`. If the push is rejected because another computer pushed first, `pull --rebase` and push again; if your new numbers now repeat one already in the file, renumber yours, commit and push again. Never force-push, and never commit anything else there. If it fails (no network, a conflict you can't settle), keep the local file and say so.
5. **Release the lock:** `rmdir <the file's real path>.lock`.

Show the proposals only after this, so the numbers the owner sees are the ones in the file.

- **Record every incident** in the lessons file: a proposal as `proposed`, the rest as `seen` (so a repeat later becomes evidence). The lessons file is private: run names, projects and details are fine there.
- **Propose at most three,** the ones with the highest cost prevented, chosen from this time's and the earlier ones still `proposed` in the file (check each earlier one against the skill's current text first: one the skill now covers becomes `seen`, with why). Each in this form:

  ```text
  **L<n>. <skill>: <short title>.** <What happened, with when and what it cost, in one or two sentences.> <The change, as the rule would read.> (<file and section>; <major|minor|patch> by docs/VERSIONING.md.)
  **Recommended:** apply, because <one sentence>. <Or: "skip, because <…>".>
  ```

  The rest stay `proposed` in the lessons file; say in one line how many wait there, so they come up again next time. With nothing worth proposing, say so in one line, or, for an orchestrator's report, return nothing.

## 5. When the owner decides

Only the owner's explicit answer about a proposal counts ("apply L3", "skip L4"). A general "sounds good" to a report applies nothing. Record each decision as section 4 says (lock, pull, write, commit and push, release), so another computer sees it.

- **Declined:** set it to `declined <date>`, with their reason if they gave one.
- **Accepted:** apply it in the skills repository, as a change of its own:
  1. Make the change. Raise the version and add the changelog entry as `docs/VERSIONING.md` says, in plain words, with the evidence in aggregate. The public repository never gets private details: no project names, people or paths from the owner's work. Longer evidence goes in `docs/skills/<skill>/evidence.md`.
  2. Run the repository's checks (its AGENTS.md lists them).
  3. Pass the `review-gate` skill at the level the diff calls for.
  4. Commit, and tag the version. Never push unless the owner asks.
  5. Set the proposal to `applied <skill> <version> <date>`, recorded as section 4 says.

  In an orchestrator run, the orchestrator gives this to a small follow-up task in the skills repository instead of doing it itself.

## Never

- Change a skill without the owner's yes for that proposal.
- Propose more than three at once, or the same declined change without new evidence.
- Propose from something you didn't verify: read the ledger, the thread or the file.
- Put private details in the public skills repository, or push it unasked.
