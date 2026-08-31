# Math narration specification

`prepare-reader.mjs` requires an explicit specification for every fenced `math` block. This prevents raw LaTeX commands from reaching text-to-speech and gives the reader symbol groups that can be highlighted during narration.

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
  ]
}
```

Rules:

- `source` must match the complete fenced block after whitespace normalization.
- Preserve the original visual equation by concatenating the `tex` segments in order.
- Write `speech` as natural mathematical English, not a literal reading of commands or punctuation.
- Split segments at meaningful visible units: variables, operators, sums, fractions, functions, and grouped predicates.
- Keep one visual equation row per array in `lines`.
- Say ambiguous notation explicitly: "W prime," "delta t sub i," "the sum over c," or "the indicator that sample i is in category c."
- Do not claim that a symbol means something the surrounding source does not establish.
