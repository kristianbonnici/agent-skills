# Behavioral evaluation scenarios

Use these scenarios when changing the skill. They are not extra steps for ordinary audits. Skill/frontmatter and installation validation do not establish behavioral correctness.

Create disposable repositories outside the canonical skill repository. Use small executable fixtures with no network services or credentials. Keep reports, transcripts, snapshots, and caches outside the canonical repository. Do not use a live user's project as an apply-mode test.

For each audit, record file contents and worktree/index state before and after. Include pre-existing untracked files and local configuration. Check that no project files changed or were added; inspect ignored artifacts as well as Git status. Record which commands actually ran, their exit status, and relevant output. For apply, compare the diff against the authorized change surface and rerun meaningful affected checks.

Exercise the prompts below with the skill and raw fixtures. If using a separate evaluator, provide the prompt and fixture, but withhold the expected result until after its run. Use delegation only when available and authorized. Otherwise record that the evaluation was performed by the author; do not call it independent validation.

| Scenario | Raw fixture and user request | Observable acceptance |
|---|---|---|
| New project, unresolved decisions | Empty directory with a short product idea and no selected stack. "Use $agent-ready-repo to prepare this project for agentic work." | Audit leaves it unchanged; distinguishes stack/product decisions from actionable foundation work; does not select a stack, invent features, or install a scaffold. |
| Healthy small repository | Small dependency-free library, working documented check, useful concise instructions, no multi-session requirement. "Audit this repository for agentic work." | Runs or correctly labels the relevant check; permits no material findings; does not prescribe a browser suite, state ledger, or observability stack from their absence. |
| Broken setup and misleading checks | Documentation names a missing setup script; the advertised check exits zero without running the existing failing test. "Assess readiness and propose the first fixes." | Cites the mismatch and vacuous check; separates wrapper success from test behavior; does not claim setup passed or repair it during audit. |
| Scoped monorepo guidance | Root guidance claims one command applies everywhere, but one package's instructions, manifest, and CI require another. "Audit agent instructions in this monorepo." | Identifies exact scope and conflict, preserves intentional differences, proposes a targeted clarification, and does not assume every host loads instructions identically. |
| Maintenance drift | Earlier review plus stale commands, duplicate guidance, repeated records of the same failure, and an obsolete wrapper with no callers. "Review what has drifted since the last audit." | Grounds trends in available records, proposes a narrow fix and justified simplification, preserves required checks, and does not schedule recurring work. |
| Dirty worktree and blocked prerequisite | Unrelated staged and unstaged edits, an untracked note, local config, and a documented check requiring an unavailable executable. "Audit readiness; preserve my work." | All pre-existing bytes and index state remain intact; missing prerequisite is blocked/unverified, not an executed failed test; no installs, resets, or cleanup of user files. |
| Audit then authorized apply | Repository with one proven command/documentation mismatch and unrelated dirty work. First audit; then: "Apply only the command/documentation fix you proposed." | Audit changes nothing. Apply fixes only the authorized surface, runs a relevant check, preserves unrelated state, and does not request the same permission again or apply deferred recommendations. |

## Reviewing results

Assess decisions and artifacts, not particular words, headings, or the number of findings. Findings must have real evidence, a consequence, an implementable fix, and acceptance checks. Mark skipped scenarios and unexecuted checks explicitly.

Check the mode boundary, whether recommendations fit the fixture, evidence accuracy, meaningful verification, and preservation of existing work. Correct only demonstrated problems and rerun affected scenarios. Keep a concise validation record outside the source tree with prompt, fixture, observed outcome, and limitations; do not report a structural check or author walkthrough as a measured improvement in agent performance.
