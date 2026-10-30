# Build from a visual source

Use the URL route for a faithful clone and the image route for a selected screenshot, mockup, or generated direction.

## URL route

1. Confirm the user requested a clone rather than a redesign.
2. Capture the source at the intended desktop and mobile viewports and inspect the screenshots.
3. Traverse the core journey and record visible states and interactions, following "Live flows and side effects" below.
4. Catalog layout, typography, colors, radii, borders, icons, imagery, and responsive changes.
5. Reuse source assets when permitted. Do not scrape hidden data or bypass authentication.

### Live flows and side effects

Walking a live product can change real things. Use test data or a test environment where one exists, with obviously fake values. Never submit anything irreversible, or anything that reaches real people or money (creating or deleting an account, sending a form or message, a payment, an order, cancelling a subscription, publishing), unless the user has said so for that specific step. Stop before such a step, say what it would do, and ask; if there is no clear yes, record the screen before it and note the next state as not observed. `audit.md` has the full rule.

## Image route

1. Open the selected source image; never infer from its filename.
2. Record its dimensions, crop, hierarchy, type treatment, spacing, palette, surfaces, icons, and imagery.
3. Resolve ambiguities from saved context and the current codebase. Ask only when a decision materially changes the design.

## Implementation

For a new app, bootstrap the matching template. For an existing app, inspect and reuse its tokens, components, and patterns.

Implement the core journey with realistic mock data. Navigation, tabs, menus, primary calls to action, forms, filters, toggles, and visible states required for that journey must work. Supporting controls may remain visual-only when clearly outside scope.

Run the app, capture it at the same viewport and state as the source (screenshots go in the run folder, `SKILL.md`, "Where evidence goes"), then follow `design-qa.md`. Do not hand off until the QA gate passes.
