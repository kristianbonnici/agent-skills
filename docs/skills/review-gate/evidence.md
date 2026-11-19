# Why the review gate works this way

The skill states its rules without their reasons, to keep the model's context for the work. The reasons are here.

Last checked: new work 2026-11-13; sources 2026-10-30.

## Our own runs (study of 2026-10-30)

263 task handoffs from 21 overnight runs of the long-horizon orchestrator, 2026-10-04 to 2026-10-29,
across a macOS app, a website and these skills. Almost every task had 1 to 5 fresh reviewers (Claude
Opus and Sonnet, a few Codex and Gemini), and the task verified each finding before fixing it. A model
sorted each finding; where to draw the line between serious and minor is a judgment, so read the numbers
as rough. The per-task details stay in the owner's private records.

- **Findings:** about 3,690 in all. About 9% were serious (a real defect that would have shipped),
  75% minor (docs out of step, a weak test, wording) and 15% rejected by the task as wrong.
- **Tasks with at least one serious finding:** 62%. A review that found nothing was practically
  unknown.
- **Where serious findings came from:** almost all from changes that read outside input, touched
  security or privacy, the user's files and settings, processes, concurrency or lifetimes, or release
  machinery. Examples of the kind:
  - a link that made the app act without asking first;
  - a cleanup that deleted data another running copy still needed;
  - a script that could stop the user's own running app;
  - a setting flipped in another app while a password field had focus;
  - crashes on crafted input.

  Docs-only, wording and visual-polish tasks almost never had one. A run of nine visual-redesign tasks
  had 4 serious findings, against 43 the tasks rejected as wrong. → *the three levels, and what makes a
  change deep.*
- **More reviewers:** more reviewers went with more serious findings per task (0.65 with one reviewer,
  1.12 with two, 2.04 with three or more). Larger tasks got more reviewers, though, and the serious share
  of findings stayed at 8–15% whatever the count. A second reviewer sometimes caught what the first
  missed, and sometimes duplicated it. → *two reviewers only at Deep, with different focus.*
- **A second round after fixes:** found something new in 18% of tasks, including defects the fixes
  themselves introduced. → *re-review after a fix that changed logic.*
- **Long loops:** a few tasks ran 3 to 5 rounds for one real finding. → *re-reviews that look only at
  the fix, and a stop when rounds stop converging.*
- **The gate's review of its own first version** (Codex's Terra, 2026-10-30): rounds found 7, 4 and 2
  must-fixes, all real. A flat cap of three rounds stopped a review that was settling, so rounds 4 and 5
  are allowed while each round finds fewer must-fixes than the one before. Under that rule, rounds 4 and
  5 found 1 and 0, and the review converged. → *converging, not counting.*
- **Codex's GPT-6.1 Sol as a reviewer:** in a few tasks, it found issues that three Claude reviewers had
  missed. → *a reviewer of another family by default.*
- **Gemini as a reviewer:** the weakest. One review declared "no defects" on evidence that didn't hold
  up, and another took three rounds for two wording fixes. → *Gemini doesn't review.*
- **Reviews lost to limits:** several reviews hit a usage limit or stalled, and returned nothing. →
  *a fallback for every reviewer, and free reviewers never waited for.*
- **OpenCode's free models:** this study has no data on them as reviewers. The gate records each
  reviewer's must-fixes, the must-fixes only it found, and its rejected findings, so the next study can show whether they earn a
  place at more levels or fewer.

## Outside sources

- **Anthropic, [How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic/)**
  (Addy Osmani, Morgan Westlee Lunt, Qing Wang, 15 October 2026):
  - Before a pull request exists, the change shows its test and build output, and a subagent with fresh
    context reviews the diff.
  - On the pull request, several agents hunt for bugs and a separate group votes on each finding; only
    findings enough of them agree on are posted, tagged Important, Nit or Pre-existing.
  - A classifier sets how many human approvals a change needs, from what it changes.
  - One pull request went through more than 50 review rounds overnight, and about 59% of what kept being
    flagged had been there since the first pass. A cap of three rounds, re-reviewing only the diff and
    never repeating a finding raised passing after one round from 65% to 78%, and cut changes needing
    five or more rounds from 8.9% to 1.5%.

  → *the pre-existing tag, stopping a loop, diff-only re-reviews without repeats, levels set by what
  the change touches, and a second opinion on an unconfirmed must-fix at Deep.*
