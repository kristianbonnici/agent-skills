# Launching reviewers

Launch every reviewer of a round at once, read-only, with the brief from [reviewer-brief.md](reviewer-brief.md) as its whole message. Then follow each reviewer's checkpoints until every one has reported or been stopped:

- **Its deadline:** 30 minutes after its launch for a paid reviewer, 15 for a free reviewer, Hydrogen or Haiku (each model a free reviewer tries gets its own 15). One still running then is limited (SKILL.md, section 2). Its brief gives such a reviewer 12 minutes and about 20 commands, so it reports before its deadline.
- **Its pace check,** for a free reviewer, Hydrogen or Haiku launched through T3, the one host that shows when each of its steps happened: 5 minutes after its launch, look at its activity (the commands it ran, the files it read, its messages). Activity a few seconds apart is one turn of the model. No turn yet, or turns typically more than a minute apart, means it won't finish in its time: it is limited then. A healthy reviewer takes a turn every few seconds to half a minute; a provider too slow to finish takes a minute or more for each.
- **Time comes from the launch:** the time left to a checkpoint is launch time + allowance − now, with the launch time read from the host (in T3, the thread's `createdAt` from `t3_thread_read`), never carried from memory.
- **Its report** is saved when it arrives, whole and unedited, in the gate's record folder ([record.md](record.md)): from a reviewer launched through T3 or as a subagent, the text of its final message; from a command-line reviewer, the report in its output.
- **A question about a tag** (SKILL.md, section 4) launches as its reviewer does, with [the question](reviewer-brief.md#the-question-about-a-tag) as its whole message and a deadline of 10 minutes. One that is limited or late is stopped and recorded as `no answer`: nothing replaces it.
- **A limited reviewer** is stopped before anything replaces it. A free reviewer's next model in the order launches then, with checkpoints of its own; a limited Hydrogen is followed by the free order; a paid one, Neon among them, is replaced as SKILL.md, section 2 says.

## Before a Go model or an Antigravity reviewer

The Go targets below draw on the owner's OpenCode Go plan, and Antigravity reviewers draw on Antigravity's Gemini windows (Neon and Gemini 4 Hydrogen, shared with the run's helpers and the owner) or its separate `claude_and_gpt_models` bucket (Antigravity Claude Opus 5.5 and Sonnet 5.5), so read those windows first. It spends nothing and takes a second (Antigravity's reading a few):

```sh
<skills folder>/long-horizon-orchestrator/scripts/provider-usage --only opencode_go
<skills folder>/long-horizon-orchestrator/scripts/provider-usage --only antigravity
```

`<skills folder>` is the folder above this skill's. Go counts as limited when any `used_percent` under `providers.opencode_go.windows` is past about 85 (SKILL.md, section 2); Neon and Hydrogen (Light's reviewer) both count as limited when `gemini_models_five_hour` under `providers.antigravity.windows` is at or past about 85; Antigravity's Claude bucket is available when `providers.antigravity.windows` includes at least one `claude_and_gpt_models_*` window and every reported `claude_and_gpt_models_*` window is under about 80% (if none is present in a successful Antigravity report, or any reported one is at or past about 80%, fall back to `claudeAgent`). If the script is missing, or its report has an `error` or no entry for that provider: for Antigravity Claude, prefer `claudeAgent` unless `claudeAgent` is short (then launch Antigravity Claude and fail over on a quota error); for Go and Neon, launch anyway (a limit stops the model with a quota error); for Hydrogen as Light's reviewer, skip it and start the free order, since the 85% limit leaves room in the shared Gemini window.

## In T3

When `delegate_task`, `schedule_task`, `t3_thread_read` or any other T3 tool the gate uses (`t3_thread_wait`, `task_cancel`, `delete_scheduled_task`, `t3_thread_list`, `t3_thread_organize`) is missing from your tool list (after a context summary, say) and `T3_ACP_MCP_NODE` is set, you are still in T3: call each through `ELECTRON_RUN_AS_NODE=1 "$T3_ACP_MCP_NODE" ${T3_ACP_MCP_ENTRYPOINT:+"$T3_ACP_MCP_ENTRYPOINT"} acp-mcp-call <tool> '<its arguments as JSON>'`, with the same `clientRequestId` and `threads.txt` tracking, and never fall back to the command-line reviewers.

`delegate_task` with role `"review"`, one call per reviewer, and `interactionMode: "plan"` for every OpenCode reviewer (free and Go) and every Antigravity reviewer (Neon, Hydrogen, and Antigravity Claude Opus 5.5 / Sonnet 5.5). On OpenCode that runs its read-only `plan` agent instead of `build`, which can edit; on Antigravity it tells the agent to stay read-only, an instruction rather than a tool guard (in a probe on 2026-11-13 Hydrogen refused a write that way and still ran `git log` and `git diff`), so the read-only instructions and footer in [reviewer-brief.md](reviewer-brief.md) are mandatory for every Antigravity reviewer. Reviewers started this way aren't bound to your worktree, so the brief names its path.

When T3 can't open Antigravity (an Antigravity thread fails at once with "Provider session failed to open", or "no longer works with this T3 Code release": T3 has withdrawn the Antigravity runtime it installed), Antigravity reviewers are unavailable for this gate: Antigravity Claude falls back to `claudeAgent`, while Neon and Hydrogen use their limited replacements (SKILL.md, section 2), recorded under `skipped` with T3's error. Don't fall back to the `agy` command line in T3, whose rules forbid switching to a CLI unasked. Say in your report that the owner should update Antigravity in T3's provider settings.

Launch every reviewer, a single one too, with mode `"async"`. Before a round's first launch, and before any launch the gate waits on after that round's wake is gone (a question about a tag launched alone, Deep's second opinion, a look after a rebase), set a wake that doesn't depend on a reviewer finishing (and delete it if no reviewer launches), so a turn that ends anyway comes back to the checks below: `schedule_task({title: "<task or branch> review-gate wake", schedule: {type: "interval", everyMs: 600000}, bindToCurrentThread: true, clientRequestId: "<task or branch>-<record folder's name>-wake-<round, or the look's or question's name>-<n>", prompt: "Review-gate wake. If your review gate is still waiting on reviewers, go on with it as the review-gate skill's launching reference says for T3: check every running reviewer for an approval, then each checkpoint that is due. If the gate has ended, or you were told to stop or pause, delete this scheduled task if it still exists, and end the turn with one line."})`. The record folder's name keeps a later gate's wake apart from an earlier one's (`review`, `review-2`), and `<n>` counts the wakes set for the same round or launch (1, then 2 after a pause or a retry), since T3 may answer a repeated `clientRequestId` with the wake it already made. Write its `scheduledTaskId` to `wake.txt` in the record folder, so whoever stops your task can delete it. Delete it with `delete_scheduled_task` once every reviewer has reported or been stopped, before you go on to the findings, and empty `wake.txt`; a tick already queued behind your turn then ends with its one line. Then, until each has reported or been stopped:

- **Wait for the next checkpoint:** `t3_thread_wait` on the thread of the reviewer whose checkpoint comes first, with `timeoutMs` set to the time left to it, but no more than 5 minutes. A wait that returns early because that reviewer finished: read its result and wait for the next checkpoint. One that returns before any checkpoint is due only leads to the approval check below; then wait again for the time left. Keep your turn until every reviewer has reported or been stopped: a wait that returns a `next` telling you to end your turn doesn't end the gate. If your turn ends anyway (the host's instructions to follow `next` win), the wake above brings you back within 10 minutes; a reviewer stopped on an approval wakes nobody. Don't poll with `task_status` in between.
- **Each time a wait returns, check every running reviewer for an approval:** `t3_thread_read` its thread; a `pendingRequestCount` above 0, or "Subagent needs approval" in the thread, means it waits on a prompt nobody is there to answer, and a host can show that prompt on the owner's screen. Stop it with `task_cancel` at once and relaunch it once, with the same brief; its time restarts from the new launch, and the record lists the first launch under `skipped` with why "asked for approval, relaunched". One that asks again is limited (SKILL.md, section 2) and is replaced as a limited reviewer is; for a question about a tag, that is `no answer`, with nothing in its place.
- **At a pace check:** `t3_thread_read` the reviewer's thread with `view: "activity"`; each item has its time (`updatedAt`). Judge its pace as above.
- **At a deadline, or a limited pace:** stop the reviewer with `task_cancel` (a wait that times out doesn't stop it), then launch what replaces it, if anything does.

**Tracking and settling reviewer threads:**

- **Record every launched thread ID in `threads.txt`:** give each `delegate_task` launch for this gate a gate-specific `clientRequestId` using a URL-safe slug (no `/`): `<task or branch slug>-<record folder's name>-rg-<round or look>-<reviewer>-<n>` (the `-rg-` marker keeps `review-rg-` distinct from `review-2-rg-` and from unrelated delegates), and append its returned `childThreadId`, one ID per line, to `threads.txt` in the gate's record folder — covering every reviewer, approval relaunch, replacement or supplemental pass, question about a tag, Deep second opinion, look after a rebase, or visual look. Keep every launched ID there, including threads later cancelled on approval prompts, slow pace, or deadlines, so a context summary never loses track of earlier rounds. If a turn ends or is interrupted during a launch before its ID is appended, reconcile on resume (and before settling) via `t3_thread_list({includeSubagents: true, limit: 100})` (without a `settled` filter, paginating with `cursor`) for subagent threads whose `parentThreadId` is this thread and whose `threadId` contains `<task or branch slug>-<record folder's name>-rg-`, and append any missing IDs to `threads.txt`. A gate paused and resumed (for example on a quota pause) keeps appending to the same record folder's `threads.txt`; a later gate (`review-2/`, etc.) keeps its own `threads.txt` in its own record folder.
- **Settle finished threads when the gate ends:** once the gate finishes (`passed`, `stopped`, `no reviewer`, or `reported`), after every reviewer has reported or been cancelled/stopped and the gate's wake has been deleted (and `wake.txt` emptied), settle every thread ID in `threads.txt` that is not already settled and has no active or queued work (including terminal statuses: `idle`, `completed`, `cancelled`, `failed`, `interrupted`, `rolled_back`) using `t3_thread_organize({action: "settle", threadId: "<id>"})`:
  - Call it **one thread per call and always pass `threadId` explicitly** — never omit `threadId` (omitting it, or passing a list in another field, settles your own thread).
  - Deduplicate IDs before settling so each thread is settled once, and skip any thread already settled (`settled: true`).
  - Skip any thread that still has active or queued work (`preparing`, `queued`, `starting`, `running`, `waiting`); cancel it first with `task_cancel` if the gate timed it out or stopped it, and skip it if it still isn't terminal or `idle`.
  - Retry a failed settlement once.
  - List any thread ID that could not be settled in your handoff (or reply to the user) so an orchestrator or user can follow up.

| Reviewer | target | Can open pictures |
|---|---|---|
| Codex GPT-6.2 Sol | `{providerInstanceId: "codex", model: "gpt-6.2-sol", options: [{id: "reasoningEffort", value: "medium"}]}` (set the level: Sol defaults to low) | Yes (read tool) |
| Claude Sonnet 5.5 (`claudeAgent`) | `{providerInstanceId: "claudeAgent", model: "claude-sonnet-5-5", options: [{id: "effort", value: "high"}]}` | Yes (Read tool) |
| Claude Opus 5.5 (`claudeAgent`) | `{providerInstanceId: "claudeAgent", model: "claude-opus-5-5", options: [{id: "effort", value: "high"}]}` | Yes (Read tool) |
| Claude Sonnet 5.5 (Antigravity) | `{providerInstanceId: "antigravity", model: "claude-sonnet-5-5", options: [{id: "thought_level", value: "high"}]}` (with `interactionMode: "plan"`; set the level, as Antigravity defaults it to `medium`) | Yes (read tool) |
| Claude Opus 5.5 (Antigravity) | `{providerInstanceId: "antigravity", model: "claude-opus-5-5", options: [{id: "thought_level", value: "high"}]}` (with `interactionMode: "plan"`; set the level, as Antigravity defaults it to `medium`) | Yes (read tool) |
| DeepSeek V4.1 Flash (free) | `{providerInstanceId: "opencode", model: "opencode/deepseek-v4.1-flash-free", options: [{id: "variant", value: "high"}]}` | No — omit pictures |
| GLM-5.3 Flash (free) | `{providerInstanceId: "opencode", model: "opencode/glm-5.3-flash-free", options: [{id: "variant", value: "high"}]}` | No — omit pictures |
| DeepSeek V4.1 Flash (Go) | `{providerInstanceId: "opencode", model: "opencode-go/deepseek-v4.1-flash", options: [{id: "variant", value: "high"}]}` | No — omit pictures |
| GLM-5.3 Flash (Go) | `{providerInstanceId: "opencode", model: "opencode-go/glm-5.3-flash", options: [{id: "variant", value: "high"}]}` | No — omit pictures |
| Gemini 4 Neon (Neon) | `{providerInstanceId: "antigravity", model: "gemini-4-neon", options: [{id: "thought_level", value: "xhigh"}]}` (with `interactionMode: "plan"`; set the level, as Antigravity defaults it to `high`; in T3 the level is an option, on `agy`'s command line it is in the model's name) | Yes (read tool) |
| Gemini 4 Hydrogen | `{providerInstanceId: "antigravity", model: "gemini-4-hydrogen", options: [{id: "thought_level", value: "high"}]}` (in T3 the level is an option; on `agy`'s command line, below, it is in the model's name) | Yes (read tool) |
| Claude Haiku 5.5 (the free order's last) | `{providerInstanceId: "claudeAgent", model: "claude-haiku-5-5", options: [{id: "effort", value: "high"}]}` | No — omit pictures (free order) |

A reviewer that is limited shows it in its result or its thread: a quota or rate-limit error, "Free usage limit reached", or "Upstream request failed".

The Go targets start with `opencode-go/`. `opencode/deepseek-v4.1-flash`, without `-free`, is a different model that bills per request, and so are `opencode/gemini-4-neon` and `opencode/gemini-4-hydrogen`: Neon and Hydrogen go through Antigravity only.

## In Claude Code without T3

A subagent can't launch agents of its own: there, use the command-line forms for every reviewer, Claude's too (`claude -p`, as under "In Codex without T3"). Here, and in Codex without T3, a free reviewer, Hydrogen or Haiku gets its deadline only, with no pace check: a background command's output and a subagent's progress carry no times to judge its pace by. Note each reviewer's launch time for its deadline. From the main session:

- **Claude reviewers:** the `Agent` tool, `model: "opus"`, `"sonnet"` or `"haiku"`, a general-purpose agent, run in the background so they work in parallel.
- **Antigravity reviewers (Neon, Gemini 4 Hydrogen, and Antigravity Claude):** a background Bash command from the worktree, in Antigravity's `plan` mode, which holds back edits. Headless `agy` can't ask for a permission, so a shell command that no allow rule matches ends the whole session with no report. Rules match the start of the command line, so `--settings` gives this session the read-only commands, and the brief tells it how to call them:

  ```sh
  cd <worktree> && agy --mode plan --model gemini-4-hydrogen-high --print-timeout 15m \
    --add-dir=<a new folder holding copies of the files the brief names outside the worktree> \
    --settings '{"trustedWorkspaces":["<worktree>"],"permissions":{"allow":["command(git diff)","command(git log)","command(git show)","command(git status)","command(grep)","command(ls)","command(cat)","command(sed -n)","command(find)"]}}' \
    -p "<brief>"
  ```

  For Neon: `--model gemini-4-neon-xhigh --print-timeout 30m` (and for Antigravity's Claude bucket outside T3: `--model claude-opus-5-5-high --print-timeout 30m` or `--model claude-sonnet-5-5-high --print-timeout 30m`, with the same `--mode plan`, `--settings`, and `--add-dir=` rules). `-p` takes the next word as the prompt, so put it last. Headless `agy` also can't ask to read a file outside the worktree, and an allow rule doesn't help: copy every file the brief names outside the worktree (the project's rules, a file holding source passages, or pictures to inspect) into a new folder of its own (`mktemp -d`), each under a name no other copy has, point the brief at each copy, and give that folder as `--add-dir=<folder>`, with the `=` (with a space, `agy` prints its help and reviews nothing). Never add a folder that already exists, such as the home folder or a skill's: `--add-dir` opens all of it, and what the reviewer reads goes to Google. Remove the folder once the reviewer is done, whether it reported, was stopped or never started (keep it only for the one relaunch below), and leave the line out when the brief names nothing outside the worktree. In the brief, write the diff as `git diff <base>...<head>`, run from the worktree, not `git -C <path> diff`, and add after its time line (paid `agy` review briefs have none: after the focus line; its question about a tag: before its last line, with `--print-timeout 10m`): "Run one shell command at a time, without &&, ; or pipes, and only these: git diff, git log, git show, git status, grep, ls, cat, sed -n, find. Read files with your file-reading tool. Don't run tests or scripts: any other command ends your session before you can report." A run that ends without a report and with "a tool required the \"command\" permission" (or the \"read_file\" permission) on stderr, however long it ran, didn't review: fix what it needed (the brief's command, or an `--add-dir`) and launch it once more; one that fails so again is limited.
- **Codex Sol:** a background Bash command from the worktree (when the brief includes pictures, attach each with `-i <picture-path>` and put `--` before `"<brief>"` so variadic `-i` never swallows the prompt):

  ```sh
  codex exec --sandbox read-only --ephemeral -m gpt-6.2-sol -c model_reasoning_effort="medium" -C <worktree> [-i <picture-path> ... --] "<brief>"
  ```

- **Free reviewers:** a background Bash command from the worktree, with OpenCode's `plan` agent, which doesn't edit:

  ```sh
  cd <worktree> && opencode run --agent plan -m 'opencode/deepseek-v4.1-flash-free#high' "<brief>"
  ```

  (GLM: `opencode/glm-5.3-flash-free#high`. On Go: `opencode-go/deepseek-v4.1-flash#high`, `opencode-go/glm-5.3-flash#high`.)

## In Codex without T3

- **Codex Sol:** `spawn_agent` with model `gpt-6.2-sol` at medium reasoning and `fork_turns: "none"` (`fork_context: false` on builds that have that field instead): a forked history refuses a model of its own and would hand the reviewer your transcript, told it is read-only.
- **Claude reviewers:** a background command:

  ```sh
  claude -p --safe-mode --model claude-sonnet-5-5 --effort high --permission-mode dontAsk --setting-sources "" \
    --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git log:*),Bash(git show:*)" \
    --disallowedTools "Bash(*--output*)" < <a file holding the brief>
  ```

  (or `claude-opus-5-5`, or `claude-haiku-5-5` as the free order's last), run from the worktree. The brief goes in on standard input, never as a last argument: `--allowedTools` takes every word after it as a tool's name, and the run ends with "Input must be provided". `--permission-mode dontAsk` refuses a tool outside the list; without it each such call waits on an approval from the owner, who may not be there. `--setting-sources ""` reads no settings file, the worktree's `.claude/settings.local.json` included: a tool any of them allows is allowed whatever the list says, so a file that allows writing would let the reviewer write. `--safe-mode` leaves out the owner's plugins, hooks and MCP servers, which could act during the review, and the project's `CLAUDE.md`: the brief names the project's rules, and the reviewer reads them as files. The denied `--output` is the one way the three git commands write a file (`git diff --output=<path>`). These flags narrow what the reviewer can do; they aren't a sandbox. The allow rules match the start of a command, and `git -C <path> diff` is refused: in the brief, write the diff as `git diff <base>...<head>`, run from the worktree.
- **Free reviewers:** the OpenCode command above.
- **Antigravity reviewers (Neon, Gemini 4 Hydrogen, and Antigravity Claude):** the `agy` command above.

If a host can't launch a reviewer of the family the level needs, use the next option from SKILL.md, section 2, and record why.
