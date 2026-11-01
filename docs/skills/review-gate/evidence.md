# Why the review gate works this way

The skill states its rules without their reasons, to keep the model's context for the work. The reasons are here.

Last checked: new work 2026-10-30; sources 2026-10-30.

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
  reviewer's must-fix, rejected and only-one counts, so the next study can show whether they earn a
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
  gate never rests on it; Beam for helpers only; no Iceman.*

## Left out

Weighed and not cited, so later checks don't weigh them again unless they change:

- **Muse Wonder Full as a reviewer:** some practitioners use it as a premium reviewer. It is available only
  in Muse Code's $50 and $200 plans, with no API, and those plans train on the owner's code by default.
- **Iceman Contributor Free as a reviewer:** it found nothing in the trial above. Its maker isn't announced.
- **MiniMax's M Plan:** MiniMax M3 scored F1 29.6 on Kodus, below the other cheap models, and the plan
  publishes no quota.
