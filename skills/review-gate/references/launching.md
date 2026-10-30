# Launching reviewers

Launch every reviewer of a round at once, read-only, with the brief from [reviewer-brief.md](reviewer-brief.md) as its whole message. Allow a paid reviewer 30 minutes and a free one 15; one that hasn't answered by then counts as limited (SKILL.md, section 2). Stop a reviewer that timed out before you launch its replacement.

## In T3

`delegate_task` with role `"review"`, one call per reviewer. Reviewers started this way aren't bound to your worktree, so the brief names its path.

- **One reviewer:** mode `"wait"` with `timeoutMs` (1800000 for a paid reviewer, 900000 for a free one).
- **Several:** launch all but the round's main paid reviewer with mode `"async"`, then the main one with mode `"wait"` and its `timeoutMs`; that wait is your deadline. When it returns, read each async reviewer's result if it has finished (its completion also wakes you). Look once with `task_status` at any still running past its own time, and stop it with `task_cancel` if it hasn't finished, counting it as limited. Don't poll between those times.
- **A wait that times out** (`waitTimedOut`) doesn't stop the reviewer: stop it with `task_cancel` before you launch its replacement.

| Reviewer | target |
|---|---|
| Codex GPT-6.1 Terra | `{providerInstanceId: "codex", model: "gpt-6.1-terra", options: [{id: "reasoningEffort", value: "high"}]}` |
| Claude Sonnet 5.5 | `{providerInstanceId: "claudeAgent", model: "claude-sonnet-5-5", options: [{id: "effort", value: "high"}]}` |
| Claude Opus 5.5 | `{providerInstanceId: "claudeAgent", model: "claude-opus-5-5", options: [{id: "effort", value: "high"}]}` |
| DeepSeek V4.1 Flash (free) | `{providerInstanceId: "opencode", model: "opencode/deepseek-v4.1-flash-free", options: [{id: "variant", value: "high"}]}` |
| GLM-5.3 Flash (free) | `{providerInstanceId: "opencode", model: "opencode/glm-5.3-flash-free", options: [{id: "variant", value: "high"}]}` |
| GPT-6 Luna (trial) | `{providerInstanceId: "codex", model: "gpt-6-luna", options: [{id: "reasoningEffort", value: "high"}]}` |
| Claude Haiku 5.5 (trial) | `{providerInstanceId: "claudeAgent", model: "claude-haiku-5-5", options: [{id: "effort", value: "high"}]}` |

A reviewer that is limited shows it in its result or its thread: a quota or rate-limit error, "Free usage limit reached", or "Upstream request failed".

## In Claude Code without T3

- **Claude reviewers:** the `Agent` tool, `model: "opus"`, `"sonnet"` or `"haiku"`, a general-purpose agent, run in the background so they work in parallel.
- **GPT-6 Luna (trial):** the Codex command below with `-m gpt-6-luna`.
- **Codex Terra:** a background Bash command from the worktree:

  ```sh
  codex exec --sandbox read-only --ephemeral -m gpt-6.1-terra -c model_reasoning_effort="high" -C <worktree> "<brief>"
  ```

- **Free reviewers:** a background Bash command from the worktree, with OpenCode's `plan` agent, which doesn't edit:

  ```sh
  cd <worktree> && opencode run --agent plan -m 'opencode/deepseek-v4.1-flash-free#high' "<brief>"
  ```

  (GLM: `opencode/glm-5.3-flash-free#high`.)

## In Codex without T3

- **Codex Terra:** `spawn_agent` with model `gpt-6.1-terra` at high reasoning, told it is read-only.
- **Claude reviewers:** a background command:

  ```sh
  claude -p --model claude-sonnet-5-5 --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git log:*),Bash(git show:*)" "<brief>"
  ```

  (or `claude-opus-5-5`), run from the worktree.
- **Free reviewers:** the OpenCode command above.

If a host can't launch a reviewer of the family the level needs, use the next option from SKILL.md, section 2, and record why.