- **Zhang et al., [Rethinking Verification in Agent Harnesses](https://arxiv.org/abs/2610.34577)**
  (arXiv 2610.34577, 25 October 2026):
  - Compared reminders, completion gates and an independent critic across seven open-weight coding
    models.
  - The independent critic gave the best accuracy for its cost: +5.9 to +9.5 points on Terminal-Bench at
    1.13–1.25× the cost, and +3.9 to +6.6 points on SWE-bench Verified at 1.00–1.04×.
  - Extra rounds or critics added up to 3.5 points more on Terminal-Bench.

  Its models are open-weight, so gains on Claude or GPT may be smaller. → *a separate reviewer on
  every change, rather than reminders to the author.*
- **Patel, Liao, Henderson, He and Chen, [Do Coding Agents Catch Their Own Bugs? (They Don't.)](https://arxiv.org/abs/2611.01181)**
  (New York University, Princeton, Stanford; arXiv 2611.01181, 31 October 2026, preprint):
  - Foresight-SWE: 212 tasks from 35 repositories in 4 languages, each with a defect a later pull request
    fixed. Across eleven models, agents resolved 60.68% of tasks on average but also avoided the later
    defect in only 14.84% (6.13% to 24.53% by model).
  - Told which defect to avoid, five of the models resolved 91.23% of tasks on average: "the primary bottleneck is identifying the
    latent defect rather than implementing its repair once identified."
  - The author's own review pass (Claude Code's `/self-review`, Codex's `/review`) raised that rate for all
    three models it was tried on (Claude Opus 5 from 24.53% to 35.85%, GPT-5.6 Sol from 18.40% to 24.06%,
    Claude Sonnet 5 from 16.98% to 18.40%) but lowered the resolve rate every time (GPT-5.6 Sol by 14.62
    points, from 84.43% to 69.81%).
  - Silent defects were caught less often than loud ones (12.5% against 18.5%).

  → *a separate reviewer on every change rather than the author's own check; re-review after a fix that
  changed logic.*
- **Pereira, Sinha, Ghosh and Dutta, [CR-Bench-v2: Evaluating the Real-World Utility of AI Code Review Agents](https://arxiv.org/abs/2611.02566)**
  (Nutanix; arXiv 2611.02566 v2, 3 November 2026, preprint):
  - Eight review agents on four backbones (GPT-5.2, GPT-5-mini, Gemma 4 31B, GPT-OSS 20B), plus Gemini
    Code Assist, on 174 verified instances with a labeled defect each, scored by three model judges.
  - "Even the strongest systems detect only about one-third of known defects" (GPT-5-mini 33.7%, GPT-5.2
    33.0%, both with Reflexion). Gemini Code Assist's comments were judged useful 78.0% of the time but
    found 8.1% of the defects.
  - With Reflexion, the two strongest found 45.8% and 48.8% of high-severity defects, against 27.0% and
    26.0% of medium ones; severity mattered only for the GPT-5 backbones.
  - Its conclusion: "agents should assist human reviewers, not gate merges."

  The gate doesn't treat a review as proof: "no defects" doesn't make a change correct, its checks must
  pass first, and a review that doesn't converge doesn't merge. Its backbones are a generation or more behind
  the reviewers here, and each judged one labeled defect per instance. → *checking every claim either way,
  and running the gate only once the change's checks pass.*
- **David Ondrej's [public skills](https://github.com/davidondrej/skills)** (`gpt-review`,
  `total-review`, read 2026-10-30): reviews run by hand, one skill per reviewer model.
  - Each reviewer gets the same neutral brief, which never hints at suspected bugs or mentions the
    other reviewers.
  - Each issue is rated from 1 to 10 for how often it would happen and how bad it would be.

  → *the reviewer's brief.* His skills run only when he invokes them and approves the fixes; ours run
  unattended, so one skill decides the level and the reviewers itself.

## Which cheap models review (2026-10-31)

Why Go's two flash models take the free reviewers' place when the free tier stops, and nothing bigger does:

- **The free limit:** on 2026-10-29 it stopped both free models for the whole computer after six minutes,
  and again after 33 minutes. → *a paid backup for the same two models.*
- **[Kodus Code Review Bench](https://www.codereviewbench.com/leaderboard)** (30 pull requests, 95 known
  bugs; Kodus sells a review product): DeepSeek V4.1 Flash F1 41.5 (95% range 24.7–49.0), GLM-5.3 Flash
  40.0 (29.1–49.4), Kimi K2.7 Code 43.1 (28.1–48.7), Kimi K3 39.9 (32.3–50.5). The top 11 models overlap,
  so the costlier ones aren't shown to be better. → *the flash models stay; no Kimi.*
- **[Qodo's comparison](https://www.qodo.ai/blog/which-llm-should-review-your-code/)** (2026-10-12; Qodo
  sells a review product): full GLM-5.3 F1 52.1%, behind only Claude's Opus, Sonnet and Fable. It is the one
  cheap model with evidence of beating the flash pair, and the case for adding it later.
- **[OpenCode Go](https://opencode.ai/docs/go/):** the docs give each model a monthly limit, with 20% per
  5 hours and 50% per week, and say a model's limit "determines how its usage counts toward those
  allowances". They don't say whether models share one allowance. On 2026-10-31, $0.54 of full GLM-5.3
  (limit $15) showed as 7% of the week and 4% of the month on a single set of console meters, which fits a shared
  limit but doesn't prove it. A review estimated at $1.16 at list price (40 turns of 60K context, 90%
  cached) would be about 15% of a week. → *full GLM-5.3 stays out until the limit is shown to be
  separate.*
- **One trial** (2026-11-01): the same brief on this change's first commit, whose problems three reviewers
  had already found. Free DeepSeek V4.1 Flash reported 10 findings, mostly real. Muse Spark 1.3 Contributor
  reported 6 in 10 turns and 4 minutes, one of them a loop nobody else had found. Beam Free reported 1 in
  13 turns. Iceman Contributor Free reported none in 78 turns and 25 minutes, past a free reviewer's time.
  One commit of Markdown proves little, and Muse's public scores disagree (Meta's own against
  [Vals' Terminal-Bench 4](https://www.vals.ai/benchmarks/terminal-bench-4)). → *Muse on trial, where the
  gate never rests on it; Beam for helpers only; no Iceman.* Beam Free keeps data 30 days and doesn't train
  on it (OpenCode's docs). With the free tier stopped, `opencode/beam-free` refused while
  `opencode-go/beam-free` answered, and Go's meters stayed at 7% and 3% through the trial. → *Beam goes
  first on Go.*
- **Gemini 4 Hydrogen** (2026-11-13; [Google Cloud's model page](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/4-hydrogen),
  [SiliconANGLE](https://siliconangle.com/2026/11/12/google-releases-gemini-4-hydrogen-a-lower-cost-model-said-to-outscore-argon/),
  [TestingCatalog](https://www.testingcatalog.com/google-launches-gemini-4-hydrogen-for-pro-and-ultra-users/) and
  [Silicon Report](https://www.siliconreport.com/google-launches-gemini-4-hydrogen-replacing-gemini-3-8-flash)): Google's lower-cost
  Gemini 4 model, released 2026-11-12 to replace Gemini 3.8 Flash, which Google's own figures put at 51 on
  the Artificial Analysis Intelligence Index against Gemini 4 Argon's 50. No independent review benchmark
  yet, and our own record of Gemini reviews is poor (above). It runs on Antigravity's Gemini windows, which
  a probe on 2026-11-13 found cost about 0.2% of the 5-hour window for a 28,000-token call. → *Hydrogen on
  trial, where the gate never rests on it; no other Gemini model reviews.*

## Gemini 4 Hydrogen as a reviewer (2026-11-13)

Five reviews by `gemini-4-hydrogen-high` with the trial reviewer's brief: one in T3 of review-gate 3.2.0's own
change, and four through `agy --mode plan` of earlier releases of these skills, each in a clone that ends at
that commit, so the later fixes weren't visible. Each was scored against the defects that change's first
review round found and fixed, by up to four reviewers together (Terra, Sonnet, a flash model, a trial
reviewer), and each finding outside that list was checked against the code.

| Change | Known first-round defects | Hydrogen found | Hydrogen's others | Time |
|---|---|---|---|---|
| review-gate 3.2.0 / orchestrator 5.1.0 (rules) | 4 (Terra) | 4 | 1 real (Terra missed it) | 5.5 min |
| orchestrator 5.0.0 (rules, three scripts) | 5 | 1 | 1 wrong (`ps` truncating piped output; it doesn't) | 4 min |
| orchestrator 3.9.0 (rules, two scripts) | 5 | 1 | 1 real, open until orchestrator 5.2.2 (Fable's effort unset on Claude Code), 3 plausible, 2 nits | 4 min |
| orchestrator 3.8.0 (three scripts that delete or lock) | 9 | 6, both blockers among them | 1 real, open until orchestrator 5.2.2 (`lease` loops on a relative `--run`) | 3 min |
| orchestrator 3.7.0 (a new 800-line script) | 4 | 1 in part, and one a later round found | 1 real, open until orchestrator 5.2.2 (a sibling task's merge credited to another task), several plausible | 4 min |

- **Recall:** 13 of 27 known defects (48%), where each list is what all of that round's reviewers found
  together. It did best on script logic (6 of 9) and worst where the defect sat in how rules meet each other
  over time (Fable's weekly reset, a lease hiding a stuck command).
- **Precision:** one wrong claim of the findings checked. It tagged some follow-ups as blockers.
- **What no reviewer had found:** three real defects, one per older release, still in the code then and fixed in orchestrator 5.2.2.
- **Cost:** about 3.4% of Antigravity's Gemini 5-hour window and 0.8% of its week per review, 3 to 5 minutes
  each, on the Pro plan.
- **Launching it outside T3:** headless `agy` ends the session at the first shell command no allow rule
  matches, so twelve attempts came back empty in 8 seconds (an untrusted folder, `git -C <path>`, a chain
  with `&&`, a test run) before the allow list and the brief's one-command rule were in place.

→ *Hydrogen stays a trial reviewer: one review isn't enough to rest a gate on, but it is a useful extra voice,
level with a paid reviewer on today's rules change and strong on script logic. Five reviews are a small
sample; the trial's study at about 20 decides.*

**DeepSeek V4.1 Flash on the same five** (2026-11-13): the free tier through `opencode run --agent plan`,
with the same brief, clones and scoring, one review at a time. A partial match counts as half.

| Change | Known | Hydrogen | DeepSeek |
|---|---|---|---|
| review-gate 3.2.0 / orchestrator 5.1.0 | 4 | 4 | 1 |
| orchestrator 5.0.0 | 5 | 1 | 2 |
| orchestrator 3.9.0 | 5 | 1 | 1 (a different one) |
| orchestrator 3.8.0 | 9 | 6 | 2.5 |
| orchestrator 3.7.0 | 4 | 1.5 | 2.5 |
| **All** | **27** | **13.5 (50%)** | **9 (33%)** |

- Hydrogen found more on four of the five, by far on the rules change and the scripts that delete or lock.
  DeepSeek found more on two: a fallback when a `ps` listing fails, and a call killed on a short look.
- They overlap little: together they found about 16.5 of the 27 (61%).
- Neither made a claim that the code disproves beyond the one above (both raised `ps` truncating piped output,
  DeepSeek as suspected). DeepSeek tagged no finding a blocker, including the one the original round did
  (a task's cleanup taking a sibling task's folder); Hydrogen tagged some follow-ups as blockers.
- DeepSeek took 4 to 6.5 minutes each and cost nothing; Hydrogen 3 to 5.5 minutes and about 3.4% of the
  Gemini 5-hour window.

→ *on this sample Hydrogen is the better single reviewer, and the two together beat either. Five changes
scored by one agent is a small, judged sample, so no rule changes on it alone.*

## Blockers and follow-ups (2026-11-06)

One overnight run of nine deep-reviewed tasks building a new app: the stop rule stopped 8 of the 9, and four
parts waited the night for the owner. A must-fix had no severity, so a race during an undo, a redirect that
kept a stale id or a malformed URL held back a merge exactly as data loss on a common path would. Counts
fell round by round (6, 2, 1; 13, 5, 1, 1; 11, 7, 1, 1), and one narrower re-find of the last finding, or
one round as high as the one before, read as "didn't converge". Nearly every finding that stopped a review
was of the rare-timing or rare-input kind. → *only blockers hold back the merge and count for convergence;
follow-ups are fixed when cheap or listed; a stop needs two rounds without a fall, a disputed approach or a
blocker in round 5.*

## The record (2026-11-14)

What the gate had left on one computer by 2026-11-12, and what a study could do with it:

- **The table is written.** All 93 task handoffs saved since the gate shipped carry the Review table.
- **It is the author's account alone.** The table counts findings by the author's tags. A reviewer's own
  report was kept in about 28 of the 93 task folders (counted by file name), since no rule asked for it. So a
  study could rarely see what a reviewer had said, the tag it gave, or whether a rejection held. One handoff
  wrote the difference into a cell by hand: "3 (1 by my tag)".
- **Nothing read the tables.** The study of 2026-10-30 had a model sort about 3,690 findings from prose. In
  the tables, eight reviewer models were written 25 ways (the reasoning level before or after "(trial)", with
  or without the host's name, with a note such as "fresh look").
- **A gate outside an orchestrated run left no file,** only its reply in the conversation.
- **Anthropic** (the post above) judges its reviewer's noise by how the author answered each comment: fixed,
  wrong, intended, or not worth fixing. There a separate group of agents votes on each finding before it is
  posted; here the author judges the findings, so the author's answer needs the reviewer's words beside it to
  be checked later.

→ *each reviewer's report saved as it arrives; one entry per finding with the reviewer's tag, the author's,
how it was checked and why it was lowered; the Review lines printed from that file; a script that totals the
records.*

The first totals, over the handoff tables of 2026-11-01 to 2026-11-12 (`review-records totals` read 92 of
the 93 handoffs; one had the cell above): 93 gates, since one handoff held two. 88 reviews by Terra, 57 by
Sonnet, 58 by DeepSeek V4.1 Flash (31 free, 27 on Go), and by the trial reviewers 35 by Haiku, 24 by Luna
and 16 by Muse. Rounds: 14 gates took one, 26 two, 24 three, 13 four and 16 five.

Six of the 93 handoffs held two Review tables, and only one or two of those were two gates: the others were
an updated table, or one more look at a fix, with no verdict line of its own. → *a handoff's table is a gate
when it has its own verdict line; a table printed from a record carries a "Record" line and is counted from
that record.*

Not recorded: what a gate missed. A later fix to code a gate passed is in git, and the record names the
commits the gate reviewed, so a study can look for it without a rule that costs every gate attention.

## The reviewer's reply (2026-11-14)

The owner's decision (2026-11-14): when the author tags a reviewer's blocker lower, give it back to the
reviewer and see whether it agrees, but "even if they don't agree, let's not block it, but let's make it
visible", to observe what happens.

- **Why ask at all:** the author sorts the findings about its own change, and only its blockers hold back a
  merge. Anthropic (the post above) has a separate group of agents vote on each finding before it is posted.
  Before 4.1.0 the record couldn't show how often an author tagged a reviewer's blocker lower. In 4.1.0's own
  gate it was 1 of 16 findings: the reviewer tagged a corner case in reading older handoffs a blocker, the
  author a follow-up, and nothing asked the reviewer whether the author's reason held.
- **Why it never blocks:** reviewers tag high. In the five reviews above, Hydrogen tagged some follow-ups as
  blockers, and a reviewer asked about its own finding has a reason to hold. When every found defect counted
  toward the stop rule, one night's run stopped 8 of 9 tasks (above). → *the author's tag stands; a reply
  is recorded and reported, and starts no fix or round.*
- **What it should show later:** how often a reviewer holds, and whether the findings it held on were fixed
  afterwards. The record keeps both tags, the author's reason, the reply and the commits the gate reviewed,
  so a study can look in git for a later fix. A count of "held" replies alone will overstate real problems.

## The reviewers side by side (2026-11-14)

`review-records totals` over 94 gates of 2026-11-01 to 2026-11-14 (93 from handoff tables, 1 record), with
free and Go tiers of a model together. "Defects" are blockers and follow-ups, and must-fixes from tables
before 3.0.0; "unique" are the defects no other reviewer of that gate raised.

| Reviewer | Reviews | Defects per review | Unique per review | Blockers | Rejected, of all its findings |
|---|---|---|---|---|---|
| GPT-6.1 Terra | 89 | 6.0 | 4.4 | 62 | 3% |
| Claude Sonnet 5.5 | 58 | 4.2 | 2.4 | 18 | 3% |
| DeepSeek V4.1 Flash (free and Go) | 59 | 1.7 | 0.8 | 4 | 8% |
| Claude Haiku 5.5 (trial) | 35 | 1.9 | 0.8 | 3 | 14% |
| GPT-6 Luna (trial) | 24 | 1.0 | 0.2 | 0 | 9% |
| Muse Spark 1.3 Contributor (trial) | 16 | 2.1 | 0.9 | 0 | 11% |

- The paid reviewers aren't comparable with the rest on these counts: they review every round, the others
  round 1 only and with 12 minutes, and the tags are the author's. Blockers have been counted apart only
  since 3.0.0.
- Among the cheap reviewers, Haiku and Muse found about as many defects per review as the flash model that
  already reviews, and Luna about half as many, with few that nobody else found. Haiku had the largest share
  of findings rejected.
- Haiku and Luna are past the 20 reviews the trial asks for; Muse is at 16 and Hydrogen at 1, besides its
  five reviews above.

→ *no rule changes on these counts alone: the trial's study is due for Haiku and Luna, and it should read
what each found, from the reports the record now keeps, not only how many.*

## The trial reviewers' study (2026-11-14)

The study the trial promised once a reviewer had about 20 reviews: 92 gates of 2026-11-01 to 2026-11-12, from
their handoffs. Haiku had 34 reviews, Luna 24 and Muse 16; Hydrogen had none in these gates (its five
scored reviews are above). DeepSeek V4.1 Flash, the cheap reviewer that already has a place, is the one to
compare with: 58 reviews. Trial and free reviewers all review round 1 only, in 12 to 15 minutes.

**Counted, from the Review tables** (the tags are the author's):

| Reviewer | Reviews | Gates with a defect from it | Gates where it alone found one | Defects per review | Found alone, per review | Blockers | Rejected, of its findings |
|---|---|---|---|---|---|---|---|
| DeepSeek V4.1 Flash | 58 | 79% | 50% | 1.7 | 0.8 | 4 | 9% |
| Claude Haiku 5.5 | 34 | 85% | 50% | 1.9 | 0.8 | 3 | 14% |
| Muse Spark 1.3 Contributor | 16 | 81% | 62% | 2.1 | 0.9 | 0 | 11% |
| GPT-6 Luna | 24 | 62% | 25% | 1.0 | 0.2 | 0 | 9% |

- **On the same gates as DeepSeek:** Haiku found 48 defects to DeepSeek's 41 over 25 gates (13 alone to
  20), Muse 28 to 27 over 12 gates (13 alone to 13), and Luna 16 to 27 over 15 gates (3 alone to 10), with
  fewer than DeepSeek in 8 of the 15.
- **Luna reported nothing at all in 3 of its 24 reviews;** Haiku in none, Muse in one.
- **Cost isn't what separates them:** in the two runs with a cost report, a review by any of them came to a
  few cents at API list prices.

**Read, from the findings the handoffs list by reviewer** (a model read each Review section; a fifth to a quarter of
the defects aren't attributed to a reviewer there, two fifths for Muse, and DeepSeek's are from every second
handoff):

| Reviewer | Defects read | Found alone | Of those, would plausibly have mattered to a user | On a common path | Rejected claims that were wrong about the code |
|---|---|---|---|---|---|
| DeepSeek V4.1 Flash (29 reviews) | 35 | 12 | about 6 | 1 | 9 of 12 |
| Claude Haiku 5.5 (34) | 50 | 19 | about 5 | 3 | 11 of 26 |
| Muse Spark 1.3 Contributor (16) | 18 | 7 | about 2 | 2, both shared | 6 of 7 |
| GPT-6 Luna (24) | 18 | 6 | 1 or 2 | 1 | 1 of 3 |

- **What they find:** corner cases and missing hardening, in all four. Most of each one's defects (61% to
  74%) needed a corner case or rare timing, and a common-path defect was rare.
- **Where they differ:** DeepSeek found more hazards to the user's data than the others, two of them alone.
  Haiku found the one security defect any of them found alone, and most of the defects in docs and rules.
  Muse found small state and ordering slips, and nothing in security, data, tests or release. Luna's hits on
  serious defects were all shared with another reviewer.
- **What they cost the author:** from Haiku a rejected claim for every two or three defects, from DeepSeek
  and Muse one for every four, and from Luna one for every eight. Half or more of those claims were wrong
  about code that already handled the case.

→ *none of them can stand in for a paid reviewer: the best of them found a user-facing defect alone in one
review of five, Luna in about one of fifteen, and almost none found a common-path defect. Luna has had its trial and adds least: half the defects
of the others, fewer than DeepSeek on the same gates, and little found alone that mattered. Haiku holds up
as well as DeepSeek does. Muse looks level with both on 16 reviews, four short of the trial's 20. Any change
of the reviewers is the owner's decision; none is made here.*

Limits: the "would have mattered" column is a model's judgment of the author's own summaries, on small
numbers. From 4.1.0 a gate keeps each reviewer's report, so the next study can read what a reviewer said
rather than what the author made of it.

## The replay benchmark (2026-11-15)

The owner's idea (2026-11-15): run candidate reviewers on the same past changes, and score them against what
those changes' reviews found. 16 app-code changes of 2026-11-03 to 2026-11-12 from two apps, 134 to 2,439
added lines each, each rebuilt as a repository of two commits (before the change, and what its first review
round read), so nothing after the review is visible. The answer key is the 108 defects the first rounds of
their gates found and the authors accepted (17 of them blockers), each confirmed in the code at that commit.
Every model got the gate's brief for a free or trial reviewer and 15 minutes, through its command-line tool.
The reports were scored blind, by letter: 1 for a known defect described, a half for the right code without
the failing case.

| Reviewer | Reports, of 16 | Known defects found, of 108 | Blockers, of 17 | Found by it alone | Minutes per review |
|---|---|---|---|---|---|
| DeepSeek V4.1 Flash | 16 | 30.5 (28%) | 4 | 5 | 6.4 |
| Gemini 4 Hydrogen | 16 | 29 (27%) | 3 | 11 | 4.4 |
| GLM-5.3 Flash | 14 | 21.5 (20%) | 2 | 6 | 7.6 |
| MiniMax M3.1 Flash | 13 | 21 (19%) | 3 | 3 | 6.5 |
| Claude Haiku 5.5 | 16 | 20 (19%) | 2.5 | 4 | 1.6 |

What each said beyond the key, where it called the finding a blocker or follow-up: all 110 such findings were
checked against the code by a second, stricter model (the first scorer had filed most under "minor" unread).

| Reviewer | Findings outside the key | Real defects | True but minor, or there before | False | False, of all its blockers and follow-ups |
|---|---|---|---|---|---|
| Gemini 4 Hydrogen | 23 | 12 | 9 | 2 | 4% |
| DeepSeek V4.1 Flash | 25 | 6 | 15 | 4 | 7% |
| GLM-5.3 Flash | 15 | 3 | 10 | 2 | 5% |
| MiniMax M3.1 Flash | 29 | 7 | 17 | 5 | 9% |
| Claude Haiku 5.5 | 18 | 4 | 10 | 4 | 10% |

- **MiMo-V2.6-Flash was too slow to score.** It reported in time on 1 of 4 changes, the smallest, in 14
  minutes. Given 30 minutes on four mid-size changes it finished two, in 27 and 29 minutes.
- **Reports that never came:** GLM ended two reviews without writing one, and MiniMax ran out of time on
  three. DeepSeek, Hydrogen and Haiku reported every time.
- **Together:** DeepSeek and Hydrogen found 41 of the 108 in full between them, the most of any pair; all
  five found 58. None of the five found the other 50 in full.
- **False claims are the smaller cost:** 17 of the 110 findings outside the key were false, between 2 and 5
  a model. The larger cost is the true but minor: 61 of the 110, which an author must still read and weigh.
- **Real defects the original reviews missed:** 32 of the 110 held up as real (some the same defect from
  two or three models), 12 of them Hydrogen's. So the key understates a model that finds what the paid
  reviewers didn't, Hydrogen most of all.
- **Not checked:** the findings a model itself called nits, 18 to 34 a model, and whether a blocker tag was
  earned (only a handful of findings outside the key carried one).

Limits: about four points either way on each share, so two tiers and no finer order. A few of the "false"
verdicts are the checker's judgment of code it couldn't run. The key favours the
models that took part in the original first rounds (DeepSeek often, Haiku and GLM sometimes) over those that
didn't (Hydrogen, MiniMax). One model scored the reports. Haiku ran with a narrower set of commands than it
has in a gate, which may be why it was both fastest and lowest. The benchmark's changes, keys, reports and
scores stay in the owner's private state.

→ *a first round of two paid reviewers and their extras found all 108; the best cheap reviewer found 28% of
them and the best pair 38%, so none stands in for a paid reviewer. DeepSeek and Hydrogen are the two worth a
regular place, and they find different things; Hydrogen also says the least that is false and finds the most
that the original reviews missed. GLM stays DeepSeek's fallback. MiniMax M3.1 Flash and
MiMo-V2.6-Flash earn no place: one no better than GLM and less often done in time, the other too slow. Any
change of the reviewers is the owner's decision; none is made here.*

## The benchmark's second run (2026-11-15)

The owner asked for Muse on the same set, and for the paid reviewers as references ("to get really good
references on different models"). Four more models reviewed the same 16 changes, now through the
[reviewer-benchmark](../reviewer-benchmark/README.md) skill: Muse Spark 1.3 Contributor with the brief and
15 minutes of a trial reviewer, and Codex GPT-6.1 Terra, Claude Sonnet 5.5 and Claude Opus 5.5 with a paid
reviewer's brief and 30 minutes. Scored blind as before. The key had grown to 133 defects with the first
run's 25 confirmed findings, and grew to 143 (20 of them blockers) with this run's 10; every saved report was
scored for each defect added.

| Reviewer | Reports, of 16 | Known defects found, of 143 | Blockers, of 20 | Found by it alone | Outside the key: true but minor, or there before | Outside the key: false | False, of all its blockers and follow-ups | Minutes per review |
|---|---|---|---|---|---|---|---|---|
| Claude Opus 5.5 | 16 | 54 (38%) | 10.5 | 6 | 16 | 1 | 1% | 5.3 |
| Gemini 4 Hydrogen | 16 | 46 (32%) | 4 | 12 | 9 | 2 | 3% | 4.4 |
| Claude Sonnet 5.5 | 16 | 45 (31%) | 5 | 0 | 15 | 2 | 3% | 2.5 |
| Codex GPT-6.1 Terra | 16 | 42.5 (30%) | 9 | 6 | 11 | 1 | 2% | 0.9 |
| DeepSeek V4.1 Flash | 16 | 39.5 (28%) | 5 | 1 | 14 | 4 | 7% | 6.4 |
| MiniMax M3.1 Flash | 13 | 29 (20%) | 3 | 4 | 16 | 5 | 9% | 6.5 |
| GLM-5.3 Flash | 14 | 26.5 (19%) | 3 | 3 | 9 | 2 | 5% | 7.6 |
| Claude Haiku 5.5 | 16 | 26.5 (19%) | 2.5 | 1 | 9 | 4 | 10% | 1.6 |
| Muse Spark 1.3 Contributor | 16 | 23.5 (16%) | 3.5 | 2 | 9 | 9 | 20% | 2.5 |

- **Muse was the weakest of the nine,** and one in five of its blockers and follow-ups was false: 9 of the 13
  false findings of this run's four models. Its 16 live trial reviews had looked promising; the same changes
  as everyone else did not bear that out.
- **Terra and Opus find the blockers.** 9 and 10.5 of the 20; every other model 2.5 to 5. Terra did it in
  under a minute a review.
- **Hydrogen finds what the others don't.** 12 defects only it found in full, twice the next model, and 20
  that neither Terra nor Sonnet found; DeepSeek adds 8 to that pair, GLM 9, Haiku 6, Muse 6. But 4 blockers:
  it is an addition to a paid reviewer, not a stand-in.
- **Sonnet found nothing alone.** 45 defects, each also found by another model. Terra and Sonnet together
  found 63; Terra and Hydrogen 71, as many as Terra, Sonnet and DeepSeek.
- **By level, for a change a Claude model wrote** (defects found in full, of 143, and blockers, of 20):
  Standard's cross reviewer, Terra, alone 41 and 9; with a trial extra, 54 and 10 (Haiku) or 52 and 10
  (Muse); with Hydrogen, 71 and 11. Deep's Terra, Sonnet and DeepSeek 71 and 13; with Hydrogen as well, 88
  and 15. All nine, 110 and 17. Three blockers and 33 defects no model found in full.
- **Opus adds the most after a paid pair:** 14 defects and 3 blockers that Terra and Sonnet missed, at the
  highest cost and the longest paid review.

Limits, beyond the first run's: each model reviewed each change once, so how much a result moves between two
runs isn't known; take the shares as tiers. The first key came from first rounds that Terra, Sonnet and Opus
often took part in, which favours them. The scorers were Claude models (Sonnet for the key, Opus for the
other findings), blind to which report was whose. The first run's findings outside the key were checked by
one checker and this run's by another instance, per change.

→ *review-gate 6.0.0 (owner, 2026-11-15: "yes, do all"): Hydrogen reviews beside the paid reviewers at
Standard and Deep and stays Light's reviewer. The trial ends: Muse and Luna get no place, and Haiku ends the
free order at Standard and Deep (level with GLM here, quick, and always done). No cheap reviewer replaces a
paid one. A model now earns a place through the benchmark, not a live trial. Whether Sonnet keeps its paid
place beside Terra is open: on this set every defect it found, another model found too, on one run.*

## Opus as Deep's Claude reviewer (2026-11-18)

Until 7.0.0 a Deep gate on a change a Claude model wrote had Terra and "the Claude model you aren't": Sonnet
for a change Opus or Fable wrote, which is most of them, since Opus is the tasks' home model. So the
stronger Claude reviewer on the benchmark's second run seldom reviewed.

| Deep's reviewers, for a Claude change | Defects found in full, of 143 | Blockers, of 20 |
|---|---|---|
| Terra and Sonnet | 63 | 11 |
| Terra and Opus | 69 | 14 |
| Terra, Sonnet, DeepSeek and Hydrogen | 88 | 15 |
| Terra, Opus, DeepSeek and Hydrogen | 96 | 16 |

- **Alone,** Opus found 54 defects, 10.5 of the 20 blockers and 6 defects no other model found; Sonnet 45,
  5 and none. Opus took 5.3 minutes a review, Sonnet 2.5.
- **The rule against a model reviewing its own change wasn't tested as such, but the set leans that way.**
  15 of the 16 changes had Terra as the cross reviewer of their own first round, which the gate gives only
  to a change a Claude model wrote, and 11 of those had Sonnet and not Opus as the Claude reviewer beside it, which it
  gives to a change Opus or Fable wrote. The set doesn't record each change's author, so this is read from
  who reviewed. The owner's account is the same: "most of the code that was part of this benchmark was,
  anyways, written with Opus". On those changes Opus, as a new agent with the brief alone, found more
  than Sonnet did.
- **Limits:** one review per model and change, so the gap in all defects (54 against 45) may be chance;
  the gap in blockers is wider. No run compared Opus on its own changes with Opus on another model's.
  The cost is about twice the review time, and Opus's share of the Claude week where Sonnet's was.

→ *review-gate 7.0.0 (owner, 2026-11-18: "I think we should maybe change Sonnet in here to Opus"): at Deep,
a Claude change's Claude reviewer is Opus, whichever Claude model wrote it. Standard, the change of another
family, and the Claude substitute when Codex is short are as they were.*

## The benchmark's third run (2026-11-18)

The owner asked whether two newly offered OpenCode models would fit as reviewers: GLM-5.3, the larger GLM, whose
Go allowance had just grown, and Hy4 flash Free, free for a limited time. Each reviewed the same 16 changes once,
with a free reviewer's brief and 15 minutes, and was scored blind as before. The key grew to 144 defects (20
blockers) with the one this run confirmed.

| Reviewer | Reports, of 16 | Known defects found, of 144 | Blockers, of 20 | Found by it alone | False, of its blockers and follow-ups | Minutes per review |
|---|---|---|---|---|---|---|
| Hy4 flash Free | 16 | 23.5 (16%) | 3.5 | 3 | 0% | 3.5 |
| GLM-5.3 | 12 | 22 (15%) | 1 | 0 | 6% | 4.8 |

- **GLM-5.3 gave no report on a quarter of the changes.** On 4 of 16 it started the project's tests in the
  background, wrote that it would report when they finished, and ended its turn. A headless run isn't resumed,
  so no report came, with no limit or error to show for it. A gate would lose that reviewer's time each time.
- **Hy4 flash Free was reliable and accurate, but found little:** every review reported, none of its findings
  was false, and it found about as much as Haiku and the smaller GLM.
- **Neither adds more than the free order's models.** Beside Terra and Hydrogen (72 defects in full, 11
  blockers), DeepSeek adds 10 defects and 2 blockers, Hy4 flash Free and Haiku 7 and 1, GLM-5.3 5 and 1.
- **The two checkers once disagreed.** A finding this run's checker ran and called real had been called true
  but minor in an earlier run's report; it now counts for both.

→ *No change (2026-11-18): neither model gets a place in the free order.*

## GPT-6.2 Sol at medium (2026-11-18)

The owner asked whether GPT-6.2 Sol, OpenAI's newer and costlier model, should replace GPT-6.1 Terra as the
Codex reviewer, perhaps at medium reasoning to keep its cost near Terra's at high. On Artificial Analysis's
index Sol at medium scores about 10 points above Terra at high for roughly 1.5 to 2 times the cost per task.
It reviewed the same 16 changes once, through `codex exec` as Terra, with a paid reviewer's brief and 30 minutes
(reviewer-benchmark 1.2.0 added the reasoning level). The key grew to 157 defects (21 blockers) with the 13 it
confirmed.

| Reviewer | Reports, of 16 | Known defects found, of 144 before this run | Blockers, of 20 | False, of its blockers and follow-ups | Minutes per review |
|---|---|---|---|---|---|
| GPT-6.2 Sol, medium | 16 | 61 in full | 17 | 0% | 2.3 |
| Claude Opus 5.5, high | 16 | 51 in full | 10 | 1% | 5.3 |
| GPT-6.1 Terra, high | 16 | 42 in full | 9 | 2% | 0.9 |

- **Sol at medium found the most of any model so far, with nothing false,** on the defects known before its
  run: half as many again as Terra, and nearly twice the blockers. It also found 13 defects no earlier review
  had, all confirmed against the code; on the grown key it has 74 in full and 18 of 21 blockers.
- **Pairs:** Sol and Hydrogen found 101 of 157 in full and 19 blockers, more than Terra, Opus and Hydrogen
  together (92 and 15).
- **Its scoring differed:** its reports were scored blind but alone, by Opus for both passes, where earlier runs
  had Sonnet against the key. That may be a little more generous; the gap is far larger.
- High reasoning wasn't run, to spare the owner's Codex allowance; nor was Sol tested against a usage limit
  across a real run of gates.

- **Set 1.5 tags every defect by today's definitions.** The oldest changes' gates had one tag, must-fix, for
  blockers and follow-ups alike; their 17 defects were tagged again, by a model reading each in its code without
  the scores, as 2 blockers and 15 follow-ups. On the 144 defects known before Sol's run, now 22 blockers and 122
  follow-ups, Sol at medium found 18 blockers and 43 follow-ups, Opus 11 and 40, Terra 10 and 32.

→ *Changed in 8.0.0 (owner, 2026-11-18: "let's swap it in for Terra"): GPT-6.2 Sol at medium is the Codex reviewer, in every place Terra had.*

## A cap on a follow-up patch's review (2026-11-20)

A follow-up patch fixes the follow-ups an earlier review listed, and those are the narrow cases: races of a
moment, rare input. Reviewing their fixes without a cap kept finding narrower ones. In one orchestrated run a
task's change took five Deep rounds and left four follow-ups; their patch took five more rounds and left three
new narrow follow-ups and seven nits, until the orchestrator told it by hand to list new non-blockers instead
of fixing them. In the next run three tasks were briefed with that cap from the start (fix blockers in any
round and follow-ups from rounds 1 and 2; list new non-blockers from round 3), and four capped patches each
converged in three rounds with no blocker left. The gate's other stops count blockers only, so without the
cap a stream of follow-ups never ends a review before round five.

→ *Changed in 8.3.0 (owner, 2026-11-20, accepting the proposal): a follow-up patch's review lists new non-blockers from round 3 on instead of fixing them.*

## Left out

Weighed and not cited, so later checks don't weigh them again unless they change:

- **Muse Wonder Full as a reviewer:** some practitioners use it as a premium reviewer. It is available only
  in Muse Code's $50 and $200 plans, with no API, and those plans train on the owner's code by default.
- **Iceman Contributor Free as a reviewer:** it found nothing in the trial above. Its maker isn't announced.
- **MiniMax's M Plan:** MiniMax M3 scored F1 29.6 on Kodus, below the other cheap models, and the plan
  publishes no quota.
- **[Autonomous Code Review: Hidden-Test Results on GitHub Issues](https://arxiv.org/abs/2611.10098)**
  (6 November 2026): a cross-provider review step (GPT-6.1 Sol and Claude Sonnet 5.5 reviewing each other)
  changed no patch's hidden-test result in the 40 of 48 workflows on 12 issues that completed. One author with no named affiliation and 12 issues:
  below the bar for a preprint.
- **GitHub, [Beyond code generation: A developer's guide to agentic engineering](https://github.blog/ai-and-ml/github-copilot/beyond-code-generation-a-developers-guide-to-agentic-engineering/)**
  (6 November 2026): Copilot code review runs "lighter analysis for simple changes and deeper analysis for
  complex ones", like the gate's levels, but the post gives no method or figures on what the deeper analysis
  catches.
