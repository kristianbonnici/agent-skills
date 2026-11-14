# Excalidraw runtime

Pinned [mcp-excalidraw-server](https://github.com/yctimlin/mcp_excalidraw) for `skills/excalidraw-drawing`. It needs Node 20 or newer. The skill's build and drawing scripts (`scripts/build.mjs`, `scripts/drawing.mjs`) import the package's offline renderer directly: `dist/core/render/index.js`, `dist/core/render/excalidraw-node/index.js` and `dist/core/render/text-metrics.js`. These are internal modules, not a published API, so check them when bumping the version (README, "Bumping a pinned runtime").

`scripts/deck.mjs` also uses `pptxgenjs` (the PowerPoint), `jszip` (to add the click animations PowerPoint needs, which pptxgenjs can't write) and `pdf-lib` (the PDF). It writes PowerPoint's own markup for an entrance effect into each slide with steps, so check a deck still opens and plays in PowerPoint or Keynote when bumping `pptxgenjs`.

`scripts/bootstrap` installs it with `npm ci --ignore-scripts`; `scripts/doctor` checks the installed version against `package.json` and warns when npm has a newer release.
