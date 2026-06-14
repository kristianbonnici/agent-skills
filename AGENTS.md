# AGENTS.md

## Purpose

This repository is the canonical source for personal agent skills. Skills here are shared across local agent tools by symlink or adapter directories.

Treat this repo as the source of truth. Tool-specific paths under `~/.codex`, `~/.agents`, `~/.antigravity`, `~/.antigravity-ide`, and `~/.gemini` are installation targets only.

## Repository Structure

- `skills/<skill-name>/SKILL.md` contains the required skill instructions and YAML frontmatter.
- `skills/<skill-name>/agents/` contains optional platform-facing metadata such as `openai.yaml`.
- `skills/<skill-name>/references/` contains supporting reference files loaded only when needed.

## Editing Rules

- Edit canonical files in this repo, not the linked install locations.
- Keep skills focused on one reusable workflow.
- Preserve the existing folder shape unless a tool requires a different adapter.
- Prefer concise, imperative instructions in `SKILL.md`.
- Keep detailed examples and long reference material in `references/`.
- Do not put secrets, API keys, tokens, private credentials, or machine-local credentials in this repo.
- Use lowercase hyphenated skill folder names.

## Symlink Rules

Codex locations can use full directory symlinks:

```text
~/.agents/skills/<skill-name> -> ~/Developer/agent-skills/skills/<skill-name>
~/.codex/skills/<skill-name> -> ~/Developer/agent-skills/skills/<skill-name>
```

Antigravity and Antigravity IDE should use adapter directories when broad compatibility matters:

```text
~/.antigravity/skills/<skill-name>/
~/.antigravity-ide/skills/<skill-name>/
```

Inside each adapter directory, symlink the skill contents:

```text
SKILL.md -> ~/Developer/agent-skills/skills/<skill-name>/SKILL.md
agents -> ~/Developer/agent-skills/skills/<skill-name>/agents
references -> ~/Developer/agent-skills/skills/<skill-name>/references
```

Maintain these compatibility adapter paths when troubleshooting Antigravity discovery:

```text
~/.gemini/antigravity/skills/<skill-name>/
~/.gemini/antigravity-ide/skills/<skill-name>/
~/.gemini/config/skills/<skill-name>/
```

Antigravity CLI can use a full directory symlink:

```text
~/.gemini/antigravity-cli/skills/<skill-name> -> ~/Developer/agent-skills/skills/<skill-name>
```

After changing symlinks or skill metadata, restart the target app or open a new conversation so skills are reindexed.

## Verification

Before saying a skill is installed, check that `SKILL.md` exists through the target path. For example:

```bash
```

Use `readlink` to confirm symlinks point back to this repo.

## Git Hygiene

- Commit source skill changes in this repo.
- Avoid committing OS metadata, generated caches, logs, or local app state.
- Keep install locations out of Git; only the canonical skill source belongs here.
