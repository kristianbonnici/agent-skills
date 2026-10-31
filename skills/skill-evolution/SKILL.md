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
- **The lessons:** every incident and proposal is an entry of its own in the owner's private state repository, kept by this skill's `scripts/lessons`: run the installed copy (the skill folder you read this from), not one in a worktree of the skills repository. `lessons show` lists one line per entry (ID, status, title); `lessons show <ID>...` prints those in full. Write only through `lessons add`, `set` and `note` (section 4), never by editing or committing the files yourself: the script pulls, commits only its own files and pushes. Each entry gets an ID like `L-K7QM` that never changes. What it prints:
  - `not pushed` (exit 3): saved here; say so, the next `lessons` command sends it.
  - `dropped: ... L-K7QM ...: <lines>`: another computer changed that entry first, and this computer's unsent change, the lines shown, was dropped; record it again if it still holds.
  - `moved: ... L-K7QM is now L-P2WD`: two computers picked one ID; use the new one, and tell the owner if they saw the old.
  - `no private state repository` on its error output: it is using this computer's files only; say so.
  - Exit 4 (the state repository is mid-rebase or mid-merge), 75 (another run holds the lock for over a minute) or 64 (a mistake): nothing was written. Try once more; if it still fails, say what it printed and give your proposals without IDs. Never work around it with git. What an entry holds: [references/entries.md](references/entries.md).

## 2. Collect incidents

An incident is something a skill's rules caused, or didn't prevent, that cost the owner:

- time: an hour or more of waiting, or work redone;
- work lost, or files the owner had to clean up;
- an interruption: a prompt, a question, a dialog the owner had to answer;
- a workaround outside the skill's rules, or a rule followed exactly that gave a wrong result;
- a correction from the owner ("don't do that", "why didn't you…").

Sources: the run's ledger ("Incidents", "Decisions log", "Side effects", nudges, relaunches, reviews that didn't converge) and the tasks' handoffs ("Couldn't check", reviews); or, outside a run, what the user just told you and what you saw. A task's own bug, a provider outage seen once, or a check that was flaky once is not an incident of a skill, unless the lessons show it before.

## 3. Judge each one

For each incident:

1. **Find the rule.** The skill, file and section that govern what happened. Read the current text, not your memory of it: the skill may have changed since.
2. **Would a change have prevented it?** If the text already covers it and was ignored, propose only a change that makes it hard to ignore: a script check instead of prose, the rule moved to where the agent reads it at that moment, a shorter rule. If nothing in a skill would have helped, record it as `seen` and stop.
3. **Check the lessons** (`lessons show`). A proposal already `declined` comes back only with new evidence (a new incident of the same kind), and says it was declined before and why. One already `applied` that recurred is a lesson about that change: propose a fix to it. A `seen` entry of the same kind makes this a repeat: count it as evidence.
4. **Write the change small.** The rule as it would read, one or two sentences, and where it goes. Prefer tightening or replacing a rule to adding one, and a script check to prose when the check is mechanical. Every line added to a skill costs every future run some context.

## 4. Record and propose

- **Record every incident:** write each new entry to a file of its own in a temporary folder outside any repository (`mktemp -d`; private details must never land in the skills repository), in the form in [references/entries.md](references/entries.md), its heading `## L?. <skill>: <title>`), a proposal as `proposed`, the rest as `seen` (so a repeat later becomes evidence), and pass them all to one `lessons add <files>`; it prints each one's ID. A repeat of an existing entry is `lessons note <ID> "<run or session>: <what happened>"` instead. The lessons are private: run names, projects and details are fine there. Show the owner only IDs `add` printed.
- **Propose at most three,** the ones with the highest cost prevented, chosen from this time's and the earlier ones still `proposed` in the file (check each earlier one against the skill's current text first: one the skill now covers becomes `seen`, with why). Each in this form:

  ```text
  **<ID>. <skill>: <short title>.** <What happened, with when and what it cost, in one or two sentences.> <The change, as the rule would read.> (<file and section>; <major|minor|patch> by docs/VERSIONING.md.)
  **Recommended:** apply, because <one sentence>. <Or: "skip, because <…>".>
  ```

  The rest stay `proposed` in the lessons; say in one line how many wait there, so they come up again next time. With nothing worth proposing, say so in one line, or, for an orchestrator's report, return nothing.

## 5. When the owner decides

Only the owner's explicit answer about a proposal counts ("apply L-K7QM", "skip L-M3DX"). A general "sounds good" to a report applies nothing. First read the entry (`lessons show <ID>`): if it is no longer `proposed` (applied or declined meanwhile, maybe on another computer), tell the owner and stop. Record each decision with `lessons set <ID> "<status>"`, so another computer sees it.

- **Declined:** `lessons set <ID> "declined <date>: <their reason, if they gave one>"`.
- **Accepted:** apply it in the skills repository, as a change of its own:
  1. Make the change. Raise the version and add the changelog entry as `docs/VERSIONING.md` says, in plain words, with the evidence in aggregate. The public repository never gets private details: no project names, people or paths from the owner's work. Longer evidence goes in `docs/skills/<skill>/evidence.md`.
  2. Run the repository's checks (its AGENTS.md lists them).
  3. Pass the `review-gate` skill at the level the diff calls for.
  4. Commit, and tag the version. Never push unless the owner asks.
  5. `lessons set <ID> "applied <skill> <version> <date>"`.

  In an orchestrator run, the orchestrator gives this to a small follow-up task in the skills repository instead of doing it itself.

## Never

- Change a skill without the owner's yes for that proposal.
- Propose more than three at once, or the same declined change without new evidence.
- Propose from something you didn't verify: read the ledger, the thread or the file.
- Put private details in the public skills repository, or push it unasked.
