# Excalidraw runtime

Pinned [mcp-excalidraw-server](https://github.com/yctimlin/mcp_excalidraw) for `skills/sketch-infographic`. Its build script imports the package's offline renderer directly (`dist/core/render`, `dist/core/render/excalidraw-node`, `dist/core/render/text-metrics.js`); these are internal modules, so check them when raising the version.

`scripts/bootstrap` installs it with `npm ci --ignore-scripts`; `scripts/doctor` checks the version.
