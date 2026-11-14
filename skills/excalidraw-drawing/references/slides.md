# Slides: a deck for a talk

A deck is a folder of `16:9` slide specs, one per point, each with speaker notes. `scripts/deck.mjs` builds them and writes a browser deck, a PDF and a PowerPoint. The drawing works as on a page; what changes is that the slides are spoken to, in order, so the story, the notes and the clicks matter as much as each picture.

## Plan the talk before any slide

Write the plan in your reply and get the user's go-ahead before drawing; a deck is too much work to redo for a wrong angle.

- **Length:** about one minute per content slide, and 120 to 150 spoken words a minute. A 20-minute talk is 18 to 25 content slides plus a few short ones (title, section maps, sources). Add up the notes' words to check.
- **The story in one line,** then its parts. A talk that argues something is a chain: each section exists because of the one before it. Open with one picture of the whole idea, end with one picture that sums it up, then something to do first and the sources.
- **Sections and a map:** for more than three sections, a map slide (the sections as cards, in order) before each one, with the current card highlighted and the others faded. It tells the room where they are.
- **One point per slide.** The title is that point as a short sentence on one line ("Most late orders start at the warehouse"), never a topic label ("Bugs"). If a slide needs two titles, it is two slides; if two neighbours say the same thing, drop one.
- **Per slide, write:** the title, the picture idea, the few words on it, the footer source, and the note. The note is what you say: the argument, the example, the caveat.

## Write each slide

- **Picture first, words second.** The picture carries the point; on-slide text is labels of a few words, about 25 words in all. The argument goes in the notes. A slide that needs a paragraph to be understood is a page, not a slide.
- **Evidence goes in the footer,** one or two short lines: what the figure is and where it comes from (author, title, date). It lends weight without competing with the picture. Every figure on a slide has a footer source and a line on the final sources slide.
- **Say it in your own words.** Build pictures and wording from what the source shows, not by copying its slides, phrases or layout; credit an idea you took ("the framing follows ...").
- **One visual language for the whole deck.** Pick three to five recurring symbols before drawing (for example: a person, a work item, a check passed, a check failed, a document) and draw each the same way on every slide, in the same colors (SKILL.md's color meanings). Write the deck's specs from one script with a helper per symbol, so a change of style is one edit; see "A generator" below.
- **Type a room can read:** on a 1500-wide slide, labels of 18 px or more and nothing under 16 px except the footer. A dense slide on a projector is unreadable from the back.
- **Examples must be real and familiar.** An example the audience knows, with a source for each step, beats a clever made-up one. If you invent an illustration, say so on the slide ("an illustration", "a made-up example").

## Numbers and charts

- **Draw numbers, don't list them:** a grid of 100 squares, a few bars, one big figure with a short label under it. One number per slide is best; three at most.
- **Nested numbers are one picture.** When one figure is part of another (60 of 100 orders shipped on time; 20 of those 60 also arrived undamaged), draw one grid and recolour the part, over two clicks, rather than three side-by-side grids that read as three separate results. Label the part as a part ("of those 60:").
- **A separate experiment looks separate:** behind a divider, labelled ("a separate test"), with its conditions in the footer (which models, how many).
- **State the base:** "per 100 tasks, averaged across models", the date range, whose data.
- **A chart redrawn from a source** (a bar chart in a blog post, a line chart in a report): read the points off it by eye, keep every figure the source states exactly, label those on the slide, and say in the footer that the rest is approximate ("Bars redrawn by eye from X's chart: heights are approximate; the labelled figures are X's"). Never present a redrawn chart as exact data.
- **Check what a chart measures** before using it: a forecast of how many people use something is not a measure of how much they do. Leave out a striking chart that doesn't support the point.

## Sources and facts

Check every figure against its primary source before it goes on a slide: the number, what it counts, the date, and who measured it. Prefer the paper or the company's own post to a summary of it; when only a secondary source is reachable, say so. Note dates that matter (when a model, a feature or a finding appeared), and re-read a source whose claim sounds too strong: an overbroad claim can turn a supporting slide into a contradiction. Opinions stay attributed ("X argues"); one company's figures about itself say so in the notes.

## Steps: what each click reveals

Give an element `"step": n` to make it appear on click `n`, from 1 to 12 without gaps (spec.md). Everything without one shows from the first click, an arrow joined to a later shape waits for it, and the footer comes with the last. `build.mjs --steps` writes one picture per click; `deck.mjs` does this for every slide.

- **A click must reveal a point.** Good uses: a sequence told in order (a cycle, a pipeline, a timeline), before then after, a whole then the part that matters (the nested numbers above), a build-up the speaker narrates (a pyramid from the bottom).
- **No clicks for:** a chart that makes one point, a single picture, map slides, the sources slide. Most slides need none; two or three clicks is plenty for one that does.
- **Each click's picture must read on its own:** no arrow pointing at something not shown yet, no heading floating without what it labels. Look at every step picture, not only the finished slide.
- **Nothing moves between clicks:** later parts are only hidden, so place everything for the finished slide first, then assign steps.

## A generator, for more than a handful of slides

Write the specs from one script instead of by hand: helpers for the recurring symbols and for common layouts (a section map, a stat callout, a grid of 100), one call per slide with its title, elements, footer and note, and file names that keep the order (`01-title`, `02-problem`; insert a slide later as `02b-...` so the others keep their names). Keep notes in each spec's `"notes"` or in the folder's `notes.json`. Then:

```bash
node scripts/deck.mjs <folder>
```

It builds every slide with its steps (warnings as for any build: fix them all), and writes `index.html`, `<folder>.pdf` and `<folder>.pptx` in the folder. It won't replace a file of those names it didn't write: give another `--name`, or `--force` when the user says to replace it. Change a slide in its spec, not in Excalidraw: a slide's drawing saved in an editor stops the deck, as it stops a build, so carry such an edit into the spec first.

## Check the whole deck before calling it ready

1. **Every picture,** finished slides and each step, as in SKILL.md step 3.
2. **The flow,** slide by slide in order: does each follow from the one before, does any repeat its neighbour, does each section's map come before it?
3. **The words:** one term for one thing across the deck; titles on one line; no word the audience may not know without a reason (prefer "look after" to "tend").
4. **The facts:** every figure against its source once more, as drawn.
5. **The time:** notes' words ÷ 130 is about the minutes; with pauses and the short slides, it should fit the slot.

Tell the user what you checked and what you couldn't (for example, the PowerPoint's animations can't be played here: ask them to click through it once).

## Deliver

- `index.html`: open it in a browser; arrows or swipe to move, N for notes, G for all slides, F for full screen, B to turn the steps off. Published as a web page it works the same.
- `<name>.pdf`: every slide finished, for a handout.
- `<name>.pptx`: for PowerPoint, with the notes in the presenter view and each step fading in on a click. Keynote opens it too, but may show each slide finished instead of playing the clicks. Its slides are pictures: to change one, change its spec and run `deck.mjs` again.
