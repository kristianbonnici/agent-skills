---
name: product-design
description: Explore, research, audit, prototype, clone, visually QA, and share product experiences. Use when the user explicitly invokes Product Design or asks for UX research, screenshot-grounded product critique, three visual design directions, faithful URL or screenshot implementation, prototype QA, or prototype sharing. Do not use for ordinary UI coding without a Product Design request.
metadata:
  version: 1.1.0
---

# Product Design

Act as a product-design partner. Route the request to one focused workflow, preserve visual evidence, and keep the user informed with short outcome-led updates.

## Start every run

1. Detect the host:
   - OpenCode: read `references/opencode.md`.
   - Factory Droid: read `references/factory.md`.
   - Google Antigravity, Antigravity IDE, or Antigravity CLI: read `references/antigravity.md`.
   - Another host: use the portable fallbacks in this skill and state missing capabilities.
2. Find this skill's own folder: the directory that holds this `SKILL.md`, as the host loaded it. Call it `SKILL_DIR`. Run every bundled script by absolute path from there (`"$SKILL_DIR/scripts/..."`), never by a path relative to the current directory: the shell usually sits in the user's project, where `scripts/` does not exist. Set `SKILL_DIR` again in each shell command, because most hosts do not keep shell variables between calls.
3. Run `python3 "$SKILL_DIR/scripts/manage_context.py" preflight` and use only saved context relevant to the request.
4. Follow local `AGENTS.md` and project conventions.
5. Identify the requested workflow from the router below and read its reference before acting.

## Router

- Setup, remember, or recall design sources: `references/user-context.md`.
- Current user pain or product friction research: `references/research.md`.
- Audit, critique, or accessibility review: `references/audit.md`.
- New design, redesign, alternatives, or a build without a selected visual target: `references/ideate.md`.
- Faithful clone of a live URL: `references/build.md`, URL route.
- Build from a selected screenshot, mockup, or generated image: `references/build.md`, image route.
- Compare a build with its visual source: `references/design-qa.md`.
- Publish or deploy a verified prototype: `references/share.md`.

For an audit followed by redesign or implementation, audit first. For a URL described as “like”, “better”, “redesign”, or “improve”, capture it as a reference and ideate; do not clone it.

## Non-negotiable gates

- Require a clear design target and intended user outcome before design work. Ask one targeted question only if either is missing. For ideation that one question may ask for every missing brief dimension at once (see `references/ideate.md`); do not ask a second round.
- Do not build a new interface without a selected visual target. Provide exactly three visual directions: when the host has an image-generation tool, generate the three images (a request for a new design or for directions covers this); otherwise write three complete image prompts and wait for the user to generate and attach them. Either way, wait for the user to select one before building.
- Capture and inspect a live URL before cloning, auditing, or using it as redesign evidence. Stop if it cannot be captured.
- In an existing app, inspect similar flows, tokens, components, and local instructions before editing. Preserve the existing design system unless the user requests a redesign.
- Never claim visual fidelity from code inspection alone. Compare the source and rendered implementation at the same viewport and state.
- Do not hand off a build until `design-qa.md` says exactly `final result: passed`.
- Do not deploy until the user has confirmed the deployment target and whether the result will be public or private (`references/share.md`).
- When walking a live product, use test data or a test environment. Never submit anything irreversible, or anything that reaches real people or money, unless the user says so for that specific step; stop before it and ask (`references/audit.md`, "Live flows and side effects").

## Browser and visual evidence

### Where evidence goes

Never write screenshots, snapshots, recordings, or notes into the user's repository or working directory unless the user asks. Once per run, create a run folder outside any repository and keep everything in it:

```bash
SKILL_DIR=/absolute/path/to/this/skill
RUN=$(python3 "$SKILL_DIR/scripts/manage_context.py" run-dir <short-product-or-flow-name>)
```

That makes `${XDG_STATE_HOME:-~/.local/state}/agent-skills/product-design/runs/<date>-<name>/` (a new folder every time; an existing one is never reused). Save screenshots there by absolute path and name them in order (`01-start.png`). The browser CLI also writes its own `.playwright-cli/` snapshot files into the current directory, so run browser commands from inside the run folder (below). Never overwrite an existing file without asking the user.

### Browser

Use the isolated browser wrapper unless the user chooses another browser. Its sessions are in memory only: no saved logins, cookies, or profile.

Shell variables may not last from one command to the next: note the skill folder's and the run folder's paths when you have them, write both out in every browser command, and start it by changing into the run folder, joined with `&&` so nothing runs if that fails. The wrapper refuses to run inside a git repository.

```bash
cd "<run folder>" && "<skill folder>/scripts/browser" open <url> --headed
cd "<run folder>" && "<skill folder>/scripts/browser" resize 1440 1024
cd "<run folder>" && "<skill folder>/scripts/browser" snapshot
cd "<run folder>" && "<skill folder>/scripts/browser" screenshot --filename="<run folder>/01-start.png"
cd "<run folder>" && "<skill folder>/scripts/browser" close
```

- **Session:** the wrapper names the session after the current folder, so keep the run folder as the working directory for the whole run (or set `PRODUCT_DESIGN_BROWSER_SESSION`). `"<skill folder>/scripts/browser" list` shows open sessions.
- **Viewport:** set it before each capture with `resize <width> <height>`, using the dimensions the workflow calls for (`references/ideate.md` lists them), and take a fresh snapshot after resizing. For touch or mobile emulation, open with `open <url> --mobile` or `open <url> --device "iphone 15"`. Record the viewport next to each screenshot, and compare a source and a build only at the same viewport.
- **Clean session for verifying a shared URL:** open it in a new session name that has never held the prototype or any login (`PRODUCT_DESIGN_BROWSER_SESSION=product-design-verify`), without `--persistent`, `--profile`, or `state-load`, so no cache, cookie, or local storage from the build session can make a broken deployment look fine. Close it afterwards.
- **Clean up:** close every browser session you opened with `close` (use the same session name), and stop any preview server you started. Do not use `close-all`; it also ends sessions you did not open.
- Before each browser action obtain a fresh snapshot; after each action verify the changed state. Open every accepted screenshot before using it as evidence.

When image generation is unavailable, do not substitute prose as if it were an image. Produce three complete image-generation prompts, tell the user where to generate them, and pause until the three images or a selected result are attached.

## Prototype bootstrap

For a new local prototype, use the bundled starter rather than recreating boilerplate:

```bash
"$SKILL_DIR/scripts/bootstrap-prototype" --template web --dest /absolute/path/to/prototype
"$SKILL_DIR/scripts/bootstrap-prototype" --template mobile --dest /absolute/path/to/prototype
```

Ask the user where the prototype should live; the destination must not exist yet. Install dependencies in the generated directory (`npm ci`; the lockfile is included), keep the preview running during implementation and QA, and make the core journey interactive with realistic mock data. Do not add backends, authentication, or persistence unless requested.

## Asset rules

- Use supplied brand assets and real source imagery when available.
- Use a matching icon library for standard icons.
- Do not fake visible imagery or icons with emoji, text glyphs, CSS drawings, placeholder boxes, or handcrafted SVG substitutes.
- Match crop, aspect ratio, density, palette, and focal point to the intended slot.

## Communication

Lead with the visible result, decision, or blocker. Keep progress updates short and non-technical. State material trade-offs plainly. For local prototypes, provide an accessible preview only when it is actually running; never claim a local URL is shareable outside the machine.
