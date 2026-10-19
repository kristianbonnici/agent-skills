# Makers' marks

The run map (`scripts/run-charts`, `assets/run-map.html`) draws the symbol of the company whose
model each agent ran on, as T3 Code does beside its harnesses. Each mark is its maker's trademark,
shown only to tell which model did the work; no endorsement by, or affiliation with, any of them
is claimed, and no license below grants a right in a trademark. A model whose maker has no mark
here gets a lettered badge instead.

Each file is a cleaned copy of its source's path data: `<path>` elements with one black fill, in a
square `viewBox`; no scripts, styles, links, gradients, embedded images or fonts. The page masks
each one with its maker's colour.

| File | Maker | Colour in the map | Source | Terms of the source |
| --- | --- | --- | --- | --- |
| `claude.svg` | Anthropic (Claude) | `#D97757` | Simple Icons 16.35.0, `icons/claude.svg` (from <https://claude.ai>) | CC0 1.0 |
| `openai.svg` | OpenAI | the text colour | T3 Code, `apps/web/src/components/Icons.tsx` (`OpenAI`), <https://github.com/pingdotgg/t3code> at f87dd14 | MIT, below |
| `gemini.svg` | Google (Gemini) | Google's sparkle gradient | Simple Icons 16.35.0, `icons/googlegemini.svg` (from <https://gemini.google.com>) | CC0 1.0 |
| `deepseek.svg` | DeepSeek | `#5786FE` | Simple Icons 16.35.0, `icons/deepseek.svg` (from <https://www.deepseek.com>) | CC0 1.0 |

Simple Icons' data is dedicated to the public domain under CC0 1.0
(<https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md>); it notes that the icons
remain their owners' trademarks, used under their brand guidelines.

T3 Code's license (its LICENSE at f87dd14), for the path taken from it:

```text
MIT License

Copyright (c) 2026 T3 Tools Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
