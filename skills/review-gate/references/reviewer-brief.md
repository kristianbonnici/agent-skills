# The reviewer's brief

Send each reviewer this brief with the angle-bracketed parts filled in. Every reviewer of a round gets the same text except its focus (and, for visible UI changes, pictures sent only to reviewers able to open them). Keep it neutral: say what the change is meant to do, never what you suspect is wrong, and never mention the other reviewers.

```text
You are reviewing a code change before it merges. Review only: don't edit, create or delete files or folders, don't commit, and run only commands that read (git diff, git log, git show, reading files). Don't run tests or scripts, and don't run any command that might ask for approval: nobody is there to give it. If you'd like a test run, name the test and what it should show in your report instead. Start nothing in the background to wait for: nothing resumes you once you stop, so a report you put off for a command still running is never written. Don't ask anyone anything; answer with your report.

The change: <the objective in two to four sentences: what it is meant to do, for whom, and what it must not change>.
Where: <worktree or checkout path>. The diff: git -C <path> diff <base>...<head>. Read the related code and tests as well, not only the diff.
The project's rules: <AGENTS.md, CLAUDE.md or similar, with their paths>.
Your focus: <this reviewer's focus, for example "logic, security and what happens when things fail">. Report anything serious you find outside it too.
<For any diff that changes visible UI (include for ALL reviewers, with or without pictures): "UI check: <required | rendered is enough because <reason> | waived>. Default is required unless all three hold: (1) every pixel in and next to the changed region is drawn by the project's own code; (2) the state is reachable without input or elapsed time; (3) the render is the shipped view tree, not a fixture, poster or placeholder. Verify this claim against the diff; if 'rendered is enough' fails any condition, report a visual-evidence gap requiring live captures.">
<For reviewers given pictures of a visible UI change (never free reviewers): "Pictures to inspect (open each with your read-only file tool; never run shell commands or OCR scripts):
- <absolute path>: <the state or region it is meant to show>
Start your report with a 'Pictures:' line giving one sentence on what you actually see in each file (or 'couldn't open: <why>' — never judge a picture you didn't open). Check both authenticity (for 'required': does the capture show the real running, mounted, interactive/hovered state under test, not a poster, mock or placeholder? for 'rendered is enough': does it show the shipped view faithfully without requiring live-hover chrome?) and visual defects (overlapping or occluded native/system controls, clipping, broken alignment, unreadable contrast). Report a real visual defect on a common path as a blocker; report a missing or unrepresentative capture as a visual-evidence gap (not a blocker), stating what state must be captured.">
<Free reviewers, Hydrogen and Haiku only: "You have 12 minutes and about 20 commands. When you reach either, stop and report what you have, and list what you didn't get to.">
<Round 2 and later: "This round reviews only the fixes since <commit>: git -C <path> diff <commit>...<head>, and what they touch. Already raised: <one line per earlier finding>. Don't report these again, except one the fixes didn't settle: report that as 'not fixed: <the finding>', with the case that still fails.">
<With a question about a tag for this reviewer: "Apart from your report, answer this first: <the question below, from 'A reviewer reported' to its last line>">

Report each issue as:
- a short title;
- file and line;
- what goes wrong and when, as a concrete case;
- blocker (a defect this change introduces or exposes that causes data loss or corruption, a security or privacy hole, a crash, hang or wrong result on a common path, a broken build or test, or another serious defect on a common path), follow-up (a defect this change introduces or exposes that needs unusual timing, rare input or a corner case, or a missing hardening), nit (real but minor) or pre-existing (true, but not caused by this diff);
- for a blocker or follow-up, the fix it needs;
- how often it would happen, from 1 to 10, and how bad it would be, from 1 to 10;
- confirmed (you traced it through the code) or suspected.

Skip style preferences and theoretical cases you can't make concrete. If you find nothing serious, say so plainly and list what you checked.

Run only read-only commands (git diff, git log, git show, reading files). Don't create files or folders, don't run tests or scripts, and don't run any command that might ask for approval: nobody is there to give it. If you'd like a test run, name the test and what it should show in your report instead.
```

