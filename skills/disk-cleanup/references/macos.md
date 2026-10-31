# Where space goes on a Mac, and the traps

## Where to look

The scan covers three levels of the home folder. For a closer look:

| Place | What collects there |
|---|---|
| `~/.local/state`, `~/.local/share` | Tools' working copies and backups, the likeliest place for forgotten gigabytes |
| `~/Library/Application Support` | App data, including apps no longer installed, and backups named after them |
| `~/Library/Caches`, `~/.cache` | Caches, downloaded browsers, models |
| `~/Library/Containers` | Sandboxed apps' data; Docker's virtual disk lives here |
| Folders named like `backup`, `backups_<date>`, `<name>.backup-<date>`, `pre-<version>` | One-off backups nobody came back to |
| Tool version folders | Playwright, Puppeteer, editor extensions, runtimes: several versions side by side |
| `$TMPDIR`, `/private/tmp` | Temporary files; only those not touched for days |
| `~/Library/Mobile Documents` | iCloud Drive files stored on this Mac as well as in iCloud |
| `~/Downloads` | Installers already installed (`.dmg`): mention them, they're the owner's files |

## Clearing with the tool's own command

A command removes all it says below, not just what you listed, so describe that much in the report (SKILL.md, sections 5 and 6).

| Tool | Command | What it removes, and notes |
|---|---|---|
| Homebrew | `brew cleanup --prune=all` | Every old version of every formula and all cached downloads. `brew cleanup <formula>` for one. |
| uv | `uv cache clean` | The whole cache. `uv cache clean <package>` for one. |
| npm | `npm cache clean --force` | The whole package cache. Leaves `~/.npm/_npx`, which is often the bigger part. Delete that only when no process runs from it (`ps -axo command \| grep '/.npm/_npx/'`): MCP servers often do. |
| pnpm | `pnpm store prune` | Frees only packages no project uses. What stays is hard-linked into projects, so deleting the store frees little. |
| Bun | `bun pm cache rm` | Refuses to work outside a project. Run it from one, or remove `~/.bun/install/cache`, which is purely a cache. |
| Cargo | Remove `~/.cargo/registry/cache` and `~/.cargo/registry/src` | Keep the index. |
| Ollama | `ollama rm <model>` | Never delete from `~/.ollama/models/blobs`: blobs are shared between models. |
| Docker | `docker image prune`, `docker builder prune` | Unused images, and the build cache. `docker system prune` also removes every stopped container and unused network, so a stopped container's data goes too: use it only when the owner chose that. All need Docker running. The virtual disk may not shrink by itself afterwards. Never delete `Docker.raw`: it holds every image and container. |
| Hugging Face | Remove `~/.cache/huggingface/hub/models--<org>--<name>` | Each model is its own folder. An app may load from here: check first. |

## Editor extensions

VS Code, Cursor and their forks keep old versions beside the new. Each extensions folder has an `extensions.json` listing what's in use: remove only folders it doesn't list, and only for an extension with a listed version. Don't work out "newest" from the version numbers.

## Traps

- **"Operation not permitted" is not empty.** macOS privacy controls hide folders such as `~/.Trash`, and `du` carries on past them. Report what it couldn't read.
- **`du` shows 0 for iCloud files that aren't downloaded,** and a folder can look almost empty on this Mac while holding gigabytes in iCloud. Removing an iCloud folder removes it from iCloud too, so look at what's in it, not its local size.
- **New iCloud files stay downloaded.** "Remove Download" in Finder (`brctl evict <path>`) frees this Mac and keeps the file in iCloud. It isn't deletion.
- **Hard links and clones:** the same data can show up under several paths, as in pnpm projects. Measure what a deletion freed with `df -k ~` before and after, not by adding up `du`.
- **`df` moves by itself:** macOS and running apps use and release space while you work, and iCloud frees purgeable space, so small differences mean nothing.
- **zsh aborts the whole command when any pattern matches nothing:** `rm -f a b*` then deletes nothing, not even `a`. Expect it, or pass exact paths.
- **Temp folders hold macOS's own service folders** (`com.apple.*`, `TemporaryItems`). Filter by your own items and by age, and don't delete those.
- **An app folder can be in use with no window open:** menu bar apps and background agents count. Look at processes, not at what's on screen.
- **A LaunchAgent pointing at a removed app** keeps failing quietly. Unload it (`launchctl bootout gui/$(id -u)/<label>`) before removing its plist.
- **A build folder can be running:** a local app or MCP server may start from a project's `dist` or `target` folder, and the file a LaunchAgent starts may be inside a project. Check before clearing.
