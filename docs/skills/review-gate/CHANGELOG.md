# review-gate changelog

## 2.3.0 (2026-11-06)

- Free and trial reviewers are told they have 12 minutes and about 20 commands, and to report what they have when they reach either (owner, 2026-11-06). A free reviewer in a Deep review ran 44 turns over its whole 15 minutes and was stopped before writing anything; its notes held two real bugs.
- In T3, a free or trial reviewer's pace is checked 5 minutes after launch: no activity yet, or turns of the model typically more than a minute apart, counts as limited then, instead of after its full 15 minutes. In the same review a Go model waited 90 to 123 seconds for each turn and returned nothing; counted per item its pace looked fine, so the check groups activity into turns. The owner first approved "no reply after 3 minutes"; that model's first reply came after 89 seconds, so the check looks at pace instead.
- Every reviewer, a single one too, launches without blocking, and the agent waits for each reviewer's next checkpoint (its pace check or its deadline), with the time left worked out from its launch time. The first version waited on the paid reviewer and checked the others around it, which let a free reviewer outrun its 15 minutes and checked too early when the paid reviewer finished first (review, below). The pace check is T3's only: on the other hosts a background command's output and a subagent's progress carry no times to judge pace by, so their free and trial reviewers keep their deadline alone, as before.
- A slow or silent model no longer skips the other model on its tier: the next in the order still gets its turn, since slowness is often one model's (owner, 2026-11-06). Neither GLM model was tried in that review. The free tier's shared limit still sends the order straight to Go.
- In T3, OpenCode reviewers launch with `interactionMode: "plan"`, which runs OpenCode's read-only `plan` agent: until now they ran as `build`, which can edit, and only the brief kept them read-only (checked in OpenCode's session records).
- A reviewer's remaining time is worked out from its launch time (its thread's `createdAt`), never from memory: a Go reviewer was stopped after 10 of its 15 minutes.
- **Review (standard), 3 rounds:** Codex GPT-6.1 Terra found 5 must-fixes in the first version's launch procedure (a single reviewer skipped the pace check, the paid wait let a free reviewer outrun its time or checked too early, a slow trial reviewer was told to launch a next model, other hosts had no way to check pace), all fixed by the checkpoint procedure; Muse Spark 1.3 Contributor (trial) raised the same and one more, that "a reply" was undefined, fixed by judging turns. Round 2 found the pace check still unworkable on hosts without T3 ("not fixed", which stops the gate); the owner had left reruns to the agent's judgment, so the check was scoped to T3 and round 3 found nothing. Muse ran under the new rules: plan mode, the 20-command budget (it used about 12) and a report in 76 seconds.

## 2.2.0 (2026-11-01)

- The record is now a verdict line and a Markdown table instead of a block of raw lines (owner, 2026-11-01): it holds the same numbers and reads far better in chat. Nothing parses the old lines; studies read handoffs. `only-one` became "Unique must-fix", zeros show as `–`, must-fixes are bold, and model names carry `(free)`, `(Go)` or `(trial)`.
- **Review (light):** OpenCode Go's DeepSeek V4.1 Flash, after the free tier stopped answering: no must-fix, 7 nits, 5 fixed. The harness no longer appears in the record; no study has used it.

## 2.1.0 (2026-11-01)

- The gate reads Go's windows before it launches a Go model (owner, 2026-11-01): past about 85% of any of them, Go counts as limited, so a free reviewer is dropped or, at Light, the cross reviewer takes over, and Muse isn't chosen for the trial. A reading that fails or finds no Go entry doesn't stop the launch.
- **Review (standard):** Codex GPT-6.1 Terra found 1 must-fix, fixed in the wording of `launching.md` (a report with no Go entry had no instruction), and a test that didn't check the usage line's numbers, also fixed; the Muse Spark trial raised the first too. No logic changed, so no second round.

## 2.0.0 (2026-11-01)

