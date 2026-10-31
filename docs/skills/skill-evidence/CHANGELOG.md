# skill-evidence changelog

## 1.0.0 (2026-10-31)

- First version (owner, 2026-10-31): keeps each skill's `evidence.md` current. It searches for new
  work since a file was last checked, by the rules the file supports, and rechecks the cited sources
  every two months or so: revised, published, withdrawn, superseded, dated or gone. A source must be
  top tier (first-party lab and tool-maker reports, peer-reviewed main-track papers, evaluation
  organizations, preprints from established groups), from the last 24 months, and tie to a named
  rule; what it weighs and rejects goes under each file's "Left out". The edits go on one branch,
  `evidence/<date>`, checked by the review gate at Light and never pushed or merged; a finding that
  undercuts a rule becomes a skill-evolution proposal. A T3 scheduled task runs it every Friday,
  and it skips files checked under 10 days ago.
