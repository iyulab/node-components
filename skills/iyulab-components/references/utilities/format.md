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

Accepts a `Date` or an ISO `YYYY-MM-DD` string. **The string form is parsed as local time,
not UTC** — `'2026-03-14'` is midnight where the user is, so a date never shifts a day
across time zones the way `new Date('2026-03-14')` does.

A value that cannot be resolved to a real date — a malformed string, or an already-invalid
`Date` — returns `String(value)` instead of throwing. `Intl.DateTimeFormat.format()` throws
`RangeError` on an invalid date, and this runs inside render paths where an uncaught throw
blanks the whole component; showing the raw value is the lesser failure.

That degrade is **deliberately not symmetric** with `formatCurrency`: a date arrives as
data (an API, a user, a stale cache), so a bad one is an expected runtime state; a currency
code is written at the call site, so a bad one is a bug worth surfacing.

## Locale

All three read `Locale.get()` when `locale` is omitted, so they follow whatever
[`Locale`](./locale.md) resolved — `<html lang>` first, then the browser language. Pass
`locale` explicitly only when one value must be formatted differently from the rest of the
page (a currency shown in its home locale, for example).
