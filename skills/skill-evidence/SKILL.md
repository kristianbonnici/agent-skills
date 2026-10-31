---
name: skill-evidence
description: Keep the evidence behind agent skills current, with the owner deciding every change. Search for new top-tier, recent work that bears on each skill's rules, recheck the sources its evidence file already cites (revised, published, contradicted, dated or gone), prepare the evidence edits on a branch for the owner to merge, and turn findings that undercut a rule into skill-evolution proposals. Never changes a skill or pushes. Use on its schedule, and when the user asks to check, update or refresh a skill's evidence or sources, or whether its evidence still holds.
metadata:
  version: 1.0.0
---

# Skill Evidence

A skill's `docs/skills/<skill>/evidence.md` in the skills repository holds the sources and studies behind its rules, each tied to the rules it supports. You keep those files true: new work that bears on a rule goes in, and cited work that changed is updated or marked. You never change a skill: a rule changes only through skill-evolution, with the owner's yes. Your evidence edits wait on a branch until the owner merges them.

On a schedule nobody is watching: don't ask questions. Decide by these rules and say what you decided in the report.

## 1. Set up

- **The files:** the skills repository is `git -C "$(realpath <this skill's folder>)" rev-parse --show-toplevel`; the evidence files are its `docs/skills/*/evidence.md`. Check the ones the user named, or all.
- **Due?** Each file starts with `Last checked: new work <date>; sources <date>.` Read it from the newest unmerged `evidence/*` branch when there is one (`git show <branch>:<file>`), else from `main`. On a scheduled run, check only the files whose new-work date is 10 days old or more, and if none is, stop with one line ("Evidence checked under 10 days ago.") and nothing else, before any branch or worktree is touched. When the user asks, check what they named whatever the dates.
- **One pending branch.** Your edits go on a branch `evidence/<YYYY-MM-DD>` in a worktree of its own, `<the repository's parent folder>/<repository folder name>-worktrees/evidence-<YYYY-MM-DD>`, made from the default branch (`main`); if that name is taken, add `-2`. Look at the `evidence/*` branches first:
  - **One merged into `main`** (`git merge-base --is-ancestor <branch> main`): the owner took it. Remove its worktree only when `git -C <worktree> status --porcelain --ignored` prints nothing, since `git worktree remove` deletes ignored files without asking; then `git worktree remove <path>` (never `--force`) and `git branch -d <branch>`. If anything is listed or git refuses, leave both and name them in the report.
  - **One not merged:** the owner hasn't decided yet. If its worktree has uncommitted changes (`git -C <worktree> status --porcelain`), someone is working there: change nothing in it, and stop with a report that says so. Otherwise rebase it onto `main` and work on it, so one branch holds everything waiting. If the rebase conflicts, abort it, leave that branch as it is, and make a new branch from `main` that carries its changes over by hand where they still apply (`git diff main...<old branch>`); the report names the old branch for the owner to delete. With several unmerged branches, take the newest the same way and name the others.
- Never touch the owner's checkout of the repository: no checkout, stash, reset or edit there.

## 2. Read what each file claims

Read the evidence file whole, and the skill it explains (`skills/<skill>/SKILL.md` and its references). Note the rules the file ties sources to (usually after "→"), its sources and their dates, and its "Left out" section. A file with notes of its own on updating it is held to those too, where they ask more.

## 3. Search for new work

For each file, look for work published or substantially revised since its new-work date. Search by the rules, not by the cited titles: what would support, contradict or refine each one. Use web search at its most thorough setting for recent work, and open every candidate yourself. Where to look:

- the engineering and research posts of the AI labs and the makers of coding agents;
- arXiv (cs.SE, cs.AI, cs.CL, cs.MA) and the accepted papers of the main venues;
- evaluation organizations such as METR and Epoch AI;
- forward from each cited source: its newer versions, its authors' follow-ups, and published responses to it.

Keep a candidate only if it passes the bar in [references/bar.md](references/bar.md). Skip what the file already cites or lists under "Left out", unless it changed since (a new version, a venue, a withdrawal).

