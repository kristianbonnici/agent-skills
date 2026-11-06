# Diagram catalog

One diagram per section: when to use it, what to watch for, and a tested `elements` array for a full-width panel. Copy one, then replace every word and number with the source's or the user's; they are placeholders. [patterns.md](patterns.md) has smaller pictures for half panels.

A diagram on its own goes in a page with one full-width panel, no frame, and the page trimmed to the drawing:

```
{ "title": "Optional", "format": "fit", "frame": false, "panels": [ { "id": "d", "span": 2, "elements": [ ... ] } ] }
```

The same arrays work as a panel of an infographic page; drop `"frame": false` there.

## Pick by the point

| The reader should see | Diagram |
|---|---|
| how a value changed, or how two things moved against each other | line chart (exact numbers) or trend sketch (a shape) |
| how much: a few quantities side by side | bar chart |
| steps, with a decision or a retry | flowchart |
| what sits inside what, and which parts talk to which | boundary |
| who sends what to whom, in what order, and who waits | sequence |
| when things happened or will | timeline |
| items sorted on two scales | quadrant |
| a process that repeats | cycle |
| the parts of a whole, or who owns what | tree |
| options compared on several criteria | table |

Several of these on one topic is an infographic page, not one diagram: plan it as a page.

## Line chart: "how it changed", with real numbers

Use the `chart` element ([spec.md](spec.md)) and give it the numbers: it scales every point, so none is placed by hand. With real numbers, show ticks and a grid, mark the points (`"markers": true`) and draw straight segments (`"curve": false`), since a smooth curve between measurements suggests values nobody measured. Start the y axis at 0 unless the source's own chart doesn't. With y ticks, each series is named at its last point.

```json
[
  { "type": "chart", "id": "users", "x": 0, "y": 0, "width": 900, "height": 420, "xAxis": { "label": "week", "min": 1, "max": 8, "ticks": [1, 2, 3, 4, 5, 6, 7, 8]}, "yAxis": { "label": "active users (thousands)", "min": 0, "max": 12, "ticks": [0, 4, 8, 12]}, "grid": true, "markers": true, "curve": false, "series": [{ "label": "web", "color": "blue", "points": [[1, 3], [2, 3.5], [3, 4.2], [4, 5], [5, 5.4], [6, 6.8], [7, 7.5], [8, 8.1]]}, { "label": "mobile", "color": "orange", "points": [[1, 1], [2, 1.6], [3, 2.9], [4, 4.4], [5, 6], [6, 7.9], [7, 9.6], [8, 11.2]]}]}
]
```

## Trend sketch: "this one rose while that one fell"

The same element without ticks: a shape, not measurements. Curves are on by default and each series is named at its first point, as in a hand-drawn chart. Use it only for the user's own sketch or a trend the source describes in words, and say on the page when the shape is illustrative.

```json
[
  { "type": "chart", "id": "trend", "x": 0, "y": 0, "width": 900, "height": 420, "xAxis": { "label": "Time", "min": 0, "max": 10}, "yAxis": { "label": "Cost", "min": 0, "max": 10}, "series": [{ "label": "Old way", "color": "gray", "points": [[0, 2], [3, 3], [6, 5.5], [8, 7.8], [10, 9.5]]}, { "label": "New way", "color": "green", "points": [[0, 6], [2, 5.6], [4, 4.2], [7, 3.4], [10, 3]]}]}
]
```

## Bar chart: "how much faster / cheaper"

`"kind": "bar"` draws one hatched bar per item, scaled to the largest value (or `max`), with its value at the end. `display` shows a value differently from how it is scaled, such as `"27.5 min"`. Keep the source's numbers as they are.

```json
[
  { "type": "chart", "kind": "bar", "id": "speed", "x": 0, "y": 0, "width": 700, "unit": "minutes per task", "bars": [{ "label": "New way", "value": 12, "color": "blue" }, { "label": "Old way", "value": 27.5, "color": "gray" }]}
]
```

## Flowchart: "steps, a decision, a retry"

