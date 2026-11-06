# Panel patterns

Each pattern below is a tested `elements` array for a half panel (639 px wide). Copy one, then change the words, colors and sizes. Every pattern answers a particular kind of claim; pick by the claim. The words in them are placeholders: replace every one with the source's.

## Chain with notes: "A leads to B leads to C"

Steps going down, each with a sentence beside it. Good for stages, escalation, a process.

```json
[
  { "type": "rectangle", "id": "a", "x": 0, "y": 0, "width": 230, "height": 50, "color": "gray", "label": "Draft" },
  { "type": "rectangle", "id": "b", "x": 0, "y": 90, "width": 230, "height": 50, "color": "blue", "label": "Review" },
  { "type": "rectangle", "id": "c", "x": 0, "y": 180, "width": 230, "height": 50, "color": "green", "label": "Publish" },
  { "type": "arrow", "start": "a", "end": "b" },
  { "type": "arrow", "start": "b", "end": "c" },
  { "type": "text", "x": 260, "y": 4, "width": 340, "fontSize": 17, "text": "Someone writes the first version." },
  { "type": "text", "x": 260, "y": 94, "width": 340, "fontSize": 17, "text": "Someone who didn't write it reads it." },
  { "type": "text", "x": 260, "y": 184, "width": 340, "fontSize": 17, "text": "It goes out with a note on what changed." }
]
```

## Piles up on one person: "more arrives than anyone can handle"

```json
[
  { "type": "stack", "id": "work", "x": 0, "y": 0, "width": 230, "height": 76, "offset": [40, 34], "items": ["request", "report", "question"], "lines": 2 },
  { "type": "person", "id": "me", "x": 470, "y": 20, "label": "one reader" },
  { "type": "arrow", "start": "work", "end": "me" }
]
```

## Many into one: "these inputs make the result"

```json
[
  { "type": "rectangle", "id": "i1", "x": 0, "y": 0, "width": 250, "height": 44, "color": "gray", "label": "The goal" },
  { "type": "rectangle", "id": "i2", "x": 0, "y": 60, "width": 250, "height": 44, "color": "gray", "label": "The limits" },
  { "type": "rectangle", "id": "i3", "x": 0, "y": 120, "width": 250, "height": 44, "color": "gray", "label": "The deadline" },
  { "type": "window", "id": "out", "x": 340, "y": 20, "width": 250, "height": 120, "title": "The plan", "backgroundColor": "#e7f5ff", "lines": 3 },
  { "type": "arrow", "start": "i1", "end": "out" },
  { "type": "arrow", "start": "i2", "end": "out" },
  { "type": "arrow", "start": "i3", "end": "out" },
  { "type": "text", "x": 370, "y": 152, "fontSize": 16, "color": "blue", "text": "everyone works from this" }
]
```

One into many is the same with the arrows reversed: `"start": "out", "end": "i1"`. Several arrows into one side of a box fan out along it by themselves.

## Loop back to the source: "check the claim against the original"

A chain, and a dashed arrow that bends back under it. The bend's `points` are relative to the arrow's `x, y`; start and end it on the edges of the boxes it links.

```json
[
  { "type": "stack", "id": "src", "x": 0, "y": 10, "width": 150, "height": 80, "offset": [10, 8], "items": ["", "", "raw notes"], "lines": 2 },
  { "type": "rectangle", "id": "sum", "x": 240, "y": 25, "width": 150, "height": 66, "color": "purple", "label": "summary" },
  { "type": "rectangle", "id": "claim", "x": 460, "y": 25, "width": 150, "height": 66, "color": "white", "label": "one claim" },
  { "type": "arrow", "start": "src", "end": "sum" },
  { "type": "arrow", "start": "sum", "end": "claim" },
  { "type": "arrow", "x": 535, "y": 100, "points": [[0, 0], [0, 40], [-440, 40], [-440, 10]], "strokeStyle": "dashed", "color": "blue" },
  { "type": "text", "x": 230, "y": 146, "fontSize": 16, "color": "blue", "text": "back to the raw notes" }
]
```

## Before and after: "one change, two outcomes"

Each outcome box has a top label and a drawn `before -> after` row. Draw the arrow; don't type "→". For a full-width panel, put the cause on the left and fan out to two rows.

```json
[
  { "type": "rectangle", "id": "same", "x": 0, "y": 0, "width": 560, "height": 96, "color": "green", "label": { "text": "New users: nothing changes", "valign": "top" } },
  { "type": "text", "x": 40, "y": 54, "fontSize": 18, "color": "#495057", "text": "before" },
  { "type": "text", "x": 110, "y": 54, "fontSize": 18, "text": "light" },
  { "type": "arrow", "x": 170, "y": 66, "points": [[0, 0], [70, 0]], "color": "green" },
  { "type": "text", "x": 260, "y": 54, "fontSize": 18, "color": "#495057", "text": "after" },
  { "type": "text", "x": 320, "y": 54, "fontSize": 18, "text": "light" },
  { "type": "line", "x": 480, "y": 62, "points": [[0, 0], [10, 12], [30, -10]], "color": "green" },
  { "type": "rectangle", "id": "flip", "x": 0, "y": 130, "width": 560, "height": 96, "color": "orange", "label": { "text": "Existing users: the theme flips", "valign": "top" } },
  { "type": "text", "x": 40, "y": 184, "fontSize": 18, "color": "#495057", "text": "before" },
  { "type": "text", "x": 110, "y": 184, "fontSize": 18, "text": "light" },
  { "type": "arrow", "x": 170, "y": 196, "points": [[0, 0], [70, 0]], "color": "orange" },
  { "type": "text", "x": 260, "y": 184, "fontSize": 18, "color": "#495057", "text": "after" },
  { "type": "text", "x": 320, "y": 184, "fontSize": 18, "text": "dark" }
]
```

