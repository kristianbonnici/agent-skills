---
name: review-gate
description: Review a finished code change with independent reviewer agents before it merges. Pick a level (light, standard or deep) from what the diff touches, choose reviewers from other model families with fallbacks when a subscription is short, give them a neutral brief, verify and tag every finding, fix what is real, and re-review only fixes that changed logic, for as long as the review keeps converging (five rounds at most). Use before an agent merges its own change, whenever a brief says to run the review gate, and when the user asks for an independent review of a change by other models.
metadata:
  version: 8.1.0
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

Reviewers come from four families: Claude (Opus 5.5, Sonnet 5.5), Codex (GPT-6.2 Sol), Gemini (Gemini 4 Hydrogen, on Antigravity) and the free pool (OpenCode's DeepSeek V4.1 Flash and GLM-5.3 Flash, on OpenCode's free tier first, then on the owner's flat-rate OpenCode Go plan). Paid reviewers run at high reasoning, except Sol at medium, free ones at their high variant, Hydrogen at high.

- **A "paid reviewer"** below is Opus, Sonnet or Sol.
- **A "free reviewer"** is one of those two OpenCode models on either tier.
- **Hydrogen is neither.** It reviews beside the paid reviewers at Standard and Deep, and is Light's reviewer; it never takes a paid reviewer's place. It runs only on Antigravity, whose Gemini windows the run's helpers share.
- **No other model reviews,** apart from Claude Haiku 5.5 as the last of the free order (below): no other Gemini model, and no other OpenCode model (`opencode/` paid models bill per request, `opencode/gemini-4-hydrogen` among them, and Go's larger models use up the plan in a few reviews). A model gets a place only on the owner's word, after the `reviewer-benchmark` skill has measured it.

Claude Fable 5.2 never reviews, by default or as a replacement: it costs about twice Opus 5.5 and has a weekly limit of its own, kept for the demanding tasks the owner chose it for. A change Fable wrote counts as Opus's below: where Opus's change gets Sonnet 5.5, so does Fable's, and "your own model in a fresh context" means Opus 5.5.

- **The cross reviewer** is the paid reviewer of another family: Codex's GPT-6.2 Sol for a change any family but Codex wrote (Claude, Gemini or a free model), Claude Sonnet 5.5 for a change Codex wrote.
- **Codex is short** when your brief says so, or when a Codex reviewer fails on a usage limit. Then a Claude change's cross reviewer is the Claude model you aren't (Sonnet for Opus's change, Opus for Sonnet's), and a free reviewer joins to bring a second family back; any other change's is Sonnet.

| Level | Round 1 |
|---|---|
| Light | Gemini 4 Hydrogen, while Antigravity's Gemini 5-hour window is under about 60%, unless a Gemini model wrote the change. Otherwise, or when it is limited, one free reviewer. If none answers, the cross reviewer. |
| Standard | The cross reviewer and Hydrogen. When Codex is short: its Claude substitute and Hydrogen, plus one free reviewer if one answers. |
| Deep | Two paid reviewers with different focus, plus Hydrogen and one free reviewer if one answers (focus for both: an open look). For a change any family but Codex wrote: Sol (logic, security, failure paths) and Opus (tests, docs, what the user sees, the project's rules), whichever model wrote it: for Opus's own change, Opus as a new agent that gets the brief and nothing else of yours; when Codex is short, Opus and Sonnet split those. For a change Codex wrote: Opus (logic, security, failure paths) and Sonnet (tests, docs, what the user sees). |

Limits:

- **Hydrogen gets its time and no more** (15 minutes, with the same checkpoints as a free reviewer), and reviews in round 1 only. It doesn't review a change a Gemini model wrote, or while Antigravity's Gemini 5-hour window is past about 85% (at Light, at about 60% or more: there the review is its alone). When it doesn't review, or is limited:
  - at Light, the free order below takes over, as if Hydrogen hadn't been chosen;
  - at Standard, one free reviewer takes its place if one answers, unless one is reviewing already;
  - at Deep, nothing takes its place.
- **A free reviewer gets its time and no more** (15 minutes for each model). One that is limited (a quota error, "Free usage limit reached", a 429 that a retry a few minutes later still gets, in T3, no activity yet or turns typically more than a minute apart when you check its pace 5 minutes after launch; or no answer in its time; [references/launching.md](references/launching.md) has the checkpoints) moves on in this order: free DeepSeek, free GLM, Go DeepSeek, Go GLM, and at Standard and Deep, last, Claude Haiku 5.5 at high, with a free reviewer's brief and time. Haiku is left out for a change a Claude model wrote while Codex is short: there the free reviewer is to bring a second family back, and Haiku isn't one. When the order runs out, it is dropped, except at Light, where the cross reviewer takes its place.
  - OpenCode's free limit covers both its free models: after "Free usage limit reached" from one, go straight to Go.
  - A model that is slow or doesn't answer is limited on its own: the next model in the order still gets its turn, since slowness is often one model's, not the tier's.
  - A Go model that "requires Global regions" isn't limited, just unavailable: try the other.
  - Before you launch a Go model, read Go's windows ([references/launching.md](references/launching.md)). Past about 85% of any of them, Go counts as limited.
- **A paid reviewer that fails on a limit** is replaced once, by a paid model not already reviewing this round: Sol by the Claude model you aren't (Sonnet when no Claude model wrote the change), or, if that one is already reviewing, by your own model in a fresh context (and a free reviewer joins, as when Codex is short); Sonnet by Opus, Opus by Sonnet, under the same rule. If the replacement fails too, the round has no independent reviewer: don't merge. In an orchestrated run, report status `ready` with "no reviewer available" (the orchestrator runs the gate again once a reviewer has room); otherwise review the diff yourself in a fresh pass, say so in the record, and leave the merge to the user. A reviewer that timed out may still be running: stop it before you start its replacement.

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

**Ask the reviewer when you tag its blocker lower.** When you reject a finding a reviewer tagged a blocker, or give it a lower tag, ask that reviewer whether it agrees, with the question in [references/reviewer-brief.md](references/reviewer-brief.md#the-question-about-a-tag): the finding as it reported it, your tag and your reason. A free reviewer's blocker, or Hydrogen's or Haiku's, goes to the round's paid reviewer instead (at Light, the cross reviewer, launched for this). Put the question in that reviewer's next round when it has one; otherwise launch it alone, with 10 minutes and no replacement. Record the answer: `agrees`, `holds` or `no answer`. Your tag stands whatever the answer: a reply never makes a blocker, holds back the merge, counts in section 5, or starts a fix or a round in this gate. If the answer shows you a case you got wrong, the most you do is tag the finding a follow-up and list it open with the fix it needs: it is fixed after the merge, as any open follow-up is.

## 5. Re-review while it converges

Re-review only when a fix changed logic, not for docs, tests or wording. Send the paid reviewers who found blockers or follow-ups the diff since their review and the list of findings already raised, and ask about the fix and what it touches: no earlier finding again, except one a fix didn't settle, reported as "not fixed". Free reviewers, Hydrogen and Haiku don't re-review: a logic fix that only one of them asked for goes to the round's paid reviewer (at Light, the cross reviewer, launched now).

A conflict resolution after the review that changed logic gets one more look by the cross reviewer, outside the count of rounds; if that look finds a blocker, stop as for a review that didn't converge, below.

Up to five rounds, re-review as above. A blocker that comes back as "not fixed" counts as a blocker of its round; one that comes back narrower (the fix settled most of it, a smaller case still fails) is progress while the count falls. Stop, and don't merge, only when:

- the blocker count doesn't fall over two rounds: two rounds in a row each find at least one blocker, and as many as the round before them or more (4, 4, 2 goes on; 4, 4, 4 stops at round 3; a round with no blocker never counts toward a stop);
- the approach itself is in dispute: a finding says the design is wrong, not a detail of it, and no fix inside the approach settles it;
- round 5 still finds a blocker.

Then report that the review didn't converge, list the open blockers and follow-ups with the fix each needs, and say whether the approach itself looks wrong. In an orchestrated run that is status `ready`, and the orchestrator decides.

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

- Name each model in plain words, with its reasoning level: `Codex GPT-6.2 Sol, medium`. Mark OpenCode's with `(free)` or `(Go)`, so the two tiers stay apart. The table takes the names from `review.json`.
- A zero is `–`, and a blocker count above zero is bold.
- "Unique defects" counts the blockers and follow-ups no other reviewer raised.
- The "Tagged lower" line counts the findings a reviewer called a blocker or follow-up that you tagged lower or rejected. It is left out when there are none.
- The "Replies" line counts what the reviewers answered about the blockers among them (section 4). It is left out when you asked none.
- The skipped line names every model that was skipped or that a reviewer moved on from, separated by semicolons. It is left out when there are none.
- The record line says where the record is. Keep it: a later count takes a table without it for a gate that has no record.

Then list each blocker with its commit, each follow-up with its commit or, if open, the fix it needs, the open nits and pre-existing findings, and the rejected findings with their reasons. Under its own heading, "A reviewer held", list each blocker you rejected or tagged lower whose reviewer held: what it says goes wrong and when, and your reason for your tag.

## When the user asks for a review

Run the same gate, with its record. If they asked for a review only, show the blockers, follow-ups and pre-existing findings and wait for their answer before changing code.
