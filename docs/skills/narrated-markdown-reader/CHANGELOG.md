# narrated-markdown-reader changelog

## Removed (2026-10-30)

The owner no longer uses this skill, so it is gone from `skills/` and from the install links. To get it back: `git checkout narrated-markdown-reader/v1.0.0 -- skills/narrated-markdown-reader`, the last released version. A 1.1.0 with fixes from its first review (inline math, HTML blocks, alt text) is in commit `ad37dc5`, untagged: its fix review found must-fixes still open (inline-math detection around `<` and `$HOME`-style text, and removed HTML still spoken), which nobody fixed, since the skill was removed.

## 1.1.0 (2026-10-30)

First review (OpenCode GLM-5.3 Flash: 3 must-fix, 5 nits), fixed by Claude Sonnet 5.5, every finding checked:
- Inline math (`$…$`, `$$…$$`, `\(…\)`) never reaches text-to-speech: the math spec gains an `inline` list of exact LaTeX and its spoken form, and an expression without one stops the preparation with a list.
- Block HTML is rendered through an allow-list of safe tags and narrated from its text, instead of vanishing; scripts, frames, styles and event handlers are left out with a warning. Image-only paragraphs are kept.
- Alt text isn't spoken, so every spoken word maps to the page and the no-warnings check can pass.
- `python3` in the commands; the chunk folder lives in the workdir and is removed, also on failure; an empty document exits with a clear message; HTML entities are decoded and strikethrough markers dropped; the KaTeX CDN tags carry integrity hashes.
- `tests/narrated-reader-test` covers these offline.

## 1.0.0 (2026-10-30)

- First versioned release: the skill as it stood on 2026-10-30. Earlier history is in `git log -- skills/narrated-markdown-reader`.
