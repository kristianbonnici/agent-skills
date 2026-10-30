# Math narration specification

`prepare-reader.mjs` requires an explicit spoken form for every fenced `math` block and every inline expression. This prevents raw LaTeX commands from reaching text-to-speech, and gives the reader symbol groups (fenced blocks) or one unit (inline expressions) that can be highlighted during narration. A formula with no entry stops the script: it lists each missing inline expression and exits without writing blocks.

Use this JSON shape:

```json
{
  "schemaVersion": 1,
  "formulas": [
    {
      "source": "L_c = w_c T_c",
      "lines": [
        [
          { "tex": "L_c", "speech": "L sub c" },
          { "tex": "=", "speech": "equals" },
          { "tex": "w_c", "speech": "w sub c" },
          { "tex": "T_c", "speech": "multiplied by T sub c" }
        ]
      ]
    }
  ],
  "inline": [
    { "source": "x_i", "speech": "x sub i" },
    { "source": "\\sum_{c} w_c", "speech": "the sum over c of w sub c" }
  ]
}
```

Fenced blocks (`formulas`):

- `source` must match the complete fenced block after whitespace normalization.
- Preserve the original visual equation by concatenating the `tex` segments in order.
- Split segments at meaningful visible units: variables, operators, sums, fractions, functions, and grouped predicates.
- Keep one visual equation row per array in `lines`.

Inline expressions (`inline`):

- `source` is the expression's exact LaTeX, without its delimiters, after whitespace normalization. `$x_i$`, `$$x_i$$` and `\(x_i\)` all use the entry for `x_i`; one entry serves every occurrence.
- `speech` is the words read in place of the expression, in one piece: the reader highlights the typeset expression while they play.
- Code spans, fenced code, link and image targets and `\$` are never math. A dollar sign is math only when it opens right before a non-space and closes right after a non-space that is not followed by a digit, so prices ("$5 or $10") stay text.
- Display math outside a fenced `math` block (`\[...\]`, `\begin{...}`) is not recognized: prepare-reader warns when a command like that is left in the spoken text. Move it into a fenced `math` block.

For both:

- Write `speech` as natural mathematical English, not a literal reading of commands or punctuation. `prepare-reader.mjs` refuses speech that holds a backslash, `$`, `^`, `_`, `{` or `}`.
- Say ambiguous notation explicitly: "W prime," "delta t sub i," "the sum over c," or "the indicator that sample i is in category c."
- Do not claim that a symbol means something the surrounding source does not establish.
