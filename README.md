# Agent Skills

Private source repo for personal agent skills used across Codex, Antigravity, Antigravity IDE, and related tools.

The repo root is:

```text
/Users/kristianbonnici/Developer/agent-skills
```

## Repository Layout

```text
agent-skills/
|-- AGENTS.md
|-- README.md
|-- .gitignore
`-- skills/
        |-- SKILL.md
        |-- agents/
        |   `-- openai.yaml
        `-- references/
            `-- note-patterns.md
```

`skills/` is the canonical source directory. Tool-specific skill folders should not contain separate copies of these files. They should point back to this repo.

## Available Skills

| Skill | Purpose |
|---|---|

## Current Install Links

The canonical skill lives at:

```text
```

Codex uses full directory symlinks:

```text

```

Antigravity CLI also works as a full directory symlink:

```text
```

Antigravity and Antigravity IDE use adapter directories. The skill directory itself is real, while its contents are symlinks back to the canonical repo. This avoids scanners that miss or ignore a symlinked skill directory:

```text

```

Compatibility paths are also maintained for Gemini-backed Antigravity installs:

```text
```

These are adapter directories with symlinked `SKILL.md`, `agents`, and `references`.

## Recreate Links

Run this from anywhere to repair the current setup:

```bash

link_dir() {
  dest="$1"
  mkdir -p "$(dirname "$dest")"
  if [ -L "$dest" ]; then
    rm "$dest"
  elif [ -e "$dest" ]; then
    echo "Refusing to replace existing path: $dest" >&2
    return 1
  fi
  ln -s "$CANONICAL" "$dest"
}

adapter_dir() {
  dest="$1"
  mkdir -p "$dest"
  for name in SKILL.md agents references; do
    target="$CANONICAL/$name"
    link="$dest/$name"
    if [ -L "$link" ]; then
      rm "$link"
    elif [ -e "$link" ]; then
      echo "Refusing to replace existing path: $link" >&2
      return 1
    fi
    ln -s "$target" "$link"
  done
}


```

After changing links, restart the target app or start a fresh conversation so it reindexes skills.

## Editing Workflow

Edit the canonical files only:

```text
/Users/kristianbonnici/Developer/agent-skills/skills/<skill-name>/SKILL.md
```

Then commit the change in this repo:

```bash
cd /Users/kristianbonnici/Developer/agent-skills
git status
git add skills/<skill-name>
git commit -m "Update <skill-name> skill"
```

Do not edit files inside `~/.codex`, `~/.agents`, `~/.antigravity`, `~/.antigravity-ide`, or `~/.gemini` unless repairing symlinks. Those locations are installation targets, not sources of truth.

## Skill Format

Each skill folder should contain:

```text
skills/<skill-name>/
|-- SKILL.md
|-- agents/
`-- references/
```

`SKILL.md` must include YAML frontmatter:

```yaml
---
name: skill-name
description: Clear description of what the skill does and when agents should use it.
---
```

Keep descriptions specific. Agents use the description to decide whether to load the full skill.
