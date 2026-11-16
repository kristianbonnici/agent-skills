# AGENTS.md

## Purpose

This repository is the canonical source for personal agent skills. Skills here are shared across local agent tools by symlink or adapter directories declared in the tables in `install/`.

Treat this repo as the source of truth. Tool-specific paths under `~/.codex`, `~/.agents`, `~/.claude/skills`, `~/.antigravity`, `~/.antigravity-ide`, and `~/.gemini` are installation targets only.

## Repository Structure

- `skills/<skill-name>/SKILL.md` contains the required skill instructions and YAML frontmatter.
- `skills/<skill-name>/agents/` contains optional platform-facing metadata such as `openai.yaml`.
- `skills/<skill-name>/references/` contains supporting reference files loaded only when needed.
- `adapters/` contains host-only command or metadata files.
- `install/` is the source of truth for host exposure and install destinations: `skills.tsv` names the hosts each skill goes to, `hosts.tsv` the folders each host reads skills from, and `links.tsv` any link that is not a skill's folder. `scripts/manifest` prints the links they declare.
- `docs/skills/<skill-name>/` holds each skill's changelog, flow diagram and evidence; agents never load it ([docs/VERSIONING.md](docs/VERSIONING.md)).
- `runtime/` contains pinned dependencies shared by portable skills.
- `scripts/` contains idempotent installation and verification commands.

## Editing Rules

- Edit canonical files in this repo, not the linked install locations.
- Keep skills focused on one reusable workflow.
- Preserve the existing folder shape unless a tool requires a different adapter.
- Prefer concise, imperative instructions in `SKILL.md`.
- Keep detailed examples and long reference material in `references/`.
- Do not put secrets, API keys, tokens, private credentials, or machine-local credentials in this repo.
- Use lowercase hyphenated skill folder names.
- Keep mutable state, private screenshots, user context, caches, and credentials outside this repository.
- Record dependency versions and upstream behavioral references explicitly.
- Every change to a skill raises its `metadata.version` and adds a changelog entry in the same commit, and the release is tagged `<skill>/v<version>` ([docs/VERSIONING.md](docs/VERSIONING.md)).
- Keep research, studies and sources out of `SKILL.md` and its references: they go in `docs/skills/<skill-name>/`. The skill states the rule; the docs say where it came from. This repository is public: cite public sources and aggregate numbers only, never an owner's project details.

## Installation Rules

- Add or change installation mappings in `install/`; do not maintain copy-paste installation snippets. To give a host a skill, add the host to the skill's row in `install/skills.tsv`.
- Use `scripts/bootstrap` to create or repair links and `scripts/uninstall` to remove them.
- The owner's unshared skills and pinned copies of other people's skills live in the private `agent-skills-private` repository (next to this one, or `AGENT_SKILLS_PRIVATE`), whose `install/` tables bootstrap, doctor and uninstall read with this one's. Never add, name or refer to anything of it here: this repository is public. Change its `vendor/` copies only with `scripts/vendor`, and list a skill that a tool installs as `external` in its `install/links.tsv` rather than copying it.
- Per-owner skill state lives in the owner's private `agent-skills-state` repository (next to this one, or `AGENT_SKILLS_STATE`); bootstrap links its `<skill>/<file>` entries into `${XDG_STATE_HOME:-~/.local/state}/agent-skills/`. Never copy its contents into this public repository.
- Which hosts each computer has is in an `install/computers.tsv` kept in the private repository (`computer<TAB>hosts`; computer names are private, so never here), and an `external` row in a `links.tsv` may end with the computers it is on. A computer with no row has every host. Bootstrap installs nothing for a host its computer leaves out and removes the links it made there earlier; doctor skips that host. When a computer gains or loses a tool, change its row there; in public files and tests, use made-up computers such as `studio-mac` through `AGENT_SKILLS_COMPUTER`. Scripts get this computer's name, hosts and links from `scripts/manifest` (`computer`, `hosts`, `left-out`, `links`, `away` for the links of hosts it leaves out, `computers`, `unhosted` and `instructions`), never by reading the tables themselves.
- The owner's global instruction files (a host's `AGENTS.md` or `CLAUDE.md`) are built by bootstrap from sections in the private repository: `instructions/sections/<name>.md` and an `install/instructions.tsv` there (`computer<TAB>host<TAB>target<TAB>sections`), read through `scripts/manifest instructions`. Change what they say in a section, never in a built file; text that differs by host or computer is a section of its own, and text that is the same everywhere exists once. Bootstrap writes a target only when it is absent or carries the generated marker on its first line, and keeps a built file someone changed as a backup before rebuilding it; the owner's own file is taken over only by `scripts/bootstrap --adopt-instructions`, after a backup beside it. Uninstall removes only marked files nobody changed. Bootstrap records each file it built, with the computer and host, in `${XDG_STATE_HOME:-~/.local/state}/agent-skills/instructions-built`; a recorded file no row builds any more (its row removed, or its host left out) is removed by bootstrap and uninstall when it still carries its marker and checksum, kept with a message when someone changed it, and reported by doctor. In public files and tests, use made-up computers and sections.
- `scripts/sync` pulls the three repositories (`--ff-only`, only one on its default branch with no uncommitted change), reports what is not pushed and then runs bootstrap; it never pushes. Run it on a computer before work that depends on another computer's commits. Doctor warns when a default branch is ahead of or behind `origin` as of the last fetch.
- Each computer runs sync daily on a schedule the repository installs: `scripts/sync --schedule [HH:MM]` (08:30 by default; on macOS the launch agent `com.agent-skills.sync`, logging to `~/Library/Logs/agent-skills-sync.log`; elsewhere it prints the cron line), `--schedule-status` and `--unschedule`, run from the main checkout in a shell whose PATH finds git, node and npm. Never write that launch agent by hand: `--schedule` takes a hand-made one over. Doctor reports the schedule and its last run, never as a failure; `uninstall --all` removes it. Every suite that runs doctor, uninstall or the schedule stubs `launchctl` and uses a made-up HOME.
- Full-directory links are preferred. Use `adapter` mode only for hosts that cannot discover a symlinked skill directory.
- When a skill is renamed or removed, change its row in `install/skills.tsv` from `install` to `retired` under its old name; when it is taken away from some hosts only, add a `retired` row naming those hosts. Bootstrap and uninstall then remove a link an earlier version installed, and doctor fails while one is left. A folder a host no longer reads is retired the same way, in `install/hosts.tsv`, and any other link in `install/links.tsv`. Keep retired rows at least until every computer has run bootstrap since.
- Never expose `skills/product-design` through `~/.agents/skills` or `~/.codex/skills`. It is an OpenCode/Factory/Antigravity compatibility implementation; Codex must use the official Product Design plugin.
- After changing links or skill metadata, restart the target app or open a new conversation so skills are reindexed.

