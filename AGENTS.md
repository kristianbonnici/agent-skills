# AGENTS.md

## Purpose

This repository is the canonical source for personal agent skills. Skills here are shared across local agent tools by symlink or adapter directories declared in `install/links.tsv`.

Treat this repo as the source of truth. Tool-specific paths under `~/.codex`, `~/.agents`, `~/.antigravity`, `~/.antigravity-ide`, and `~/.gemini` are installation targets only.

## Repository Structure

- `skills/<skill-name>/SKILL.md` contains the required skill instructions and YAML frontmatter.
- `skills/<skill-name>/agents/` contains optional platform-facing metadata such as `openai.yaml`.
- `skills/<skill-name>/references/` contains supporting reference files loaded only when needed.
- `adapters/` contains host-only command or metadata files.
- `install/links.tsv` is the source of truth for host exposure and install destinations.
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

## Installation Rules

- Add or change installation mappings in `install/links.tsv`; do not maintain copy-paste installation snippets.
- Use `scripts/bootstrap` to create or repair links and `scripts/uninstall` to remove them.
- Full-directory links are preferred. Use `adapter` mode only for hosts that cannot discover a symlinked skill directory.
- Never expose `skills/product-design` through `~/.agents/skills` or `~/.codex/skills`. It is an OpenCode/Factory/Antigravity compatibility implementation; Codex must use the official Product Design plugin.
- After changing links or skill metadata, restart the target app or open a new conversation so skills are reindexed.

## Verification

Before saying a skill is installed, run:

```bash
./scripts/doctor --all
./tests/bootstrap-test
```

The doctor must confirm Product Design is absent from Codex discovery paths.

## Git Hygiene

- Commit source skill changes in this repo.
- Avoid committing OS metadata, generated caches, logs, or local app state.
- Keep install locations out of Git; only the canonical skill source belongs here.
- Commit lockfiles for pinned runtimes; do not commit `node_modules`, browser caches, or generated prototypes.
