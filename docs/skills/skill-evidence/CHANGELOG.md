# skill-evidence changelog

## 1.1.0 (2026-11-20)

- **Every candidate is read in full, and one that can't be is carried to the next run** (the 2026-11-20 run: one paper was weighed only from its abstract and another never opened, and neither was recorded, so the next run had no way to know of them). Papers are read from arXiv's HTML or PDF; a candidate not read in full goes under "Left out" marked "(not yet read: <why>)", and the next run weighs it first, whatever its date, keeping the mark if it still can't be read. A cited source whose claims couldn't be confirmed from what could be read is marked "(not rechecked <date>: <why>)", and every run that checks its file rechecks it whatever the sources date, until the mark comes off (from this release's review).
- **A page that refuses automated reading is read from its archived copy** (same run: two OpenAI pages answered 403, and one entry rested on search excerpts, while the Wayback Machine held the whole article). The latest snapshot is found with the archive's availability API and fetched as archived (`id_`, `--compressed`); the entry names the snapshot. Search excerpts or coverage only when there is no snapshot, or it doesn't replay, or is older than the page's last update.
- **An index without dates is dated from its feed or sitemap** (same run: OpenAI's blog index shows no dates; its news feed dates every post). A sitemap's `lastmod` is only a lead, checked against the post's own date; a candidate with no date found is carried as not yet read. A file holding either mark is due on a scheduled run whatever its dates, the mark overrides the "Left out" section's opening line, the review brief accepts an archived copy's words with its snapshot named, and the archive lookup encodes the URL (from this release's review). The how-to is in the new `references/reading.md`.

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
- **Review (standard), round 1:** Codex GPT-6.1 Terra found 5 must-fixes, all fixed:
  - a merged evidence worktree is removed only when it holds no ignored files, since
    `git worktree remove` deletes them without `--force` (checked);
  - a pending worktree with uncommitted changes is left alone and the run stops;
  - a pending branch that won't rebase is left as it is and its changes carried to a new branch, so
    the owner's merge stays a fast-forward;
  - the report says how to merge after `main` moved, and quotes what `lessons` printed as dropped,
    moved or not pushed;
  - the no-push rule names the skills repository, since the lessons script's pushes to the private
    state are how proposals reach the owner.

  Claude Haiku 5.5 (trial) found 3 more must-fixes, all fixed:
  - reviewers may have no web access, so the Light review's brief quotes each figure's supporting
    passage from its source;
  - an owner's reason for dropping an item goes into the public file only in public terms;
  - skill-evolution judges outside evidence by whether the changed rule would stand on better
    evidence, since it costs nothing yet.

  Haiku's nits, all fixed:
  - the due check comes before any branch or worktree is touched, so a quiet run leaves nothing
    behind;
  - "Left out" takes only candidates that came close;
  - attention is called for new or changed entries and proposals, never for dates alone;
  - the "never cite unopened" rule names the exception for pages that refuse reading;
  - `lessons note` takes the evidence line without its date;
  - the new `tests/evidence-test` checks every evidence file's "Last checked" line and "Left out"
    section.
- **Round 2** (Terra, the fixes only, 2 must-fix, fewer than round 1):
  - a branch carried over by hand lists what it didn't carry, so the owner never deletes an old
    branch that still held undecided work;
  - the Light review's brief quotes coverage, named as such, for a source read through coverage, and
    the record says whether the reviewer opened the sources or checked against the quoted passages.

  Its pre-existing finding is fixed too: a pending worktree holding ignored files isn't rebased, which
  could overwrite them; its changes are carried to a new branch instead.
- **Round 3** (Terra, 1 must-fix, fewer again): the Light review's brief also gives each entry's link
  with the title, authors and date as the source shows them, so a reviewer without web access can
  check dates and titles, not only figures.
- **Round 4** (Terra, 1 must-fix, no fewer than round 3, so the review stopped there, as the gate
  says): a reviewer without web access still can't check a link or a date against its source,
  whatever the brief quotes. That is a limit of offline review, not a fault of the steps. The skill now
  says so: such a review checks only against the quotes, and the record and the report say the
  sources weren't checked independently, so the owner knows before merging (a wording fix,
  unreviewed).