## Verification

Before saying a skill is installed, run:

```bash
./scripts/doctor --all
./tests/bootstrap-test
./tests/vendor-test                   # scripts/vendor pins a folder of a made-up upstream byte for byte, catches a changed copy, and updates the pin without committing
./tests/install-manifest-test         # the tables in install/ expand to the expected links and refuse a contradiction, and the README's table of skills says what they say
./tests/instructions-test             # instruction files built for two made-up computers from shared and variant sections, the owner's own file left alone and then adopted with a backup, a stale file rebuilt, a change made during the rebuild kept, a file whose row is gone removed or kept, uninstall, no table, and the rows manifest refuses
./tests/sync-test                     # scripts/sync with made-up repositories: pulls one that is behind, skips a dirty one and one off its default branch, reports unpushed commits, pushes nothing, runs bootstrap; with no terminal, nothing can prompt (a caller's askpass included) and a caller's GIT_SSH is kept; a scheduled run's start and finish lines; doctor's ahead/behind warning
./tests/sync-schedule-test            # sync --schedule in a made-up home with a stand-in launchctl: the launch agent's plist, idempotent installs, a hand-made agent taken over with a backup, the status and doctor's report of the last run, a worktree refused, removal, and the cron line elsewhere
./tests/orchestrator-scripts-test   # the long-horizon-orchestrator's scripts (lease, run-charts and the run map, usage-sampler, report-offer, prune-runs, run-watch, heartbeat, run-costs, share-usage)
./tests/skill-versions-test         # every skill's version and its changelog agree
./tests/skill-evolution-test        # skill-evolution's lessons script: two computers sharing the private lessons, one file per entry
./tests/evidence-test               # every evidence file has skill-evidence's "Last checked" line and "Left out" section
./tests/disk-cleanup-test           # disk-cleanup's scan script in a made-up home folder, and scripts/decisions: per-computer decisions, the migration and its refusals, two writers at once, CRLF kept
./tests/reviewer-benchmark-test     # reviewer-benchmark's bench script with a made-up set: the copy holds the change and nothing after it, a review is saved, skipped or stopped at its time, scoring is blind, and the totals add up
./tests/review-gate-test            # review-gate's review-records script: the documented record prints the documented Review lines, a bad record is refused, and totals add up records and older handoff tables
./tests/excalidraw-drawing-test     # every documented pattern and diagram and the example page build cleanly, charts place points by their numbers, the checks catch what they claim, vault builds write the Obsidian plugin's files, hand edits are never overwritten, and drawing.mjs edits and previews a drawing
```

The doctor must confirm Product Design is absent from Codex discovery paths.

Hosts read this checkout's files through the links, so doctor also fails while this checkout or the private one is off its default branch or a file a host reads has an uncommitted change, and while a vendored copy differs from its pin: commit a skill change before running it. The same suites run on GitHub for each push and pull request (`.github/workflows/tests.yml`); doctor runs only here, because it checks this computer.

## Git Hygiene

- Commit source skill changes in this repo.
- Avoid committing OS metadata, generated caches, logs, or local app state.
- Keep install locations out of Git; only the canonical skill source belongs here.
- Commit lockfiles for pinned runtimes; do not commit `node_modules`, browser caches, or generated prototypes.
