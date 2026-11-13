# Page spec

`page.json` describes one page. `scripts/build.mjs` turns it into `page.excalidraw` and `page.png` (inside an Obsidian vault, `<title>.excalidraw.md` and `<title>.excalidraw.png`: see Build options).

```json
{
  "title": "Small teams",
  "subtitle": "A team lead on why four people ship faster than twelve",
  "format": "3:4",
  "panels": [
    { "id": "now", "heading": "...", "elements": [ ... ], "takeaway": "..." },
    { "id": "how", "span": 2, "heading": "...", "elements": [ ... ] }
  ],
  "footer": "Source: author, title (date). Caveats."
}
```

## Page and panels

The page is 1500 px wide with two columns, and `format` fixes its height:

| `format` | Size | Use for |
|---|---|---|
| `3:4` (default) | 1500×2000 | a tall post, the usual shape of these pages |
| `4:5` | 1500×1875 | Instagram portrait |
| `a4` | 1500×2121 | printing |
| `square` | 1500×1500 | a short page |
| `16:9` | 1500×844 | a slide: one full-width panel, usually `"frame": false`; the title is the slide's point. Use larger type than on a page (labels 20 to 24, captions 18 or more), since slides are read from across a room |
| `auto` | grows to fit | drafts only |
| `fit` | grows to fit, and narrows to the drawing | a single diagram ([diagrams.md](diagrams.md)) |

Spare height is spread evenly over the rows, and panels keep their drawing at the top. Content taller than the format is a warning that says how many pixels to cut. A 3:4 page holds about four rows of panels, one of them full width. Fill the page: a page with a lot of empty space is missing a panel.

