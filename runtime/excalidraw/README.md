# Excalidraw runtime

Pinned [mcp-excalidraw-server](https://github.com/yctimlin/mcp_excalidraw) for `skills/sketch-infographic`. It needs Node 20 or newer. The skill's build script imports the package's offline renderer directly: `dist/core/render/index.js`, `dist/core/render/excalidraw-node/index.js` and `dist/core/render/text-metrics.js`. These are internal modules, not a published API, so check them when bumping the version (README, "Bumping a pinned runtime").

`scripts/bootstrap` installs it with `npm ci --ignore-scripts`; `scripts/doctor` checks the installed version against `package.json` and warns when npm has a newer release.
