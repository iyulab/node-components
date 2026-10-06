# u-date-range-picker

```ts
import '@iyulab/components/dist/components/date-range-picker/UDateRangePicker.js';
```

**Tag:** `u-date-range-picker`

A period of calendar days in one field — "ordered between", "valid from … to …". Use it instead of
two `u-date-picker`s for a start and an end: the user picks both ends in one calendar, and the
range can never come out reversed.

The value is an ISO 8601 time interval of two days, start first: `YYYY-MM-DD/YYYY-MM-DD`. It is one
string, so it works as an attribute and submits with a form as a single field. Read the halves with
the `start` and `end` getters. Form-associated.

The popover shows two months (on a narrow screen the second month moves below the first). The first
day picked is an anchor; the range previews up to the day under the pointer or keyboard focus. The
second day completes the range — if it comes before the anchor it becomes the start — fires
`change` and closes the calendar. Picking the same day twice gives a one-day range. Escape while a
range is half picked drops the anchor; Escape again closes the calendar. When the first day is
picked, an off-screen status region announces it and asks for the end date. A reversed value set from
code is put in order (no `change`).

> The calendar week always starts on Sunday, regardless of locale.

**Typing a range.** The field is a text box: type `2026-10-01 ~ 2026-10-31` (also `–`, ` - `, the ISO
interval `2026-10-01/2026-10-31`, a short second day such as `10-31` — the first day's year, or the
next year when it would fall before the first day — or one day for a one-day range) and press Enter
or leave the field. It shows `YYYY-MM-DD – YYYY-MM-DD` in every browser language; `format="locale"`
uses the locale's numeric order for each day. Clicking the field opens the calendar and keeps the
caret in the text box; ArrowDown (or Alt+ArrowDown) moves into the calendar. Text that is not a range
clears the value and reports `badInput` (the text stays to be fixed). The reader and writer are
exported as `parseDateRange` and `formatDateRangeText`.

```html
<u-date-range-picker name="ordered" label="Ordered"></u-date-range-picker>

<!-- Bounded, clearable, with an initial range -->
<u-date-range-picker name="period" label="Period" clearable
  min="2026-01-01" max="2026-12-31" value="2026-03-01/2026-03-31"></u-date-range-picker>
```

### Date and time (`mode="datetime"`)

`mode="datetime"` adds a start time and an end time under the calendar (labelled inputs). Each half of
the value is then a complete ISO-8601 `DateTimeOffset` — seconds and the browser's local offset are
always filled in — and `start`/`end` return those halves:

```html
<u-date-range-picker name="shift" label="Shift" mode="datetime"
  value="2026-10-01T09:00:00+09:00/2026-10-01T18:00:00+09:00"></u-date-range-picker>
```

The first range picked covers its days whole (00:00 to 23:59), as do presets; after that, picking
other days keeps the times already set. Changing a time updates that end at once (the calendar stays
open); a start time set after the end on the same day swaps the two. The text box reads
`2026-10-01 09:00 ~ 2026-10-31 18:00` and `2026-10-01 09:00 ~ 18:00` (a time alone ends on the first
day); a day typed without a time keeps that end's time. 12-hour times are read as well
(`2026-10-01 오전 9:00 ~ 오후 6:00`, `9:00 AM ~ 6:00 PM`) and shown in 24-hour form. `min`/`max` and `isDateDisabled` stay
date-only. The reader and writer are exported as `parseDateTimeRange` and `formatDateTimeRangeText`.
Add `seconds` to enter times to the second: the inputs and the text box show `HH:mm:ss`, and a whole
day runs from `00:00:00` to `23:59:59`.

### Disabled days

`isDateDisabled` receives an ISO day and returns `true` to disable it. A disabled day cannot start or
end a range, but a range may run across it — a working week still spans the weekend between. A preset
whose range starts or ends on a disabled day is disabled. A typed or assigned range that starts or ends
on one reports `stepMismatch` ("This date is not available").

### Apply to confirm

With `confirm`, choosing in the calendar does not change the value yet: a completed range, a preset
and "Clear value" only stage the choice, shown in the calendar, and the footer adds **Cancel** and
**Apply**. Apply commits the staged choice (empty if "Clear value" was chosen), fires `change` once
and closes; Cancel, Escape or closing the calendar any other way drops it, and the next opening
starts from the value. Typing in the text box still commits on Enter or leaving the field.

```html
<u-date-range-picker name="period" label="Period" presets="last7Days thisMonth" confirm></u-date-range-picker>
```

### Quick ranges (presets)

`presets` lists quick ranges beside the calendar (above it on a narrow screen), in the order given.
Built-in names can be written as a space-separated attribute; app-defined presets are objects with
a `label` and a `range()` function returning the two ends (`Date`s or ISO days, either order).
Picking a preset sets the range at once, fires `change` and closes the calendar. A preset whose
range reaches outside `min`/`max` is disabled, and the one equal to the current range is marked
`aria-pressed="true"` (and highlighted). Relative ranges are computed each time the calendar opens,
so "Last 7 days" is always the last seven days.

| Name | Range (both ends inclusive) |
|------|-----------------------------|
| `today` | today |
| `yesterday` | yesterday |
| `last7Days` | the 7 days ending today |
| `last30Days` | the 30 days ending today |
| `thisWeek` | Sunday–Saturday of this week |
| `lastWeek` | Sunday–Saturday of last week |
| `thisMonth` | the whole of this month |
| `lastMonth` | the whole of last month |
| `thisYear` | January 1 – December 31 of this year |

