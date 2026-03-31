# u-select

```ts
import '@iyulab/components/dist/components/select/USelect.js';
import '@iyulab/components/dist/components/option/UOption.js';
```

**Tag:** `u-select`

Dropdown select with single or multiple selection, search, and clear support. Form-associated.

```html
<u-select name="country" placeholder="Select country">
  <u-option value="us">United States</u-option>
  <u-option value="kr">South Korea</u-option>
  <u-option value="jp">Japan</u-option>
</u-select>

<!-- Multiple + searchable -->
<u-select name="tags" multiple searchable clearable max-count="3">
  <u-option value="js">JavaScript</u-option>
  <u-option value="ts">TypeScript</u-option>
  <u-option value="py">Python</u-option>
</u-select>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | `u-option` elements |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string \| string[]` | — | — | Selected value(s) |
| `variant` | `'outlined'\|'filled'\|'underlined'\|'borderless'` | `'outlined'` | ✓ | Visual style |
| `multiple` | `boolean` | `false` | ✓ | Allow multiple selections |
| `searchable` | `boolean` | `false` | ✓ | Filter options by text |
| `clearable` | `boolean` | `false` | ✓ | Show clear button |
| `loading` | `boolean` | `false` | ✓ | Loading state |
| `placeholder` | `string` | — | — | Placeholder text |
| `minCount` | `number` | — | — | Minimum required selections |
| `maxCount` | `number` | — | — | Maximum allowed selections |
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
| `change` | Fires when selection changes |

## Methods

| Method | Description |
|--------|-------------|
| `validate()` | Validate; sets `invalid` |
| `reset()` | Reset value |

## CSS Parts

| Part | Description |
|------|-------------|
| `field` | Outer field wrapper |
| `container` | Trigger area |
| `popover` | Dropdown list container |
| `search-input` | Search input inside dropdown |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--select-popover-min-width` | Dropdown min-width |
| `--select-popover-max-width` | Dropdown max-width |
| `--select-popover-min-height` | Dropdown min-height |
| `--select-popover-max-height` | Dropdown max-height |
