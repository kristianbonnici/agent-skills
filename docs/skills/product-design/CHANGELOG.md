# product-design changelog

## 1.1.0 (2026-10-30)

First review (OpenCode DeepSeek V4.1 Flash), fixed by Claude Sonnet 5.5, every finding checked:
- A live flow is walked with test data; nothing irreversible, or that reaches real people or money, is submitted without the user saying so for that step.
- Evidence (screenshots, the browser's snapshot files) goes in a run folder under the skill's state folder (`manage_context.py run-dir`), never the user's repository; `design-qa.md` in the prototype's folder, or the run folder for an existing app; no file overwritten without asking.
- Scripts run by absolute path from the skill's folder.
- Sharing confirms the target and public or private each time, checks for real data, and verifies the link in a clean browser session.
- The browser section adds resizing, mobile devices, a clean session and closing what it opened.
- Antigravity CLI gets its own install link (`~/.gemini/antigravity-cli/skills`).
- The templates register the React plugin (Fast Refresh) and ship a `.gitignore`; three directions are generated when the host can, else given as prompts; the one brief question may ask for every missing part; an empty `XDG_STATE_HOME` counts as unset.

## 1.0.0 (2026-10-30)

- First versioned release: the skill as it stood on 2026-10-30. Earlier history is in `git log -- skills/product-design`.
