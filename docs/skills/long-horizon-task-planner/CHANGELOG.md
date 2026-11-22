# long-horizon-task-planner changelog

## 1.1.0 (2026-11-22)

- **Antigravity is now an explicit execution target under host-specific controls** (checked 2026-11-22 against `agy` 1.5.14 and the public Antigravity CLI reference): planners inspect the live catalog (`agy models` on CLI or the host's model catalog in T3) for selectable models and each model's advertised reasoning/thought controls (`thought_level` in T3; model-name level suffixes or `--effort` on `agy` CLI), recommend Antigravity's orchestrator models only when multi-file or multi-step delegation materially helps, and use `/goal` only when the live session lists it with verified syntax—otherwise emitting a plain task prompt with explicit stopping conditions and validation commands while disclosing that unattended persistence is unverified or depends on an outer host if one is used (such as `long-horizon-orchestrator` in T3). Deferred candidates in `references/task-packet-format.md` now bar any runnable prompt, not only `/goal` prompts, matching `SKILL.md`.
- **Review (Light, 2 rounds, blockers 1, 0):** Antigravity Claude Sonnet 5.5 at high caught the unverified flat "no `/goal`" claim across Antigravity surfaces, hard-coded `thought_level` values, non-public/missing source citations, and unconditional outer-host wording; all fixed.

## 1.0.1 (2026-10-30)

- Safe diagnostics change nothing outside the project either (no databases, containers or services), and a check longer than a minute or two becomes a candidate's validation instead of running during planning; the skill and its reference had disagreed (first review, OpenCode DeepSeek V4.1 Flash, 2026-10-30).

## 1.0.0 (2026-10-30)

- First versioned release: the skill as it stood on 2026-10-30. Earlier history is in `git log -- skills/long-horizon-task-planner`.
