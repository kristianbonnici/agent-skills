# Agent Skills

Canonical, version-controlled source for personal agent skills and the adapters that install them into supported hosts.

The repository owns skill behavior, host mappings, dependency pins, and verification. Paths under `~/.config/opencode`, `~/.factory`, `~/.agents`, `~/.codex`, `~/.antigravity`, and `~/.gemini` are generated installation targets.

## New-machine setup

Clone the repository at any path, then run:

```bash
./scripts/bootstrap --all
./scripts/doctor --all
```

The scripts resolve the repository root relative to themselves. They do not depend on a username or a fixed `~/Developer` location.

Install one host only:

```bash
./scripts/bootstrap --host opencode
./scripts/bootstrap --host factory
```

Preview changes without writing:

```bash
./scripts/bootstrap --all --dry-run
```

Bootstrap is idempotent. It repairs managed symlinks but refuses to overwrite real files or directories it does not own.

## Repository layout

```text
agent-skills/
├── skills/                 Canonical host-neutral skills
├── adapters/               Host-specific commands or metadata
├── install/links.tsv       Declarative source-to-host mapping
├── runtime/                Pinned shared tool dependencies
├── scripts/                Bootstrap, doctor, uninstall, upstream checks
└── tests/                  Disposable-home integration tests
```

## Available skills

| Skill | Installed into | Purpose |
|---|---|---|
| `long-horizon-task-planner` | Codex user locations | Propose maturity-aware autonomous task portfolios with calibrated workloads and safe parallel plans. |
| `narrated-markdown-reader` | Codex user locations | Create and archive synchronized audio read-throughs for Markdown files. |
| `product-design` | OpenCode, Factory, and Google Antigravity | Research, audit, ideate, prototype, visually QA, and share product experiences. |

The Product Design compatibility skill is deliberately not linked into `~/.agents/skills` or `~/.codex/skills`. Codex should continue using OpenAI's installed Product Design plugin without a semantically competing personal copy.

## Product Design invocation

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

OpenCode uses the checked-in command adapter at `adapters/opencode/commands/product-design.md`. Factory exposes the canonical skill as a slash command directly. Antigravity discovers the skill from its global `~/.gemini/config/skills/` location and can activate it from an explicit mention or matching request.

Both hosts use a repository-pinned Playwright CLI runtime and isolated in-memory browser sessions. Reinstall only the runtime dependencies with:

```bash
./scripts/bootstrap --dependencies
```

Mutable Product Design context is shared between compatible hosts at:

```text
${XDG_STATE_HOME:-$HOME/.local/state}/agent-skills/product-design/
```

That state is intentionally outside Git. The repository reproduces behavior and wiring, not private screenshots, URLs, or product context.

## Maintenance

Edit canonical files under `skills/` and commit them here. Do not edit installed symlink targets.

Run the local checks before committing:

```bash
./tests/bootstrap-test
./scripts/doctor --all
```

Check whether the upstream Product Design behavioral reference changed:

```bash
./scripts/check-product-design-upstream
```

The portable workflow is independently written. The upstream checker is review-only and never copies or overwrites files automatically.

Remove managed links without touching unrelated files:

```bash
./scripts/uninstall --all
```
