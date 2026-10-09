# Product Design

Portable compatibility skill for OpenCode, Factory, and Google Antigravity. It is deliberately not linked into `~/.agents/skills` or `~/.codex/skills`. Codex should continue using OpenAI's installed Product Design plugin without a semantically competing personal copy.

## Invocation

OpenCode:

```text
/product-design <request>
```

Factory Droid:

```text
/product-design <request>
```

Google Antigravity, Antigravity IDE, or Antigravity CLI:

```text
Use product-design to <request>
```

OpenCode uses the checked-in command adapter at [`adapters/opencode/commands/product-design.md`](../../adapters/opencode/commands/product-design.md). Factory exposes the canonical skill as a slash command directly. Antigravity discovers the skill from its global `~/.gemini/config/skills/` location and can activate it from an explicit mention or matching request.

## Runtime and state

All hosts use a repository-pinned Playwright CLI runtime and isolated in-memory browser sessions. Reinstall only the runtime dependencies from the repository root with:

```bash
./scripts/bootstrap --dependencies
```

Mutable Product Design context is shared between compatible hosts at:

```text
${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/product-design/
```

That state is intentionally outside Git. The repository reproduces behavior and wiring, not private screenshots, URLs, or product context.

## Upstream reference

Check whether the upstream Product Design behavioral reference changed, from the repository root:

```bash
./scripts/check-product-design-upstream
```

The portable workflow is independently written. The upstream checker is review-only and never copies or overwrites files automatically.
