# OpenCode adapter

Use OpenCode's current primary session. `/product-design` is a prompt adapter, not a subagent.

- Load this skill through OpenCode's `skill` tool before acting.
- Use shell, file, web-search, and image-inspection capabilities exposed by the active agent.
- Use `scripts/browser` for isolated browser capture. Do not attach to the user's Chrome profile unless they explicitly request it.
- Render local screenshots and file links in the format supported by the current OpenCode client.
- If an unavailable connector is named, state the gap and offer the portable fallback. Do not invent tool calls.
