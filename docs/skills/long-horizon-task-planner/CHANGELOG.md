# long-horizon-task-planner changelog

## 1.1.0 (2026-11-22)

- **Antigravity is now an explicit execution target under host-specific controls:** planners inspect the live capability catalog (`agy models` on CLI, or the host's model catalog in T3) for selectable models and reasoning/thought levels (`thought_level` in T3, level suffix on `agy` CLI), recommend Antigravity's orchestrator models only when multi-file or multi-step delegation materially helps, and emit a plain task prompt with explicit stopping conditions and validation commands instead of `/goal`, disclosing that unattended persistence is handled by the outer host (such as `long-horizon-orchestrator` in T3). Added so tasks planned for Antigravity get accurate launch controls without falling through to unverified-host handling or emitting unsupported `/goal` directives.

## 1.0.1 (2026-10-30)

- Safe diagnostics change nothing outside the project either (no databases, containers or services), and a check longer than a minute or two becomes a candidate's validation instead of running during planning; the skill and its reference had disagreed (first review, OpenCode DeepSeek V4.1 Flash, 2026-10-30).

## 1.0.0 (2026-10-30)

- First versioned release: the skill as it stood on 2026-10-30. Earlier history is in `git log -- skills/long-horizon-task-planner`.
