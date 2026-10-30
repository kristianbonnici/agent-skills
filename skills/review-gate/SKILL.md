---
name: review-gate
description: Review a finished code change with independent reviewer agents before it merges. Pick a level (light, standard or deep) from what the diff touches, choose reviewers from other model families with fallbacks when a subscription is short, give them a neutral brief, verify and tag every finding, fix what is real, and re-review only fixes that changed logic, within three rounds. Use before an agent merges its own change, whenever a brief says to run the review gate, and when the user asks for an independent review of a change by other models.
metadata:
  version: 1.0.0
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

Reviewers come from three families: Claude (Opus 5.5, Sonnet 5.5), Codex (GPT-6.1 Terra) and the free pool (OpenCode's DeepSeek V4.1 Flash and GLM-5.3 Flash). Paid reviewers run at high reasoning, free ones at their high variant. Gemini doesn't review.

- **The cross reviewer** is the paid reviewer of another family: Codex's GPT-6.1 Terra for a change Claude wrote, Claude Sonnet 5.5 for a change any other family wrote.
- **Codex is short** when your brief says so, or when a Codex reviewer fails on a usage limit. Then a Claude change's cross reviewer is the Claude model you aren't (Sonnet for Opus's change, Opus for Sonnet's), and a free reviewer joins to bring a second family back.

| Level | Round 1 |
|---|---|
| Light | One free reviewer: DeepSeek, else GLM. If both are limited, the cross reviewer. |
| Standard | The cross reviewer. When Codex is short: its Claude substitute, plus one free reviewer if one answers. |
| Deep | Two paid reviewers with different focus, plus one free reviewer if one answers (focus: an open look). For a Claude change: Terra (logic, security, failure paths) and the Claude model you aren't (tests, docs, what the user sees, the project's rules); when Codex is short, Opus and Sonnet split those. For any other change: Opus (logic, security, failure paths) and Sonnet (tests, docs, what the user sees). |

Limits:

- **A free reviewer is never waited for.** One that is limited (a quota error, "Free usage limit reached", a 429 that a retry a few minutes later still gets, or no answer in its time) is dropped, except at Light, where the cross reviewer takes its place. OpenCode's free limit covers both its free models: after "Free usage limit reached" from one, don't try the other.
- **A paid reviewer that fails on a limit** is replaced once, by a paid model not already reviewing this round: Terra by the Claude model you aren't, or, if that one is already reviewing, by your own model in a fresh context (and a free reviewer joins, as when Codex is short); Sonnet by Opus, Opus by Sonnet, under the same rule. If the replacement fails too, review the diff yourself in a fresh pass, and say so in the record. A reviewer that timed out may still be running: stop it before you start its replacement.

### Trial reviewers

Two cheap models are on trial as reviewers: Codex's GPT-6 Luna and Claude Haiku 5.5, at high reasoning. At Standard and Deep, round 1 gets one of them as an extra reviewer: the one your brief names, or else whichever has more room (not Luna when Codex is short). Brief it like the others. Check its findings like any other reviewer's and fix the real ones, but the gate never rests on it: a round still needs its regular reviewers, and a limited trial reviewer is dropped, never replaced or waited for. Trial reviewers don't review at Light or in later rounds. The record marks them `trial=yes`, so a later study can decide whether either earns a regular place.

## 3. Brief them

Launch the round's reviewers in parallel, each with the same neutral brief from [references/reviewer-brief.md](references/reviewer-brief.md) and its own focus. Give the objective, the base and head, and the project's rules. Never give your transcript, your suspicions or the other reviewers' findings. Reviewers are read-only. How to launch each one on your host: [references/launching.md](references/launching.md).

## 4. Check each finding

Sort every finding into one of these:

- **must-fix:** a real defect this change introduces or exposes. Show it with a failing test where you can, then fix it with that test, as its own commit. If it names a kind of bug, fix every instance in the diff.
- **nit:** real but minor, such as wording, naming, or a weak test of something that works. Fix it when that's cheap; otherwise list it.
- **pre-existing:** true, but the diff didn't cause it. Don't fix it here unless it is small and in the files you changed; list it for the report.
- **rejected:** wrong or not applicable. Give one line on why.

Agreement between reviewers doesn't make a finding real, and "no defects" doesn't make the change correct: check the claims either way. At Deep, a must-fix that only one reviewer raised and that you can't show with a test goes to the other paid reviewer for a yes or no with its reason, before you change code.

## 5. Re-review, three rounds at most

Re-review only when a must-fix changed logic, not for docs, tests or wording. Send the paid reviewers who found must-fixes the diff since their review and the list of findings already raised, and ask about the fix and what it touches, without repeating earlier findings. Free reviewers don't re-review: a logic fix that only a free reviewer asked for goes to the round's paid reviewer (at Light, the cross reviewer, launched now).

Round 3 is the last. If it still finds a must-fix, stop and don't merge. Report that the review didn't converge, list the open findings, and say whether the approach itself looks wrong. In an orchestrated run that is status `ready`, and the orchestrator decides.

## 6. Record the result

Put a Review section in your handoff, or in your reply to the user, starting with these lines in this format, since later studies of the gate count them:

```text
review: level=<light|standard|deep> (<why, in a few words>) rounds=<n>
reviewer=<harness/model/level> rounds=<1,2> must-fix=<n> nit=<n> pre-existing=<n> rejected=<n> only-one=<must-fixes no other reviewer raised> <trial=yes, for a trial reviewer>
reviewer=<harness/model/level> skipped=<why: the limit error, or "Codex short">
```

Then list each must-fix with its commit, the open nits and pre-existing findings, and the rejected findings with their reasons.

## When the user asks for a review

Run the same gate. If they asked for a review only, show the must-fix and pre-existing findings and wait for their answer before changing code.