Boxes joined by `start`/`end` arrows, a diamond for the decision, and each branch named by a short text beside its arrow (an arrow's own `label` has the line drawn through it in the PNG). A loop back is an arrow with `points` that bends under the row and ends on the box it returns to; dash it when it's the exception.

```json
[
  { "type": "rectangle", "id": "in", "x": 0, "y": 40, "width": 170, "height": 64, "color": "white", "label": "Order in" },
  { "type": "rectangle", "id": "check", "x": 250, "y": 40, "width": 190, "height": 64, "color": "blue", "label": "Check stock" },
  { "type": "diamond", "id": "ok", "x": 520, "y": 12, "width": 200, "height": 120, "color": "yellow", "label": "In stock?" },
  { "type": "rectangle", "id": "ship", "x": 880, "y": 40, "width": 170, "height": 64, "color": "green", "label": "Ship it" },
  { "type": "rectangle", "id": "wait", "x": 520, "y": 250, "width": 200, "height": 64, "color": "orange", "label": "Back-order" },
  { "type": "arrow", "start": "in", "end": "check" },
  { "type": "arrow", "start": "check", "end": "ok" },
  { "type": "arrow", "start": "ok", "end": "ship" },
  { "type": "text", "x": 780, "y": 44, "fontSize": 16, "color": "#495057", "text": "yes" },
  { "type": "arrow", "start": "ok", "end": "wait" },
  { "type": "text", "x": 634, "y": 168, "fontSize": 16, "color": "#495057", "text": "no" },
  { "type": "arrow", "x": 512, "y": 282, "points": [[0, 0], [-167, 0], [-167, -170]], "strokeStyle": "dashed", "color": "blue" },
  { "type": "text", "x": 360, "y": 292, "fontSize": 16, "color": "blue", "text": "try again tomorrow" }
]
```

## Boundary: "what lives inside what"

A large tinted rectangle drawn first, its name as a text in its top-left corner, and the parts inside it. A person or system outside it connects in; a note outside it says the point. A database is a cylinder: a rectangle and an ellipse sharing a `group`.

```json
[
  { "type": "person", "id": "user", "x": 20, "y": 90, "label": "user" },
  { "type": "rectangle", "id": "backend", "x": 200, "y": 0, "width": 640, "height": 320, "color": "blue", "backgroundColor": "#f1f8ff" },
  { "type": "text", "x": 222, "y": 16, "fontSize": 20, "color": "blue", "text": "Backend" },
  { "type": "rectangle", "id": "api", "x": 250, "y": 90, "width": 180, "height": 64, "color": "white", "label": "API" },
  { "type": "rectangle", "id": "svc", "x": 560, "y": 90, "width": 220, "height": 64, "color": "purple", "label": "Model service" },
  { "type": "rectangle", "id": "db", "x": 595, "y": 224, "width": 150, "height": 66, "color": "cyan", "label": "Database", "group": "db" },
  { "type": "ellipse", "id": "dbtop", "x": 595, "y": 212, "width": 150, "height": 26, "color": "cyan", "group": "db" },
  { "type": "rectangle", "id": "note", "x": 930, "y": 80, "width": 300, "height": 84, "color": "yellow", "sharp": true, "label": { "text": "Only the API is reachable from outside.", "align": "left" }},
  { "type": "arrow", "start": "user", "end": "api" },
  { "type": "arrow", "start": "api", "end": "svc" },
  { "type": "arrow", "start": "svc", "end": "db" },
  { "type": "arrow", "start": "svc", "end": "note", "strokeStyle": "dashed", "color": "#868e96" }
]
```

## Sequence: "who sends what, in what order"

Actors in boxes along the top, a dashed lifeline under each, and a narrow bar on a lifeline while that actor is busy. Messages are straight arrows with `points`, solid for a call and dashed for its reply, with the message as a centred text above. Time runs down: leave about 60 px between messages. Turn the wobble off (`"roughness": 0`) on bars and messages so their order reads exactly. To show waiting, use a hatched bar (`"fillStyle": "hachure"`) and a legend.

```json
[
  { "type": "rectangle", "id": "hb", "x": 0, "y": 0, "width": 160, "height": 50, "color": "white", "label": "Browser" },
  { "type": "rectangle", "id": "hs", "x": 400, "y": 0, "width": 160, "height": 50, "color": "blue", "backgroundColor": "#e7f5ff", "label": "Server" },
  { "type": "rectangle", "id": "hd", "x": 800, "y": 0, "width": 160, "height": 50, "color": "cyan", "backgroundColor": "#e3fafc", "label": "Database" },
  { "type": "line", "x": 80, "y": 58, "points": [[0, 0], [0, 390]], "strokeColor": "#74c0fc", "strokeStyle": "dashed", "strokeWidth": 1},
  { "type": "line", "x": 480, "y": 58, "points": [[0, 0], [0, 390]], "strokeColor": "#74c0fc", "strokeStyle": "dashed", "strokeWidth": 1},
  { "type": "line", "x": 880, "y": 58, "points": [[0, 0], [0, 390]], "strokeColor": "#74c0fc", "strokeStyle": "dashed", "strokeWidth": 1},
  { "type": "rectangle", "id": "sbar", "x": 472, "y": 110, "width": 16, "height": 270, "color": "blue", "backgroundColor": "#1971c2", "sharp": true, "roughness": 0},
  { "type": "rectangle", "id": "dbar", "x": 872, "y": 170, "width": 16, "height": 70, "color": "cyan", "backgroundColor": "#0c8599", "sharp": true, "roughness": 0},
  { "type": "arrow", "x": 90, "y": 110, "points": [[0, 0], [382, 0]], "roughness": 0},
  { "type": "text", "x": 281, "y": 82, "align": "center", "text": "GET /order" },
  { "type": "arrow", "x": 488, "y": 170, "points": [[0, 0], [384, 0]], "roughness": 0},
  { "type": "text", "x": 680, "y": 142, "align": "center", "text": "query" },
  { "type": "arrow", "x": 872, "y": 240, "points": [[0, 0], [-384, 0]], "roughness": 0, "strokeStyle": "dashed" },
  { "type": "text", "x": 680, "y": 212, "align": "center", "text": "rows" },
  { "type": "text", "x": 500, "y": 288, "fontSize": 16, "color": "#495057", "text": "builds the page" },
  { "type": "arrow", "x": 472, "y": 380, "points": [[0, 0], [-382, 0]], "roughness": 0, "strokeStyle": "dashed" },
  { "type": "text", "x": 281, "y": 352, "align": "center", "text": "200 OK" }
]
```

## Timeline: "when"

An arrow along the bottom of time, a dot per event, and the date and a few words above or below it, alternating so neighbours don't collide. Filled dots for what has happened, an orange one for now, an empty one for what is planned.

```json
[
  { "type": "arrow", "x": 0, "y": 86, "points": [[0, 0], [1200, 0]], "color": "#868e96" },
  { "type": "ellipse", "id": "m0", "x": 131, "y": 77, "width": 18, "height": 18, "color": "green", "backgroundColor": "#2f9e44" },
  { "type": "text", "x": 140, "y": 4, "fontSize": 19, "align": "center", "text": "Jan" },
  { "type": "text", "x": 140, "y": 30, "fontSize": 16, "align": "center", "color": "#495057", "text": "research" },
  { "type": "ellipse", "id": "m1", "x": 431, "y": 77, "width": 18, "height": 18, "color": "green", "backgroundColor": "#2f9e44" },
  { "type": "text", "x": 440, "y": 108, "fontSize": 19, "align": "center", "text": "Mar" },
  { "type": "text", "x": 440, "y": 134, "fontSize": 16, "align": "center", "color": "#495057", "text": "first prototype" },
  { "type": "ellipse", "id": "m2", "x": 731, "y": 77, "width": 18, "height": 18, "color": "orange", "backgroundColor": "#e8590c" },
  { "type": "text", "x": 740, "y": 4, "fontSize": 19, "align": "center", "text": "Jun" },
  { "type": "text", "x": 740, "y": 30, "fontSize": 16, "align": "center", "color": "#495057", "text": "beta, now" },
  { "type": "ellipse", "id": "m3", "x": 1031, "y": 77, "width": 18, "height": 18, "color": "gray", "backgroundColor": "#ffffff" },
  { "type": "text", "x": 1040, "y": 108, "fontSize": 19, "align": "center", "text": "Sep" },
  { "type": "text", "x": 1040, "y": 134, "fontSize": 16, "align": "center", "color": "#495057", "text": "launch" }
]
```

## Quadrant: "sorted on two scales"

Two crossing arrows, the scale's ends named in words (not numbers), each quadrant's name in its corner in the color of its meaning, and items as dots with a short label. Place items by the source's judgement; the positions are not measurements.

```json
[
  { "type": "arrow", "x": 300, "y": 440, "points": [[0, 0], [0, -400]], "color": "#495057" },
  { "type": "arrow", "x": 120, "y": 240, "points": [[0, 0], [360, 0]], "color": "#495057" },
  { "type": "text", "x": 300, "y": 6, "align": "center", "text": "more impact" },
  { "type": "text", "x": 0, "y": 228, "text": "less effort" },
  { "type": "text", "x": 492, "y": 228, "text": "more effort" },
  { "type": "text", "x": 140, "y": 60, "fontSize": 20, "color": "green", "text": "quick wins" },
  { "type": "text", "x": 330, "y": 60, "fontSize": 20, "color": "blue", "text": "big bets" },
  { "type": "text", "x": 140, "y": 400, "fontSize": 20, "color": "#868e96", "text": "fill-ins" },
  { "type": "text", "x": 330, "y": 400, "fontSize": 20, "color": "red", "text": "money pits" },
  { "type": "ellipse", "x": 190, "y": 130, "width": 14, "height": 14, "color": "green", "backgroundColor": "#2f9e44" },
  { "type": "text", "x": 212, "y": 126, "fontSize": 16, "text": "dark mode" },
  { "type": "ellipse", "x": 400, "y": 150, "width": 14, "height": 14, "color": "blue", "backgroundColor": "#1971c2" },
  { "type": "text", "x": 422, "y": 146, "fontSize": 16, "text": "new app" },
  { "type": "ellipse", "x": 410, "y": 330, "width": 14, "height": 14, "color": "red", "backgroundColor": "#e03131" },
  { "type": "text", "x": 432, "y": 326, "fontSize": 16, "text": "rewrite" }
]
```

## Cycle: "it repeats"

Ellipses around a circle, joined by curved arrows (`"curve": true` with three points: start, a point pushed outward, end). Start and end each arrow just off the shapes' edges. The cadence or the cycle's name goes in the middle.

```json
[
  { "type": "ellipse", "id": "plan", "x": 320, "y": 0, "width": 160, "height": 64, "color": "blue", "label": "Plan" },
  { "type": "ellipse", "id": "build", "x": 580, "y": 168, "width": 160, "height": 64, "color": "purple", "label": "Build" },
  { "type": "ellipse", "id": "ship", "x": 320, "y": 336, "width": 160, "height": 64, "color": "green", "label": "Ship" },
  { "type": "ellipse", "id": "learn", "x": 60, "y": 168, "width": 160, "height": 64, "color": "orange", "label": "Learn" },
  { "type": "arrow", "curve": true, "x": 472, "y": 44, "points": [[0, 0], [118, 22], [180, 116]]},
  { "type": "arrow", "curve": true, "x": 652, "y": 240, "points": [[0, 0], [-52, 96], [-172, 116]]},
  { "type": "arrow", "curve": true, "x": 328, "y": 356, "points": [[0, 0], [-118, -22], [-180, -116]]},
  { "type": "arrow", "curve": true, "x": 148, "y": 160, "points": [[0, 0], [52, -96], [172, -116]]},
  { "type": "text", "x": 400, "y": 188, "align": "center", "color": "#495057", "text": "every two weeks" }
]
```

## Tree: "the parts of a whole"

The root on top, children in a row under it. Draw the branches as a short stem, a horizontal bar across the children, and short arrows down: arrows routed straight from the root to each child cross each other. A child with no children of its own simply has none.

```json
[
  { "type": "rectangle", "id": "root", "x": 520, "y": 0, "width": 200, "height": 56, "color": "blue", "label": "Product" },
  { "type": "rectangle", "id": "web", "x": 120, "y": 130, "width": 200, "height": 56, "color": "white", "label": "Web" },
  { "type": "rectangle", "id": "mob", "x": 520, "y": 130, "width": 200, "height": 56, "color": "white", "label": "Mobile" },
  { "type": "rectangle", "id": "api", "x": 920, "y": 130, "width": 200, "height": 56, "color": "white", "label": "API" },
  { "type": "rectangle", "id": "w1", "x": 0, "y": 260, "width": 180, "height": 52, "color": "gray", "label": "Checkout" },
  { "type": "rectangle", "id": "w2", "x": 220, "y": 260, "width": 180, "height": 52, "color": "gray", "label": "Search" },
  { "type": "rectangle", "id": "a1", "x": 840, "y": 260, "width": 180, "height": 52, "color": "gray", "label": "Public" },
  { "type": "rectangle", "id": "a2", "x": 1060, "y": 260, "width": 180, "height": 52, "color": "gray", "label": "Internal" },
  { "type": "line", "x": 620, "y": 56, "points": [[0, 0], [0, 37]]},
  { "type": "line", "x": 220, "y": 93, "points": [[0, 0], [800, 0]]},
  { "type": "arrow", "x": 220, "y": 93, "points": [[0, 0], [0, 31]]},
  { "type": "arrow", "x": 620, "y": 93, "points": [[0, 0], [0, 31]]},
  { "type": "arrow", "x": 1020, "y": 93, "points": [[0, 0], [0, 31]]},
  { "type": "line", "x": 220, "y": 186, "points": [[0, 0], [0, 37]]},
  { "type": "line", "x": 90, "y": 223, "points": [[0, 0], [220, 0]]},
  { "type": "arrow", "x": 90, "y": 223, "points": [[0, 0], [0, 31]]},
  { "type": "arrow", "x": 310, "y": 223, "points": [[0, 0], [0, 31]]},
  { "type": "line", "x": 1020, "y": 186, "points": [[0, 0], [0, 37]]},
  { "type": "line", "x": 930, "y": 223, "points": [[0, 0], [220, 0]]},
  { "type": "arrow", "x": 930, "y": 223, "points": [[0, 0], [0, 31]]},
  { "type": "arrow", "x": 1150, "y": 223, "points": [[0, 0], [0, 31]]}
]
```

## Table: "options compared on several criteria"

Sharp rectangles edge to edge: a colored header row, a left column of criteria with left-aligned labels, and cells holding a drawn tick, a drawn cross or a word or two. Ticks and crosses are lines, since Excalifont has no check marks.

```json
[
  { "type": "rectangle", "id": "h0", "x": 0, "y": 0, "width": 300, "height": 52, "color": "gray", "sharp": true},
  { "type": "rectangle", "id": "h300", "x": 300, "y": 0, "width": 220, "height": 52, "color": "blue", "sharp": true, "label": "Option A" },
  { "type": "rectangle", "id": "h520", "x": 520, "y": 0, "width": 220, "height": 52, "color": "purple", "sharp": true, "label": "Option B" },
  { "type": "rectangle", "id": "r0", "x": 0, "y": 52, "width": 300, "height": 52, "color": "white", "sharp": true, "label": { "text": "Answers right away", "align": "left" }},
  { "type": "rectangle", "id": "a0", "x": 300, "y": 52, "width": 220, "height": 52, "color": "white", "sharp": true},
  { "type": "rectangle", "id": "b0", "x": 520, "y": 52, "width": 220, "height": 52, "color": "white", "sharp": true},
  { "type": "rectangle", "id": "r1", "x": 0, "y": 104, "width": 300, "height": 52, "color": "white", "sharp": true, "label": { "text": "Handles long work", "align": "left" }},
  { "type": "rectangle", "id": "a1", "x": 300, "y": 104, "width": 220, "height": 52, "color": "white", "sharp": true},
  { "type": "rectangle", "id": "b1", "x": 520, "y": 104, "width": 220, "height": 52, "color": "white", "sharp": true},
  { "type": "rectangle", "id": "r2", "x": 0, "y": 156, "width": 300, "height": 52, "color": "white", "sharp": true, "label": { "text": "Extra setup", "align": "left" }},
  { "type": "rectangle", "id": "a2", "x": 300, "y": 156, "width": 220, "height": 52, "color": "white", "sharp": true},
  { "type": "rectangle", "id": "b2", "x": 520, "y": 156, "width": 220, "height": 52, "color": "white", "sharp": true},
  { "type": "line", "x": 395, "y": 78, "points": [[0, 0], [10, 12], [30, -10]], "color": "green", "strokeWidth": 3},
  { "type": "line", "x": 620, "y": 68, "points": [[0, 0], [20, 20]], "color": "red", "strokeWidth": 3, "group": "x63052" },
  { "type": "line", "x": 640, "y": 68, "points": [[0, 0], [-20, 20]], "color": "red", "strokeWidth": 3, "group": "x63052" },
  { "type": "line", "x": 400, "y": 120, "points": [[0, 0], [20, 20]], "color": "red", "strokeWidth": 3, "group": "x410104" },
  { "type": "line", "x": 420, "y": 120, "points": [[0, 0], [-20, 20]], "color": "red", "strokeWidth": 3, "group": "x410104" },
  { "type": "line", "x": 615, "y": 130, "points": [[0, 0], [10, 12], [30, -10]], "color": "green", "strokeWidth": 3},
  { "type": "text", "x": 410, "y": 170, "align": "center", "text": "none" },
  { "type": "text", "x": 630, "y": 170, "align": "center", "text": "a job queue" }
]
```
