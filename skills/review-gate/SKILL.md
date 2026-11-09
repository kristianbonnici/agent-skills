---
name: review-gate
description: Review a finished code change with independent reviewer agents before it merges. Pick a level (light, standard or deep) from what the diff touches, choose reviewers from other model families with fallbacks when a subscription is short, give them a neutral brief, verify and tag every finding, fix what is real, and re-review only fixes that changed logic, for as long as the review keeps converging (five rounds at most). Use before an agent merges its own change, whenever a brief says to run the review gate, and when the user asks for an independent review of a change by other models.
metadata:
  version: 3.1.0
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
- **Light:** the diff changes only docs, comments, user-facing wording, or visual styling and assets: no logic, and no test that checks behavior.
- **Standard:** everything else.

## 2. Choose the reviewers

Reviewers come from three families: Claude (Opus 5.5, Sonnet 5.5), Codex (GPT-6.1 Terra) and the free pool (OpenCode's DeepSeek V4.1 Flash and GLM-5.3 Flash, on OpenCode's free tier first, then on the owner's flat-rate OpenCode Go plan). Paid reviewers run at high reasoning, free ones at their high variant. Gemini doesn't review. A "free reviewer" below is one of those two models on either tier. No other OpenCode model reviews, apart from the trial below: `opencode/` paid models bill per request, and Go's larger models use up the plan in a few reviews.

Claude Fable 5.2 never reviews, by default or as a replacement: it costs about twice Opus 5.5 and has a weekly limit of its own, kept for the demanding tasks the owner chose it for. A change Fable wrote counts as Opus's below: its Claude reviewer is Sonnet 5.5, and "your own model in a fresh context" means Opus 5.5.

- **The cross reviewer** is the paid reviewer of another family: Codex's GPT-6.1 Terra for a change Claude wrote, Claude Sonnet 5.5 for a change any other family wrote.
- **Codex is short** when your brief says so, or when a Codex reviewer fails on a usage limit. Then a Claude change's cross reviewer is the Claude model you aren't (Sonnet for Opus's change, Opus for Sonnet's), and a free reviewer joins to bring a second family back.

| Level | Round 1 |
|---|---|
| Light | One free reviewer. If none answers, the cross reviewer. |
| Standard | The cross reviewer. When Codex is short: its Claude substitute, plus one free reviewer if one answers. |
| Deep | Two paid reviewers with different focus, plus one free reviewer if one answers (focus: an open look). For a Claude change: Terra (logic, security, failure paths) and the Claude model you aren't (tests, docs, what the user sees, the project's rules); when Codex is short, Opus and Sonnet split those. For any other change: Opus (logic, security, failure paths) and Sonnet (tests, docs, what the user sees). |

Limits:

- **A free reviewer gets its time and no more** (15 minutes for each model). One that is limited (a quota error, "Free usage limit reached", a 429 that a retry a few minutes later still gets, in T3, no activity yet or turns typically more than a minute apart when you check its pace 5 minutes after launch; or no answer in its time; [references/launching.md](references/launching.md) has the checkpoints) moves on in this order: free DeepSeek, free GLM, Go DeepSeek, Go GLM. When the order runs out, it is dropped, except at Light, where the cross reviewer takes its place.
  - OpenCode's free limit covers both its free models: after "Free usage limit reached" from one, go straight to Go.
  - A model that is slow or doesn't answer is limited on its own: the next model in the order still gets its turn, since slowness is often one model's, not the tier's.
  - A Go model that "requires Global regions" isn't limited, just unavailable: try the other.
  - Before you launch a Go model, read Go's windows ([references/launching.md](references/launching.md)). Past about 85% of any of them, Go counts as limited.
- **A paid reviewer that fails on a limit** is replaced once, by a paid model not already reviewing this round: Terra by the Claude model you aren't, or, if that one is already reviewing, by your own model in a fresh context (and a free reviewer joins, as when Codex is short); Sonnet by Opus, Opus by Sonnet, under the same rule. If the replacement fails too, the round has no independent reviewer: don't merge. In an orchestrated run, report status `ready` with "no reviewer available" (the orchestrator runs the gate again once a reviewer has room); otherwise review the diff yourself in a fresh pass, say so in the record, and leave the merge to the user. A reviewer that timed out may still be running: stop it before you start its replacement.

### Trial reviewers

Three cheap models are on trial as reviewers: Codex's GPT-6 Luna, Claude Haiku 5.5 and Muse Spark 1.3 Contributor on OpenCode Go, at high reasoning. Muse keeps prompts to train Meta's models, so leave it out of code the owner may not share. At Standard and Deep, round 1 gets one of them as an extra reviewer: the one your brief names, or else whichever has more room (not Luna when Codex is short, not Muse when Go counts as limited). Brief it like the others. Check its findings like any other reviewer's and fix the real ones, but the gate never rests on it: a round still needs its regular reviewers, and a trial reviewer gets its time and no more, and one that is limited is dropped, never replaced. Trial reviewers don't review at Light or in later rounds. The record marks them `(trial)`, so a later study can decide whether any earns a regular place.

