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
