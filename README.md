# Agent Skills

Canonical, version-controlled source for personal agent skills and the adapters that install them into supported hosts.

The repository owns skill behavior, host mappings, dependency pins, and verification. Paths under `~/.config/opencode`, `~/.factory`, `~/.agents`, `~/.codex`, `~/.claude/skills`, `~/.antigravity`, and `~/.gemini` are generated installation targets.

## New-machine setup

Clone the repository at any path, then run:

```bash
./scripts/bootstrap --all
./scripts/doctor --all
```

The scripts resolve the repository root relative to themselves. They do not depend on a username or a fixed `~/Developer` location.

With the owner's two private repositories ([Private state](#private-state), [Private skills and
other people's skills](#private-skills-and-other-peoples-skills)), clone all three side by side, sync
them, and let bootstrap take over the instruction files the computer already has:

```bash
cd ~/Developer
git clone https://github.com/<owner>/agent-skills.git
git clone <the private repository> agent-skills-private
git clone <the state repository> agent-skills-state
./agent-skills/scripts/sync                                  # pull all three, then bootstrap
./agent-skills/scripts/bootstrap --all --adopt-instructions  # build the instruction files, keeping the old ones as backups
./agent-skills/scripts/doctor --all
```

Run `./scripts/sync` again whenever another computer may have pushed: it is how a computer catches up.

Install one host only:

```bash
./scripts/bootstrap --host claude
./scripts/bootstrap --host codex
```

Preview changes without writing:

```bash
./scripts/bootstrap --all --dry-run
```

Bootstrap is idempotent. It repairs managed symlinks but refuses to overwrite real files or directories it does not own.

### Computers with different hosts

When the computers don't all have the same agent tools, an `install/computers.tsv` (kept in the
private repository, since computer names are private) says which hosts each one has: one row per
computer, its name, then its hosts separated by spaces, as `install/hosts.tsv` names them.

```text
studio-mac	opencode factory antigravity antigravity-cli codex claude gemini
travel-mac	opencode antigravity codex claude gemini
```

A computer is named by `scutil --get LocalHostName` on macOS (`hostname -s` when that gives no
name) and `hostname -s` elsewhere; `AGENT_SKILLS_COMPUTER` overrides it. A computer with no row, or
no table at all, has every host; doctor warns when there is a table but no row for this computer,
as after a rename.
For a host its computer leaves out, bootstrap installs nothing and removes the links an earlier
bootstrap made there, as safely as a retired link: only a link to exactly what this checkout
installed, never a real file or someone else's link. Doctor skips that host's checks and says in one
line which hosts it left out, and `--host` naming one of them stops with the reason.

