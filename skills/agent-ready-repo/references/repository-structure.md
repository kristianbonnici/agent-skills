# Repository structure patterns

Use these as worked arrangements of responsibilities, not mandatory directory templates. Preserve ecosystem conventions and functioning layouts. Select the smallest shape that supports the intended work; a large repository may already provide these capabilities under different names.

## Select a shape

| Shape | Use when | Add only when needed |
|---|---|---|
| Small repository | One main change surface, straightforward commands, little persistent task state | An architecture note for non-obvious boundaries; a durable plan for work spanning sessions |
| Growing application | Several domains, cross-component changes, decisions and long-running work that are difficult to rediscover | Indexed specs and decisions, active/completed plans, runtime runbooks, generated references |
| Monorepo | Packages have different commands or constraints and shared interfaces need ownership | Scoped entry instructions, package-local guidance, integration checks and workspace-level coordination |

An existing repository adopts a shape by mapping and filling gaps, not by relocating source code to match a diagram. These examples use familiar filenames; equivalent established locations are preferable to duplicates. Do not create empty folders or placeholder policies to make a tree look complete.

## Small repository: a short route to useful work

```text
README.md            # purpose, supported usage, human quick start
AGENTS.md            # unusual working rules and links to relevant commands
package manifest     # native dependencies and named operations
lockfile             # where supported by the chosen ecosystem
src/                 # or the language's conventional package directory
tests/               # or colocated tests
```

A small library may need nothing more. Use a README section for a simple architecture explanation; split it only when readers need a separate map. Use the existing package/task runner for setup and checks instead of adding `init.sh` plus `Makefile` plus a second verification script. A document or asset repository substitutes its real sources and validation workflow for `src/` and application tests.

Example discovery route: `AGENTS.md` identifies a compatibility constraint and the existing check command; the README explains installation; the manifest defines the operation. Each fact has one maintained home.

## Growing application: separate durable knowledge from work in progress

```text
AGENTS.md
ARCHITECTURE.md
docs/
  index.md
  development.md               # supported setup, check, debug, restart paths
  product-specs/               # intended behavior and acceptance criteria
  decisions/                   # rationale, status, supersession
  plans/
    active/                    # current execution plans, when repo policy permits
    completed/                 # historical results and decisions
  reliability.md               # important journeys, failure signals, diagnosis
  generated/                   # inspectable derived schemas or API descriptions
  references/                  # curated dependency/standard references with versions
src/
tests/
```

Split only the roles that need independent navigation. Reuse an existing `docs/adr`, `design-docs`, or `exec-plans` convention. A separate product-principles, frontend, security, quality, or plan-policy document is useful only when that subject has real decisions or workflows to record. Do not overwrite the repository's existing security reporting policy with agent instructions.

In `ARCHITECTURE.md`, explain the system's purpose, domain responsibilities, important entrypoints, allowed dependencies, forbidden dependencies, and cross-cutting interfaces. Include a concrete change route: for example, an export-format change belongs in the export domain, while filesystem access belongs behind its storage adapter. Keep implementation details next to code and avoid maintaining an exhaustive symbol inventory.

Retain the project's layering. If boundaries need clarification, write the allowed import direction explicitly: for example, `UI imports application; application imports domain interfaces; adapters implement those interfaces`. Do not copy an ambiguous arrow diagram or impose an article's six-layer architecture. Promote stable, consequential boundaries into the existing linter or a structural test; verify both a valid dependency and a forbidden dependency.

## Monorepo: shared rules at the root, package details near their owners

```text
AGENTS.md                         # shared invariants and package routing
workspace manifest / task runner
docs/architecture.md              # package relationships and shared interfaces
apps/
  web/
    AGENTS.md                     # only genuinely web-specific guidance
    package manifest
services/
  api/
    AGENTS.md                     # service-specific commands and constraints
    package manifest
packages/
  contracts/                      # shared interfaces with a named owner
tests/integration/                # cross-package behavior, if applicable
```

This layout does not prescribe separate deployables or an `apps/` directory. Map the actual packages. Root guidance should identify the relevant package and shared gates; local guidance should supply command working directories, fixtures, and exceptions. A web task should not need to load every service runbook. Explain intentional exceptions rather than writing apparently contradictory universal rules.

Check host instruction discovery before depending on nested files. Link ordinary docs with a "read when" condition; a link makes material discoverable, not automatically loaded. Define who owns shared schemas, root configuration, generated clients, and lockfiles before recommending concurrent changes. Retest the affected integration path when package boundaries change.

## Artifact responsibilities and lifecycle

| Artifact | What belongs here | How it stays useful |
|---|---|---|
| Entry instructions | Non-obvious working constraints, exact command pointers, conditional routing | Update when a working rule changes; remove duplicate facts |
| Architecture | Stable responsibility map, boundaries, change routes | Update with structural decisions; keep detail near implementation |
| Product spec | Intended observable behavior, exceptions, acceptance | Record approved behavior changes; do not rewrite it to excuse a defect |
| Decision record | Decision, reason, alternatives that matter, status | Mark proposed/accepted/superseded; preserve why an old choice existed |
| Active plan | Outcome, scope, current step, evidence, blockers | Update at meaningful transitions; archive completed plans out of the startup path |
| Generated reference | Derived interface/schema plus source and generation command | Regenerate from its source; never silently hand-edit derived truth |
| External reference | Source URL, relevant version, applicability | Refresh when the consuming dependency or rule changes |
| Quality/debt record | Specific gap, evidence, owner or next trigger | Use when a backlog already needs coordination; retain uncertainty and avoid invented grades |

Follow repository policy for task-state storage. When mutable plans cannot be tracked, use its approved external store and document how subsequent sessions find it. External systems remain authoritative when that is the team's workflow; retain stable identifiers and concise approved context, not private transcripts or a competing tracker.

## Adoption and maintenance

1. Map existing artifacts to the responsibilities above and identify actual gaps or conflicts.
2. Choose the target discovery path and show the proposed layout only where it changes. Include what is retained, moved, merged, or newly added, and why.
3. In apply mode, update inbound links and consumers together with moves. Keep generated-source ownership intact. Separate structural cleanup from unrelated product refactoring.
4. Test entrypoint-to-document routes, documented commands, and relevant boundaries. Check that completed plans and historical decisions cannot be mistaken for current instructions.
5. Assign an update trigger or existing owner to material that will drift. Remove stale duplication once callers have migrated; do not leave two current sources of truth.

Acceptance is practical: a fresh session can locate the project's purpose, the right change surface, startup and verification operations, and current work without relying on this conversation. An author walkthrough verifies the routes; only a genuinely new session tests independent discovery.
