---
name: excalidraw-drawing
description: Draw hand-drawn pictures in Excalidraw's style - a one-page infographic that explains an article, talk, thread, paper or notes (a title, six or so panels, a source line), or a single diagram such as a line or bar chart, flowchart, architecture or boundary diagram, sequence diagram, timeline, quadrant, cycle, tree or comparison table - delivered as a PNG to post and an .excalidraw file to edit by hand (in an Obsidian vault, the Excalidraw plugin's .excalidraw.md) - and change an existing Excalidraw drawing in place. Use when the user wants a sketch page, a visual summary, an Excalidraw-style explainer, cheat sheet, chart or diagram, "one of those hand-drawn infographic posts", a picture like an example image they share, or a change to an .excalidraw or .excalidraw.md drawing they have.
metadata:
  version: 3.1.0
---

# Excalidraw Drawing

You make one of two things, both in Excalidraw's hand-drawn style:

- **A page** that explains one source: a title, a grid of panels that each make one point with a small diagram and a sentence or two, and a footer naming the source.
- **A diagram**: one chart or picture, such as a line chart, a flowchart or a sequence diagram, from the user's data, description or example image.

Either way you write a JSON spec; `scripts/build.mjs` lays it out, draws it with Excalidraw's own renderer, checks it, and writes a PNG and an editable `.excalidraw` file. A drawing someone has since edited by hand you change in place instead (step 5).

The drawing is the easy part. The picture is only worth posting if everything on it is true to the source, in fewer words than the source took.

## 1. Decide which, then plan it

A source to summarize, or several points to make, is a page. One picture of one thing is a diagram. Plan in your reply, before any JSON.

### A page

Read all of the source. Then write:

- **Title:** the topic in two to five words. **Subtitle:** who said it and what about, in one line ("A transit planner on why buses beat new rail lines in small cities").
- **Shape:** 3:4 portrait (1500×2000) unless the user names another, or their example page has another shape. A slide for a talk is `16:9` (1500×844), one spec per slide. Other formats are in [references/spec.md](references/spec.md).
- **Six or seven panels, enough to fill the page.** A 3:4 page holds about four rows: three rows of two half panels and one full-width panel. Each panel has a heading that makes the point (not a topic label), a picture idea, and a takeaway of at most two sentences and about 30 words. The full-width panel holds the richest example.
- **Footer:** the source (author, title, date) and any caveat the source gives, such as "design notes and a prototype, not a shipped product".

Wait for the user's go-ahead on the plan when the source is long or the angle is unclear; otherwise go straight on.

For each panel, pick one picture from [references/patterns.md](references/patterns.md) (a chain of steps, before and after, many into one, a loop back, a bar chart, a timeline...) or [references/diagrams.md](references/diagrams.md), by the claim it makes, not by which looks busiest. A panel whose point is a list can be three labelled boxes. Text inside drawings is a few words, never a sentence.

### A diagram

Pick the kind from the table at the top of [references/diagrams.md](references/diagrams.md), by what the reader should see. Then write the kind, its parts (the boxes, actors, series or events) and every word that will be on it. It goes in a page with one full-width panel, `"frame": false` and `"format": "fit"`; a title is optional.

- **From numbers:** use the `chart` element and give it the numbers exactly as the source or the user gave them; it does the scaling.
- **From a description of a shape** ("rose, then fell"): a trend sketch without ticks. Say on the page that the shape is illustrative, unless it's the user's own sketch.
- **From an example image:** list everything it shows (nodes, arrows, labels, legend, the order of messages) and keep all of it. Redraw it in this skill's style and colors unless the user asks to match theirs. What the skill can't draw (logos, icons, a code font) becomes the plainest stand-in, and you say so.

### Either

**Working from an example page** the user shares: list its panels first and keep every one in your plan, unless the user asked for fewer. Matching its look but dropping a panel is the most common way to fall short of it.

**Stay true to the source.** Every number, name and claim must be in the source. Attribute opinions ("the author argues..."). When you add your own illustration of a point, say so on the page ("a made-up example of how that could happen"). Leave out what you can't draw honestly rather than inventing a figure for it.

Color carries meaning, the same way everywhere: green for good or the default path, orange for risk or what changed, red for failure, blue for the thing being acted on, purple for an agent or model, yellow for the single most important callout, cyan for data and storage. Gray is neutral. See [references/spec.md](references/spec.md) for the names.

## 2. Write the spec and build

Save each picture in its own folder, as `page.json`; ask where if the user hasn't said. The format and every element type are in [references/spec.md](references/spec.md); [assets/example.json](assets/example.json) is a complete page. Then run, from this skill's folder:

```bash
node scripts/build.mjs <folder>/page.json
```

It prints each panel's drawing-area width (draw within it; height grows to fit) and writes `page.png` and `page.excalidraw` next to the spec. If the runtime is missing it says how to install it.

**For an Obsidian vault** (a folder with `.obsidian` in it or above it), keep `page.json` in a folder of your own outside the vault, and build with `--out-dir <folder in the vault>`. The build sees the vault and writes the Excalidraw plugin's own files there, named after the title: `<title>.excalidraw.md`, which the plugin opens as a drawing (a plain `.excalidraw` opens only in compatibility mode), and `<title>.excalidraw.png`, the file the plugin's auto-export keeps up to date. `--name` gives another name; `--no-obsidian` writes the plain pair.

## 3. Check it, then fix it

- **Fix every warning.** Exit code 3 means it built with warnings: the content is taller than the page (it says how many pixels to cut), something reaches outside its panel, overlaps something else, has an arrow running through its text, has an arrow too short to read as one, made a box grow because its label didn't fit, puts a chart point outside its axes, or uses a character Excalifont lacks (arrows such as →, check marks, emoji), which renders in a system font. Draw arrows and ticks as elements instead.
- **Then look at the PNG** (open the image file): does the eye follow the arrows the right way, does every arrow and line start and end on something, are arrowheads clear of each other, is any label crowded against a border or an arrow, do panels in a row look balanced, does each heading match its picture? Is a page full, or is a panel mostly empty? Fix the spec and build again. Two or three rounds is normal.
- **With an example image, compare the two side by side,** part by part: same panels or nodes, same arrows, similar density. Say what still differs.
- **Read the words once more against the source,** on the picture as drawn.

## 4. Deliver

Give the user the PNG and the drawing's path, and the plan's one-line summary. Say that the `.excalidraw` file opens at excalidraw.com or in the Excalidraw app for hand edits (an `.excalidraw.md` opens in Obsidian), and that after hand edits that file, not `page.json`, is the picture: you can carry on from their edits, and the build won't replace a drawing saved in an editor since.

Recreating someone else's published page or diagram is fine as a private study or test; don't offer one for posting. Their layout, wording and branding are theirs.

## 5. Change an existing drawing

When the user has edited a drawing, or asks for a change to one they have, change that file; never build it again from a spec. Follow [references/editing.md](references/editing.md): in Obsidian, have them close the drawing's tab first; read the file, since their edits are only there; make the change with a short script that uses `scripts/drawing.mjs`, which keeps the file's format; render a preview outside the vault with `node scripts/drawing.mjs render <drawing> <preview.png>` and check it as in step 3; then tell them what changed and, in Obsidian, ask them to reopen the drawing and save it once.
