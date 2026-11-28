---
name: review-gate
description: Review a finished code change with independent reviewer agents before it merges. Pick a level (light, standard or deep) from what the diff touches, choose reviewers from other model families with fallbacks when a subscription is short, give them a neutral brief, verify and tag every finding, fix what is real, and re-review only fixes that changed logic, for as long as the review keeps converging (five rounds at most). Use before an agent merges its own change, whenever a brief says to run the review gate, and when the user asks for an independent review of a change by other models.
metadata:
  version: 8.8.0
---

# Review Gate

A change merges only after agents that didn't write it have read it. You, the agent that made the change, run the gate: choose the level, launch the reviewers, check what they find, fix what is real and record the result. Run it once the change is committed and its checks pass.

## 1. Choose the level

Read the whole diff against its base. Judge by what it touches, not by its size. When unsure, take the higher level. A level named in your brief is the lowest you may use; raise it if the diff touches a deep area.

- **Deep:** the diff touches any of these:
  - input from outside the process: sockets, links, IPC, files or network data it reads, and the parsers and decoders for them;
  - security and privacy: permissions, secrets, sandboxing, what gets logged, stored or sent;
  - the user's own data, files and settings, or another app's: anything that deletes, moves, overwrites or migrates them;
  - processes: launching, signalling or stopping them, and anything that could reach the user's running copy instead of a test copy;
  - concurrency and lifetimes: threads, actors, locks, timers, work after close, races;
  - release, update, install, signing or CI machinery;
  - or the change was made at extra-high reasoning.
- **Light:** the diff changes only docs, comments, user-facing wording, or static visual styling and assets that don't change where anything sits or what covers what: no logic, no layout, placement or overlay changes, and no test that checks behavior.
- **Standard:** everything else (including any UI layout, placement or overlay change).

## 2. Choose the reviewers

