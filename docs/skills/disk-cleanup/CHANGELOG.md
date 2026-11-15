# disk-cleanup changelog

## 2.0.0 (2026-11-15)

- Decisions are kept per computer: `decisions.md` has one `## Machine: <computer>` section per computer (named by `scutil --get LocalHostName`, or `hostname -s`), each with its own Keep, Undecided and Cleared lists, and an `## Every machine` section for rules the owner stated for every computer. A round reads and writes only its own computer's section and the shared one. The owner now uses two computers that share the file, and a round on the second would have taken the first one's "caches cleared" as done there and hidden finds that are new on it.
- A computer with no section yet starts clean, and the round tells the owner that decisions made on other computers were not applied.
- A file from before (one list) applies nowhere until the owner says which computer its entries were made on; the round asks once, and the new `scripts/decisions migrate --to <computer>` moves every entry, unchanged, under that computer. When the owner can't say, `migrate --unassigned` moves them unchanged under an `## Unassigned` section that applies on no computer, so the round can still record its decisions, and a later `migrate --to` gives that section to the computer the owner names. A scheduled run doesn't ask; it says so in its report.
- New `scripts/decisions`: `show` prints this computer's section and the shared one and names the case (no file, new computer, single list); `init` creates the file or adds this computer's section and changes nothing else. Both write through a link to the file it points to, and refuse a link into a folder that is missing, such as a state repository not cloned on this computer, instead of making that folder.
- Sharing the file now follows the orchestrator's profile: commit only that file, pull `--rebase` and push again when another computer pushed first, `rebase --abort` when that rebase stops on a conflict, never force, and go on with the local file and say so when the pull or push fails. A plain local file is never moved over a file the repository already has, since that one holds another computer's decisions.

## 1.0.0 (2026-10-31)

- First release: a read-only scan, then sort, prove unused, report, and clear only what the owner picks, with their decisions kept in private state so later rounds show what's new. A scheduled run only reports. From two manual cleanup rounds that freed about 140 GB, where the checks that mattered were running processes, LaunchAgents and whether anything still referenced a folder, and where estimates from `du` overstated what hard-linked caches would free.
