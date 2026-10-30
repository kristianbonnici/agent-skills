# Saved Product Design context

Use this workflow for setup, remembering sources, or explaining what Product Design knows.

## Storage

The shared state root is:

```text
${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/product-design/
```

`user-context.md` stores curated text and links. `assets/` stores user-approved reference images. `runs/<date>-<name>/` holds each run's screenshots and evidence, outside any repository. Never save secrets, credentials, tokens, copied customer data, or unsupported claims.

## Commands

```bash
SKILL_DIR=/absolute/path/to/this/skill   # the folder that holds SKILL.md
python3 "$SKILL_DIR/scripts/manage_context.py" preflight
python3 "$SKILL_DIR/scripts/manage_context.py" init
python3 "$SKILL_DIR/scripts/manage_context.py" show
python3 "$SKILL_DIR/scripts/manage_context.py" run-dir <short-name>   # a new evidence folder under runs/
```

Run them by absolute path: from the user's project directory a relative `scripts/` path does not exist.

For first-time setup, explain that Product Design can remember product URLs, screenshots, codebase paths, component docs, design-system sources, brand assets, browser preferences, and share targets. Ask for useful sources or allow the user to skip.

When saving an entry, include what it represents, when it was added, and how future work should use it. Give copied images descriptive filenames. The source supplied in the current request always overrides saved defaults. A saved share target is only a suggestion: `share.md` still confirms the target and its visibility each time.
