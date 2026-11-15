# Why the reviewer benchmark works this way

The skill states its rules without their reasons, to keep the model's context for the work. The reasons are here.

Last checked: new work 2026-11-15; sources 2026-11-15.

## The first run (2026-11-15)

The run that became this skill: nine models on 16 past app-code changes of two apps, 134 to 2,439 added lines
each. Its numbers are in [review-gate's evidence](../review-gate/evidence.md#the-replay-benchmark-2026-11-15);
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

## Outside sources

- **Pereira, Sinha, Ghosh and Dutta, [CR-Bench-v2: Evaluating the Real-World Utility of AI Code Review Agents](https://arxiv.org/abs/2611.02566)**
  (Nutanix; arXiv 2611.02566 v2, 3 November 2026, preprint): review agents scored on 174 verified instances
  with a labeled defect each, by three model judges. "Even the strongest systems detect only about one-third
  of known defects", and a reviewer whose comments were judged useful 78.0% of the time found 8.1% of the
  defects. The first run here landed in the same range (18% to 31% of 133 known defects). → *known defects
  as the measure, and usefulness of the other findings counted apart from it.*

## Left out

Weighed and not cited, so later checks don't weigh them again unless they change:

- **Vendors' own review benchmarks** ([Kodus](https://www.codereviewbench.com/leaderboard),
  [Qodo](https://www.qodo.ai/blog/which-llm-should-review-your-code/)): each sells a review product, their
  sets aren't the owner's kind of change, and their top models overlap within the error. They are weighed in
  review-gate's evidence for choosing which cheap models to try.
