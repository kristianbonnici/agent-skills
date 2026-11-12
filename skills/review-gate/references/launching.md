# Launching reviewers

Launch every reviewer of a round at once, read-only, with the brief from [reviewer-brief.md](reviewer-brief.md) as its whole message. Then follow each reviewer's checkpoints until every one has reported or been stopped:

- **Its deadline:** 30 minutes after its launch for a paid reviewer, 15 for a free or trial one (each model a free reviewer tries gets its own 15). One still running then is limited (SKILL.md, section 2). Its brief gives a free or trial reviewer 12 minutes and about 20 commands, so it reports before its deadline.
- **Its pace check,** for a free or trial reviewer launched through T3, the one host that shows when each of its steps happened: 5 minutes after its launch, look at its activity (the commands it ran, the files it read, its messages). Activity a few seconds apart is one turn of the model. No turn yet, or turns typically more than a minute apart, means it won't finish in its time: it is limited then. A healthy reviewer takes a turn every few seconds to half a minute; a provider too slow to finish takes a minute or more for each.
- **Time comes from the launch:** the time left to a checkpoint is launch time + allowance − now, with the launch time read from the host (in T3, the thread's `createdAt` from `t3_thread_read`), never carried from memory.
- **A limited reviewer** is stopped before anything replaces it. A free reviewer's next model in the order launches then, with checkpoints of its own; a trial reviewer is dropped, never replaced; a paid one is replaced as SKILL.md, section 2 says.

## Before a Go model or Hydrogen

The Go targets below and Muse draw on the owner's OpenCode Go plan, and Gemini 4 Hydrogen on Antigravity's Gemini windows, which the run's helpers share, so read those windows first. It spends nothing and takes a second (Antigravity's reading a few):

```sh
<skills folder>/long-horizon-orchestrator/scripts/provider-usage --only opencode_go
<skills folder>/long-horizon-orchestrator/scripts/provider-usage --only antigravity
```

`<skills folder>` is the folder above this skill's. Go counts as limited when any `used_percent` under `providers.opencode_go.windows` is past about 85 (SKILL.md, section 2); Hydrogen when `gemini_models_five_hour` under `providers.antigravity.windows` is. If the script is missing, or its report has no windows for that provider (an `error`, or no entry at all), launch anyway: a limit stops the model with a quota error.

## In T3

`delegate_task` with role `"review"`, one call per reviewer, and `interactionMode: "plan"` for every OpenCode reviewer (free, Go and Muse) and for Hydrogen. On OpenCode that runs its read-only `plan` agent instead of `build`, which can edit; on Antigravity it tells the agent to stay read-only, an instruction rather than a guard (in a probe on 2026-11-13 Hydrogen refused a write that way and still ran `git log` and `git diff`). Reviewers started this way aren't bound to your worktree, so the brief names its path.

Launch every reviewer, a single one too, with mode `"async"`. Then, until each has reported or been stopped:

