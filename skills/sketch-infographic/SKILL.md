---
name: sketch-infographic
description: Turn an article, talk, thread, paper or notes into a one-page hand-drawn infographic in Excalidraw's style - a title, six or so panels that each make one point with a small diagram and a one- or two-sentence takeaway, and a source line - delivered as a PNG to post and an .excalidraw file to edit by hand. Use when the user wants a sketch page, a visual summary, an Excalidraw-style explainer or cheat sheet, "one of those hand-drawn infographic posts", or a page like an example image they share.
metadata:
  version: 1.0.0
---

# Sketch Infographic

You make one page that explains one source: a title, a grid of panels, and a footer naming the source. Each panel makes one point with a small diagram and a sentence or two. You write the page as a JSON spec; `scripts/build.mjs` lays out the grid, draws it with Excalidraw's own renderer, checks it, and writes a PNG and an editable `.excalidraw` file.

The drawing is the easy part. The page is only worth posting if every panel says something true about the source, in fewer words than the source took.

## 1. Read the source and plan the page

Read all of it. Then write the plan in your reply, before any JSON:

- **Title:** the topic in two to five words. **Subtitle:** who said it and what about, in one line ("A transit planner on why buses beat new rail lines in small cities").
- **Shape:** 3:4 portrait (1500×2000) unless the user names another, or their example page has another shape. Other formats are in [references/spec.md](references/spec.md).
- **Six or seven panels, enough to fill the page.** A 3:4 page holds about four rows: three rows of two half panels and one full-width panel. Each panel has a heading that makes the point (not a topic label), a picture idea, and a takeaway of at most two sentences and about 30 words. The full-width panel holds the richest example.
- **Footer:** the source (author, title, date) and any caveat the source gives, such as "design notes and a prototype, not a shipped product".

Wait for the user's go-ahead on the plan when the source is long or the angle is unclear; otherwise go straight on.

**Working from an example page** the user shares: list its panels first and keep every one in your plan, unless the user asked for fewer. Matching its look but dropping a panel is the most common way to fall short of it.

**Stay true to the source.** Every number, name and claim on the page must be in the source. Attribute opinions ("the author argues..."). When you add your own illustration of a point, say so on the page ("a made-up example of how that could happen"). Leave out what you can't draw honestly rather than inventing a figure for it.

## 2. Pick a picture for each panel

Use one diagram per panel, built from the patterns in [references/patterns.md](references/patterns.md): a chain of steps, before and after, many into one, a loop back to the source, a comparison of options, a bar chart, a timeline. Choose the pattern that matches the claim, not the one that looks busiest. A panel whose point is a list can be three labelled boxes. Text inside drawings is a few words, never a sentence.

Color carries meaning, the same way on the whole page: green for good or the default path, orange for risk or what changed, red for failure, blue for the thing being acted on, purple for an agent or model, yellow for the single most important callout on the page. Gray is neutral. See [references/spec.md](references/spec.md) for the names.

## 3. Write the spec and build

Save each page in its own folder, as `page.json`; ask where if the user hasn't said. The format and every element type are in [references/spec.md](references/spec.md); [assets/example.json](assets/example.json) is a complete page. Then run, from this skill's folder:

```bash
node scripts/build.mjs <folder>/page.json
```

It prints each panel's drawing-area width (draw within it; height grows to fit) and writes `page.png` and `page.excalidraw` next to the spec. If the runtime is missing it says how to install it.

## 4. Check it, then fix it

- **Fix every warning.** Exit code 3 means the page built with warnings: the content is taller than the page (it says how many pixels to cut), something reaches outside its panel, overlaps something else, has an arrow running through its text, has an arrow too short to read as one, made a box grow because its label didn't fit, or uses a character Excalifont lacks (arrows such as →, check marks, emoji), which renders in a system font. Draw arrows and ticks as elements instead.
- **Then look at the PNG** (open the image file) and check each panel: does the eye follow the arrows the right way, does every arrow and line start and end on something, are arrowheads clear of each other, is any text crowded against a border, do panels in a row look balanced, does the heading match the picture? Is the page full, or is a panel mostly empty? Fix the spec and build again. Two or three rounds is normal.
- **With an example page, compare the two side by side,** panel by panel: same panels, same kind of drawing, similar density. Say what still differs.
- **Read the words once more against the source** (step 1), on the page as drawn.

## 5. Deliver

Give the user the PNG and the `.excalidraw` path, and the plan's one-line summary. Say that the `.excalidraw` file opens at excalidraw.com or in the Excalidraw app for hand edits, and that after hand edits that file, not `page.json`, is the page: building again overwrites it.

Recreating someone else's published page is fine as a private study or test; don't offer one for posting. Their layout, wording and branding are theirs.
