# Changing an existing drawing

Once someone has edited a drawing by hand, the file is the picture: change it in place. Building again from `page.json` would replace their edits, so the build refuses (`--force` overrides that, and loses them).

## Before you touch it

- **Know the file.** A `.excalidraw` file is JSON, from excalidraw.com, the Excalidraw app or this skill's build. An `.excalidraw.md` comes from Obsidian's Excalidraw plugin: the drawing is the JSON under `## Drawing`, and the `## Text Elements` list above it holds every text's words. A `<name>.excalidraw.png` beside it is the plugin's auto-export; leave it to the plugin.
- **In Obsidian, ask the user to close the drawing's tab, and wait for their word.** An open drawing lives in the plugin's memory, and its next save overwrites the file, your change included.
- **A compressed drawing** (a `compressed-json` block) can't be read. Ask the user to turn off "Compress Excalidraw JSON in Markdown" (Excalidraw settings, Saving), or to run "Decompress current Excalidraw file" from the command palette, and save the drawing once.
- **Read it first.** What the user changed is only in the file. Find elements by their words, color or position: a drawing the plugin has saved gives its texts new 8-character ids, so the spec's ids no longer match.

## Make the change with a short script

Write a one-off script in your own scratch folder, never in the vault, and run it with `node`:

```js
import { readDrawing, writeDrawing, newId, indexAfter } from '<this skill>/scripts/drawing.mjs';

const d = readDrawing('/path/to/Plan.excalidraw.md');
const els = d.scene.elements;
const byText = t => els.find(e => e.type === 'text' && e.text === t);

byText('DONE').text = 'SHIPPED';
writeDrawing(d);
```

`writeDrawing` keeps the file's format and indentation, so a diff shows only your change. It gives every changed or new element a new `version`, `versionNonce` and `updated`, copies a changed `text` into `originalText` and `rawText` (the plugin reads those), and in an `.excalidraw.md` rewrites the Text Elements list and gives a text without an 8-character id a new one.

## Common changes

- **Words:** set `text`. A text with `"autoResize": false` is wrapped to its `width` again when the drawing opens; for a one-line text, set `"autoResize": true` and Excalidraw sizes it to its words.
- **Move or resize:** change `x`, `y`, `width`, `height`. A label bound to a shape (its `containerId` is the shape's id) moves with it: shift the label by the same amount.
- **Color:** `strokeColor` and `backgroundColor`, from the palette in [spec.md](spec.md), so the meaning of each color holds.
- **Add an element:** copy a similar one from the drawing with `structuredClone`, then give it `id: newId()`, a new `seed` (any integer), `index: indexAfter(els.at(-1).index)`, `boundElements: []` and its own position and words, and push it onto `els` (later elements are drawn on top).
- **Connect two boxes with an arrow:** copy an arrow from the drawing if it has one. `x`, `y` is the start, 6 px off the first box's edge, and `points` is `[[0, 0], [dx, dy]]` to 6 px off the second. Bind both ends in the form the file already uses: the plugin writes `{ "elementId": <box id>, "mode": "orbit", "fixedPoint": [1, 0.5001] }`, where `fixedPoint` is the point on the box as fractions of its width and height (`[1, 0.5001]` the middle of its right side, `[0, 0.5001]` of its left); older files have `{ "elementId", "focus": 0, "gap": 6 }`. Then add `{ "id": <arrow id>, "type": "arrow" }` to both boxes' `boundElements`.
- **Delete:** remove the element, its bound label, and every reference to it: `boundElements` entries and arrow bindings.

## Check it, then hand it back

```bash
node scripts/drawing.mjs render <drawing> <preview.png>
```

Write the preview outside the vault, open it and check it as in step 3 of the skill. Images embedded in the drawing aren't drawn in the preview. Then tell the user what changed. In Obsidian, ask them to reopen the drawing and save it once: auto-export then brings its PNG up to date.

When the plugin next saves the drawing it may give texts new ids, rewrite arrow bindings in its own form, wrap fixed-width texts again and measure auto-sized ones again. That's expected; carry on from the file as it saved it.
