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