An `external` row in a `links.tsv` may end with the computers it is on, separated by spaces, for a
tool installed on some computers only. Doctor expects that skill only there; an empty column means
every computer. A computer named there needs a row in the table, so a misspelt name is refused.
`./scripts/manifest computer` prints this computer's name, `hosts` and `left-out` the hosts it has
and leaves out, `away` the links of the hosts it leaves out, `computers` the computers the table
names, `unhosted` the hosts no row names (doctor warns about those), and `instructions` the
instruction files this computer has ([Instruction files](#instruction-files)).

### Instruction files

A host's global instructions (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`,
`~/.config/opencode/AGENTS.md`) can be built by bootstrap, so that their text is kept once and every
computer gets the same rules. The text lives in the private repository, as sections in
`instructions/sections/<name>.md`, and an `install/instructions.tsv` there has one row per file to
build: the computer (as `computers.tsv` names it), the host, the file, and its sections in order.

```text
studio-mac	claude	~/.claude/CLAUDE.md	title long-responses computer-use-studio voice
travel-mac	claude	~/.claude/CLAUDE.md	title long-responses computer-use-travel
```

Bootstrap joins the sections with a blank line between two of them and writes a real file, not a
link, whose first line is a marker: an HTML comment saying it is generated, where to edit it, and the
checksum of the rest of the file. Text that is the same everywhere is one section; text that differs
by host or computer, such as the tools a Mac has for computer use, is a section of its own. Edit a
section and run bootstrap, never the built file: bootstrap rebuilds it whenever it no longer matches
its sections. A built file changed in place (by hand, or by an agent writing to it) is kept first as
a backup beside it (`CLAUDE.md.changed-<date>-<time>`, named in the output), and doctor fails on it
until the change is moved into a section. The marker names the private repository by its folder's
name, so a clone under another name counts each built file as changed once, and bootstrap keeps one
backup of each. A rebuilt file keeps the permissions of the one it replaces.

A file already at a target without the marker is the owner's own. Bootstrap leaves it as it is and
says `NOT ADOPTED` with the command that adopts it, and doctor warns about it without failing.
`./scripts/bootstrap --adopt-instructions` takes such files over, keeping each first as a backup
beside it (`CLAUDE.md.before-agent-skills-<date>-<time>`, named in its output; a link stays a link).
Doctor fails while a built file is missing or out of date. Uninstall removes only built files nobody
changed, and names the backup from before the adoption, to rename back. With no table, or no row for
this computer, nothing is built and nothing is reported. A row taken out of the table leaves its
built file where it is: remove it by hand. `./scripts/manifest instructions` prints this computer's
rows, each section as its path; it refuses a row with a section that has no file, a host the
computer leaves out, a target written with a `..` step, or one file named twice for a computer.

### Keeping computers in step

`./scripts/sync` brings the three repositories up to date. For each one on its default branch with no
uncommitted change to a tracked file, it runs `git pull --ff-only`; one off its default branch or
with a change is skipped, with the reason and the command to fix it. For each it reports the commits
of its default branch that are not on `origin` as of the last fetch, and it never pushes: push those
yourself, so the other computers get them. When its standard input is not a terminal (a schedule, an
agent), git fails rather than asks for a password: no prompt, and ssh in batch mode (added to the
repository's own ssh command; a `GIT_SSH_COMMAND` you set is left alone). Then it runs
`bootstrap --all` (pass `--skip-dependencies` to leave the runtimes alone). A pull that cannot
fast-forward fails sync after bootstrap has run.

Doctor warns, without using the network, when a repository's default branch is ahead of or behind
`origin` as of the last fetch, with the count and the command to run.

### Private state

Skills keep per-owner facts, such as the orchestrator's provider profile, in
`${XDG_STATE_HOME:-~/.local/state}/agent-skills/<skill>/`, outside this public
repository. To carry them between computers, keep them in a private git
repository cloned next to this one as `agent-skills-state` (or set
`AGENT_SKILLS_STATE` to its path). Bootstrap links each `<skill>/<file>` in it
into the state folder, and doctor checks the links. Without that repository,
the files simply stay local.

### Private skills and other people's skills

Skills that are not for sharing, and other people's skills taken into use, belong in a second
private repository with this one's shape, cloned next to it as `agent-skills-private` (or set
`AGENT_SKILLS_PRIVATE` to its path; set it empty to leave it out). Bootstrap, doctor and uninstall
read its `install/` tables together with this repository's, so every host gets both:

| Its folder | Holds | Its `install/skills.tsv` mode |
|---|---|---|
| `skills/<skill>/` or `skills/<group>/<skill>/` | the owner's own unshared skills | `install` |
| `vendor/<group>/<skill>/` | someone else's skill, byte for byte as one upstream commit has it, grouped by upstream repository with its licence | `vendor` |

A skill in a group is named `group/skill` in the tables; hosts see it by its own name, so two groups
cannot both hold a skill of the same name.

Its `install/links.tsv` may also list `external` rows: a skill that a tool installs and updates
itself (a CLI's own installer, or the host). Bootstrap never touches those; they are listed so doctor
knows them. The private repository may use this one's hosts but never claims a path this one
installs, and nothing of it is ever named here.

`scripts/vendor` keeps the `vendor/` copies, recorded in `vendor/sources.tsv` with their repository,
commit, git's hash of the folder and licence, and copies each upstream licence into its group:

```bash
./scripts/vendor add <skill> <repository URL> <path in it> --license <SPDX>   # pin upstream HEAD, or --ref; into vendor/<owner>-<repository>/, or --group
./scripts/vendor status            # each copy still matches its pin; what upstream changed since
./scripts/vendor update <skill>    # or --all: move the pin; read the diff, then commit it there
```

Nothing is committed for you: a newer upstream version reaches the agents only after its diff is read
and committed. Doctor fails while a copy differs from its pinned commit, which also catches an
installer writing through a link.

## Repository layout

```text
agent-skills/
├── skills/                 Canonical host-neutral skills
├── adapters/               Host-specific commands or metadata
├── install/                Which hosts get each skill, and where each host looks for skills
├── docs/                   Versioning rules; each skill's changelog, flow and evidence
├── runtime/                Pinned shared tool dependencies
├── scripts/                Bootstrap, doctor, uninstall, sync, the manifest, instruction files, vendored skills, upstream checks
└── tests/                  Disposable-home integration tests
```

## Where skills are installed

The tables in `install/` say what is linked where; `scripts/bootstrap`, `scripts/doctor` and `scripts/uninstall` all act on them.

| Table | One row per | Columns |
|---|---|---|
| `install/skills.tsv` | skill | `install` or `retired`, the skill's folder name, the hosts that get it |
| `install/hosts.tsv` | folder a host reads skills from | host, its name in the table below, `link`, `adapter` or `retired`, the folder |
| `install/links.tsv` | link that is not a skill's folder, such as a host's command file | host, mode, source, target; for an `external` row, optionally the computers it is on |
| `install/computers.tsv` (optional) | computer | the computer's name, the hosts it has ([Computers with different hosts](#computers-with-different-hosts)) |
| `install/instructions.tsv` (optional) | instruction file on a computer | computer, host, the file, its sections in order ([Instruction files](#instruction-files)) |

To give a host a skill, add the host to the skill's row. To take a skill away, or after renaming or removing it, name it in a `retired` row: bootstrap then removes the links an earlier version installed. `./scripts/manifest` prints every link the tables declare, and refuses tables that contradict themselves.

Hosts read the checkout itself through these links, so the checked-out files are what every agent runs. Doctor fails while the checkout, or the private one, is off its default branch or a file a host reads has an uncommitted change. It warns about anything in a host's skills folder that no table names: put it in a table, as `external` if a tool installs it.

## Available skills

Each skill's version is in its `SKILL.md`; its changelog, and for some a flow diagram and the evidence behind it, are in `docs/skills/<skill>/`. `tests/install-manifest-test` keeps the "Installed into" column equal to what `install/` says.

| Skill | Installed into | Purpose |
|---|---|---|
| `long-horizon-task-planner` | Codex, Claude Code | Propose maturity-aware autonomous task portfolios with calibrated workloads and safe parallel plans. |
| `long-horizon-orchestrator` | Codex, Claude Code | Run approved long tasks as separate agents (T3 threads on any provider and on the owner's linked computers, or native subagents), get woken when they finish, route by capacity and strengths, merge reviewed work, and report in plain language with a run diagram. |
| `review-gate` | Codex, Claude Code | Have a finished change reviewed by agents of other model families before it merges, at a level set by what the diff touches, with every finding verified. See its [flow](docs/skills/review-gate/README.md). |
| `reviewer-benchmark` | Codex, Claude Code | Measure how well a model reviews code: run it over the owner's private set of past changes with known defects, score its reports blind, check every other finding against the code, and add the confirmed ones to the answer key. See its [flow](docs/skills/reviewer-benchmark/README.md). |
| `skill-evolution` | Codex, Claude Code | Turn what went wrong with a skill into at most three proposed changes, with their evidence, for the owner to apply or decline; the orchestrator calls it at a run's finish. See its [flow](docs/skills/skill-evolution/README.md). |
| `skill-evidence` | Codex, Claude Code | Keep each skill's evidence current: new top-tier work that bears on its rules, cited sources rechecked, edits on a branch for the owner to merge, and rule changes as skill-evolution proposals; a T3 scheduled task runs it. See its [flow](docs/skills/skill-evidence/README.md). |
| `disk-cleanup` | Codex, Claude Code | Find what is wasting disk space on a Mac with a read-only scan, prove it is unused, and clear only what the owner picks, remembering their decisions per computer so later rounds show what's new; a T3 scheduled task runs the report. |
| `excalidraw-drawing` | Codex, Claude Code | Draw in Excalidraw's hand-drawn style: a one-page infographic that explains one source, a single chart or diagram (line and bar charts from numbers, flowcharts, sequence diagrams, timelines and more), or a slide deck for a talk with speaker notes and click-by-click reveals, written as a browser deck, a PDF and a PowerPoint. A JSON spec, and a build that lays it out, checks it and writes a PNG and an editable `.excalidraw` file (in an Obsidian vault, the Excalidraw plugin's `.excalidraw.md`); a hand-edited drawing is changed in place and previewed. |
| `agent-ready-repo` | Codex | Audit agent readiness for new, existing, and maintained repositories; apply improvements when explicitly requested. |
| `remote-session-reporting` | Codex, Claude Code | Show results in chat (screenshots, pasted text, check summaries) while the user follows a session remotely. |
| `product-design` | OpenCode, Factory, Google Antigravity | Research, audit, ideate, prototype, visually QA, and share product experiences. See its [README](skills/product-design/README.md). |

## Maintenance

Edit canonical files under `skills/` and commit them here. Do not edit installed symlink targets.

Run the local checks before committing:

```bash
./tests/bootstrap-test
./tests/install-manifest-test
./tests/instructions-test
./tests/sync-test
./tests/vendor-test
./tests/skill-versions-test
./scripts/doctor --all
```

Every suite in `tests/` also runs on GitHub for each push to `main` and each pull request ([.github/workflows/tests.yml](.github/workflows/tests.yml)). Doctor does not: it checks this computer.

Each change to a skill raises its version and adds a changelog entry ([docs/VERSIONING.md](docs/VERSIONING.md)).

Remove managed links without touching unrelated files:

```bash
./scripts/uninstall --all
```

### Bumping a pinned runtime

`runtime/` pins each tool a skill runs to an exact version, in `runtime/<name>/package.json` and its lockfile, so a new upstream release can't change a skill's behavior unannounced. `scripts/doctor` reads each pin from that file, fails when the installed version differs, and warns, without failing, when npm has a newer release (`AGENT_SKILLS_NO_UPDATE_CHECK=1` skips asking npm, for example offline).

To bump one on purpose:

1. Read the package's changes between the two versions. For `mcp-excalidraw-server`, also check the internal modules the excalidraw-drawing build imports ([runtime/excalidraw/README.md](runtime/excalidraw/README.md)).
2. Update the pin and the lockfile together:

   ```bash
   npm install --prefix runtime/<name> --ignore-scripts --save-exact <package>@<version>
   ```

3. Run `./scripts/doctor --all` and the checks of the skills that use it: `./tests/excalidraw-drawing-test` for Excalidraw, a Product Design browser capture for Playwright.
4. Commit `package.json` and `package-lock.json` together. If a skill now behaves differently, raise its version too ([docs/VERSIONING.md](docs/VERSIONING.md)).
