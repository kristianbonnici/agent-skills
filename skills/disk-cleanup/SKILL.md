---
name: disk-cleanup
description: Find what is wasting disk space on the owner's Mac and clear only what the owner picks. Measure with a read-only scan, sort each find into leftover, rebuildable, old version or the owner's own work, prove it is unused, and report sizes and what would be lost. Remember the owner's decisions in private state, per computer, so later rounds show only what's new. Never deletes anything the owner didn't choose in the conversation, and a scheduled run only reports. Use on its schedule, and when the user asks to free up disk space, find what's taking up space, clean up leftovers or caches, or do another cleanup round.
metadata:
  version: 2.0.0
---

# Disk Cleanup

You find what is wasting space and the owner decides what goes. Measuring is the easy part. The job is telling a forgotten copy from something still in use, and saying plainly what each deletion costs.

## Rules that never bend

- **Delete only what the owner chose, in this conversation, naming that item.** "Clean it all up" with no list yet means report first. A choice covers the item as you described it, nothing wider: if a check finds more than you listed, or something different, ask again.
- **Nobody watching means no deleting.** A scheduled run ends with its report, whatever it finds, and never asks a question it waits on.
- **Never touch:** credentials and tokens, anything needing `sudo`, the Trash, Time Machine snapshots, system folders, macOS's own data (`com.apple.*`), git history, a repository's tracked files, or a skill's own state (`~/.local/state/agent-skills`: run ledgers and decisions may exist nowhere else). Report them if they matter; the owner handles them, and a skill with a pruning tool of its own, such as the orchestrator's `prune-runs`, is named instead.
- **Unsure means it's the owner's work.** Leave it out of the deletable list, and say so if it's big.

## 1. Set up

- **The state:** `${XDG_STATE_HOME:-~/.local/state}/agent-skills/disk-cleanup/`. Its `decisions.md` is what the owner already decided, and may be a link into the owner's private state repository (`realpath` shows where). When it is, `git -C <that repository> pull --ff-only` first, except on a scheduled run; if the pull fails, carry on with the copy you have and say so. Its `scans/` holds the script's measurements.
- **Decisions are per computer.** Several computers may share the file, and a cache cleared on one is still full on another. The file has one `## Machine: <computer>` section per computer, each with its own Keep, Undecided and Cleared lists, and one `## Every machine` section for rules the owner stated for every computer. The computer's name is `scutil --get LocalHostName` on macOS, `hostname -s` elsewhere. Read the decisions with `scripts/decisions show` from this skill's folder: it prints this computer's section and the shared one, never another computer's entries, and says which case you are in:
  - **No file yet:** the first round anywhere. Section 7 creates it.
  - **A new computer** (no section for it yet): start clean, and tell the owner that decisions made on other computers, which it names, were not applied here. Section 7 adds the section.
  - **A single list** (the file from before computers had sections): its entries apply nowhere yet. Ask the owner once whether they were made on this computer, or on which other one, and after they answer run `scripts/decisions migrate --to <that computer>`, which moves every entry unchanged under it. If the owner can't say, run `scripts/decisions migrate --unassigned`, which moves them unchanged under `## Unassigned`, applied on no computer, so this round can record its decisions. Until the file is migrated, treat this computer as new. A scheduled run doesn't ask and doesn't migrate: it says so in its report.
  - **Unassigned entries** (`show` counts them): they apply on no computer. When the owner later says which computer they were made on, `scripts/decisions migrate --to <that computer>` gives them that computer's section, if it has none yet; otherwise leave them and tell the owner.
  - Apply only this computer's section and the shared one; another computer's decisions say nothing about this one.
- **Due?** On a scheduled run, run `scripts/scan --due` from this skill's folder. A round is due every four weeks, or sooner when free space runs low. If it says `not due`, stop with that one line and nothing else.

## 2. Scan

Run `scripts/scan` from this skill's folder, which can take several minutes, and read what it prints. It deletes nothing. For a closer look, or a second round, measure the places it summarizes: go a level deeper in the biggest folders, and look where a first round didn't. [references/macos.md](references/macos.md) lists where things collect and the traps in measuring them.

Anything the scan was refused is unknown, not empty. Say so in the report.

## 3. Sort each find

| Kind | What it is | Default |
|---|---|---|
| **Leftover** | Nothing uses it any more: a backup of a backup, a forgotten working copy, a failed install, data from a removed app | Offer it |
| **Rebuildable** | Comes back by itself or with one command: caches, build folders | Offer it, with the cost of rebuilding |
| **Old version** | An older copy kept beside the one in use: browsers, extensions, runtimes | Offer it, keeping the version in use |
| **Big, the owner's call** | Works today but maybe isn't needed: models, sample data, a large unused app | Offer it, plainly as a choice |
| **The owner's work** | Projects, documents, task outputs, history, anything you can't place | Leave out; mention it if it's big |

A shared store is never one item. Offer what's inside it, by the tool's own listing (`ollama list`, `docker image ls`), or leave it out: see "Shared stores" in [references/macos.md](references/macos.md), and read that before you offer anything from one.

Skip anything this computer's section or the shared one says to keep, unless it changed a lot since. Something cleared before that came back isn't news when it's a cache that refills: offer it only if it's worth the rebuild, and from 5 GB.

## 4. Prove it's unused

