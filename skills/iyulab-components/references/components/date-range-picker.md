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
range is half picked drops the anchor; Escape again closes the calendar. A reversed value set from
code is put in order (no `change`).

> The calendar week always starts on Sunday, regardless of locale.

```html
<u-date-range-picker name="ordered" label="Ordered"></u-date-range-picker>

<!-- Bounded, clearable, with an initial range -->
<u-date-range-picker name="period" label="Period" clearable
  min="2026-01-01" max="2026-12-31" value="2026-03-01/2026-03-31"></u-date-range-picker>
```

### Quick ranges (presets)

`presets` lists quick ranges beside the calendar (above it on a narrow screen), in the order given.
Built-in names can be written as a space-separated attribute; app-defined presets are objects with
a `label` and a `range()` function returning the two ends (`Date`s or ISO days, either order).
Picking a preset sets the range at once, fires `change` and closes the calendar. A preset whose
range reaches outside `min`/`max` is disabled. Relative ranges are computed each time the calendar
opens, so "Last 7 days" is always the last seven days.

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
| `value` | `string` | — | — | The range as `YYYY-MM-DD/YYYY-MM-DD` (start first) |
| `start` | `string` (read-only) | — | — | First day of the range (ISO), `undefined` without a complete range |
| `end` | `string` (read-only) | — | — | Last day of the range (ISO), `undefined` without a complete range |
| `min` | `string` | — | — | Earliest selectable day (ISO `YYYY-MM-DD`), inclusive |
| `max` | `string` | — | — | Latest selectable day (ISO `YYYY-MM-DD`), inclusive |
| `clearable` | `boolean` | `false` | ✓ | Show clear button |
| `placeholder` | `string` | — | — | Placeholder text |
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
→ `badInput`; start before `min` → `rangeUnderflow`; end after `max` → `rangeOverflow`.

## Events

| Event | Description |
|-------|-------------|
| `change` | Fires when the user completes a range or clears it. Programmatic value assignment does not fire it. |

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
| `popover` | The popover element showing the calendar |
| `calendar` | The calendar container |
| `calendar-month` | One month block |
| `calendar-header` | A month navigation header |
| `calendar-title` | A "Month Year" title |
| `calendar-weekdays` | A weekday header row |
| `calendar-grid` | A date grid |
| `calendar-week` | One week row inside a date grid |
| `day` | A date cell button |
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
