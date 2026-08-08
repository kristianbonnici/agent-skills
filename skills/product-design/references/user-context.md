# Saved Product Design context

Use this workflow for setup, remembering sources, or explaining what Product Design knows.

## Storage

The shared state root is:

```text
${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/product-design/
```

`user-context.md` stores curated text and links. `assets/` stores user-approved reference images. Never save secrets, credentials, tokens, copied customer data, or unsupported claims.

## Commands

```bash
python3 scripts/manage_context.py preflight
python3 scripts/manage_context.py init
python3 scripts/manage_context.py show
```

For first-time setup, explain that Product Design can remember product URLs, screenshots, codebase paths, component docs, design-system sources, brand assets, browser preferences, and share targets. Ask for useful sources or allow the user to skip.

When saving an entry, include what it represents, when it was added, and how future work should use it. Give copied images descriptive filenames. The source supplied in the current request always overrides saved defaults.