## 3. Brief them

Launch the round's reviewers in parallel, each with the same neutral brief from [references/reviewer-brief.md](references/reviewer-brief.md) and its own focus. Give the objective, the base and head, and the project's rules. Never give your transcript or your suspicions, and in round 1 never the other reviewers' findings (later rounds list every finding already raised, section 5). Reviewers are read-only. How to launch each one on your host: [references/launching.md](references/launching.md).

## 4. Check each finding

Sort every finding into one of these:

- **blocker:** a real defect this change introduces or exposes that causes data loss or corruption, a security or privacy hole, a crash, hang or wrong result on a common path, or a broken build or test. Only blockers hold back the merge and count in section 5. Show it with a failing test where you can, then fix it with that test, as its own commit. If it names a kind of bug, fix every instance in the diff.
- **follow-up:** a real defect this change introduces or exposes that needs unusual timing, rare input or a corner case to show, or a hardening the code lacks. Fix it as a blocker when that's cheap and a round is left to review a fix that changes logic; otherwise list it with the fix it needs. In an orchestrated run, the orchestrator makes the listed ones a follow-up task.
- **nit:** real but minor, such as wording, naming, or a weak test of something that works. Fix it when that's cheap; otherwise list it.
- **pre-existing:** true, but the diff didn't cause it. Don't fix it here unless it is small and in the files you changed; list it for the report.
- **rejected:** wrong or not applicable. Give one line on why.

You decide the tag; a reviewer's is a suggestion. Data loss, a security or privacy hole and a build or test that fails are blockers even when they need rare timing or input. A real defect on a common path that neither list names, such as a large slowdown, is a blocker, and so is a real defect you're unsure about.

Agreement between reviewers doesn't make a finding real, and "no defects" doesn't make the change correct: check the claims either way. At Deep, a blocker or follow-up that only one reviewer raised and that you can't show with a test goes to the other paid reviewer for a yes or no with its reason, before you change code.

## 5. Re-review while it converges

Re-review only when a fix changed logic, not for docs, tests or wording. Send the paid reviewers who found blockers or follow-ups the diff since their review and the list of findings already raised, and ask about the fix and what it touches: no earlier finding again, except one a fix didn't settle, reported as "not fixed". Free and trial reviewers don't re-review: a logic fix that only one of them asked for goes to the round's paid reviewer (at Light, the cross reviewer, launched now).

A conflict resolution after the review that changed logic gets one more look by the cross reviewer, outside the count of rounds; if that look finds a blocker, stop as for a review that didn't converge, below.

Up to five rounds, re-review as above. A blocker that comes back as "not fixed" counts as a blocker of its round; one that comes back narrower (the fix settled most of it, a smaller case still fails) is progress while the count falls. Stop, and don't merge, only when:

- the blocker count doesn't fall over two rounds: two rounds in a row each find at least one blocker, and as many as the round before them or more (4, 4, 2 goes on; 4, 4, 4 stops at round 3; a round with no blocker never counts toward a stop);
- the approach itself is in dispute: a finding says the design is wrong, not a detail of it, and no fix inside the approach settles it;
- round 5 still finds a blocker.

Then report that the review didn't converge, list the open blockers and follow-ups with the fix each needs, and say whether the approach itself looks wrong. In an orchestrated run that is status `ready`, and the orchestrator decides.

## 6. Record the result

Put a Review section in your handoff, or in your reply to the user, starting with a verdict line and a table in this format, since later studies of the gate count them:

```markdown
**Review: <Light, Standard or Deep>, <1 round or n rounds>.** <Why that level, in a few words.> <What the table adds up to, and what is still open.>

| Reviewer | Rounds | Blockers | Follow-ups | Nits | Pre-existing | Rejected | Unique defects |
|---|---|---|---|---|---|---|---|
| <model>, <level> | <1, 2> | <n> | <n> | <n> | <n> | <n> | <n> |

*Skipped: <model>: <why: the limit error, or "Codex short">.*
```

- Name each model in plain words, with its reasoning level: `Codex GPT-6.1 Terra, high`. Mark OpenCode's with `(free)` or `(Go)`, so the two tiers stay apart, and a trial reviewer with `(trial)`.
- Write a zero as `–`, and put a blocker count above zero in bold.
- "Unique defects" counts the blockers and follow-ups no other reviewer raised.
- The skipped line names every model that was skipped or that a reviewer moved on from, separated by semicolons. Leave it out when there are none.

Then list each blocker with its commit, each follow-up with its commit or, if open, the fix it needs, the open nits and pre-existing findings, and the rejected findings with their reasons.

## When the user asks for a review

Run the same gate. If they asked for a review only, show the blockers, follow-ups and pre-existing findings and wait for their answer before changing code.
