# Screenshot-grounded audit

Audit a screen or flow from evidence captured in the current run.

1. Confirm the surface, user goal, flow boundary, and whether the audit is UX, accessibility, or combined.
2. Observe the current browser state before acting.
3. Move through the flow one step at a time. Before each action take a fresh snapshot; after it, verify the changed state.
4. Capture stable screenshots with numbered names such as `01-start.png` and `02-confirmation.png`.
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

Do not claim WCAG compliance from screenshots alone. Use only evidence captured in this run unless the user explicitly supplies older evidence.
