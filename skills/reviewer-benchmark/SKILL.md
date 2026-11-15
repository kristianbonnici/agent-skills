---
name: reviewer-benchmark
description: Measure how well a model reviews code, by having it review past changes whose defects are known and scoring its reports blind. Run models through the owner's private set of past changes, score each report against the set's answer key, check every other finding against the code (real, minor or false), add the confirmed finds to the key, and report one table for the set's version. Use when the owner asks how good a model is as a reviewer, wants reviewers compared or a new model tested before it reviews in the review gate, or wants changes added to the benchmark. It never changes who reviews in the review gate.
metadata:
  version: 1.0.0
---

# Reviewer Benchmark

Every reviewer is judged on the same past changes, against what is known to be wrong in them. `scripts/bench` does the mechanical parts; you choose, brief the scorers, check and report.

The set, its keys, the reports and the scores are the owner's private data: `scripts/bench where` prints their folder. Never copy any of it into a public repository or a message outside the owner's. Report counts and shares, and describe a defect only to the owner.

## Rules that never bend

- **Reviewers only read.** Each reviews a copy that holds the change and nothing made after it. The repositories the changes came from are never checked out, changed or committed to. Reading only is held by each tool's read-only mode, its list of allowed commands and the brief, not by a sandbox: a reviewer can still read files elsewhere on the computer.
- **No command that can wait for a person.** Run reviewers only through `bench run`, whose forms refuse a tool that isn't allowed where others raise an approval card and stall.
- **Say what a paid model's run spends before you start it** (one review of every change in the set), unless the owner asked for that model.
- **Scoring is blind.** Whoever scores sees letters, never the models' names, and isn't the model under test when another is available.
- **A finding is real or false only once its code was opened.** A verdict from the report's wording is `unclear`.
- **The result is evidence, not a decision.** Who reviews in the review gate changes only on the owner's word, through `skill-evolution`.

## 1. Find the set

Run `scripts/bench where`. It prints the data folder, the two cache folders and the set's version. With no set yet, build one first: [references/set.md](references/set.md).

## 2. Make the copies

Run `scripts/bench setup`. For each change it makes a small repository of two commits: the tree before the change, and the tree its first review round read. Copies are made again when a key's commits change, and may be deleted when the run is over.

## 3. Run the models

Run `scripts/bench run <model>` once for each model, in the background, the models side by side. It reviews one change at a time, skips a review already saved, and stops one that passes its time, recording it as timed out. That is a result, not a failure to retry: a reviewer that doesn't report in its time is of no use to a gate. A review whose tool ends in an error (a usage limit, a login) is no result, whatever it printed: it is recorded as failed, and the same command later does it again. To stop a run, stop `bench` (Ctrl-C, or ending its command): it stops its reviewer and keeps nothing of that review. Don't end the reviewer yourself.

- The models it knows: `deepseek`, `glm`, `muse`, `haiku`, `hydrogen` (15 minutes, the gate's brief for a free or trial reviewer), and `terra`, `sonnet`, `opus` (30 minutes, no time line in the brief, as the gate gives a paid reviewer). Another model goes in the data folder's `models.json` ([references/set.md](references/set.md#another-model)).
- A paid model may run as two commands, each given half of the changes' names.
- When a model fails its first two reviews the same way (no report, out of time, or an error after a good report), stop it and say so. Don't spend the whole set on it: a failed review is run again by every later run.
- A review that left almost nothing and no error counts as tried with no report. Read its log in the scoring folder: when it was a usage limit or a login, delete that review's `.json` in `runs/<model>/` and run the model again.
- A model with saved reports of the set isn't run again to be compared with a new one: its reports are scored, and stay scored.
- Models side by side review the same copies. Don't run two commands of one model on the same change.

## 4. Score the reports blind

1. Run `scripts/bench blind <model> ...` once, for all the models to score. It copies their reports that have no score yet to `blind/<change>/<letter>.md` in the scoring folder and leaves a `scores.json` to fill beside them. Filled scores exist only there until step 3: a second `blind` before it is refused.
2. For each change, have a scorer fill that file, with the two briefs in [references/scoring.md](references/scoring.md): first each report against the key, then every other finding the report calls a blocker or follow-up against the code. Give the second pass to the strongest model you have.
3. Run `scripts/bench unblind`. It checks each `scores.json` against its key and saves the scores under the models' names; one that doesn't fit is refused with its reasons, and nothing is saved until it does. A report whose change was reviewed again since step 1 is left out and named, and the others are saved: run `blind` for that model again and score its new report.

## 5. Add what was confirmed to the key

A finding outside the key that held up as real is a defect the first reviews missed. Left out of the key, it counts against nobody who misses it and for nobody who finds it.

1. Merge the findings that describe the same defect.
2. Add each as a defect to that change's key, with who raised it and `source` saying which run found it ([references/set.md](references/set.md#a-key)).
3. Check every saved report of that change for the new defect and set its score under `known`, in `scores/<change>.json`. Where a report's finding became the defect, take that finding out of its `others`: left there it counts twice. This step isn't blind, since the scores are under the models' names by now: judge the report's words, as the first pass does. `bench totals` names a score that doesn't cover its key.
4. Look at the repository's code as it is today, and note for each new defect whether it is still there, fixed or gone. Give the owner the ones still there: they are real defects in their code.
5. Raise the set's version ([references/set.md](references/set.md#versions)).

## 6. Report

Run `scripts/bench totals` and give the owner its table, all of it: reports delivered, known defects found, blockers, defects only that model found, and its other findings by verdict. Then, in a few lines:

- what the numbers can't carry: a share is good to about four points either way on a hundred defects, so name tiers, not an order;
- which models didn't report in time, and how often;
- what wasn't checked (the findings a model itself called nits);
- the defects still in today's code.

Add the table, with its date and the set's version, to `results.md` in the data folder, and commit the data folder in its repository. Push it only when the owner asks: the reports quote their code.
