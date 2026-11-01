# review-gate changelog

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