## 4. Recheck the sources it cites

When a file's sources date is 8 weeks old or more, or the user asks, open each cited source and compare the entry with the source as it reads now:

- **Revised** (a new version, new figures): update the entry, with the version and its date.
- **Published or withdrawn:** a preprint now in a venue gets the venue; a withdrawn one is marked withdrawn, and you judge whether its rule still stands on the rest.
- **Superseded** by its authors' newer work: cite the newer work, and keep the old entry only if the file still needs it.
- **Contradicted** by newer work that passes the bar: add that work beside it (section 6 if it undercuts the rule).
- **Dated:** figures measured on models two or more generations behind the current ones, with nothing newer confirming them. Add "(dated: <why>)" to the entry; never delete an entry for its age alone.
- **Gone** (a 404 or 410 on two tries, or the site is gone): link its new address or an archived copy. A page that refuses automated reading (a 403, a bot check) isn't gone: read it through search excerpts or reputable coverage, and say in the entry that the figures came from there.

## 5. Write the evidence edits

In the worktree, edit each file in its own form and voice:

- **A new entry** goes where entries of its kind are: its title linked, its authors or organization, its date, "preprint" or its venue, what it found with its figures, and "→ *<the rules it bears on>*". Check every figure and quote against the source as you write it.
- **Work that argues against a rule** also goes under "Where the evidence argues against us", where the file has that section, with how the skill answers it.
- **A candidate that came close** goes under "Left out", one line each: its linked title, date, and why (the part of the bar it missed). Close means top tier but bearing on no rule, or bearing on a rule but missing the bar: the ones a later run would otherwise weigh again. Search results nowhere near the bar aren't recorded.
- **`Last checked:`** gets today's date for new work, and for sources too when you rechecked them.

The repository is public: cite public sources and aggregate numbers only, never the owner's projects. Then run the checks the repository's AGENTS.md lists, commit on the branch (`docs(evidence): <what changed, per file>`) and pass the `review-gate` skill at Light, its brief's objective being that every added or changed figure, quote, date and link matches its source. Reviewers may have no web access, so the brief gives, for each added or changed figure or quote, the source's own passage that supports it, quoted, with its link. A run that found nothing still commits its `Last checked:` dates, so the next run knows. Never push the branch or merge it.

## 6. Findings that undercut a rule

New work that contradicts a rule, or shows a better one, is a proposal as well as an evidence entry. Hand it to the `skill-evolution` skill as an incident, its line `<date> evidence: <title, linked, date>: <what it found>` (in `lessons note`, without the date, which the script adds): that skill checks the lessons for an earlier decision, writes the change small and records it with `lessons add`, at most three proposals at once. The evidence entry it cites goes on your branch as usual.

## 7. Report

Short and plain, in the thread or your reply:

- **Per file checked:** what changed (sources added, updated, marked dated or gone, left out), or "nothing new".
- **The branch:** its name and worktree, and how to take it: `git merge --ff-only evidence/<date>` in the repository's checkout of `main`; if that refuses because `main` moved since, `git rebase main` in the branch's worktree first. To drop an item, the owner says which, and it moves to "Left out", now or on the next run, as "owner declined", with their reason only in public terms (a private reason stays out of this public repository).
- **Proposals:** in skill-evolution's form, with the IDs `lessons add` printed, and anything `lessons` printed as dropped, moved or not pushed, word for word.
- **What you couldn't check,** and why.

Call for the owner's attention (the host's notification, or one spoken sentence) only when there is a proposal or a new or changed entry, never for dates alone. A quiet run ends with its one line.

## Never

- Change a skill, or apply a proposal, without the owner's yes for it.
- Push the skills repository, merge into `main`, or touch the owner's checkout. (The `lessons` script's own pushes to the private state repository are how proposals reach the owner, as skill-evolution says.)
- Cite a source you didn't open, or a figure you didn't find in it. (A page that refuses automated reading is read through excerpts or coverage, named in the entry, as section 4 says.)
- Delete an entry for its age alone, or weigh again what "Left out" holds unless it changed.
