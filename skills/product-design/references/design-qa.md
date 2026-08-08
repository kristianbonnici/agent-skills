# Design QA

Compare a rendered implementation against its source visual before handoff.

Both artifacts must be visible. Normalize viewport, crop, scale, theme, content, route, and interaction state before judging. If either artifact cannot be opened, write `design-qa.md` with `final result: blocked`.

Inspect:

- Layout, alignment, density, spacing, radii, borders, and elevation.
- Font family, fallback, weight, size, line height, tracking, wrapping, and hierarchy.
- Palette, tokens, contrast, gradients, opacity, and state colors.
- Image subject, crop, scale, sharpness, masking, and art direction.
- Icon family, size, weight, optical alignment, and states.
- Copy, core interactions, focus, keyboard access, responsiveness, loading, empty, error, success, and reduced motion.

Severity:

- `P0`: core journey blocked, severe accessibility failure, or broken layout.
- `P1`: major usability or fidelity regression.
- `P2`: visible drift, missing state, responsive issue, or meaningful polish gap.
- `P3`: non-blocking refinement.

For every P0–P2, record evidence and a concrete fix, apply it, recapture at the same viewport/state, and compare again. Do not stop after fixing without a fresh comparison.

Save `design-qa.md` at the project root with source and implementation paths, viewport/state, dimensions, comparison evidence, findings, iteration history, remaining P3 notes, and one final line:

```text
final result: passed
```

Use `passed` only when no actionable P0–P2 remains. Otherwise use exactly `final result: blocked` and name the blocker.