## The question about a tag

When you reject a finding a reviewer tagged a blocker, or give it a lower tag (SKILL.md, section 4), send this, alone or inside that reviewer's next brief. Give the finding whole, as it was reported, and your reason as you recorded it: don't argue further.

```text
You are asked one question about a code change under review. Answer it only: don't review the change, don't edit, create or delete files or folders, don't commit, and run only commands that read (git diff, git log, git show, reading files). Don't run tests or scripts, and don't run any command that might ask for approval: nobody is there to give it. Don't ask anyone anything.

Where: <worktree or checkout path>. The diff: git -C <path> diff <base>...<head>.
A reviewer reported: <the finding as it was reported, whole: its title, file and line, the case, its tag and the fix it asked for>.
The author tagged it <follow-up, nit, pre-existing or rejected> instead of blocker, because: <your reason>.
A blocker is a defect this change introduces or exposes that causes data loss or corruption, a security or privacy hole, a crash, hang or wrong result on a common path, a broken build or test, or another serious defect on a common path.

Do you agree with the author's tag? Start your answer with "agree" or "hold". If you hold, give the concrete case that still goes wrong, how often it would happen, and why it is a blocker by the definition above. You have 10 minutes.
```

An answer that starts with "agree", in any letter case, is `agrees`; one that starts with "hold" is `holds`; and none in its 10 minutes, or one that says neither, is `no answer`. Save it in the record folder as `reply-<the finding's id>-<reviewer>.md`; if you ask about the finding again in a later round, as `reply-<id>-<reviewer>-round-<n>.md`.

Ask once in a round for a finding and the reviewer that answers. When the questions about one finding go to the same reviewer (its own report of the finding and a free reviewer's or Haiku's, or several of theirs), send one question with every report of it, and record its one answer on each of those entries, with `reply_from` on every entry that reviewer didn't raise.

## The visual look

When live UI captures are taken or retaken after round 1 (for example after queueing for the screen in an evening run, or after retaking an unrepresentative capture), send this to the round's cross reviewer (or another eligible paid reviewer able to open pictures):

```text
You are doing a visual look on a code change that already passed code review. Review only: don't edit, create or delete files or folders, don't commit, and run only read-only tools and commands (git diff, git log, git show, reading files). Don't run tests or scripts, and don't run any command that might ask for approval: nobody is there to give it. Don't ask anyone anything; answer with your report.

The change: <the objective in two to four sentences, and what visible UI changed>.
UI check: <required | rendered is enough because <reason>>.
Where: <worktree or checkout path>. The diff: git -C <path> diff <base>...<head>.
Pictures to inspect (open each with your read-only file tool; never run shell commands or OCR scripts):
- <absolute path>: <the state or region it is meant to show>

Start your report with a "Pictures:" line giving one sentence on what you actually see in each file (or "couldn't open: <why>" — never judge a picture you didn't open). Check:
1. Authenticity: does each capture show the required state under test (for "required": real running, mounted, interactive/hovered state including native/system chrome where present, not a poster, mock or placeholder; for "rendered is enough": shipped view matching the three conditions)?
2. Visual defects: overlapping or occluded controls, clipping, broken alignment, unreadable contrast or layout regressions against the diff.

Report each real visual defect as:
- a short title;
- file and line (where in the diff or view it comes from);
- what goes wrong and when, as a concrete case;
- blocker (a visible defect on a common path), follow-up (a corner case), nit (minor) or pre-existing;
- for a blocker or follow-up, the fix it needs;
- how often it would happen, from 1 to 10, and how bad it would be, from 1 to 10;
- confirmed (seen in the capture and traced to code) or suspected.

Report a missing or unrepresentative capture (or a false "rendered is enough" claim) as a visual-evidence gap (not a blocker), stating what state must be captured. If every picture is authentic and clean, say so plainly after your "Pictures:" line.

Run only read-only commands (git diff, git log, git show, reading files). Don't create files or folders, don't run tests or scripts, and don't run any command that might ask for approval: nobody is there to give it.
```
