# Setups, isolation and drivers

## Setup syntax

Pass comma-separated setups to `bench run`: `arm[:model[@effort]]`

| Arm | Default model / effort | Driver / transport | Harness isolation |
| --- | --- | --- | --- |
| `codex-native` | `gpt-6.1-terra@high` | Codex built-in computer use (`node_repl`) | TUI (`tui.py`), per-attempt temp cwd, `--sandbox read-only`, all other MCP servers disabled via `-c`, hooks skipped |
| `codex-cua` | `gpt-6.1-terra@high` | Bounded Cua Driver daemon | `codex exec --json`, `node_repl` and plugins off, `cua-driver` pointed at benchmark socket |
| `claude-native` | `claude-sonnet-5-5` | Claude Code built-in computer use | TUI (`tui.py`), `--setting-sources project`, `--tools ""`, `--strict-mcp-config`, Cua MCP off |
| `claude-cua` | `claude-sonnet-5-5` | Bounded Cua Driver daemon | TUI (`tui.py`), `--mcp-config` pointing solely at benchmark socket, built-in computer use off |
| `antigravity-cua` | `gemini-4-neon-high` | Bounded Cua Driver daemon | `agy -p` in `<cache>/agy-ws` plugin, `--settings` denies all discovered user servers, `command(*)`, `write_file(*)`, web tools |
| `opencode-cua` | `$CU_OPENCODE_MODEL` or `opencode/deepseek-v4.1-flash-free` | Bounded Cua Driver daemon | `opencode run`, `OPENCODE_CONFIG_CONTENT` enables only `cua` on benchmark socket, all edit/bash/web permissions denied |

Notes:
- OpenCode models carry their variant in the model name (`#high`), so `@effort` is rejected for `opencode-cua`.
- `agy` model names typically carry their level (`gemini-4-hydrogen-high`), and `@level` passes `--effort`.

## Isolation guarantees

- **Relative `CODEX_HOME`:** Resolved to an absolute path once at `bench` startup (`resolve_codex_home`) and passed explicitly via `env` to both `codex exec` and the Codex TUI, so changing working directories into `<cache>` or per-attempt temp folders never splits `config.toml` lookup from session rollout lookup.
- **Antigravity staging & config checks:** `agy_workspace` stages plugin JSON updates in `<cache>/.agy-staging` (outside `agy-ws`), cleans up failed/killed staging files automatically, refuses symlinks or hard links anywhere in `agy-ws` or `.agy-staging`, verifies `GEMINI_HOME` is unset or matches `~/.gemini`, scans all `~/.gemini` configs and `plugins.json` entries to build the explicit deny list, and rejects ancestor `.agents` folders that inject servers.
- **Cua Driver manifest verification:** `verify_manifest_file` parses `manifest.yaml`, checks `version == 3`, verifies `resources.apps` contains only `local.computer-use-benchmark.harbor-desk` with `desktop.display == false` and no desktop-wide tools (`list_apps`, `list_windows`, `get_desktop_state`, `kill_app`, `run_script`), computes `sha256("cua-driver-capability-manifest-v3\0" + bytes)`, and requires `cua-driver status --socket <sock>` to report `permission mode: bounded`, `configured=true, approved_at_startup=true, valid=true`, and that exact digest.

## TUI Python environment (`pyte`)

`claude-native`, `claude-cua`, and `codex-native` require an interactive PTY via `scripts/tui.py` and `pyte` (Python 3.11+):

```sh
python3 -m venv /path/to/scratch/venv
/path/to/scratch/venv/bin/pip install pyte
/path/to/scratch/venv/bin/python scripts/bench run ...
```

## Provider usage snapshots

Passing `--usage <script>` splits `<script>` with `shlex` and calls `<cmd> --only <provider>` before the batch starts and in a `finally` block when it ends (including `opencode_go`, warning on stderr if a snapshot fails), appending snapshots to `<out>/usage.jsonl`. Remember that concurrent tasks or sessions on the same account share those windows.
