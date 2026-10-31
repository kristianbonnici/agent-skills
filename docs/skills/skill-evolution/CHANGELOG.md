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
