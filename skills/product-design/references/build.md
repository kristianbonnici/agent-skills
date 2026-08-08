# Build from a visual source

Use the URL route for a faithful clone and the image route for a selected screenshot, mockup, or generated direction.

## URL route

1. Confirm the user requested a clone rather than a redesign.
2. Capture the source at the intended desktop and mobile viewports and inspect the screenshots.
3. Traverse the core journey and record visible states and interactions.
4. Catalog layout, typography, colors, radii, borders, icons, imagery, and responsive changes.
5. Reuse source assets when permitted. Do not scrape hidden data or bypass authentication.

## Image route

1. Open the selected source image; never infer from its filename.
2. Record its dimensions, crop, hierarchy, type treatment, spacing, palette, surfaces, icons, and imagery.
3. Resolve ambiguities from saved context and the current codebase. Ask only when a decision materially changes the design.

## Implementation

For a new app, bootstrap the matching template. For an existing app, inspect and reuse its tokens, components, and patterns.

Implement the core journey with realistic mock data. Navigation, tabs, menus, primary calls to action, forms, filters, toggles, and visible states required for that journey must work. Supporting controls may remain visual-only when clearly outside scope.

Run the app, capture it at the same viewport and state as the source, then follow `design-qa.md`. Do not hand off until the QA gate passes.
