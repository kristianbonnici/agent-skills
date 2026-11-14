# The gate's record

Every gate leaves one folder: what each reviewer said, and what you did with each finding. A later study counts from it, so it holds the reviewers' own words and tags beside yours.

## Where

- **In an orchestrated run:** `<run directory>/<your task ID>/review/`. A later gate of the same task (a later milestone, or a gate run again once a reviewer has room) goes in `review-2/`, then `review-3/`, and so on.
- **Otherwise:** `${XDG_STATE_HOME:-~/.local/state}/agent-skills/review-gate/<YYYYMMDD-HHMM>-<the repository's folder name>/`, named for when the gate started; if that name is taken, the same name with `-2`, then `-3`, and so on.

Make the folder yourself with plain `mkdir`, after `mkdir -p` on the folder above it, never `mkdir -p` on the folder itself. If `mkdir` fails because the folder exists, another gate has that name: try the next number in the same sequence (after `review-2/` comes `review-3/`, never `review-2-2/`) until it succeeds. Write only into a record folder this gate made.

Never inside the repository under review: the reports quote its code, and the record isn't part of the change.

## The reports

Save each reviewer's report when it arrives, whole and unedited, as `round-<n>-<reviewer>.md` (`round-1-terra.md`, `round-2-terra.md`). A second opinion, or a look after a rebase, is `look-<n>-<reviewer>.md`. Save its final report only, not its commands or the files it read. A reviewer that was limited and reported nothing has no file: it goes under `skipped`. A reviewer's reply about a blocker you tagged lower is `reply-<the finding's id>-<reviewer>.md`, and one about the same finding in a later round `reply-<id>-<reviewer>-round-<n>.md`: never write over a saved reply.

## review.json

Add each finding as you settle it, and finish the file before you write the Review section.

```json
{
  "gate": "5.0.0",
  "date": "2026-11-14",
  "repository": "notes-app",
  "base": "3f2a91c",
  "head": "b81d7e4",
  "author": "Claude Opus 5.5, high",
  "level": "deep",
  "result": "passed",
  "reviewers": [
    {"name": "Codex GPT-6.1 Terra, high", "rounds": [1, 2],
     "reports": ["round-1-terra.md", "round-2-terra.md", "reply-2-terra.md", "reply-3-terra.md"]},
    {"name": "Claude Sonnet 5.5, high", "rounds": [1], "reports": ["round-1-sonnet.md"]},
    {"name": "GPT-6 Luna, high (trial)", "rounds": [1], "reports": ["round-1-luna.md"]}
  ],
  "skipped": [
    {"name": "DeepSeek V4.1 Flash (free)", "why": "Free usage limit reached"}
  ],
  "findings": [
    {"id": 1, "round": 1, "reviewer": "Codex GPT-6.1 Terra, high", "reviewer_tag": "blocker", "tag": "blocker",
     "checked": "test", "commit": "9c4e2aa", "title": "A crafted link opens a note without asking"},
    {"id": 1, "round": 1, "reviewer": "Claude Sonnet 5.5, high", "reviewer_tag": "follow-up", "tag": "blocker",
     "checked": "test", "commit": "9c4e2aa", "title": "A crafted link opens a note without asking"},
    {"id": 2, "round": 1, "reviewer": "Codex GPT-6.1 Terra, high", "reviewer_tag": "blocker", "tag": "follow-up",
     "checked": "run", "title": "Two saves within a second keep the older text",
     "why": "Needs two windows saving the same note in the same second", "reply": "holds"},
    {"id": 3, "round": 1, "reviewer": "GPT-6 Luna, high (trial)", "reviewer_tag": "blocker", "tag": "rejected",
     "checked": "read", "title": "The import reads files outside the chosen folder",
     "why": "The path is resolved and checked against the folder two lines above",
     "reply": "agrees", "reply_from": "Codex GPT-6.1 Terra, high"},
    {"id": 4, "round": 1, "reviewer": "Claude Sonnet 5.5, high", "reviewer_tag": "nit", "tag": "nit",
     "checked": "read", "commit": "b81d7e4", "title": "The error names the wrong setting"}
  ]
}
```