- **Wait for the next checkpoint:** `t3_thread_wait` on the thread of the reviewer whose checkpoint comes first, with `timeoutMs` set to the time left to it. A wait that returns early because that reviewer finished: read its result and wait for the next checkpoint. Don't poll with `task_status` in between.
- **At a pace check:** `t3_thread_read` the reviewer's thread with `view: "activity"`; each item has its time (`updatedAt`). Judge its pace as above.
- **At a deadline, or a limited pace:** stop the reviewer with `task_cancel` (a wait that times out doesn't stop it), then launch what replaces it, if anything does.

| Reviewer | target |
|---|---|
| Codex GPT-6.1 Terra | `{providerInstanceId: "codex", model: "gpt-6.1-terra", options: [{id: "reasoningEffort", value: "high"}]}` |
| Claude Sonnet 5.5 | `{providerInstanceId: "claudeAgent", model: "claude-sonnet-5-5", options: [{id: "effort", value: "high"}]}` |
| Claude Opus 5.5 | `{providerInstanceId: "claudeAgent", model: "claude-opus-5-5", options: [{id: "effort", value: "high"}]}` |
| DeepSeek V4.1 Flash (free) | `{providerInstanceId: "opencode", model: "opencode/deepseek-v4.1-flash-free", options: [{id: "variant", value: "high"}]}` |
| GLM-5.3 Flash (free) | `{providerInstanceId: "opencode", model: "opencode/glm-5.3-flash-free", options: [{id: "variant", value: "high"}]}` |
| DeepSeek V4.1 Flash (Go) | `{providerInstanceId: "opencode", model: "opencode-go/deepseek-v4.1-flash", options: [{id: "variant", value: "high"}]}` |
| GLM-5.3 Flash (Go) | `{providerInstanceId: "opencode", model: "opencode-go/glm-5.3-flash", options: [{id: "variant", value: "high"}]}` |
| GPT-6 Luna (trial) | `{providerInstanceId: "codex", model: "gpt-6-luna", options: [{id: "reasoningEffort", value: "high"}]}` |
| Claude Haiku 5.5 (trial) | `{providerInstanceId: "claudeAgent", model: "claude-haiku-5-5", options: [{id: "effort", value: "high"}]}` |
| Muse Spark 1.3 Contributor (trial) | `{providerInstanceId: "opencode", model: "opencode-go/muse-spark-1.3-contributor", options: [{id: "variant", value: "high"}]}` |
| Gemini 4 Hydrogen (trial) | `{providerInstanceId: "antigravity", model: "gemini-4-hydrogen-high"}` (the level is in the model's name; no options) |

A reviewer that is limited shows it in its result or its thread: a quota or rate-limit error, "Free usage limit reached", or "Upstream request failed". Muse also stops with "trains on request data" while the workspace blocks such models; treat that as limited.

The Go targets start with `opencode-go/`. `opencode/deepseek-v4.1-flash`, without `-free`, is a different model that bills per request, and so is `opencode/gemini-4-hydrogen`: Hydrogen goes through Antigravity only.

## In Claude Code without T3

A subagent can't launch agents of its own: there, use the command-line forms for every reviewer, Claude's too (`claude -p`, as under "In Codex without T3"). Here, and in Codex without T3, a free or trial reviewer gets its deadline only, with no pace check: a background command's output and a subagent's progress carry no times to judge its pace by. Note each reviewer's launch time for its deadline. From the main session:

- **Claude reviewers:** the `Agent` tool, `model: "opus"`, `"sonnet"` or `"haiku"`, a general-purpose agent, run in the background so they work in parallel.
- **GPT-6 Luna (trial):** the Codex command below with `-m gpt-6-luna`.
- **Muse Spark (trial):** the OpenCode command below with `-m 'opencode-go/muse-spark-1.3-contributor#high'`.
- **Gemini 4 Hydrogen (trial):** a background Bash command from the worktree, in Antigravity's `plan` mode, which doesn't edit files but runs read-only commands such as `git diff`. `-p` takes the next word as the prompt, so put it last:

  ```sh
  cd <worktree> && agy --mode plan --model gemini-4-hydrogen-high --print-timeout 15m -p "<brief>"
  ```
- **Codex Terra:** a background Bash command from the worktree:

  ```sh
  codex exec --sandbox read-only --ephemeral -m gpt-6.1-terra -c model_reasoning_effort="high" -C <worktree> "<brief>"
  ```

- **Free reviewers:** a background Bash command from the worktree, with OpenCode's `plan` agent, which doesn't edit:

  ```sh
  cd <worktree> && opencode run --agent plan -m 'opencode/deepseek-v4.1-flash-free#high' "<brief>"
  ```

  (GLM: `opencode/glm-5.3-flash-free#high`. On Go: `opencode-go/deepseek-v4.1-flash#high`, `opencode-go/glm-5.3-flash#high`.)

## In Codex without T3

- **Codex Terra:** `spawn_agent` with model `gpt-6.1-terra` at high reasoning, told it is read-only.
- **Claude reviewers:** a background command:

  ```sh
  claude -p --model claude-sonnet-5-5 --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git log:*),Bash(git show:*)" "<brief>"
  ```

  (or `claude-opus-5-5`), run from the worktree.
- **Free reviewers and Muse Spark (trial):** the OpenCode command above.
- **Gemini 4 Hydrogen (trial):** the `agy` command above.

If a host can't launch a reviewer of the family the level needs, use the next option from SKILL.md, section 2, and record why.
