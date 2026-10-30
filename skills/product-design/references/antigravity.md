# Google Antigravity adapter

Use the canonical global skill, installed in two places that point at the same source: `~/.gemini/config/skills/product-design` for Antigravity and Antigravity IDE, and `~/.gemini/antigravity-cli/skills/product-design` for Antigravity CLI. Each host reads only its own folder.

- Invoke it by explicitly mentioning `product-design`, or let Antigravity activate it when the request matches the skill description.
- Use the active workspace and current agent session; do not create a separate agent unless the user requests one.
- Run bundled scripts with `--help` before first use when the command is unfamiliar.
- Use `scripts/browser` (by absolute path from the skill folder, as `SKILL.md` says) for isolated browser capture so behavior and evidence match OpenCode and Factory.
- Do not use Antigravity's Chrome-debugging browser unless the user explicitly selects it or needs an existing authenticated Chrome session.
- Respect Antigravity's normal permission prompts for shell commands and access outside the workspace. Do not broaden permissions or edit global permission settings automatically.
- If a named connector or deployment target is unavailable, state the gap and offer the portable fallback.
