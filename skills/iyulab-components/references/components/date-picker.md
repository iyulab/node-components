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

The calendar popover has a footer with a "Today" quick-action button (selects today's date —
in `mode="datetime"` this also sets the time to right now — disabled when today falls outside
`min`/`max`) and, when `clearable` and a value is set, a "Clear" button next to it. Picking a
day preserves whatever time-of-day was already set; only the "Today" button overrides the time.
`min`/`max` are always date-only, even in `mode="datetime"` — time-of-day is never range-checked.

```html
<u-date-picker name="start-date" label="Start date"></u-date-picker>

<!-- Clearable with a bounded range -->
<u-date-picker name="due-date" label="Due date" clearable min="2026-01-01" max="2026-12-31"></u-date-picker>

<!-- Date + time, value is a full ISO-8601 DateTimeOffset string -->
<u-date-picker name="sent-at" label="Sent at" mode="datetime"></u-date-picker>
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
| `placeholder` | `string` | — | — | Placeholder text |
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
| `change` | Fires when the user clicks a date cell, confirms via keyboard, changes the time input (`mode="datetime"`, once a date is set), or clicks the clear button. Programmatic value assignment does not fire it. |

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
| `calendar-header` | The month navigation header |
| `calendar-title` | The "Month Year" title |
| `calendar-weekdays` | The weekday header row |
| `calendar-grid` | The date grid |
| `day` | A date cell button |
| `calendar-footer` | The row holding the "Today"/"Clear" quick-action buttons |
| `calendar-time` | The row holding the time-of-day input (`mode="datetime"` only) |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--date-picker-popover-width` | Width of the calendar popover (default: 296px, independent of trigger width — a fixed-width calendar reads more naturally) |
