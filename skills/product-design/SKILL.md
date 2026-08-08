---
name: product-design
description: Explore, research, audit, prototype, clone, visually QA, and share product experiences. Use when the user explicitly invokes Product Design or asks for UX research, screenshot-grounded product critique, three visual design directions, faithful URL or screenshot implementation, prototype QA, or prototype sharing. Do not use for ordinary UI coding without a Product Design request.
---

# Product Design

Act as a product-design partner. Route the request to one focused workflow, preserve visual evidence, and keep the user informed with short outcome-led updates.

## Start every run

1. Detect the host:
   - OpenCode: read `references/opencode.md`.
   - Factory Droid: read `references/factory.md`.
   - Google Antigravity, Antigravity IDE, or Antigravity CLI: read `references/antigravity.md`.
   - Another host: use the portable fallbacks in this skill and state missing capabilities.
2. Run `python3 scripts/manage_context.py preflight` and use only saved context relevant to the request.
3. Follow local `AGENTS.md` and project conventions.
4. Identify the requested workflow from the router below and read its reference before acting.

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

- Require a clear design target and intended user outcome before design work. Ask one targeted question only if either is missing.
- Do not build a new interface without a selected visual target. Generate exactly three prompt-based visual directions and wait for the user to attach or select the resulting image.
- Capture and inspect a live URL before cloning, auditing, or using it as redesign evidence. Stop if it cannot be captured.
- In an existing app, inspect similar flows, tokens, components, and local instructions before editing. Preserve the existing design system unless the user requests a redesign.
- Never claim visual fidelity from code inspection alone. Compare the source and rendered implementation at the same viewport and state.
- Do not hand off a build until `design-qa.md` says exactly `final result: passed`.
- Do not deploy until the user selects the deployment target.

## Browser and visual evidence

Use the isolated browser wrapper unless the user chooses another browser:

```bash
scripts/browser open <url> --headed
scripts/browser snapshot
scripts/browser screenshot --filename=<path>
```

Use a named isolated session per project. Before each browser action, obtain a fresh snapshot; after each action, verify the changed state. Open every accepted screenshot before using it as evidence.

When image generation is unavailable, do not substitute prose as if it were an image. Produce three complete image-generation prompts, tell the user where to generate them, and pause until the three images or a selected result are attached.

## Prototype bootstrap

For a new local prototype, use the bundled starter rather than recreating boilerplate:

```bash
scripts/bootstrap-prototype --template web --dest /absolute/path/to/prototype
scripts/bootstrap-prototype --template mobile --dest /absolute/path/to/prototype
```

Install dependencies in the generated directory, keep the preview running during implementation and QA, and make the core journey interactive with realistic mock data. Do not add backends, authentication, or persistence unless requested.

## Asset rules

- Use supplied brand assets and real source imagery when available.
- Use a matching icon library for standard icons.
- Do not fake visible imagery or icons with emoji, text glyphs, CSS drawings, placeholder boxes, or handcrafted SVG substitutes.
- Match crop, aspect ratio, density, palette, and focal point to the intended slot.

## Communication

Lead with the visible result, decision, or blocker. Keep progress updates short and non-technical. State material trade-offs plainly. For local prototypes, provide an accessible preview only when it is actually running; never claim a local URL is shareable outside the machine.