Labels come from the built-in locale tables (14 languages). Organization-specific periods — fiscal
quarters, half-years — are not built in; define them as presets:

```html
<u-date-range-picker label="Ordered" presets="today last7Days thisMonth lastMonth"></u-date-range-picker>
```

```ts
picker.presets = [
  'thisMonth',
  { label: 'Q1 FY2026', range: () => ['2026-01-01', '2026-03-31'] },
];
```

```ts
const picker = document.querySelector('u-date-range-picker')!;
picker.addEventListener('change', () => {
  const { start, end } = picker; // both undefined when cleared
  load({ from: start, to: end });
});
```

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `mode` | `'date' \| 'datetime'` | `'date'` | ✓ | `datetime` adds start and end times; each half becomes an ISO-8601 `DateTimeOffset` |
| `value` | `string` | — | — | The range as `YYYY-MM-DD/YYYY-MM-DD` (start first), or two `DateTimeOffset`s in `mode="datetime"` |
| `start` | `string` (read-only) | — | — | Start of the range (ISO day, or date-time in `mode="datetime"`), `undefined` without a complete range |
| `end` | `string` (read-only) | — | — | End of the range (ISO day, or date-time in `mode="datetime"`), `undefined` without a complete range |
| `min` | `string` | — | — | Earliest selectable day (ISO `YYYY-MM-DD`), inclusive |
| `max` | `string` | — | — | Latest selectable day (ISO `YYYY-MM-DD`), inclusive |
| `size` | `'sm'\|'md'\|'lg'` | `'md'` | ✓ | Field size, like a button's: 12px · `--u-density` (14px) · 16px. A field and a button of the same size share a height |
| `chars` | `number` | — | ✓ | Characters the field holds — both dates and the separator (`a – b`). An unsized field draws at N characters + its clear and calendar buttons + padding; a sized one uses it as the text floor, so a narrower box overflows. Same axis as `u-input`'s `chars` |
| `clearable` | `boolean` | `false` | ✓ | Show clear button |
| `isDateDisabled` | `(date: string) => boolean` | — | — | App rule for days that cannot start or end a range (ISO in, `true` = disabled). Property only; see «Disabled days» |
| `placeholder` | `string` | — | — | Placeholder text (defaults to the pattern to type) |
| `format` | `'iso' \| 'locale'` | `'iso'` | ✓ | How the text box writes and reads each day |
| `confirm` | `boolean` | `false` | ✓ | Calendar picks wait for an Apply button (see «Apply to confirm») |
| `seconds` | `boolean` | `false` | ✓ | `mode="datetime"`: enter times to the second; a whole day ends at `23:59:59` |
| `presets` | `Array<DateRangePresetName \| DateRangePreset>` | `[]` | — | Quick ranges beside the calendar; attribute form is space-separated built-in names |
| `disabled` | `boolean` | `false` | ✓ | Disable |
| `readonly` | `boolean` | `false` | ✓ | Read-only |
| `required` | `boolean` | `false` | ✓ | Required |
| `invalid` | `boolean` | `false` | ✓ | Validation failed |
| `name` | `string` | — | — | Form field name |
| `label` | `string` | — | — | Field label |
| `description` | `string` | — | — | Helper text |
| `validationMessage` | `string` | — | — | Custom validation message |

Validation: `required` with no value → `valueMissing`; a value that is not two ISO days joined by `/`
→ `badInput`; start before `min` → `rangeUnderflow`; end after `max` → `rangeOverflow`; start or end on a day
`isDateDisabled` refuses → `stepMismatch`.

## Events

| Event | Description |
|-------|-------------|
| `change` | Fires when the user completes a range or clears it (with `confirm`, when Apply commits a different value). Programmatic value assignment does not fire it. |

## Methods

| Method | Description |
|--------|--------------|
| `validate()` | Validate; sets `invalid` |
| `reset()` | Reset value |
| `focus(options?)` | Focus the trigger |
| `blur()` | Blur the trigger |

## CSS Parts

| Part | Description |
|------|-------------|
| `field` | The `u-field` element |
| `container` | The element wrapping the trigger area |
| `input` | The text box |
| `popover` | The popover element showing the calendar |
| `calendar` | The calendar container |
| `calendar-month` | One month block |
| `calendar-header` | A month navigation header |
| `calendar-title` | A "Month Year" title |
| `calendar-weekdays` | A weekday header row |
| `calendar-grid` | A date grid |
| `calendar-week` | One week row inside a date grid |
| `day` | A date cell button |
| `calendar-time` | The row holding the start and end time inputs (`mode="datetime"` only) |
| `time-input` | A time-of-day input (`mode="datetime"` only) |
| `calendar-footer` | The row holding the "Clear" quick action |
| `presets` | The list of quick ranges beside the calendar |
| `preset` | One quick-range button |

The range look comes from theme tokens — `--u-primary-color` (end caps), `--u-primary-bg-color`
(the band between them) and `--u-primary-txt-color` — so a theme restyles it without part selectors.

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--u-date-range-picker-display` | Host `display` (default: inline-block). Set `block` to fill the container width |
| `--u-date-range-picker-width` | Host `width` (default: auto). Set `100%` where `block` alone does not stretch the host |
| `--date-range-picker-min-text` | Minimum width of the text area (default `4ch`). The clear and calendar buttons never squeeze the typed range below it — a picker given less width overflows its host visibly |
