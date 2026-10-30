# Agent Skills

Canonical, version-controlled source for personal agent skills and the adapters that install them into supported hosts.

The repository owns skill behavior, host mappings, dependency pins, and verification. Paths under `~/.config/opencode`, `~/.factory`, `~/.agents`, `~/.codex`, `~/.claude/skills`, `~/.antigravity`, and `~/.gemini` are generated installation targets.

## New-machine setup

Clone the repository at any path, then run:

```bash
./scripts/bootstrap --all
./scripts/doctor --all
```

The scripts resolve the repository root relative to themselves. They do not depend on a username or a fixed `~/Developer` location.

Install one host only:

```bash
./scripts/bootstrap --host claude
./scripts/bootstrap --host codex
```

Preview changes without writing:

```bash
./scripts/bootstrap --all --dry-run
```

Bootstrap is idempotent. It repairs managed symlinks but refuses to overwrite real files or directories it does not own.

### Private state

Skills keep per-owner facts, such as the orchestrator's provider profile, in
`${XDG_STATE_HOME:-~/.local/state}/agent-skills/<skill>/`, outside this public
repository. To carry them between computers, keep them in a private git
repository cloned next to this one as `agent-skills-state` (or set
`AGENT_SKILLS_STATE` to its path). Bootstrap links each `<skill>/<file>` in it
into the state folder, and doctor checks the links. Without that repository,
the files simply stay local.

## Repository layout

```text
agent-skills/
├── skills/                 Canonical host-neutral skills
├── adapters/               Host-specific commands or metadata
├── install/links.tsv       Declarative source-to-host mapping
├── docs/                   Versioning rules; each skill's changelog, flow and evidence
├── runtime/                Pinned shared tool dependencies
├── scripts/                Bootstrap, doctor, uninstall, upstream checks
└── tests/                  Disposable-home integration tests
```

## Available skills

Each skill's version is in its `SKILL.md`; its changelog, and for some a flow diagram and the evidence behind it, are in `docs/skills/<skill>/`.

| Skill | Installed into | Purpose |
|---|---|---|
| `long-horizon-task-planner` | Codex user locations | Propose maturity-aware autonomous task portfolios with calibrated workloads and safe parallel plans. |
| `long-horizon-orchestrator` | Codex and Claude Code user locations | Run approved long tasks as separate agents (T3 threads on any provider, or native subagents), get woken when they finish, route by capacity and strengths, merge reviewed work, and report in plain language with a run diagram. |
| `review-gate` | Codex and Claude Code user locations | Have a finished change reviewed by agents of other model families before it merges, at a level set by what the diff touches, with every finding verified. See its [flow](docs/skills/review-gate/README.md). |
| `agent-ready-repo` | Codex user locations | Audit agent readiness for new, existing, and maintained repositories; apply improvements when explicitly requested. |
| `remote-session-reporting` | Codex and Claude Code user locations | Show results in chat (screenshots, pasted text, check summaries) while the user follows a session remotely. |
| `product-design` | OpenCode, Factory, and Google Antigravity | Research, audit, ideate, prototype, visually QA, and share product experiences. See its [README](skills/product-design/README.md). |

## Maintenance

Edit canonical files under `skills/` and commit them here. Do not edit installed symlink targets.

Run the local checks before committing:

```bash
./tests/bootstrap-test
./tests/skill-versions-test
./scripts/doctor --all
```

Each change to a skill raises its version and adds a changelog entry ([docs/VERSIONING.md](docs/VERSIONING.md)).

Remove managed links without touching unrelated files:

```bash
./scripts/uninstall --all
```
