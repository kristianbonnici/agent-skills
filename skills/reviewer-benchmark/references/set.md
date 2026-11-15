# The set, its keys and its models

## Where it is

`scripts/bench where` prints the data folder: `reviewer-benchmark/` in the owner's private state repository, or, without one, `${XDG_STATE_HOME:-~/.local/state}/agent-skills/reviewer-benchmark/`.

| File | What it holds |
|---|---|
| `set.json` | The set's `version`, its `changes` (their names) and a `history` line per version |
| `keys/<change>.json` | The change's answer key |
| `runs/<model>/<change>.md` and `.json` | A model's report as it came, and how long it took and how it ended |
| `scores/<change>.json` | Each model's score for that change |
| `models.json` | The owner's own models |
| `results.md` | The table of each run, with its date and the set's version |

What can be made again is in the cache, `${XDG_CACHE_HOME:-~/.cache}/agent-skills/`: the copies to review in `reviewer-benchmark/`, and the blind copies of reports and the reviewers' logs in `reviewer-benchmark-scoring/`, apart from the copies. Scores a scorer has filled are there too, and are safe only once `bench unblind` has saved them.

## Choosing a change

A change is worth adding when:

- it is code, not docs or wording, and under about 2,500 added lines, which a reviewer can cover in its time;
- its first review round found at least three defects the author accepted as real;
- the commits that round read can still be found, and the round's findings say which reviewer raised what. From review-gate 4.1.0 a gate's record has both: `review.json` names the commits, and each reviewer's report is saved beside it.

Spread the set over the kinds of change the owner's gates see, and name each change so it can be found again (the run and the task it came from).

## A key

```json
{
  "id": "<the change's name>",
  "repo": "<the repository the change is in>",
  "base": "<the commit the change started from, in full>",
  "head": "<the last commit the first review round read, in full>",
  "objective": "<two to four sentences: what the change is meant to do, for whom, and what it must not change, with no hint of any defect>",
  "rules": "<the path of the rules file in the repository at head, such as AGENTS.md, or empty>",
  "defects": [
    {"n": 1, "title": "<a few words>", "where": "<file and function or area>",
     "case": "<what goes wrong and when, concretely>", "tag": "blocker",
     "raised_by": ["<reviewer>"], "fix_commit": "<the commit that fixed it, if one did>",
     "source": "first review round", "sure": true}
  ]
}
```

- **`base` and `head` are full commit names.** A gate's record may give short ones: `git -C <repo> rev-parse <name>` gives the full one.
- **`head` is what the first round read,** not what merged: the last commit before the first fix of a review finding. A branch rebased after its review has other commit names than its handoff gives; use the commits the round read when they still exist, and check that the change is the same.
- **`defects` are the first round's only:** the findings the author accepted as a blocker or a follow-up (a must-fix, in gates before review-gate 3.0.0). Not nits, not pre-existing or rejected findings, and not findings of later rounds, which are about fixes that `head` doesn't have.
- **Confirm each defect in the code at `head`,** from the code or the diff of the commit that fixed it. Mark one you couldn't settle `"sure": false`.
- **`objective` is the reviewer's whole brief on the change.** Write it from the task's brief, neutrally.
- **A defect added later** (SKILL.md, section 5) has `source` naming the run that found it and `raised_by` naming the models.

## Keeping the commits

A commit no branch holds may be deleted by git. When a key is written, name its two commits in their repository:

```sh
git -C <repo> update-ref refs/reviewer-benchmark/<change>/base <base>
git -C <repo> update-ref refs/reviewer-benchmark/<change>/head <head>
```

These names change nothing the owner sees and aren't pushed. They are the only thing this skill writes in those repositories.

## Versions

`set.json`'s `version` is `MAJOR.MINOR`. Scores compare only within one MAJOR.

- **MINOR:** defects were added to keys, or changes were added. Saved reports are scored against what was added; nothing is run again for the changes already there.
- **MAJOR:** a change was removed or its commits changed. Earlier scores no longer compare. `bench run` reviews a change again when its key names other commits than the saved review read, and drops that review's score; every model the owner compares others with is run again.

Add a `history` line saying what changed and why.

## Another model

`models.json` in the data folder adds models to those `bench run` knows, or changes one:

```json
{
  "minimax": {"kind": "opencode", "model": "opencode-go/minimax-m3.1-flash#high"},
  "slow-one": {"kind": "opencode", "model": "opencode-go/some-model", "minutes": 30, "commands": 40}
}
```

- `kind`: `opencode` (its read-only `plan` agent), `claude` (`claude -p`, with only reading tools allowed and a mode that refuses the rest), `codex` (`codex exec` in its read-only sandbox), `agy` (Antigravity's `plan` mode with its list of allowed commands), or `command` with `argv`, a list in which `{work}` is the copy's folder and `{brief}` the brief (`"stdin": true` sends the brief on standard input instead). A command given as a path is read from the copy's folder, where it runs.
- `model`: the model's name as that tool takes it, with its reasoning level where the tool has one (`#high` on OpenCode). A model with no such level is named bare: asking for one it lacks fails at once.
- `minutes`: its time, from 4 to 120, 15 unless given. `paid`: true leaves the time line out of its brief. `commands`: the number of commands its brief allows, 20 unless given.

## What a copy leaves out

- A file its repository marks `export-ignore` isn't in the copy, since the copy is made with `git archive`.
- Models running side by side share a change's copy. A reviewer that runs the tests may leave build files there for the next one to see.
