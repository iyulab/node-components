# u-date-picker

```ts
import '@iyulab/components/dist/components/date-picker/UDatePicker.js';
```

**Tag:** `u-date-picker`

Single-date selection with a popover calendar. The value follows the same convention as the native `input[type=date]`: an ISO `YYYY-MM-DD` string. Form-associated.

```html
<u-date-picker name="start-date" label="Start date"></u-date-picker>

<!-- Clearable with a bounded range -->
<u-date-picker name="due-date" label="Due date" clearable min="2026-01-01" max="2026-12-31"></u-date-picker>
```

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | — | — | Selected date (ISO `YYYY-MM-DD`) |
| `min` | `string` | — | — | Minimum selectable date (ISO `YYYY-MM-DD`) |
| `max` | `string` | — | — | Maximum selectable date (ISO `YYYY-MM-DD`) |
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
| `change` | Fires when the user clicks a date cell, confirms via keyboard, or clicks the clear button. Programmatic value assignment does not fire it. |

## Methods

| Method | Description |
|--------|--------------|
| `validate()` | Validate; sets `invalid` |
| `reset()` | Reset value |

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

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--date-picker-popover-width` | Width of the calendar popover (default: 296px, independent of trigger width — a fixed-width calendar reads more naturally) |
