# number-format

```ts
import { applyNumberFormat, type NumberFormat } from '@iyulab/components';
```

Without the barrel's component registrations:

```ts
import { applyNumberFormat } from '@iyulab/components/dist/utilities/numberFormat.js';
```

One number-format vocabulary for tables, sheets and widgets. A `NumberFormat` is either a
**spreadsheet format code** (the subset of Excel's number formats a list needs) or
**`Intl.NumberFormat` options** — the same two shapes a user brings from a spreadsheet or
from code.

## `applyNumberFormat(value, format, locale?)`

Returns `{ text, tone? }`, or `null` when a format code uses syntax the engine does not
support.

```ts
applyNumberFormat(1234.5, '#,##0.00');               // { text: '1,234.50' } in an en locale
applyNumberFormat(-1234, '#,##0;[Red](#,##0)');      // { text: '(1,234)', tone: 'danger' }
applyNumberFormat(1234, '#,##0원');                   // { text: '1,234원' }
applyNumberFormat(0.256, { style: 'percent', maximumFractionDigits: 1 });  // { text: '25.6%' }
applyNumberFormat(0.00007729, { maximumSignificantDigits: 4 });             // { text: '0.00007729' }
applyNumberFormat(5, '0.00E+00');                    // null — scientific is not supported
```

- `value`: a number or numeric text is formatted. Other text goes through a code's text
  section (the fourth), or is returned as is. `null` / `undefined` give `''`.
- `locale`: overrides the active locale (`Locale.get()`) for this call — separators follow it.
- **No signed zero.** A negative that rounds to zero reads `0` on both paths (as Excel does).
  With options that is `signDisplay: 'negative'`, unless the options set `signDisplay`.
- `tone`: a section color (`[Red]` `[Green]` `[Blue]` `[Yellow]`) becomes a status tone —
  `'danger' | 'success' | 'info' | 'warning'` — so the caller paints it with theme colors,
  not the literal color. `[Black]` is the default text color (no tone).

### Format codes

| Supported | Example |
|---|---|
| Up to four `;` sections — positive;negative;zero;text | `#,##0;(#,##0);"-"` |
| Digit placeholders `0` `#` `?`, decimal `.`, grouping `,` | `#,##0.00` · `000` · `#.##` |
| Trailing `,` divides by 1000 each | `#,##0,,"M"` |
| `%` multiplies by 100 | `0.0%` |
| Literals: `"…"`, `\x`, any other character | `#,##0" 원"` · `#,##0원` |
| `_x` alignment space · `*x` fill (ignored) | `#,##0_)` |
| Section colors | `[Red]-#,##0` |
| Currency `[$sym-locale]` (the symbol is used) | `[$₩-412]#,##0` |
| `@` in the text section | `0;-0;0;"["@"]"` |

Not supported (returns `null`): conditions `[>100]`, `[Color N]`, scientific `E+`, fractions `# ?/?`.
