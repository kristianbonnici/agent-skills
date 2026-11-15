# Scoring a change's reports

One scorer per change, in two passes. Both read the same files:

- the key: `<data folder>/keys/<change>.json`;
- the reports: `<cache>/blind/<change>/<letter>.md`, and nothing else of that cache: not `map.json`, not the `logs` folder;
- the code the reviewers saw: `<cache>/work/<change>` (the change is `git diff HEAD~1...HEAD`).

Both fill `<cache>/blind/<change>/scores.json`, which `bench blind` left with one entry per report.

## A score

```json
{"id": "<change>",
 "reports": {"A": {"is_review": true,
                   "known": {"1": 1, "2": 0, "3": 0.5},
                   "others": [{"title": "<a few words>", "their_tag": "blocker",
                               "verdict": "true-minor", "why": "<the file, and what was seen there>"}],
                   "nits_unchecked": 2}}}
```

- `is_review`: false when the report is no review: empty, an error, or a note that it ran out of time.
- `known`: one score for each defect of the key. `1`: the report describes that defect, the same wrong behaviour through the same mechanism or place, whatever tag or words it uses. `0.5`: it points at the same code and a closely related risk but misses the failing case, or names only a symptom. `0`: otherwise, and for a remark that would fit any code.
- `others`: every finding that matches no defect of the key and that the report calls a blocker or a follow-up, or gives no tag. `verdict`:
  - `real`: the code does what the finding says, the change introduced or exposed it, and it is worth fixing;
  - `true-minor`: true, but only a nit, or what the change was asked to do, or an accepted trade-off;
  - `pre-existing`: true, and the same before the change (`git show HEAD~1:<file>`);
  - `wrong`: false: the code doesn't behave as the finding says, or the case can't happen;
  - `unclear`: not settled after really trying. A verdict from the report's wording alone is `unclear`.
- `nits_unchecked`: how many findings the report itself called nits or pre-existing. They are counted, not checked.

## The first pass: against the key

```text
You are scoring code reviews for a benchmark. Several anonymous reviewers reviewed the same code change. Score each report against a list of known defects. Be strict and even-handed: every report gets the same standard. Read-only except for the one file you fill.

The known defects: <key> (see "defects": each has "n", "title", "where", "case"). You may read a fix in the key's "repo" with git show <fix_commit> to understand a defect. Never write there.
The reports: every .md file in <blind folder of the change>, named by a letter. Read nothing else of that cache.
The code as the reviewers saw it: <work copy> (the change is git diff HEAD~1...HEAD).

For each report, in <scores.json>:
- "known": for each defect, 1 if the report describes it (the same wrong behaviour through the same mechanism or place, whatever tag or words it uses), 0.5 if it points at the same code and a closely related risk but misses the failing case or names only a symptom, 0 otherwise. A vague remark that would fit any code scores 0.
- "is_review": false if the report is empty, an error, or says it ran out of time before reporting.
- "others": list every other finding the report calls a blocker or a follow-up, or gives no tag, with its "title" and "their_tag", and "verdict": "unclear". Don't judge them: they are checked next.
- "nits_unchecked": how many findings the report itself calls nits or pre-existing.

Answer in under 100 words: for each letter, the known defects found and how many other findings you listed.
```

## The second pass: the other findings, against the code

Give this to the strongest model you have, after the first pass.

```text
You are checking findings from anonymous code reviews against the code, to measure how often reviewers say things that are false. Be strict and even-handed. Read-only except for the one file you change.

The findings: every entry under "others" in <scores.json>, for each report letter. The report is <blind folder>/<letter>.md: find the finding by its title and read exactly what it claims.
The code as the reviewer saw it: <work copy> (the change is git diff HEAD~1...HEAD). Open the code the finding points at and trace the claimed case. To see whether something was there before the change: git show HEAD~1:<file>.
The known defects and what the change was asked to do: <key> ("defects", "objective").

Give each finding a "verdict" and one or two lines of "why", naming the file and what you saw there:
- real: the code does what the finding says, the change introduced or exposed it, and it is worth fixing;
- true-minor: true, but only a nit, or what the objective asked for, or an accepted trade-off;
- pre-existing: true, and the same before the change;
- wrong: false: the code doesn't behave as the finding says, or the case can't happen;
- unclear: you couldn't settle it after really trying.
A finding that is really one of the key's defects: take it out of "others" and set that defect's score in "known" to 1.

Answer in under 100 words: the count of each verdict, and any verdict you are less than sure of.
```