The gate:

- `gate`: this skill's `metadata.version`. `date`: the day the gate ended.
- `repository`: the repository's folder name. `base` and `head`: the commits the gate reviewed between, `head` being the last one after the fixes.
- `author`: the model that made the change, with its reasoning level.
- `level`: `light`, `standard` or `deep`.
- `result`: `passed` (no blocker left), `stopped` (the review didn't converge), `no reviewer` (none had room; `reviewers` and `findings` are then empty), or `reported` (the user asked for a review only, and you changed nothing).
- `reviewers`: every reviewer that reported, named as the Review table names them. `rounds` lists the rounds it reviewed, and by name any look outside the count of rounds (`"second opinion"`, `"rebase look"`). `reports` lists its files in the folder, its replies about tags among them. A reviewer launched only to answer about a tag has `"rounds": ["reply"]`: it reviewed nothing, so it gets no row in the table and no review in the totals, and no finding is its own. If it reports a defect while answering, give it the round it did that in.
- `skipped`: every model that was skipped or that a reviewer moved on from, and why.
- `note`: optional, one line on what a reader of the record must know and no field holds. When no reviewer had room and you read the diff yourself in a fresh pass, say that here and what you found: your own pass isn't a review, so it has no reviewer and no findings.

Each finding:

- **One entry per finding per reviewer who raised it.** Two reviewers raising the same finding are two entries with the same `id`, and the same `tag`. A finding that comes back "not fixed" is another entry with its `id` and the later round.
- `reviewer_tag`: the tag that reviewer gave it (`blocker`, `follow-up`, `nit`, `pre-existing`), or `none` if it gave none.
- `tag`: yours (`blocker`, `follow-up`, `nit`, `pre-existing`, `rejected`).
- `checked`: how you settled whether it is real. `test`: a test that fails on it, or passes where it said one would fail. `run`: you ran the case. `read`: you traced it through the code. `second opinion`: Deep's yes or no from the other paid reviewer.
- `commit`: the commit that fixed it. Leave it out while the finding is open or needs no change. A finding that came back "not fixed" carries, on its later entry, the commit that settled it then.
- `title`: the finding in a few words.
- `why`: one line, needed when you rejected the finding or gave it a lower tag than the reviewer did (a blocker as a follow-up, a follow-up as a nit or pre-existing).
- `reply`: needed when the reviewer's tag was `blocker` and yours is lower or `rejected`: what the reviewer answered when you asked (SKILL.md, section 4): `agrees`, `holds` or `no answer`. Give it nowhere else. `reply_from`: the reviewer that answered, on every entry it didn't raise itself. A reviewer gives one answer about a finding in a round, so the entries it answered for carry the same `reply`.

## The Review lines

`scripts/review-records table <folder>` checks the record and prints the lines the Review section starts with. For the record above:

```markdown
**Review: Deep, 2 rounds.**

| Reviewer | Rounds | Blockers | Follow-ups | Nits | Pre-existing | Rejected | Unique defects |
|---|---|---|---|---|---|---|---|
| Codex GPT-6.1 Terra, high | 1, 2 | **1** | 1 | – | – | – | 1 |
| Claude Sonnet 5.5, high | 1 | **1** | – | 1 | – | – | – |
| GPT-6 Luna, high (trial) | 1 | – | – | – | – | 1 | – |

*Tagged lower than the reviewer's blocker or follow-up: 2 (1 rejected).*

*Replies on the blockers tagged lower: 1 agreed, 1 held, 0 no answer.*

*Skipped: DeepSeek V4.1 Flash (free): Free usage limit reached.*

*Record: /Users/you/.local/state/agent-skills/review-gate/20261114-0930-notes-app.*
```

Keep the "Record" line right under the table: it says where the record is, and it tells a later count that this table is already in that record, so the handoff's copy isn't counted as another gate.

A gate in which no reviewer reported prints `no round` and a table without rows. A record that fails its check prints what it lacks instead: fix the record and run it again. If the script can't run (no `python3`), write the same lines by hand, the "Record" line too.

`scripts/review-records totals` adds up every record on this computer, for a study of the gate.
