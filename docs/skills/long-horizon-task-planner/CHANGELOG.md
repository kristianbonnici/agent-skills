# long-horizon-task-planner changelog

## 1.1.0 (2026-11-22)

- **Antigravity is now an explicit execution target under host-specific controls** (checked 2026-11-22 against `agy` 1.5.14, T3 Code's live Antigravity capability catalog, and Antigravity ACP runtime metadata): planners inspect the live catalog (`agy models` on CLI or the host's model catalog in T3) for selectable models and each model's advertised reasoning/thought controls (`thought_level` in T3; model-name level suffixes or `--effort` on `agy` CLI), recommend Antigravity's orchestrator models only when multi-file or multi-step delegation materially helps, and check persistent-execution support by surface—verifying `/goal` live on Antigravity's own chat UI, or emitting a plain task prompt with explicit stopping conditions and validation commands on ACP/T3, headless `agy -p`, or unverified surfaces while disclosing that unattended persistence depends on an outer host if one is used (such as `long-horizon-orchestrator` in T3). Deferred candidates in `references/task-packet-format.md` now bar any runnable prompt, not only `/goal` prompts, matching `SKILL.md`.

## 1.0.1 (2026-10-30)

- Safe diagnostics change nothing outside the project either (no databases, containers or services), and a check longer than a minute or two becomes a candidate's validation instead of running during planning; the skill and its reference had disagreed (first review, OpenCode DeepSeek V4.1 Flash, 2026-10-30).

## 1.0.0 (2026-10-30)

- First versioned release: the skill as it stood on 2026-10-30. Earlier history is in `git log -- skills/long-horizon-task-planner`.
