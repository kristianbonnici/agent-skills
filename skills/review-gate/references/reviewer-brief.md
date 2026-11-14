# The reviewer's brief

Send each reviewer this brief with the angle-bracketed parts filled in. Every reviewer of a round gets the same text except its focus. Keep it neutral: say what the change is meant to do, never what you suspect is wrong, and never mention the other reviewers.

```text
You are reviewing a code change before it merges. Review only: don't edit, create or delete files, don't commit, and run only commands that read (git diff, git log, git show, reading files, running the existing tests if that is quick and writes nothing outside a temporary folder). Don't ask anyone anything; answer with your report.

The change: <the objective in two to four sentences: what it is meant to do, for whom, and what it must not change>.
Where: <worktree or checkout path>. The diff: git -C <path> diff <base>...<head>. Read the related code and tests as well, not only the diff.
The project's rules: <AGENTS.md, CLAUDE.md or similar, with their paths>.
Your focus: <this reviewer's focus, for example "logic, security and what happens when things fail">. Report anything serious you find outside it too.
<Free and trial reviewers only: "You have 12 minutes and about 20 commands. When you reach either, stop and report what you have, and list what you didn't get to.">
<Round 2 and later: "This round reviews only the fixes since <commit>: git -C <path> diff <commit>...<head>, and what they touch. Already raised: <one line per earlier finding>. Don't report these again, except one the fixes didn't settle: report that as 'not fixed: <the finding>', with the case that still fails.">
<With a question about a tag for this reviewer: "Apart from your report, answer this first: <the question below, from 'A reviewer reported' to its last line>">

Report each issue as:
- a short title;
- file and line;
- what goes wrong and when, as a concrete case;
- blocker (a defect this change introduces or exposes that causes data loss or corruption, a security or privacy hole, a crash, hang or wrong result on a common path, a broken build or test, or another serious defect on a common path), follow-up (a defect this change introduces or exposes that needs unusual timing, rare input or a corner case, or a missing hardening), nit (real but minor) or pre-existing (true, but not caused by this diff);
- for a blocker or follow-up, the fix it needs;
- how often it would happen, from 1 to 10, and how bad it would be, from 1 to 10;
- confirmed (you traced it through the code or ran it) or suspected.

Skip style preferences and theoretical cases you can't make concrete. If you find nothing serious, say so plainly and list what you checked.
```

## The question about a tag

When you reject a finding a reviewer tagged a blocker, or give it a lower tag (SKILL.md, section 4), send this, alone or inside that reviewer's next brief. Give the finding whole, as it was reported, and your reason as you recorded it: don't argue further.

```text
You are asked one question about a code change under review. Answer it only: don't review the change, don't edit, create or delete files, don't commit, and run only commands that read. Don't ask anyone anything.

Where: <worktree or checkout path>. The diff: git -C <path> diff <base>...<head>.
A reviewer reported: <the finding as it was reported, whole: its title, file and line, the case, its tag and the fix it asked for>.
The author tagged it <follow-up, nit, pre-existing or rejected> instead of blocker, because: <your reason>.
A blocker is a defect this change introduces or exposes that causes data loss or corruption, a security or privacy hole, a crash, hang or wrong result on a common path, a broken build or test, or another serious defect on a common path.

Do you agree with the author's tag? Start your answer with "agree" or "hold". If you hold, give the concrete case that still goes wrong, how often it would happen, and why it is a blocker by the definition above. You have 10 minutes.
```

An answer that starts with "agree", in any letter case, is `agrees`; one that starts with "hold" is `holds`; and none in its 10 minutes, or one that says neither, is `no answer`. Save it in the record folder as `reply-<the finding's id>-<reviewer>.md`; if you ask about the finding again in a later round, as `reply-<id>-<reviewer>-round-<n>.md`.

Ask once for a finding and the reviewer that answers. When two reviewers called the same finding a blocker and their questions go to the same reviewer (two free or trial reviewers', to the round's paid one), send one question with both reports, and record its one answer on both entries.
