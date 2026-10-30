# Screenshot-grounded audit

Audit a screen or flow from evidence captured in the current run.

1. Confirm the surface, user goal, flow boundary, and whether the audit is UX, accessibility, or combined.
2. Observe the current browser state before acting.
3. Move through the flow one step at a time, following "Live flows and side effects" below. Before each action take a fresh snapshot; after it, verify the changed state.
4. Capture stable screenshots with numbered names such as `01-start.png` and `02-confirmation.png`. Save them in the run folder outside the user's repository (`SKILL.md`, "Where evidence goes"), by absolute path, and never overwrite an existing file without asking.
5. Open each saved screenshot. Reject loading, blank, cropped, blocked, or wrong-state captures.
6. Tie every finding to a numbered step or accepted screenshot.

Inspect task entry, information architecture, hierarchy, copy, affordances, validation, errors, empty states, consistency, trust, responsive behavior, contrast, semantics, keyboard access, focus, labels, target size, motion, and state announcements.

Return an inline report with:

- Scope, user goal, and overall verdict.
- Accepted screenshots in flow order.
- Strengths.
- UX and accessibility risks, each with evidence, impact, and concrete recommendation.
- Highest-impact changes.
- Evidence limits, including anything screenshots cannot prove.

## Live flows and side effects

Walking a live product can change real things. Before the first action, decide how each step could be reversed, and:

- Use test data and a test, staging, or sandbox environment whenever one exists. Use obviously fake values (for example an address you control or a reserved test domain, and a payment provider's documented test card), never the user's real details unless they supply them for this purpose.
- Never submit anything irreversible, or anything that reaches real people or money, unless the user has said so for that specific step. That includes creating or deleting an account, sending a message, invitation, or form, placing an order or entering payment details, changing a plan, cancelling a subscription, publishing, and granting permissions.
- Stop before such a step, say what it would do, and ask. Without a clear yes, audit up to that screen from what it shows, and state in the report that the following state was not observed.

Do not claim WCAG compliance from screenshots alone. Use only evidence captured in this run unless the user explicitly supplies older evidence.
