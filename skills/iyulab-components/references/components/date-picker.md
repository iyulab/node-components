# u-date-picker

```ts
import '@iyulab/components/dist/components/date-picker/UDatePicker.js';
```

**Tag:** `u-date-picker`

Single-date(-time) selection with a popover calendar. `mode="date"` (default) follows the same
convention as the native `input[type=date]`: an ISO `YYYY-MM-DD` string. `mode="datetime"` adds
a time-of-day input and the value becomes a complete ISO-8601 `DateTimeOffset` string
(`YYYY-MM-DDTHH:mm:ss±HH:mm`, seconds and the browser's local UTC offset always filled in — the
value is unconditionally valid regardless of how coarse the time input was). Form-associated.

> The calendar week always starts on Sunday, regardless of locale.

**Typing a date (`mode="date"`).** The field is a text box. Type `2026-10-02`, `2026/10/2`,
`20261002`, or just `10-02` (this year), then press Enter or leave the field. The text shows as
`YYYY-MM-DD` in every browser language; `format="locale"` shows and reads the locale's numeric
order instead (`10/02/2026` in `en-US`, `02.10.2026` in `de` — ISO is still read). Clicking the
field opens the calendar and keeps the caret in the text box; ArrowDown (or Alt+ArrowDown) moves
into the calendar. Text that is not a date clears the value and reports `badInput` (the text stays
so it can be fixed); a date outside `min`/`max` is kept and reported as out of range.
In `mode="datetime"` the text box takes a time after the date (`2026-10-02 14:30`, `9:05`, seconds
dropped) and shows `YYYY-MM-DD HH:mm`; typing only a date keeps the time already set.
The parser and formatter are exported as `parseDate`, `parseDateTime`, `formatDateText`,
`formatDateTimeText` and `dateTextPattern`.

The calendar popover has a footer with a "Today" quick-action button (selects today's date —
in `mode="datetime"` this also sets the time to right now — disabled when today falls outside
`min`/`max`) and, when `clearable` and a value is set, a "Clear" button next to it. Picking a
day preserves whatever time-of-day was already set; only the "Today" button overrides the time.
`min`/`max` are always date-only, even in `mode="datetime"` — time-of-day is never range-checked.

### Disabled days

`min`/`max` bound the calendar; `isDateDisabled` removes days inside it — weekends, holidays, fully
booked days. It receives the ISO day and returns `true` to disable it. A disabled day is drawn with
`aria-disabled="true"` and cannot be picked (nor can "Today" when today is disabled). A typed or
assigned value on a disabled day reports `stepMismatch` ("This date is not available") — the native
date input reports the same flag for a readable day its `step` does not allow.

```js
const holidays = new Set(['2026-10-03', '2026-10-09']);
picker.isDateDisabled = (date) => {
  const day = new Date(`${date}T00:00`).getDay();
  return day === 0 || day === 6 || holidays.has(date);
};
```

### Apply to confirm

With `confirm`, choosing in the calendar does not change the value yet: a day, the time, "Today"
and "Clear value" only stage the choice, shown in the calendar, and the footer adds **Cancel** and
**Apply**. Apply commits the staged choice (empty if "Clear value" was chosen), fires `change` once
and closes; Cancel, Escape or closing the calendar any other way drops it, and the next opening
starts from the value. Typing in the text box still commits on Enter or leaving the field.

```html
<u-date-picker name="start-date" label="Start date"></u-date-picker>

<!-- Clearable with a bounded range -->
<u-date-picker name="due-date" label="Due date" clearable min="2026-01-01" max="2026-12-31"></u-date-picker>

<!-- Date + time, value is a full ISO-8601 DateTimeOffset string -->
<u-date-picker name="sent-at" label="Sent at" mode="datetime"></u-date-picker>

<!-- Day and time are applied together -->
<u-date-picker name="due-at" label="Due at" mode="datetime" confirm></u-date-picker>
```

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `mode` | `'date' \| 'datetime'` | `'date'` | ✓ | `datetime` adds a time input; value becomes a full ISO-8601 `DateTimeOffset` string |
| `value` | `string` | — | — | Selected date (ISO `YYYY-MM-DD`), or full ISO-8601 datetime in `mode="datetime"` |
| `min` | `string` | — | — | Minimum selectable date (ISO `YYYY-MM-DD`, date-only in both modes) |
| `max` | `string` | — | — | Maximum selectable date (ISO `YYYY-MM-DD`, date-only in both modes) |
| `clearable` | `boolean` | `false` | ✓ | Show clear button |
| `isDateDisabled` | `(date: string) => boolean` | — | — | App rule for days that cannot be chosen (ISO in, `true` = disabled). Property only; see «Disabled days» |
| `placeholder` | `string` | — | — | Placeholder text (defaults to the pattern to type, e.g. `YYYY-MM-DD` or `YYYY-MM-DD HH:mm`) |
| `format` | `'iso' \| 'locale'` | `'iso'` | ✓ | How the text box writes and reads the date part |
| `confirm` | `boolean` | `false` | ✓ | Calendar picks wait for an Apply button (see «Apply to confirm») |
| `disabled` | `boolean` | `false` | ✓ | Disable |
| `readonly` | `boolean` | `false` | ✓ | Read-only |
| `required` | `boolean` | `false` | ✓ | Required |
| `invalid` | `boolean` | `false` | ✓ | Validation failed |
| `name` | `string` | — | — | Form field name |
| `label` | `string` | — | — | Field label |
| `description` | `string` | — | — | Helper text |
| `validationMessage` | `string` | — | — | Custom validation message |

## Events

| Event | Description |
|-------|-------------|
| `change` | Fires when the user clicks a date cell, confirms via keyboard, commits typed text (Enter or leaving the field, when the value changes), changes the time input (`mode="datetime"`, once a date is set), or clicks the clear button — with `confirm`, calendar picks fire it only when Apply commits a different value. Programmatic value assignment does not fire it. |

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
| `calendar-header` | The month navigation header |
| `calendar-title` | The "Month Year" title |
| `calendar-weekdays` | The weekday header row |
| `calendar-grid` | The date grid |
| `day` | A date cell button |
| `calendar-footer` | The row holding the "Today"/"Clear" quick-action buttons |
| `calendar-time` | The row holding the time-of-day input (`mode="datetime"` only) |
| `calendar-week` | One week row inside the date grid |
| `time-input` | Time-of-day input (datetime mode only) |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--u-date-picker-display` | Host `display` (default: inline-block). Set `block` to fill the container width in forms and grid cells |
| `--u-date-picker-width` | Host `width` (default: auto). Set `100%` where `block` alone does not stretch the host (e.g. inside a flex container) |
| `--date-picker-popover-width` | Width of the calendar popover (default: 296px, independent of trigger width — a fixed-width calendar reads more naturally) |
