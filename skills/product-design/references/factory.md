# Factory Droid adapter

Invoke this workflow as `/product-design` or through matching natural language.

- Use Droid's available file, shell, search, and image-inspection tools.
- Use `scripts/browser` for isolated browser capture so behavior matches OpenCode.
- Keep work in the current session unless the user explicitly requests a separate Droid or mission.
- Treat `allowed-tools` metadata as documentation, not a security boundary.
- If an unavailable connector is named, state the gap and offer the portable fallback. Do not invent tool calls.
