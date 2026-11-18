# Versioning skills

Each skill carries its own version, so a change can be traced to the runs that used it and judged by
what those runs did. A run that records `long-horizon-orchestrator 1.1.0` and `review-gate 1.0.0` can
be compared with runs on earlier versions, instead of guessing whether a change helped.

## Where the version lives

- **In the skill:** `metadata.version` in the `SKILL.md` front matter. That one line is all the
  model sees of it.
- **The history:** `docs/skills/<skill>/CHANGELOG.md`, newest first. It sits outside the skill's
  folder, so no agent loads it.
- **A tag per release:** `<skill>/v<version>`, for example `long-horizon-orchestrator/v1.1.0`, on the
  commit that sets that version.

## What a version number means

`MAJOR.MINOR.PATCH`, judged by what an agent following the skill does, not by how much text changed:

- **MAJOR:** the change breaks something that relies on the skill: a file format others read (such as
  the review gate's record), a script's commands, options, output or exit codes, or what another skill
  or the orchestrator expects from it. Something written for the earlier version no longer works
  unchanged.
- **MINOR:** the skill behaves differently, and nothing that relies on it breaks: a new capability or
  rule, a changed default, a different model in a role (such as a reviewer swapped for another), a
  removed step that nothing else depended on.
- **PATCH:** a fix or clarification: wording, a wrong command, a check that didn't do what it said.

When unsure between MINOR and MAJOR, ask what would break: if nothing would, it is MINOR. A version
traces a run to the skill text it used at any number, so a smaller step loses nothing; the larger
step is kept for the change a reader has to act on.

These rules apply from 2026-11-18; earlier versions keep their numbers, many of them set under a
wider MAJOR (any change the user would notice).

## Releasing a change

In the commit that changes a skill:

1. Raise `metadata.version` in its `SKILL.md`.
2. Add an entry at the top of its `CHANGELOG.md`: `## <version> (<date>)`, then one line per change,
   in plain words, saying what an agent now does differently and why (the run or source that showed
   it).
3. After the commit, tag it: `git tag <skill>/v<version>`.

Several commits may go into one release: raise the version once, in the first, and add to the same
entry until it is tagged. Fixes asked for by the review of a release that isn't tagged yet go into that
release, not a new version.

`tests/skill-versions-test` checks that every skill has a version and that its changelog's newest
entry is that version.

## Evidence

Why a skill works as it does belongs in `docs/skills/<skill>/`, not in the skill: research, studies of
past runs and the sources behind a rule. The skill states the rule; the docs say where it came from.
Keeping the evidence out of the skill keeps the model's context for the work.
