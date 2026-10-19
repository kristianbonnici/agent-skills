# Makers' marks

The run map (`scripts/run-charts`, `assets/run-map.html`) draws the symbol of the company whose
model each agent ran on, as T3 Code does beside its harnesses; for a model with no real name
("default", "auto") it draws its harness's symbol instead. Each mark is its owner's trademark,
shown only to tell which model or harness did the work; no endorsement by, or affiliation with,
any of them is claimed, and no license below grants a right in a trademark. A model whose maker
has no mark here gets a lettered badge.

`marks.json` says which mark goes with which models and harnesses (regular expressions on the
model's name, a `maker` field in the facts, or the harness's name), and in which colour the page
masks it: the maker's own, taken from its source's colour version, or the text colour for marks
that are black and white.

Each file is a cleaned copy of its source's path data: `<path>` elements with the fill rule and
one black fill, in the source's `viewBox`; symbols only, never a maker's lettering; no titles, scripts, styles, links, gradients, embedded
images or fonts (`tests/orchestrator-scripts-test` checks). Downloads are kept outside the
repository; only the cleaned path data is copied in.

| File | Maker or harness | Source | Terms of the source |
| --- | --- | --- | --- |
| `claude.svg` | Anthropic (Claude) | Simple Icons 16.35.0, `icons/claude.svg` (from <https://claude.ai>) | CC0 1.0 |
| `openai.svg` | OpenAI | T3 Code, `apps/web/src/components/Icons.tsx` (`OpenAI`), <https://github.com/pingdotgg/t3code> at f87dd14 | MIT, below |
| `gemini.svg` | Google (Gemini) | Simple Icons 16.35.0, `icons/googlegemini.svg` (from <https://gemini.google.com>) | CC0 1.0 |
| `deepseek.svg` | DeepSeek | Simple Icons 16.35.0, `icons/deepseek.svg` (from <https://www.deepseek.com>) | CC0 1.0 |
| `gemma.svg` | Google (Gemma) | Lobe Icons | MIT, below |
| `google.svg` | Google | Lobe Icons | MIT, below |
| `grok.svg` | xAI (Grok) | Lobe Icons | MIT, below |
| `qwen.svg` | Alibaba (Qwen) | Lobe Icons | MIT, below |
| `zai.svg` | Z.ai (GLM) | Lobe Icons | MIT, below |
| `kimi.svg` | Moonshot AI (Kimi) | Lobe Icons | MIT, below |
| `minimax.svg` | MiniMax | Lobe Icons | MIT, below |
| `mistral.svg` | Mistral AI | Lobe Icons | MIT, below |
| `meta.svg` | Meta (Llama) | Lobe Icons | MIT, below |
| `nvidia.svg` | NVIDIA (Nemotron) | Lobe Icons | MIT, below |
| `bytedance.svg` | ByteDance (Seed, Doubao) | Lobe Icons | MIT, below |
| `hunyuan.svg` | Tencent (Hunyuan) | Lobe Icons | MIT, below |
| `cohere.svg` | Cohere | Lobe Icons | MIT, below |
| `perplexity.svg` | Perplexity (Sonar) | Lobe Icons | MIT, below |
| `nova.svg` | Amazon (Nova) | Lobe Icons | MIT, below |
| `microsoft.svg` | Microsoft (Phi, MAI) | Lobe Icons | MIT, below |
| `stepfun.svg` | StepFun | Lobe Icons | MIT, below |
| `baidu.svg` | Baidu (ERNIE) | Lobe Icons | MIT, below |
| `sakana.svg` | Sakana AI | Lobe Icons | MIT, below |
| `antgroup.svg` | Ant Group (inclusionAI, Ling) | Lobe Icons | MIT, below |
| `nousresearch.svg` | Nous Research (Hermes) | Lobe Icons | MIT, below |
| `upstage.svg` | Upstage (Solar) | Lobe Icons | MIT, below |
| `liquid.svg` | Liquid AI (LFM) | Lobe Icons | MIT, below |
| `inception.svg` | Inception (Mercury) | Lobe Icons | MIT, below |
| `longcat.svg` | Meituan (LongCat) | Lobe Icons | MIT, below |
| `morph.svg` | Morph | Lobe Icons | MIT, below |
| `perceptron.svg` | Perceptron | Lobe Icons | MIT, below |
| `relace.svg` | Relace | Lobe Icons | MIT, below |
| `aionlabs.svg` | Aion Labs | Lobe Icons | MIT, below |
| `openrouter.svg` | OpenRouter (its routers) | Lobe Icons | MIT, below |
| `cursor.svg` | Cursor (Anysphere) | Lobe Icons | MIT, below |
| `githubcopilot.svg` | GitHub Copilot | Lobe Icons | MIT, below |
| `opencode.svg` | OpenCode | Lobe Icons | MIT, below |
| `pi.svg` | Pi | Lobe Icons | MIT, below |
| `antigravity.svg` | Google Antigravity | Lobe Icons | MIT, below |

"Lobe Icons" is `@lobehub/icons-static-svg` 1.95.1 (<https://github.com/lobehub/lobe-icons>),
`icons/<name>.svg` for the shape and `icons/<name>-color.svg` for the colours, taken on
2026-10-20.

Simple Icons' data is dedicated to the public domain under CC0 1.0
(<https://github.com/simple-icons/simple-icons/blob/develop/LICENSE.md>); it notes that the icons
remain their owners' trademarks, used under their brand guidelines.

Lobe Icons' license (its LICENSE, last changed in c8ae543):

```text
MIT License

Copyright (c) 2023 LobeHub

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
