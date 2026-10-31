# skill-evolution changelog

## 1.0.0 (2026-10-31)

- First version (owner, 2026-10-31): turns incidents with a skill into at most three proposed changes,
  checked against the skill's current text and a private lessons file of earlier proposals (declined
  ones come back only with new evidence; a repeat counts as evidence), each with its evidence, place
  and version bump. Nothing changes until the owner names a proposal; an accepted one is applied with
  a version bump, the repository's checks and the review gate, and never pushed unasked. The
  long-horizon orchestrator runs it at every finish.
- From its review (standard; Codex GPT-6.1 Terra 3 must-fix, GPT-6 Luna on trial 1, all fixed): a new
  lessons file is made in the private state repository and linked, not left local; every write takes a
  lock, pulls, numbers after the highest entry, commits and pushes, and renumbers its own entries if
  another computer took the numbers, before the owner sees them; the owner's decisions are pushed too;
  proposals still waiting compete for the three places each time, and the count of the rest is named.
- Round 2 (Terra, 4 must-fix, no fewer than round 1, so the review stopped as not converging) showed the
  prose git steps were the wrong approach. A first script around one shared file (`begin` and `end`,
  sequential numbers, git's union merge) drew 7 findings from Terra and 3 from Claude Sonnet 5.5,
  among them that the union merge can silently drop a line and that a number shown offline could
  later change. So the lessons are now one file per entry with a random ID (`L-K7Q`) that never
  changes, written only by `scripts/lessons` (`show`, `add`, `set`, `note`): two computers never edit
  the same text, nothing is renumbered, each command holds a short lock tied to its process, pulls,
  commits only its own files and pushes, and an unsent edit that meets another computer's edit of
  the same entry is dropped and named, never leaving a rebase behind; `tests/skill-evolution-test`
  plays two computers against one remote.
- From the per-entry design's review (Claude Sonnet 5.5, and Codex GPT-6.1 Terra 6 must-fix, 2 of them
  the same): a dropped edit is printed with what it said; an entry whose commit failed is committed by the
  next command; the script finds the state repository from a worktree of the skills repository and
  warns when it falls back to local files; IDs have four characters, and an offline ID collision moves
  the second entry to a new ID and says so; `show` lists one line per entry, full text by ID; the skill
  says what to do on each exit, writes entry files outside any repository, and checks an entry is
  still proposed before applying it. Terra's others: a lessons
  command never pushes the owner's other unpushed commits (it leaves the push to them), never stashes
  their uncommitted edits (it doesn't pull then), and skips a rebase step only when it is lessons-only
  and came to nothing; an old `lessons.md` gets a warning.
- Round 2 of the per-entry design (Terra, 3, fewer than round 1): an entry whose commit fails again is
  reported as not committed, never as sent; only the script's own commits (by message and files, one
  parent) count as lessons-only, so the owner's empty or merge commits are never pushed; after an ID
  collision, a later change to the old ID is named for checking.
- Round 3 (Terra, 2, fewer again): a `set` or `note` on an ID its own pull just moved is refused with the
  new ID; pushes go to exactly this branch's upstream, whatever `push.default` says, so the owner's
  other branches never go along.
