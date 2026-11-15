# reviewer-benchmark

How good is a model at reviewing code? The review gate's trial answers that slowly: one extra review at a
time, each model on different changes, beside different reviewers. This skill answers it in an evening: every
model reviews the same past changes, whose defects are known, and its reports are scored without the scorer
knowing who wrote them.

Version and history: [CHANGELOG.md](CHANGELOG.md). Why it works this way: [evidence.md](evidence.md).

## The flow

```mermaid
flowchart TD
  set[("The set, private:<br/>past changes, each with its answer key")] --> copies["bench setup<br/>a copy of each change:<br/>two commits, nothing after the review"]
  copies --> run["bench run, one command per model<br/>the gate's brief, 15 or 30 minutes,<br/>read-only, no approval prompts"]
  run -->|"out of time, or no report"| none(["Recorded: no report"])
  run --> blind["bench blind<br/>reports named by letter"]
  blind --> first["First pass, per change:<br/>each report against the key<br/>1, a half or 0 for each known defect"]
  first --> second["Second pass, the strongest model:<br/>every other blocker or follow-up<br/>against the code: real, minor or false"]
  second --> unblind["bench unblind<br/>scores saved under the models' names"]
  unblind -->|"findings that held up as real"| grow["Add them to the key,<br/>check today's code for each,<br/>raise the set's version"]
  grow --> totals
  unblind --> totals["bench totals<br/>one line per model"]
  totals --> report(["Report to the owner:<br/>the table, its limits,<br/>and the defects still in their code"])
```

## What the table says

| Column | What it counts |
|---|---|
| Reports | Reviews that came back with a report, of those tried. One that ran out of time counts as none. |
| Known found | Defects of the key the report described: 1 each, a half for the right code without the failing case. |
| Blockers | The same, for the key's blockers alone. |
| Alone | Known defects only that model found in full, among the models that tried every change. |
| Real | Its findings outside the key that held up against the code. They join the key for the next version. |
| Minor | Findings outside the key that are true but trivial, or were there before the change. The author still has to read them. |
| False | Findings outside the key that the code contradicts. |
| False share | False findings among all the blockers and follow-ups it raised. |
| Min/review | Time per review, timed-out ones included. |

## Where things live

- **This repository:** the skill, its script and its test, with a made-up set.
- **The owner's private state repository,** `reviewer-benchmark/`: the set, its keys, every model's reports
  and scores, and the table of each run. It quotes the owner's code and never comes here.
- **The cache:** the copies to review in one folder, and the blind copies and logs in another, so that a reviewer
  looking around its copy doesn't find another's report beside it. Deleted freely once scores are saved.
- **The repositories the changes came from:** only read, apart from the names that keep each key's two
  commits from being deleted.

## What it doesn't decide

Who reviews in the review gate. The table is evidence; a change of reviewers is the owner's, through
`skill-evolution`.