Panels fill rows in order: a `"span": 2` panel takes a whole row; two half panels in a row share one height (the taller one's). To keep a pair together, list them one after the other; a half panel followed by a full one sits alone in its row, so pair half panels up.

| Panel field | Meaning |
|---|---|
| `id` | Short, unique; prefixes the ids of its elements in warnings and in the file |
| `heading` | The panel's point, 24 px |
| `elements` | The drawing, in the panel's own coordinates (below) |
| `takeaway` | One or two sentences, 17 px, under the drawing, wrapped to 520 px (`takeawayWidth` to change) |
| `span` | `2` for full width |
| `minHeight` | Force a taller panel |
| `frame` | `false` drops the panel's card and its padding: a bare drawing. Set it on the page to apply to every panel |

**Coordinates are local to the panel's drawing area:** `x: 0, y: 0` is its top-left corner, just under the heading. Its width is 639 px for a half panel and 1356 px for a full one, 48 px more without a frame (the build prints it). Its height grows to fit the drawing. Keep `x` and `y` at 0 or more.

## Colors

Give any element `"color"` a name: the fill is pastel, the stroke the matching dark tone.

| Name | Fill | Stroke | Use for |
|---|---|---|---|
| `green` | #b2f2bb | #2f9e44 | good, the expected path |
| `orange` | #ffd8a8 | #e8590c | risk, what changed |
| `red` | #ffc9c9 | #e03131 | failure, what to avoid |
| `blue` | #a5d8ff | #1971c2 | the thing acted on, links, notes |
| `purple` | #d0bfff | #7048e8 | an agent, a model |
| `yellow` | #ffec99 | #f08c00 | the page's one key callout |
| `gray` | #e9ecef | #868e96 | neutral items, inputs |
| `cyan` | #99e9f2 | #0c8599 | data, storage |
| `white` | #ffffff | #1e1e1e | plain boxes |

A hex value as `color` sets only the stroke, for example `"#dee2e6"` for a faint divider line. `backgroundColor` and `strokeColor` override either part with a hex value: a light fill such as `#e7f5ff` (blue) or `#fff4e6` (orange) with the named stroke makes a softer card. On text, `color` is a name or a hex value; `#495057` is the muted gray for captions.

## Elements

Every element can take `id` (needed to connect arrows to it), `color`, `strokeColor`, `backgroundColor`, `strokeStyle` (`solid`, `dashed`, `dotted`), `strokeWidth`, `fillStyle` (`solid`, `hachure`, `cross-hatch`), `roughness` (0 to 2, default 1) and `opacity`.

`group` (any name) marks elements that form one drawing, such as a cylinder made of a box and an ellipse, or a label with a line struck through it: they move together in Excalidraw, and the build lets their parts overlap.

| Type | Fields | Notes |
|---|---|---|
| `rectangle`, `ellipse`, `diamond` | `x, y, width, height, label` | `label` is a string or `{ "text", "fontSize", "align": "left", "valign": "top", "color" }`. Labels wrap to the box; a label that doesn't fit makes the box grow, and the build warns. `"\n"` breaks a line. `"sharp": true` gives square corners. |
| `text` | `x, y, text, fontSize, width, align, color` | With `width` it wraps; without, it stays on its lines. Default size 17. `"align": "center"` centres it on `x`. |
| `arrow`, `line` | `start, end` (ids), or `x, y, points` | With `start` and `end` the build routes it side to side or top to bottom and binds it to boxes. `points` are relative to `x, y`, for bends and loops. `"curve": true` draws a smooth curve through the points instead of straight segments. `"elbow": true` makes a routed arrow bend at right angles. `label` puts text on it, with the line drawn through it in the PNG; to name a branch, a `text` beside the arrow reads better. `startArrowhead`, `endArrowhead`: `arrow`, `triangle`, `dot`, `bar` or `null`. |
| `chart` | `x, y, width, height, series` or `kind: "bar", bars` | A line or bar chart scaled from numbers: see Charts below. |
| `window` | `x, y, width, height, title, lines, dots` | A card with "•••" and a title in its bar, like an app window or a document. `lines` draws that many gray placeholder lines in it. `"dots": false` drops the dots, for a sheet of paper. |
| `stack` | `x, y, width, height, items, offset, lines, dots` | Overlapping windows, one per item, back to front. `offset: [dx, dy]`, default `[36, 30]`; `[10, -10]` fans a pile of sheets up and to the right. Its `id` connects arrows to the whole stack. |
| `person` | `x, y, size, label` | A stick figure about 50×90 at size 1, with a caption under it. |
| `lines` | `x, y, width, count, gap` | Gray placeholder lines, for text that isn't the point. |

Arrows connect by id within one panel. Leave at least 40 px between connected boxes: an arrow under 20 px is a stub, and the build warns. Several arrows into or out of one side of a box fan out along that side, and arrows to an ellipse end on its curve, so their heads don't pile up. An arrow drawn with `points` must start and end on something: put its ends on the edge of the shapes it links. Shapes Excalidraw lacks are built from parts: a funnel or other polygon is a `line` whose `points` end where they start, with a `backgroundColor`; a cylinder is a rectangle with an ellipse on top; an eye is an ellipse with a small dark one inside.

## Charts

A `chart` places every point and bar from the numbers you give it, so nothing is scaled by hand. Its parts are grouped: they move together in Excalidraw.

**Line chart** (the default `kind`). `x, y, width, height` are the whole chart, labels included; the plot is what the labels leave.

| Field | Meaning |
|---|---|
| `series` | `[{ "label", "color", "points": [[x, y], ...] }]`, two or more points each. Per series: `curve`, `markers`, `strokeStyle` (`dashed` for a forecast), `strokeWidth` |
| `xAxis`, `yAxis` | `{ "label", "min", "max", "ticks" }`. `min`/`max` default to the data (y from 0 when no value is negative). `ticks` are values, or `[value, "text"]` pairs such as `[1, "Jan"]` |
| `labels` | Where each series is named: `start` (left of the y axis, the default without y ticks), `end` (after the last point, the default with them) or `none`. Names too close together are pushed apart |
| `curve` | Smooth curves through the points: the default without y ticks (a sketched trend). With y ticks the points are measurements and the default is straight segments, since a curve can bulge past them |
| `markers` | A dot on every point |
| `grid` | Faint dashed lines at the y ticks |
| `fontSize` | Labels, default 18; tick numbers are 2 px smaller |

A point outside the axis range, a tick outside it, or a plot squeezed under 120×80 px by its labels is a warning.

**Bar chart** (`"kind": "bar"`). `x, y, width`; the height follows from the bars.

| Field | Meaning |
|---|---|
| `bars` | `[{ "label", "value", "color", "display" }]`. `value` is 0 or more; `display` replaces the printed value, such as `"27.5 min"` |
| `unit` | A caption above the bars, such as "minutes per task" |
| `max` | Scale to this value instead of the largest bar, to compare charts side by side |
| `barHeight`, `gap`, `fillStyle`, `fontSize` | Defaults 32, 18, `hachure`, 17 |

## Text sizes

The title is 56 px, the subtitle 21, headings 24 and takeaways 17, set by the build. Inside drawings: box labels 16 to 19, captions 15 to 16, never under 14. The PNG collapses a run of spaces to one (the `.excalidraw` file keeps them), so to space things out, use separate text elements. Excalifont has Latin letters, digits and common punctuation (•, –, —, ’, “ ”, …, ×, −, °), but no arrows, check marks, stars or emoji: draw those.

## Build options

```bash
node scripts/build.mjs page.json [--out-dir DIR] [--name NAME] [--scale 2] [--lint-only] [--obsidian | --no-obsidian] [--force]
```

`--scale` sets the PNG's pixel density (1 to 4, default 2: a 3000 px wide image). `--lint-only` checks without writing files. `--name` names the outputs (default: the spec's file name, or in an Obsidian vault its title). Exit codes: 0 clean, 3 built with warnings, 1 error, 2 usage.

| Output folder | Writes |
|---|---|
| anywhere else | `<name>.png` and `<name>.excalidraw` |
| inside an Obsidian vault (`.obsidian` in it or above it), or with `--obsidian` | `<name>.excalidraw.png` and `<name>.excalidraw.md`, the Excalidraw plugin's files, with the JSON uncompressed |

`--no-obsidian` writes the plain pair inside a vault too. If the drawing on disk has been saved in an editor since it was built (its `source` is no longer `excalidraw-drawing`), the build stops with exit 1 rather than replace those edits; `--force` replaces it anyway.

Wrapped text (headings, takeaways, any `text` with a `width`) is saved 2% and 2 px wider than its widest line, within the width it was wrapped to, so an editor that measures the font a fraction wider doesn't break a line again.