## Key callout: the one sentence to remember

At most one per page, often at the bottom of the full-width panel. Keep it to two lines.

```json
[
  { "type": "rectangle", "id": "key", "x": 0, "y": 0, "width": 600, "height": 76, "color": "yellow", "sharp": true, "label": { "text": "Write here the one sentence a reader should still remember tomorrow, and nothing else.", "align": "left" } }
]
```

## Bar chart: "how much faster / cheaper"

A `chart` with `"kind": "bar"`: it scales the bars to the largest value and writes each value at its bar's end, so no length is worked out by hand. Use the source's numbers as they are, never rounded into a different claim. More charts are in [diagrams.md](diagrams.md).

```json
[
  { "type": "chart", "kind": "bar", "id": "speed", "x": 0, "y": 0, "width": 560, "unit": "minutes per task",
    "bars": [ { "label": "New way", "value": 12, "color": "blue" }, { "label": "Old way", "value": 27.5, "color": "gray" } ] }
]
```

## Before and after on a timeline: "it no longer waits"

Two rows of small boxes on a time axis. A dashed box is time spent waiting.

```json
[
  { "type": "text", "x": 0, "y": 0, "fontSize": 16, "color": "#495057", "text": "before" },
  { "type": "rectangle", "id": "m1", "x": 0, "y": 26, "width": 90, "height": 44, "color": "white", "label": "order" },
  { "type": "rectangle", "id": "t1", "x": 120, "y": 26, "width": 90, "height": 44, "color": "white", "label": "check" },
  { "type": "rectangle", "id": "wait", "x": 240, "y": 26, "width": 220, "height": 44, "color": "gray", "strokeStyle": "dashed", "label": { "text": "stuck until it's done", "fontSize": 16 } },
  { "type": "rectangle", "id": "r1", "x": 490, "y": 26, "width": 90, "height": 44, "color": "blue", "label": "reply" },
  { "type": "arrow", "start": "m1", "end": "t1", "gap": 4 },
  { "type": "arrow", "start": "t1", "end": "wait", "gap": 4 },
  { "type": "arrow", "start": "wait", "end": "r1", "gap": 4 },
  { "type": "text", "x": 0, "y": 100, "fontSize": 16, "color": "#495057", "text": "after" },
  { "type": "rectangle", "id": "m2", "x": 0, "y": 126, "width": 90, "height": 44, "color": "white", "label": "order" },
  { "type": "rectangle", "id": "t2", "x": 120, "y": 126, "width": 90, "height": 44, "color": "white", "label": "starts" },
  { "type": "rectangle", "id": "m3", "x": 240, "y": 126, "width": 90, "height": 44, "color": "white", "label": "order 2" },
  { "type": "rectangle", "id": "r2", "x": 360, "y": 126, "width": 110, "height": 44, "color": "blue", "label": "answers" },
  { "type": "rectangle", "id": "r3", "x": 500, "y": 126, "width": 90, "height": 44, "color": "green", "label": "result" },
  { "type": "arrow", "start": "m2", "end": "t2", "gap": 4 },
  { "type": "arrow", "start": "t2", "end": "m3", "gap": 4 },
  { "type": "arrow", "start": "m3", "end": "r2", "gap": 4 },
  { "type": "arrow", "start": "r2", "end": "r3", "gap": 4 },
  { "type": "line", "x": 165, "y": 186, "points": [[0, 0], [0, 14], [380, 14], [380, 0]], "color": "blue" },
  { "type": "text", "x": 230, "y": 206, "fontSize": 15, "color": "blue", "text": "the check runs in the background" }
]
```

## Cards with a colored header: "two habits", "two cadences"

A header bar sits on top of a white card. Put the card first so the bar draws over it.

```json
[
  { "type": "rectangle", "id": "c1", "x": 0, "y": 0, "width": 270, "height": 130, "color": "white", "label": { "text": "Read yesterday's notes.", "fontSize": 17 } },
  { "type": "rectangle", "id": "h1", "x": 0, "y": 0, "width": 270, "height": 36, "color": "blue", "label": { "text": "Each morning", "fontSize": 17 } },
  { "type": "rectangle", "id": "c2", "x": 320, "y": 0, "width": 270, "height": 130, "color": "white", "label": { "text": "Clear what is still open.", "fontSize": 17 } },
  { "type": "rectangle", "id": "h2", "x": 320, "y": 0, "width": 270, "height": 36, "color": "purple", "label": { "text": "Each Friday", "fontSize": 17 } }
]
```

The header overlaps its card on purpose; the build only warns about overlaps where neither contains the other, so keep the header inside the card's edges.

## Options, one chosen: "picked among similar choices"

```json
[
  { "type": "rectangle", "id": "o1", "x": 0, "y": 0, "width": 70, "height": 70, "color": "white" },
  { "type": "rectangle", "id": "o2", "x": 100, "y": 0, "width": 70, "height": 70, "color": "green" },
  { "type": "rectangle", "id": "o3", "x": 200, "y": 0, "width": 70, "height": 70, "color": "white" },
  { "type": "text", "x": 60, "y": 84, "fontSize": 16, "color": "#495057", "text": "3 similar options" }
]
```
