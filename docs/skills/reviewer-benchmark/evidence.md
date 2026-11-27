# Why the reviewer benchmark works this way

The skill states its rules without their reasons, to keep the model's context for the work. The reasons are here.

Last checked: new work 2026-11-27; sources 2026-11-15.

## The first run (2026-11-15)

The run that became this skill: six cheap models on 16 past app-code changes of two apps, 134 to 2,439 added
lines each. Its numbers are in [review-gate's evidence](../review-gate/evidence.md#the-replay-benchmark-2026-11-15);
what it taught about running a benchmark is here.

- **Why past changes with known defects:** the review gate's trial gave each model one extra review at a
  time, on different changes, beside different reviewers. After two weeks three models had 16 to 35 reviews
  each, and their counts couldn't be compared directly. The same 16 changes for every model took an evening.
  → *one set, every model on it.*
- **Why a copy with two commits:** a reviewer that can see the fix finds the defect. Each copy is the tree
  before the change and the tree the first review round read, with no history after it. → *`bench setup`.*
- **A command that waits for a person stalls a run.** One model, launched through its command line with a
  list of allowed tools, raised an approval card for each command outside the list and waited on the owner.
  The same command, as first written, also failed outright: the brief was read as a tool's name. → *`bench
  run`'s forms: the brief on standard input, and a mode that refuses what isn't allowed.*
- **A reviewer that doesn't report in time is a result.** One model reported on 1 of 4 changes in 15 minutes
  and 2 of 4 in 30; another ran out of time on 3 of 16; a third ended two reviews without writing its
  report. → *a timed-out review is recorded and counted, and a model that fails its first two reviews the
  same way is stopped.*
- **A light scorer isn't enough for findings outside the key.** The first scorer matched reports to the key
  well, but filed most other findings under "minor" without opening the code. A stricter check of the 11 it
  had called real kept 5, and a strict pass over all 110 found 17 false and 32 real. → *two passes; the
  second by the strongest model, and no verdict of real or false without the code open.*
- **The key is tilted toward the reviewers who wrote it.** It is what the changes' original first rounds
  found, so a model that took part in them is scored on its own kind of finding. The model that found the
  most outside the key (12 real defects the original reviews had missed) had taken part in none. Adding the
  25 distinct confirmed defects moved it from second to first. → *confirmed findings join the key, and the
  set's version goes up.*
- **Nineteen of those 25 were still in the owner's code.** → *each added defect is checked against today's
  code and reported.*
- **Changes of over 4,000 added lines were left out:** no 15-minute reviewer covers them, and one didn't
  build at the commit its review had read. → *a limit of about 2,500 added lines.*
- **Commits were already going missing.** Several branches had been rebased after their review, so the
  commits a round had read were on no branch, and one change's were gone. → *the names that keep a key's
  commits.*

## The second run (2026-11-15)

Four more models on the same 16 changes, with the skill's own script: one more cheap model, and the three
paid models the review gate uses, as references. Its numbers are in
[review-gate's evidence](../review-gate/evidence.md#the-benchmarks-second-run-2026-11-15).

- **A reference run gives the scale its top.** The strongest paid model found 38% of the 143 known defects in
  full and the three paid models 30% to 38%; the cheap models 16% to 32%. Without the references, 28% read as
  a weak reviewer; with them it is close to a paid one. → *the models the owner compares others with are run
  on the same set, and run again when it changes by a MAJOR.*
- **Shares hide what a model is for.** One paid model found 9 of the 20 blockers in under a minute a review;
  a cheap model with a higher share of all defects found 4. Another paid model found 45 defects and none
  that no other model found. → *`totals` prints blockers and "alone" beside the share, and the report says
  what a pair finds together.*
- **The key kept growing, and the growth reached back.** The second strict pass confirmed 10 more defects (of
  80 findings outside the key, 13 were false). Checking the first run's saved reports for them credited models
  that had already described five of the ten, as nits or as findings the first check had filed under minor.
  → *every saved report is scored for each defect added, whoever raised it.*
- **Scoring four models on 16 changes took 40 short tasks:** 16 first-pass scorers that read the reports and
  the key, 16 second-pass checkers with the code open, and 8 that added defects to a key. The first pass
  took under half a minute a change, the second one to two minutes. → *one scorer per change, in two passes.*
- **Twenty-four of the 35 defects added over both runs were still in the owner's code,** 8 had been fixed
  since and 3 were in code that no longer exists.
- **Not measured:** how much a model's result moves between two runs on the same change. Each model reviewed
  each change once.

## Outside sources

- **Pereira, Sinha, Ghosh and Dutta, [CR-Bench-v2: Evaluating the Real-World Utility of AI Code Review Agents](https://arxiv.org/abs/2611.02566)**
  (Nutanix; arXiv 2611.02566 v2, 3 November 2026, preprint): review agents scored on 174 verified instances
  with a labeled defect each, by three model judges. "Even the strongest systems detect only about one-third
  of known defects", and a reviewer whose comments were judged useful 78.0% of the time found 8.1% of the
  defects. Both runs here landed in the same range (16% to 38% of 143 known defects). → *known defects
  as the measure, and usefulness of the other findings counted apart from it.*
- **Zhang et al., [CodeReviewBench: An Automated Benchmark for Evaluating the Software Factory](https://arxiv.org/abs/2611.26942)**
  (Martian, Greptile, Augment and the University of Oxford; arXiv 2611.26942 v1, 20 November 2026,
  preprint): review bots scored by whether the PR's developers acted on their suggestions, over 500K+ judged
  PRs and 18 tools, beside a 50-PR offline gold set of 136 expert-labeled issues. On that set, "41 clusters
  of concerns flagged by ≥3 tools are absent from the gold set entirely" ("roughly 30% of the gold set
  size"), many of them on inspection "genuine bugs", while "6 golden issues were caught by zero of 20
  tracked tools"; curated again, the same PRs "each find real issues the previous pass missed with no
  evidence of convergence". So "precision is underestimated (real finds scored as false positives) and
  recall is overestimated". F1 "drops nearly 28 pp from small (≤50 lines) to extra-large (≥1,000 lines)
  PRs, driven almost entirely by recall collapse", for every tool alike. Two of its authors work for review
  vendors the benchmark scores, which the paper declares. → *confirmed findings join the key and every saved
  report is scored for them; a limit of about 2,500 added lines.*

## Left out

Weighed and not cited, so later checks don't weigh them again unless they change; a line marked "(not yet read: <why>)" wasn't weighed yet, and the next check weighs it first:

- [(When) Should a Software Factory be Lights-off? Benchmarking Code Review Agents on Bug Detection](https://arxiv.org/abs/2610.13668), 9 October 2026 (not yet read: found in the 2026-11-27 run, dated before the file's last check, and not opened).
- [Can Agentic Code Review Catch Vulnerabilities Before They Are Merged?](https://arxiv.org/abs/2610.33509), 24 October 2026 (not yet read: found in the 2026-11-27 run, dated before the file's last check, and not opened).
- [Do Coding Agents Catch Their Own Bugs? (They Don't.)](https://arxiv.org/abs/2611.01181), 31 October 2026 (not yet read: found in the 2026-11-27 run, dated before the file's last check, and not opened).
- [GitHub: ReviewBench: An open benchmark for AI code review](https://github.blog/ai-and-ml/github-copilot/reviewbench-an-open-benchmark-for-ai-code-review/), 5 October 2026 (not yet read: found in the 2026-11-27 run, dated before the file's last check, and not opened).

- **Vendors' own review benchmarks** ([Kodus](https://www.codereviewbench.com/leaderboard),
  [Qodo](https://www.qodo.ai/blog/which-llm-should-review-your-code/)): each sells a review product, their
  sets aren't the owner's kind of change, and their top models overlap within the error. They are weighed in
  review-gate's evidence for choosing which cheap models to try.