Reviewers come from four families: Claude (`Opus 5.5`, `Sonnet 5.5`), Codex (`GPT-6.2 Sol`), Gemini (`Gemini 4 Neon`, and `Gemini 4 Hydrogen` at Light, both on Antigravity) and the free pool (`DeepSeek V4.1 Flash` and `GLM-5.3 Flash`, on OpenCode's free tier first, then on OpenCode Go). Paid reviewers run at `high` reasoning, except Sol at `medium` and Neon at `xhigh` (extra high); free reviewers run at their `high` variant, Hydrogen at `high`.

- **A "paid reviewer"** is Opus, Sonnet, Sol or Neon (`Gemini 4 Neon` at `xhigh`, replacing Orchestrator (Neon)).
- **Claude buckets:** Opus and Sonnet run on `claudeAgent`, or on Antigravity's separate `claude_and_gpt_models` bucket (`interactionMode: "plan"`, `thought_level: "high"` in T3) when your brief says to prefer Antigravity's Claude bucket or when `claudeAgent` is short, provided `providers.antigravity.windows` includes at least one `claude_and_gpt_models_*` window and every reported `claude_and_gpt_models_*` window (`claude_and_gpt_models_five_hour`, `claude_and_gpt_models_weekly`) from `provider-usage --only antigravity` is under about 80% (exception: if `provider-usage` is missing, returns an error, or has no `antigravity` entry, prefer `claudeAgent` unless `claudeAgent` is short — then launch Antigravity Claude and fail over on a quota error; distinct from a successful Antigravity report with no `claude_and_gpt_models_*` window, where the bucket is disabled). If either bucket hits a usage limit, is at or past 80% (for Antigravity), or is unavailable, fall back seamlessly to the other bucket. **Claude is short** only when both buckets are limited or unavailable (or when your brief says so).
- **A "free reviewer"** is one of the two OpenCode flash models on either tier, plus `Claude Haiku 5.5` at `high` last in the free order at Standard and Deep — except Haiku is excluded whenever **`claudeAgent` is short** (including when **Claude is short**, since Haiku runs on `claudeAgent` only), and for a Claude-authored change while **Codex is short** (where the free reviewer brings back a second family).
- **Hydrogen is neither.** It is Light's reviewer for non-Gemini changes while `gemini_models_five_hour` is under about 85%, and reviews nowhere else.
- **Neon and Hydrogen run only on Antigravity,** whose Gemini windows the run's helpers and the owner share. Neither reviews while `gemini_models_five_hour` is at or past about 85% or Antigravity can't open. Hydrogen never reviews a Gemini-authored change; Neon reviews a Gemini-authored change **only** in round 1 at Deep as a fresh agent (open look ONLY) — never at Light or Standard, never as the cross reviewer, never holding a focused Deep role, never for Deep's second opinion, and never in later-round re-reviews or tag questions (which route to the round's cross reviewer).
- **No other model reviews,** apart from Haiku in the free order above: plain Gemini 4 Neon at `high`, Orchestrator (Neon), all other unbenchmarked Gemini models, and all other OpenCode models (`opencode/` paid models that bill per request — `opencode/gemini-4-neon` and `opencode/gemini-4-hydrogen` among them — and Go's larger models) stay excluded. A model gets a place only on the owner's word, after `reviewer-benchmark` has measured it (plain Gemini 4 Neon at `xhigh` is authorized as covered by the Orchestrator (Neon) benchmark and 0-worker-call review-database proof; no separate re-run is needed).

Claude Fable 5.2 never reviews, by default or as a replacement: it costs about twice Opus 5.5 and has a weekly limit of its own, kept for the demanding tasks the owner chose it for. A change Fable wrote counts as Opus's below: where Opus's change gets Sonnet 5.5, so does Fable's, and "fresh if Opus/Fable wrote it" means Opus 5.5 as a new agent with the brief alone.

Availability states:

- **Codex is reserved for Deep** (soft-reserve): set only by your brief or the run's common file (never self-detected per task, so parallel gates don't race). **Standard** reviews of Claude-authored changes drop Sol and run **Neon (`xhigh`) + one free reviewer** (or **Sol + one free** if Neon can't review). Deep reviews, Gemini/Codex/free-authored changes, Light fallbacks, and re-reviews of findings Sol already raised keep Sol until Codex is short.
- **Codex is short** when your brief says so, or when a Codex reviewer fails on a usage limit.
- **Claude is short** when your brief says so, or when both `claudeAgent` and Antigravity's `claude_and_gpt_models` bucket are unavailable or limited.
- **Neon can't review** when `gemini_models_five_hour` is at or past about 85%, when Antigravity can't open in T3, or when Neon fails on a usage limit. (When Antigravity Gemini is unavailable or at/past 85% 5h, Hydrogen can't review either.)

**The cross reviewer** (Light's final fallback, tag questions on blockers raised by free reviewers, Hydrogen, Haiku or Gemini Deep's fresh Neon, logic fixes only one of them raised, rebase looks and visual looks) depends on the combined availability state:

| Availability state | Claude change | Codex change | Gemini change | Free-model change |
|---|---|---|---|---|
| Normal | Sol (`medium`) | Sonnet (`high`) | Sol (`medium`) | Sol (`medium`) |
| Codex reserved for Deep | Standard: Neon (`xhigh`) if available else Sol (`medium`); Light/Deep: Sol (`medium`) | Sonnet (`high`) | Sol (`medium`) | Sol (`medium`) |
| Codex short (Claude normal) | Standard/Deep: Neon (`xhigh`) if available else the Claude model you aren't; Light: the Claude model you aren't | Sonnet (`high`) | Light/Standard: Sonnet (`high`); Deep: Opus (`high`) | Light/Standard: Sonnet (`high`); Deep: Neon (`xhigh`) if available else Opus (`high`) |
| Claude short (Codex not short) | Standard when Codex is reserved for Deep: Neon (`xhigh`) if available else Sol (`medium`); otherwise Sol (`medium`) | Neon (`xhigh`) if available; Standard fallback if Neon can't review: fresh Sol (`medium`); Light/Deep if Neon can't: none | Sol (`medium`) | Sol (`medium`) |
| Both Codex and Claude short | Neon (`xhigh`) if available, else none | Neon (`xhigh`) if available, else none | none | Neon (`xhigh`) if available, else none |

Normal Round 1 reviewers by author family and level (when `Codex`, `Claude` and `Neon` are available):

| Author | Light | Standard | Deep |
|---|---|---|---|
| Claude | Hydrogen (`< ~85%` 5h), else one free, else Sol | Sol + Neon | Sol (logic, security, failure paths) + Opus (tests, docs, UX, project rules; fresh if Opus/Fable wrote it) + Neon (open look) + one free if one answers |
| Codex | Hydrogen (`< ~85%` 5h), else one free, else Sonnet | Sonnet + Neon | Opus (logic, security, failure paths) + Sonnet (tests, docs, UX, project rules) + Neon (open look) + one free if one answers |
| Gemini | Sonnet (`high`) while a Claude bucket has room, else one free, else Sol | Sol + Sonnet (strictly cross-family, no Neon) | Sol (logic, security, failure paths) + Opus (tests, docs, UX, project rules) + fresh Neon (`xhigh`, round-1 open look ONLY) + one free if one answers |
| Free model | Hydrogen (`< ~85%` 5h), else one free, else Sol | Sol + Neon | Sol (logic, security, failure paths) + Opus (tests, docs, UX, project rules) + Neon (open look) + one free if one answers |

Fallbacks when an availability state holds:

- **Codex is reserved for Deep:** on a Claude change at **Standard**, run **Neon (`xhigh`) + one free reviewer** (if Neon can't review, **Sol + one free**). Every other author and level keeps the normal table.
- **Codex is short:**
  - **Claude change:** Light fallback uses the Claude model you aren't; Standard runs **Neon + one free** (no Haiku), or if Neon can't review, **the Claude model you aren't + one free** (no Haiku); Deep runs **Neon (logic, security, failure paths) + Opus (tests, docs, UX, project rules; fresh if Opus/Fable) + one free** (no Haiku), or if Neon can't review, **Sonnet (logic, security, failure paths; fresh if Sonnet) + Opus (tests, docs, UX, project rules; fresh if Opus/Fable) + one free** (no Haiku).
  - **Gemini change:** Light runs **Sonnet**, else one free (no Sol fallback: if none answers, `no reviewer available`); Standard runs **Opus + Sonnet + one free if one answers** (no Neon); Deep runs **Opus (logic, security, failure paths) + Sonnet (tests, docs, UX, project rules) + fresh Neon (`xhigh`, round-1 open look ONLY) + one free if one answers**.
  - **Free change:** Light fallback uses **Sonnet**; Standard runs **Sonnet + Neon + one free** (or **Sonnet + one free** if Neon can't review); Deep runs **Neon (logic, security, failure paths) + Opus (tests, docs, UX, project rules) + one free** (or **Opus + Sonnet + one free** if Neon can't review).
  - **Codex change:** unchanged from the normal table.
- **Claude is short** (Haiku excluded from the free order everywhere):
  - **Claude change:** Light and Standard follow the normal or Codex-reserved rules while Sol or Neon can review (if Codex is also short and Neon can review: Light fallback is **Neon**, Standard is **Neon + one free**); Deep runs **Sol (logic, security, failure paths) + Neon (tests, docs, UX, project rules) + one free** (if Neon can't review, **Sol (full diff) + one free**; if Codex is also short and Neon can review, **Neon (full diff) + one free**). If both Codex and Neon can't review: **`no reviewer available`** at Standard and Deep (and at Light if Hydrogen and free fail).
  - **Codex change:** Light fallback uses **Neon** (if Neon can't review, **`no reviewer available`**); Standard runs **Neon (`xhigh`) + one free** (if Neon can't review and Codex isn't short, **fresh Sol (`medium`) + one free**; if Codex is also short, **`no reviewer available`**); Deep runs **Neon (`xhigh`, logic, security, failure paths) + fresh Sol (`medium`, tests, docs, UX, project rules) + one free if one answers** when the diff also touches tests, docs, UX or project rules and Codex isn't short, otherwise **Neon (`xhigh`, full diff) + one free if one answers** (when Codex is also short, **Neon (`xhigh`, full diff) + one free if one answers**); if Neon can't review at Deep, **`no reviewer available`**, don't merge.
  - **Gemini change:** Light runs **one free reviewer**, else **Sol (`medium`)**; Standard runs **Sol (`medium`) + one free** (no Neon); Deep runs **Sol (`medium`, full diff: logic, security, failure paths, tests, docs, UX, project rules) + fresh Neon (`xhigh`, round-1 open look ONLY, dropped if Neon can't review) + one free if one answers**. If Codex is also short: Light stops at `no reviewer available` if no free answers; Standard and Deep have no independent cross-family reviewer (`no reviewer available`, don't merge).
  - **Free change:** Light and Standard follow the normal rules while Sol or Neon can review (Codex reserved-for-Deep still keeps Sol on Free Standard; if Codex is also short and Neon can review, Light fallback is **Neon** and Standard is **Neon + one free**); Deep runs **Sol (logic, security, failure paths) + Neon (tests, docs, UX, project rules) + one free** (if Neon can't review, **Sol (full diff) + one free**; if Codex is also short and Neon can review, **Neon (full diff) + one free**). If both Codex and Neon can't review: **`no reviewer available`**.
- **Neon can't review (when Codex and Claude rules don't already cover its role):**
  - beside a cross reviewer at Standard round 1 (Claude, Codex or free): one free reviewer if one answers (unless one is reviewing already, or Claude Standard under Codex reserved-for-Deep, which keeps Sol + one free);
  - as Deep's open look (any family): drop Neon;
  - in a later round's re-review, a rebase look or a visual look: the round's cross reviewer (never a free reviewer, never Neon on a Gemini change).

Limits:

- **Neon gets a paid reviewer's time** (30 minutes) and re-reviews as one (section 5), except on a Gemini-authored Deep change where fresh Neon reviews round 1 only. It doesn't review while Antigravity's Gemini 5-hour window is at or past about 85%.
- **Hydrogen gets its time and no more** (15 minutes, with the same checkpoints as a free reviewer), and reviews in round 1 only. It doesn't review a Gemini-authored change or while Antigravity's Gemini 5-hour window is at or past about 85%. When it doesn't review, or is limited, the free order below takes over, as if Hydrogen hadn't been chosen.
- **A free reviewer gets its time and no more** (15 minutes for each model). One that is limited (a quota error, "Free usage limit reached", a 429 that a retry a few minutes later still gets, in T3, no activity yet or turns typically more than a minute apart when you check its pace 5 minutes after launch; or no answer in its time; [references/launching.md](references/launching.md) has the checkpoints) moves on in this order: free DeepSeek, free GLM, Go DeepSeek, Go GLM, and at Standard and Deep, last, Claude Haiku 5.5 at high with a free reviewer's brief and time (excluding Haiku whenever `claudeAgent` is short, or on a Claude change while Codex is short). When the order runs out, it is dropped — except at Light (where the cross reviewer takes its place) and on a same-family Standard or Deep fallback (Claude under Codex short + Neon unavailable, or Codex Standard under Claude short + Neon unavailable), where losing the sole cross-family free reviewer stops with `no reviewer available` instead of merging without a second family.
  - OpenCode's free limit covers both its free models: after "Free usage limit reached" from one, go straight to Go.
  - A model that is slow or doesn't answer is limited on its own: the next model in the order still gets its turn, since slowness is often one model's, not the tier's.
  - A Go model that "requires Global regions" isn't limited, just unavailable: try the other.
  - Before you launch a Go model, read Go's windows ([references/launching.md](references/launching.md)). Past about 85% of any of them, Go counts as limited.
- **A paid reviewer that fails on a limit** (stop any timed-out reviewer first): for a Claude reviewer, try the other Claude bucket first before marking Claude short. Once a family enters `Codex is short`, `Claude is short` or `Neon can't review`, apply the state's fallback rules above to fill any required paid role left uncovered — never duplicating a model already reviewing this round and never promoting fresh Neon on a Gemini change. If a focused Deep reviewer fails after its partner already started and no second distinct paid model is eligible (for example, Opus fails late on Gemini Deep, or either focused reviewer fails late on Claude or Free Deep while Claude is short), wait for the remaining cross-family paid reviewer's first pass to report and then queue a fresh supplemental pass on that model covering whichever focus the failed reviewer held (`logic, security and failure paths`, or `tests, docs, UX and project rules`) — never running two instances of the same model concurrently, and never using fresh Neon on a Gemini change — and require both reports before settling the round (if that supplemental pass also fails on a limit, stop as below). If the replacement fails too, or no eligible reviewer from the rules above remains (including a same-family Standard/Deep fallback whose free reviewer also failed, Gemini Standard/Deep with Codex and Claude short, Codex Deep with Claude and Neon short, or Light when its fallback cross reviewer fails — Claude Light's other-Claude fallback under Codex short and Codex Standard's fresh-Sol + free fallback are explicit exceptions permitted by the fallback rules above), don't merge. In an orchestrated run, report status `ready` with `"no reviewer available"` (the orchestrator runs the gate again once a reviewer has room); otherwise review the diff yourself in a fresh pass, say so in the record, and leave the merge to the user.

## 3. Brief them

Launch the round's reviewers in parallel, each with the same neutral brief from [references/reviewer-brief.md](references/reviewer-brief.md) and its own focus. Give the objective, the base and head, and the project's rules. Never give your transcript or your suspicions, and in round 1 never the other reviewers' findings (later rounds list every finding already raised, section 5). Reviewers are read-only and run no tests, scripts or command that may ask for approval; in T3, one that asks anyway is stopped and relaunched once ([references/launching.md](references/launching.md#in-t3)). How to launch each one on your host: [references/launching.md](references/launching.md).

**Visual evidence for visible UI changes:** any diff that changes visible UI defaults to `Live UI check: required` (in standalone gates too, unless the brief or user classifies it `rendered is enough because <reason>` — valid only when every pixel in and next to the changed region is drawn by the project's own code, the state is reachable without input or elapsed time, and the render is the shipped view tree, not a fixture, poster or placeholder — or `waived`). Take captures only from your own test build with **sample content**, never the user's running copy or real/private data (if safe sample captures aren't possible, stop with `"result": "stopped"` and `"note": "live UI check pending: <why>"`). Include the `UI check:` classification and its reason unconditionally in every reviewer's brief so reviewers verify the claim against the diff; if a reviewer shows `rendered is enough` fails any condition, upgrade to `required`. When captures already exist at round 1, list their absolute paths (with what each capture is meant to show) in the brief of reviewers that can open pictures ([references/launching.md](references/launching.md)) — Light's reviewer when it can open pictures (Sonnet, Hydrogen or a paid fallback; if Light ran on a free reviewer, run a visual look below), both paid reviewers at **Standard**, and the UX-focused and open-look reviewers at **Deep** (leave the logic-focused reviewer's context alone unless it is the sole paid reviewer or running a visual look; never send picture paths to free reviewers, whose plan-mode sandbox can prompt on out-of-worktree reads). Each reviewer given pictures opens them directly and starts its report with a `Pictures:` line (one sentence on what it sees in each, or `couldn't open` — never judging a picture it couldn't open), checking both **authenticity** (for `required`: the real running, mounted, interactive/hovered state under test, not a poster, mock or placeholder; for `rendered is enough`: shipped-view fidelity without requiring live-hover chrome) and **visual defects** (overlaps, clipping, occluded native/system controls, unreadable contrast, layout regressions). Compare each reviewer's `Pictures:` line against what you saw; a mismatch voids that reviewer's visual verdict. When captures are taken or retaken after round 1 (for example, after finishing code review before queueing for the real screen in an evening run, after Light ran on a free reviewer, or after retaking an unrepresentative capture), send them to the round's cross reviewer (or another eligible paid reviewer that can open pictures) for one **visual look** (`look-<n>-<reviewer>.md`, `"visual look"` in `review.json`'s `rounds`), outside the count of rounds.

## 4. Check each finding

Sort every finding into one of these:

- **blocker:** a real defect this change introduces or exposes that causes data loss or corruption, a security or privacy hole, a crash, hang or wrong result on a common path, a visible UI overlap, clipping or occluded control on a common path, or a broken build or test. Only blockers hold back the merge and count in section 5. Show it with a failing test where you can (or live capture for a visual defect), then fix it with that test or refreshed capture, as its own commit. If it names a kind of bug, fix every instance in the diff.
- **follow-up:** a real defect this change introduces or exposes that needs unusual timing, rare input or a corner case to show, or a hardening the code lacks. Fix it as a blocker when that's cheap and a round is left to review a fix that changes logic; otherwise list it with the fix it needs. In an orchestrated run, the orchestrator makes the listed ones a follow-up task.
- **nit:** real but minor, such as wording, naming, or a weak test of something that works. Fix it when that's cheap; otherwise list it.
- **pre-existing:** true, but the diff didn't cause it. Don't fix it here unless it is small and in the files you changed; list it for the report.
- **rejected:** wrong or not applicable. Give one line on why.

**Visual-evidence gate condition (not a `blocker` finding):** a gate on a visible UI change whose captures are required (`required`, or upgraded from a false `rendered is enough` claim) cannot end `passed` until **at least one eligible reviewer** has returned an affirmative, non-voided `Pictures:` verdict covering every required state on the final captures — with two explicit exceptions: (1) in an orchestrated run, when valid live captures exist on disk and **every** eligible reviewer reported `couldn't open` or had its visual verdict voided (never when an eligible reviewer that could still supply a verdict merely hit a usage limit), the task stops with `"result": "stopped"` and `"note": "live UI check pending: <why>"` (`ready`), and the orchestrator may inspect those captures as the sole authorized fallback eye before authorizing merge (recording its clearance in the ledger and updating `review.json` to `"result": "passed"` with `"note": "visual check cleared by orchestrator fallback inspection"`); or (2) the owner explicitly verified the final window-drawing commit themselves (recorded in the ledger in an orchestrated run, updating `review.json` to `"result": "passed"` with `"note": "visual check verified by owner on <commit>"`, which stands in for both captures and a reviewer verdict). Missing or unrepresentative captures, an upgraded `rendered is enough` claim, `couldn't open`, or a voided mismatch are gate-level conditions, never `blocker` tags (retaking a picture produces no commit, and a passed record requires a commit on every blocker): if a reviewer couldn't open the pictures, its verdict was voided, or a visual-look reviewer hits a limit, try another eligible paid reviewer able to open pictures (following section 2's fallback order, never a free reviewer or Neon on a Gemini change); if captures are missing or unrepresentative, retake them and run a visual look; only when **no reviewer has returned an affirmative, non-voided verdict and no untried eligible reviewer remains** (or required captures cannot be taken) stop without merging (`"result": "stopped"`, `"note": "live UI check pending: <why>"`; in an orchestrated run report `ready` with `"live UI check pending"` and the specific reason — naming any eligible reviewer that hit a usage limit so the orchestrator retries after its reset instead of clearing via fallback).

You decide the tag; a reviewer's is a suggestion. Data loss, a security or privacy hole and a build or test that fails are blockers even when they need rare timing or input. A real defect on a common path that neither list names, such as a large slowdown, is a blocker, and so is a real defect you're unsure about.

Agreement between reviewers doesn't make a finding real, and "no defects" doesn't make the change correct: check the claims either way. At Deep, a blocker or follow-up that only one reviewer raised and that you can't show with a test goes to another eligible paid reviewer of the round — never Neon on a Gemini change — for a yes or no with its reason, before you change code; if no other eligible paid reviewer reviewed the round, settle it yourself.

**Ask the reviewer when you tag its blocker lower.** When you reject a finding a reviewer tagged a blocker, or give it a lower tag, ask that reviewer whether it agrees, with the question in [references/reviewer-brief.md](references/reviewer-brief.md#the-question-about-a-tag): the finding as it reported it, your tag and your reason. A free reviewer's blocker, or Hydrogen's, Haiku's, or fresh Neon's on a Gemini-authored Deep change, goes to the round's cross reviewer instead (at Light, launched for this). Put the question in that reviewer's next round when it has one; otherwise launch it alone, with 10 minutes and no replacement. When no cross reviewer can review (or it doesn't answer in 10 minutes), record `no answer`. Otherwise record the answer: `agrees`, `holds` or `no answer`. Your tag stands whatever the answer: a reply never makes a blocker, holds back the merge, counts in section 5, or starts a fix or a round in this gate. If the answer shows you a case you got wrong, the most you do is tag the finding a follow-up and list it open with the fix it needs: it is fixed after the merge, as any open follow-up is.

## 5. Re-review while it converges

Re-review only when a fix changed logic — which includes changing what is drawn where (layout, placement, overlays or visible state) — not for docs, tests or wording alone. Re-reviews of visual fixes include fresh pictures of the same states. Send the paid reviewers who found blockers or follow-ups the diff since their review and the list of findings already raised, and ask about the fix and what it touches: no earlier finding again, except one a fix didn't settle, reported as "not fixed". Re-reviews of findings Sol already raised continue on Sol unless Codex is short (even while Codex is reserved for Deep). Free reviewers, Hydrogen, Haiku, and fresh Neon on a Gemini-authored Deep change don't re-review: a logic fix that only one of them asked for goes to the round's cross reviewer (at Light, launched now). If a paid reviewer can't re-review on a limit, try the other Claude bucket first (for Claude), then fall back to the round's cross reviewer (never a free reviewer, never Neon on a Gemini change); if none can review, stop as for no independent reviewer above.

A conflict resolution after the review that changed logic (including layout or placement), or pictures taken or retaken after round 1, gets one more look by the cross reviewer (or, for a visual look, another eligible paid reviewer able to open pictures, falling back along section 2's paid order — never a free reviewer or Neon on a Gemini change — if that reviewer hits a limit or cannot open the pictures), outside the count of rounds (`"rebase look"` or `"visual look"`). If a rebase look finds a blocker, stop as for a review that didn't converge, below. If a visual look finds a blocker, fix it with fresh pictures of the same states and re-review as above (stopping if the review stops converging). If no eligible paid reviewer can complete a required visual look, stop without merging (`"result": "stopped"`, `"note": "live UI check pending: <why>"`).

Up to five numbered rounds (counting distinct numbered rounds, ignoring any integer skipped for a named look's findings), re-review as above. A blocker that comes back as "not fixed" counts as a blocker of its round; one that comes back narrower (the fix settled most of it, a smaller case still fails) is progress while the count falls. Stop, and don't merge, only when:

- the blocker count doesn't fall over two rounds: two rounds in a row each find at least one blocker, and as many as the round before them or more (4, 4, 2 goes on; 4, 4, 4 stops at round 3; a round with no blocker never counts toward a stop);
- the approach itself is in dispute: a finding says the design is wrong, not a detail of it, and no fix inside the approach settles it;
- the fifth numbered round still finds a blocker.

Then report that the review didn't converge, list the open blockers and follow-ups with the fix each needs, and say whether the approach itself looks wrong. In an orchestrated run that is status `ready`, and the orchestrator decides.

**A follow-up patch is capped.** A change that fixes an earlier review's listed follow-ups gets its own level, and in its gate: fix every blocker, in any round, and the follow-ups raised in the first two numbered rounds; from the third numbered round on, list a new finding that isn't a blocker with the fix it needs, instead of fixing it, so a fix for a narrow race doesn't invite a narrower one round after round. What is listed is fixed later only when the owner asks.

## 6. Record the result

Keep the gate's record in one folder outside the repository: in an orchestrated run, `<run directory>/<your task ID>/review/`; otherwise under `${XDG_STATE_HOME:-~/.local/state}/agent-skills/review-gate/`. [references/record.md](references/record.md) has the names and the format. It holds:

- **each reviewer's report,** whole and unedited, saved when it arrives;
- **`review.json`:** the gate's facts and one entry per finding per reviewer who raised it, with the reviewer's tag beside yours, how you checked it, the commit that fixed it, and a line of why wherever you rejected it or tagged it lower than the reviewer did.

Then run `scripts/review-records table <folder>`: it checks the record and prints the first lines of the Review section. Put a Review section in your handoff, or in your reply to the user, starting with those lines as printed, since later studies of the gate count them, and finish the verdict line yourself:

```markdown
**Review: <Light, Standard or Deep>, <1 round or n rounds>.** <Why that level, in a few words.> <What the table adds up to, and what is still open.>

| Reviewer | Rounds | Blockers | Follow-ups | Nits | Pre-existing | Rejected | Unique defects |
|---|---|---|---|---|---|---|---|
| <model>, <level> | <1, 2> | <n> | <n> | <n> | <n> | <n> | <n> |

*Tagged lower than the reviewer's blocker or follow-up: <n> (<n> rejected).*

*Replies on the blockers tagged lower: <n> agreed, <n> held, <n> no answer.*

*Skipped: <model>: <why: the limit error, or "Codex short">.*

*Record: <the record folder's path>.*
```

- Name each model in plain words, with its reasoning level: `Codex GPT-6.2 Sol, medium`, `Gemini 4 Neon, xhigh`. Prefix Antigravity Claude reviewers with `Antigravity` (`Antigravity Claude Opus 5.5, high`, `Antigravity Claude Sonnet 5.5, high`) so subscription attribution stays visible, and mark OpenCode's with `(free)` or `(Go)`, so the two tiers stay apart. The table takes the names from `review.json`.
- A zero is `–`, and a blocker count above zero is bold.
- "Unique defects" counts the blockers and follow-ups no other reviewer raised.
- The "Tagged lower" line counts the findings a reviewer called a blocker or follow-up that you tagged lower or rejected. It is left out when there are none.
- The "Replies" line counts what the reviewers answered about the blockers among them (section 4). It is left out when you asked none.
- The skipped line names every model that was skipped or that a reviewer moved on from, separated by semicolons. It is left out when there are none.
- The record line says where the record is. Keep it: a later count takes a table without it for a gate that has no record.

Then list each blocker with its commit, each follow-up with its commit or, if open, the fix it needs, the open nits and pre-existing findings, and the rejected findings with their reasons. When reviewers inspected pictures, include a short `Pictures:` line quoting what each reviewer saw (or noting if no other-family reviewer could open them). Under its own heading, "A reviewer held", list each blocker you rejected or tagged lower whose reviewer held: what it says goes wrong and when, and your reason for your tag.

In T3, once the gate ends (after every reviewer has reported or been stopped and the wake is deleted), settle every finished or cancelled reviewer thread you started — passing `threadId` explicitly on every call — and list any you couldn't settle in your handoff or reply ([references/launching.md](references/launching.md#in-t3)).

## When the user asks for a review

Run the same gate, with its record. If they asked for a review only, show the blockers, follow-ups and pre-existing findings and wait for their answer before changing code.
