# format

```ts
import { formatNumber, formatCurrency, formatDate } from '@iyulab/components';
```

Thin wrappers over `Intl.NumberFormat` / `Intl.DateTimeFormat` that default to the
library's active locale (`Locale.get()`), so numbers and dates rendered by your app match
the ones the components render themselves.

They add no formatting rules of their own — everything `Intl` accepts is passed straight
through. Reach for them instead of calling `Intl` directly when you want the active locale
applied without threading it through every call site.

For spreadsheet-style format codes (`#,##0;[Red](#,##0)`), see [`number-format`](./number-format.md).

## Functions

### `formatNumber(value, options?, locale?)`

```ts
formatNumber(1234.5);                                  // active locale
formatNumber(0.42, { style: 'percent' });              // '42%'
formatNumber(1234.5, { maximumFractionDigits: 0 }, 'de-DE');
```

`options` is `Intl.NumberFormatOptions`. `locale` overrides the active locale for this call
only.

---

### `formatCurrency(value, currency, options?, locale?)`

```ts
formatCurrency(1234.5, 'USD');   // '$1,234.50' in an en locale
formatCurrency(1234.5, 'KRW');
```

`currency` is **required and has no default** — which currency an amount is in is domain
knowledge this utility will not guess.

⚠ An invalid currency code throws `RangeError` rather than degrading (see the note under
`formatDate`). Pass a valid ISO 4217 code.

If `options` contains `currency` or `style`, those win over the `currency` argument.

---

### `formatDate(value, options?, locale?)`

```ts
formatDate(new Date());
formatDate('2026-03-14', { dateStyle: 'long' });
formatDate(order.createdAt, { dateStyle: 'short', timeStyle: 'short' });
```

Accepts a `Date` or a date string, read by [`readDateValue`](#date-values--readdatevalue-and-writers): a
`YYYY-MM-DD` day is **local midnight, not UTC** — `'2026-03-14'` is midnight where the user is, so a date
never shifts a day across time zones the way `new Date('2026-03-14')` does; a date-time without an offset is
local wall clock; one with an offset (`…Z`, `…+09:00`) is that instant. ISO-shaped text that names no real
day (`2026-02-30`) is treated as invalid rather than rolled into March; other text goes to the platform parser.

A value that cannot be resolved to a real date — a malformed string, or an already-invalid
`Date` — returns `String(value)` instead of throwing. `Intl.DateTimeFormat.format()` throws
`RangeError` on an invalid date, and this runs inside render paths where an uncaught throw
blanks the whole component; showing the raw value is the lesser failure.

That degrade is **deliberately not symmetric** with `formatCurrency`: a date arrives as
data (an API, a user, a stale cache), so a bad one is an expected runtime state; a currency
code is written at the call site, so a bad one is a bug worth surfacing.

## Date values — `readDateValue` and writers

```ts
import { readDateValue, writeInstant, writePlainDate, writePlainDateTime } from '@iyulab/components';

const read = readDateValue('2026-09-06T22:22:34Z');
// { kind: 'instant', date } — in Seoul, writeInstant(read.date) is '2026-09-07T07:22:34+09:00'
if (read?.kind === 'plainDate') console.log(writePlainDate(read.date));
```

An app receives dates as text of three kinds, named after Temporal:

| kind | text | means here |
|---|---|---|
| `instant` | a date-time with `Z` or an offset (`…+09:00`, `…-0500`) | that moment; shown as this browser's wall clock |
| `plainDateTime` | a date-time without an offset (`2026-09-06T22:22`, `2026-09-06 22:22:34`) | that wall clock, local |
| `plainDate` | a day (`2026-09-06`) | local midnight of that day |

`readDateValue(value)` returns `{ kind, date }`, or `null` for text that is none of the three or names a day or
time that does not exist. A `Date` reads as an `instant`. Write back in the kind you read so the value keeps its
meaning: `writeInstant(date)` (local offset, same moment), `writePlainDateTime(date, seconds?)`,
`writePlainDate(date)`. `localOffset(date)` gives the `±HH:mm` of that date (daylight saving is per date).
`formatDate` and the date pickers read through the same function.

## Locale

All three read `Locale.get()` when `locale` is omitted, so they follow whatever
[`Locale`](./locale.md) resolved — `<html lang>` first, then the browser language. Pass
`locale` explicitly only when one value must be formatted differently from the rest of the
page (a currency shown in its home locale, for example).
