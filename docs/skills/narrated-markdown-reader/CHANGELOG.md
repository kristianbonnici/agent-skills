# narrated-markdown-reader changelog

## 1.1.0 (2026-10-30)

First review (OpenCode GLM-5.3 Flash: 3 must-fix, 5 nits), fixed by Claude Sonnet 5.5, every finding checked:
- Inline math (`$…$`, `$$…$$`, `\(…\)`) never reaches text-to-speech: the math spec gains an `inline` list of exact LaTeX and its spoken form, and an expression without one stops the preparation with a list.
- Block HTML is rendered through an allow-list of safe tags and narrated from its text, instead of vanishing; scripts, frames, styles and event handlers are left out with a warning. Image-only paragraphs are kept.
- Alt text isn't spoken, so every spoken word maps to the page and the no-warnings check can pass.
- `python3` in the commands; the chunk folder lives in the workdir and is removed, also on failure; an empty document exits with a clear message; HTML entities are decoded and strikethrough markers dropped; the KaTeX CDN tags carry integrity hashes.
- `tests/narrated-reader-test` covers these offline.

## 1.0.0 (2026-10-30)

- First versioned release: the skill as it stood on 2026-10-30. Earlier history is in `git log -- skills/narrated-markdown-reader`.