Major because the gate now spends a plan that it didn't touch before: the owner's flat-rate OpenCode Go plan, with its Extra Usage off, so it can't bill past the plan's price.
- A free reviewer that is limited moves on instead of being dropped (owner, 2026-11-01, after the free limit stopped both models for the whole computer on 2026-10-29): free DeepSeek, free GLM, Go DeepSeek, Go GLM, 15 minutes each; a model that doesn't answer in its time skips the other model on its tier. At Light, the cross reviewer takes over only when that order runs out.
- Only the two flash models are regular reviewers on Go. Full GLM-5.3 (not GLM-5.3 Flash) stays out, and so do Go's other larger models: their reviews look stronger, but about 25 turns of GLM-5.3 took 7% of the plan's week, and the console shows one set of meters for all models, so it may be one shared limit ([evidence.md](evidence.md)).
- The record writes OpenCode's whole model name, so a later study can tell the free tier from Go, with a `skipped` line for each model a reviewer left.
- Muse Spark 1.3 Contributor joins the trial reviewers (owner, 2026-11-01): cheap on the Go plan, from a third model family. It keeps prompts to train Meta's models, which the owner accepts for their own code, so it stays out of code the owner may not share. It gets a free reviewer's 15 minutes.
- `launching.md` lists the Go targets and warns that `opencode/deepseek-v4.1-flash`, without `-free`, bills per request.
- **Review (deep), round 1:** Codex GPT-6.1 Terra found 3 must-fixes, all fixed: a limit read only after the paid wait left Go no time; a task's brief had four target slots for six targets and lacked the limit rules; two free-tier timeouts used up the time for Go. Claude Sonnet 5.5, OpenCode DeepSeek V4.1 Flash and the Claude Haiku 5.5 trial added nits, most fixed.
- **Round 2** (Terra, the fixes only): 1 must-fix, a contract line that offered a choice nothing else honoured, and "not fixed" on one sentence that still called Go one shared limit. Both were fixed without another round, because a "not fixed" stops the review as the gate says; the third finding, that a free reviewer can run past its time while the paid wait lasts, is how the gate already worked. The owner approved going on (2026-11-01).
- **Review (deep) of what followed, the usage reader and the Muse and Beam rules, with those two fixes:** Terra found 2 must-fixes, both fixed with tests: Python's header error could quote a key with a line break in it, so such a key is never sent and errors give only their type; a database that couldn't be opened hid the other keys. A refused key now shows an error instead of leaving Go out, and the 85% rule reads the monthly window. Claude Sonnet 5.5, OpenCode Go's DeepSeek V4.1 Flash (the free tier was stopped) and the Muse Spark trial added nits, most fixed. Round 2 (Terra, the fixes only): no must-fix, one nit, fixed.

## 1.1.0 (2026-10-30)

- A round with no independent reviewer (each one and its replacement limited) doesn't merge: in an orchestrated run the task reports `ready` with "no reviewer available" and the gate runs again once a reviewer has room (from the orchestrator's first full review).
- A subagent that can't launch agents runs every reviewer by command line, Claude's too.
- Rounds stop when they stop converging instead of at a flat three: rounds 4 and 5 only while each round finds fewer must-fixes; a re-review reports a finding a fix didn't settle as "not fixed".

## 1.0.0 (2026-10-30)

- First release, from a study of 263 reviewed tasks in 21 orchestrated runs, Anthropic's account of
  its own code review, and a paper on verification in agent harnesses ([evidence.md](evidence.md)).
- Three levels by what a diff touches: light (docs, wording, styling), standard, deep (outside input,
  security, the user's files, processes, concurrency, release machinery, extra-high tasks).
- Reviewers of another family at high reasoning: Codex's GPT-6.1 Terra for Claude's changes, Claude
  Sonnet for others; Codex preferred but never required. OpenCode's free models review alone at light,
  join at deep, and stand in for the lost family when Codex is short; never in later rounds, never
  waited for. Gemini doesn't review.
- A replacement for a limited reviewer is never a model already reviewing that round; a timed-out reviewer is stopped before its replacement starts; in T3, the main reviewer's wait is the round's deadline.
- Trial reviewers (owner, 2026-10-30): GPT-6 Luna and Claude Haiku 5.5 add one cheap extra review in round 1 at Standard and Deep, recorded `trial=yes`, to learn whether cheaper models can take regular places.
- Findings sorted must-fix, nit, pre-existing or rejected; re-review only after a logic fix, the fix's
  diff only, no repeats; up to three rounds, then rounds 4 and 5 only while each round finds fewer must-fixes than the one before (owner, 2026-10-30, after the gate's own review went 7, 4, 2); a fixed record format for later studies.
