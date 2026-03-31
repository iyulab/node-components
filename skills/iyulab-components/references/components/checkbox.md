# u-checkbox

```ts
import '@iyulab/components/dist/components/checkbox/UCheckbox.js';
```

**Tag:** `u-checkbox`

Checkbox with `indeterminate` state support. Form-associated (`formAssociated = true`).

```html
<u-checkbox name="agree" required>I agree to the terms</u-checkbox>

<u-checkbox checked color="green" variant="outline">
  Enabled feature
</u-checkbox>

<!-- Indeterminate (partial selection) -->
<u-checkbox indeterminate>Select all</u-checkbox>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Label text |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `checked` | `boolean` | `false` | ✓ | Checked state |
| `indeterminate` | `boolean` | `false` | ✓ | Partial / indeterminate state |
| `variant` | `'filled'\|'outline'` | `'filled'` | ✓ | Visual style |
| `color` | `'blue'\|'green'\|'red'\|'orange'\|'teal'\|'cyan'\|'purple'\|'pink'\|'neutral'` | `'blue'` | ✓ | Accent color |
| `disabled` | `boolean` | `false` | ✓ | Disable the control |
| `readonly` | `boolean` | `false` | ✓ | Read-only |
| `required` | `boolean` | `false` | ✓ | Required field |
| `invalid` | `boolean` | `false` | ✓ | Validation failed state |
| `name` | `string` | — | — | Form field name |
| `value` | `string` | — | — | Submitted value |
| `label` | `string` | — | — | Label (alternative to slot) |
| `validationMessage` | `string` | — | — | Custom validation message |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `validate()` | `boolean` | Run validation; sets `invalid` |
| `reset()` | `void` | Clear value and validation state |

## CSS Parts

| Part | Description |
|------|-------------|
| `wrapper` | Outer layout wrapper |
| `input` | Hidden native `<input>` |
| `checkbox` | Visual checkbox box |
| `label` | Label text element |
| `description` | Description text |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--checkbox-color` | Checkmark color |
| `--checkbox-border-color` | Border color |
| `--checkbox-background-color` | Fill color when checked |