A name isn't proof, and neither is an old date alone. Before listing anything as deletable, check what applies:

- **Running:** does a process use it (`lsof +D <folder>`, `ps -axo pid,command | grep <name>`)?
- **Scheduled or launched:** does a LaunchAgent or login item start something inside it?
- **Installed:** is its app still there (`mdfind "kMDItemCFBundleIdentifier == '<id>'"`, then `/Applications`)? A folder's name can look like one app and belong to another, so read what's inside.
- **Referenced:** does a project, config or script still name it (`grep -rIl` across the owner's projects, skipping `node_modules` and `.git`)?
- **Last changed:** the newest file inside, not the folder's own date, and in a repository the last commit. A copied file keeps its old date, so an old date alone proves little.
- **A git checkout or worktree:** uncommitted or untracked files (`git -C <folder> status --short`), and commits on no remote (`git -C <folder> log --branches --not --remotes --oneline`) make it the owner's work, however old it looks. `git worktree list` from its repository says what still uses it.
- **The only copy?** For a backup or working copy, is the same data somewhere else? If not, say that deleting it loses it.

## 5. Report

Each item gets a number, so the owner can answer in one line, in this form: the size, where it is, when it last changed, how you know it's unused, what deleting it loses, and how it comes back if it can. When a tool's command would clear it, the item is everything that command removes: describe all of it, not just the part that caught your eye. Group by kind, biggest first, and total it. Plain words: the owner shouldn't need to know what a pack file is.

Sizes before deleting are estimates, so write "about". Say what you left out and why, what you couldn't measure, and anything that needs the owner, such as Docker's virtual disk, which is cleaned from inside Docker.

Worth keeping short: when the items total under 5 GB and free space is above 15%, say so in a line or two rather than listing them.

In a conversation, then ask which to clear, with the host's question tool if it has one. A scheduled run doesn't ask: it ends with the numbered list, the owner answers in that thread when they come to it, and section 6 starts from their answer. If the owner asks what an item means, explain it, and don't act on it until they choose.

## 6. Clear what the owner chose

Do these in order for each chosen item:

1. **Recheck first.** Time has passed since the report. Repeat the checks in section 4 that apply. If something changed, leave the item, and say what changed.
2. **Note the free space before starting** (`df -k ~`).
3. **Use the tool's own way when it has one and it removes only what the owner chose** (`uv cache clean`, `brew cleanup`, `ollama rm`). If they chose part of what a command would clear, remove just that part. See [references/macos.md](references/macos.md).
4. **Keep the parts that matter.** Write-ups stay when a working folder goes; the version in use stays when old ones go. Unload a LaunchAgent (`launchctl bootout`) before removing it.
5. **Check it worked:** the folder is gone or smaller, not just that the command returned.

Name each path exactly, and quote it. Never build a deletion from a variable that could be empty, or from a broad pattern.

## 7. Finish

- **Report what happened:** free space before and after, measured, and what each item freed. Where the real figure differs from your estimate, say so and why. Say what you didn't do.
- **What needs doing later:** a cleared build folder needs a rebuild, a removed browser profile means signing in again.
- **Keep it where it can follow the owner.** The private state repository is `$AGENT_SKILLS_STATE`, or else `agent-skills-state` beside the skills repository (`git -C "$(realpath <this skill's folder>)" rev-parse --show-toplevel`). If that exists and `decisions.md` isn't already a link into it, put the file at `<repository>/disk-cleanup/decisions.md`, moving a plain one from the state folder, and link it: `ln -s <that file> <state folder>/decisions.md`. If the repository already has the file, another computer's decisions are in it: never replace it. Leave both files as they are and tell the owner, who decides how to bring this computer's entries in. Bootstrap won't replace a real file with its link. With no such repository, a plain file in the state folder is right.
- **Update `decisions.md`,** on every round the owner decided anything: run `scripts/decisions init` first, which creates the file or adds this computer's section and changes nothing else, then edit the file `realpath` names (never the link) in the form below, newest first in each list. Paths start with `~`. Write only in this computer's section, and in `## Every machine` only a rule the owner said holds for every computer.

  ```markdown
  # disk-cleanup decisions

  ## Every machine
  - <rule, in the owner's terms> (<date>)

  ## Machine: <computer>

  ### Keep
  - `<path>` (<date>): <why, in the owner's terms>

  ### Undecided
  - `<path>` (<date>): <what's waiting on the owner>

  ### Cleared
  - `<path>` (<date>): <what it was, about how much it freed>
  ```

  Whatever the owner saw and declined goes under Keep. Something they haven't answered yet goes under Undecided.
- **Share it.** If the file is in the private state repository, commit that file alone and push: `git -C <repository> add disk-cleanup/decisions.md`, `git -C <repository> commit -m "disk-cleanup: <computer>: <what was decided>" -- disk-cleanup/decisions.md`, then `git -C <repository> push`. Other skills keep their state there too, so never commit anything else in it. If the push is rejected because another computer pushed first, `git -C <repository> pull --rebase` and push again. Never force-push. If the pull or push fails (no network, a conflict), leave the local file as it is and say so in the report. Nothing from `decisions.md` goes into the public skills repository.

If a tool or skill keeps causing the same waste, say which one and what would stop it at the source: a cleanup only treats the symptom.
