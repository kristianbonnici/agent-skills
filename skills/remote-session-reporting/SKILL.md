---
name: remote-session-reporting
description: Report work through the chat itself while the user is away from their computer and following the session remotely, for example from a phone through Remote Control or a cloud session. Send screenshots of UI changes, paste changed prose, summarize code and check results, and ask decisions inline, because the user cannot open local files, diffs, terminals, browser panes, or localhost pages. Use whenever the user says they are remote, on their phone, away from the computer, using remote control, or asks to see pictures or have results pasted into chat, and keep using it until they say they are back at the computer.
---

# Remote Session Reporting

While the user is remote, the chat is their only window into the work. They can read messages and open files you send through the host's file-sharing tool. They cannot open local paths, file links, diff or terminal panes, the agent's browser, or `localhost` URLs. Anything you only describe or link, they cannot check.

## When it applies

Start when the user says they are remote or asks to see results in chat ("I'm on my phone", "I'm in remote use", "send pictures", "paste the text here"). The mode lasts across turns. Stop when they say they are back ("I'm on my computer again"); from then on, do not resend screenshots or paste content they can now open themselves.

If you are unsure whether the user can see local files, ask once rather than guessing.

## What to show

Choose the form that lets the user judge the result without their computer.

| Change | Show |
| --- | --- |
| Visible UI or layout | Screenshots of the running app with the change on screen |
| Interactive behavior | One screenshot per meaningful state: before and after, hover, selected, each toggle position |
| Prose, docs, lesson or UI copy | The final text pasted into the message |
| Code | What changed and why, plus short excerpts of the key hunks |
| Checks | Commands run, pass or fail counts, and failure excerpts |
| Generated artifacts (images, PDFs, reports) | The file itself through the file-sharing tool |
| Decisions | The options inline, each with enough context to choose |

### Screenshots

- Capture the real result, not a mock-up. If the change is not rendered, say so instead of sending an old picture.
- Reload the page before capturing after hot-module updates or other in-place reloads; stale state can show an outdated view. Make sure the screenshot shows what the caption claims, and retake it if a click missed or the view did not update.
- Use a legible size. If the viewport is small, enlarge it for the capture (about 1400×900 works well) and restore the original size afterward.
- Frame the relevant area and keep unrelated windows, personal data, tokens, and secrets out of the picture.
- Save captures in a scratch or temporary directory, never in the repository, then send them with the host's file-sharing tool (for example `SendUserFile` in Claude Code). Add a one-line caption that says what to look at.
- Send a screenshot when a result is ready for review, not for every intermediate step. If the user asks for pictures of something already sent, resend only what changed.

### Pasted text

- Paste the final wording, not a diff, so the user can read it as a reader would.
- Convert markup that only matters inside the app: keep link labels but drop internal anchors, and keep citation numbers but drop their URLs. Then list any new sources with links at the end.
- For long content, paste the changed sections and name what stayed the same.

### Code and checks

- Lead with behavior: what now works differently and where it lives.
- Quote only the hunks that carry the decision, in fenced blocks. Do not paste whole files.
- Report checks with counts ("290 tests passed; type check clean"). If something failed or was skipped, say so with the relevant output.

## Message shape

Keep messages readable on a phone:

1. One or two sentences on what changed and whether it is verified.
2. The attachments or pasted content.
3. Deviations from the request, open questions, and anything still uncommitted or unverified.

Do not ask the user to "open", "click", or "check" anything that exists only on the computer. Bring the content to them.

## Long-running work

The user is not watching the screen, so send a short update with any finished deliverable when a meaningful milestone completes, or when you are blocked on their decision. If the host distinguishes proactive notifications from replies, mark these updates as proactive. Do not flood the chat with routine progress.

## Hosts without file sharing

If the host cannot send files, say so once. Paste text content inline, describe visual changes precisely (layout, labels, states), and offer to produce an artifact the user can open later.
