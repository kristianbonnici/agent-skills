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
./tests/orchestrator-scripts-test   # the long-horizon-orchestrator's scripts (lease, run-charts and the run map, usage-sampler, report-offer, prune-runs, run-watch, heartbeat, run-costs)
./tests/skill-versions-test         # every skill's version and its changelog agree
./tests/skill-evolution-test        # skill-evolution's lessons script: two computers sharing the private lessons, one file per entry
./tests/evidence-test               # every evidence file has skill-evidence's "Last checked" line and "Left out" section
./tests/disk-cleanup-test           # disk-cleanup's scan script in a made-up home folder
./tests/excalidraw-drawing-test     # every documented pattern and diagram and the example page build cleanly, charts place points by their numbers, the checks catch what they claim, vault builds write the Obsidian plugin's files, hand edits are never overwritten, and drawing.mjs edits and previews a drawing
```

The doctor must confirm Product Design is absent from Codex discovery paths.

Hosts read this checkout's files through the links, so doctor also fails while this checkout or the private one is off its default branch or a file a host reads has an uncommitted change, and while a vendored copy differs from its pin: commit a skill change before running it. The same suites run on GitHub for each push and pull request (`.github/workflows/tests.yml`); doctor runs only here, because it checks this computer.

## Git Hygiene

- Commit source skill changes in this repo.
- Avoid committing OS metadata, generated caches, logs, or local app state.
- Keep install locations out of Git; only the canonical skill source belongs here.
- Commit lockfiles for pinned runtimes; do not commit `node_modules`, browser caches, or generated prototypes.
