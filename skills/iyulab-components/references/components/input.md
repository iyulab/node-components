# u-input

```ts
import '@iyulab/components/dist/components/input/UInput.js';
```

**Tag:** `u-input`

Text input field with prefix/suffix slots and label. Add `u-option` children for combobox (autocomplete) mode. Form-associated.

```html
<u-input name="search" type="search" placeholder="Search..." clearable></u-input>

<!-- With icon prefix -->
<u-input name="email" type="email" label="Email" required>
  <u-icon slot="prefix" lib="tabler" name="mail"></u-icon>
</u-input>

<!-- Combobox mode -->
<u-input name="country" placeholder="Select country">
  <u-option value="us">United States</u-option>
  <u-option value="kr">South Korea</u-option>
</u-input>
```

---

## Slots

| Name | Description |
|------|-------------|
| `prefix` | Leading content (icon, text) |
| *(default)* | `u-option` elements for combobox mode |
| `suffix` | Trailing content |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `variant` | `'outlined'\|'filled'\|'underlined'\|'borderless'` | `'outlined'` | ✓ | Visual style |
| `type` | `'text'\|'password'\|'email'\|'tel'\|'url'\|'search'\|'number'\|'date'\|'time'`… | `'text'` | — | Input type |
| `placeholder` | `string` | — | — | Placeholder text |
| `clearable` | `boolean` | `false` | ✓ | Show clear button |
| `minlength` | `number` | — | — | Minimum character count |
| `maxlength` | `number` | — | — | Maximum character count |
| `min` | `string` | — | — | Minimum value (number/date) |
| `max` | `string` | — | — | Maximum value |
| `step` | `number` | — | — | Step increment |
| `pattern` | `string` | — | — | Regex validation pattern |
| `autofocus` | `boolean` | `false` | — | Auto-focus on render |
| `autocomplete` | `AutoFill` | — | — | Browser autocomplete |
| `spellcheck` | `boolean` | `false` | — | Spellcheck |
| `disabled` | `boolean` | `false` | ✓ | Disabled |
| `readonly` | `boolean` | `false` | ✓ | Read-only |
| `required` | `boolean` | `false` | ✓ | Required |
| `invalid` | `boolean` | `false` | ✓ | Validation failed |
| `name` | `string` | — | — | Form field name |
| `value` | `string` | — | — | Current value |
| `label` | `string` | — | — | Field label |
| `description` | `string` | — | — | Helper text |
| `validationMessage` | `string` | — | — | Custom validation message |

## Events

| Event | Description |
|-------|-------------|
| `input` | Fires on every keystroke |
| `change` | Fires when value is committed |

## Methods

| Method | Description |
|--------|-------------|
| `validate()` | Validate; sets `invalid` |
| `reset()` | Clear value and validation state |
| `focus(options?)` | Focus the input |
| `blur()` | Blur the input |

## CSS Parts

| Part | Description |
|------|-------------|
| `field` | Outer field wrapper |
| `container` | Input area wrapper |
| `input` | Native `<input>` element |
| `popover` | Combobox dropdown |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--input-popover-min-width` | Combobox popover min-width |
| `--input-popover-max-width` | Combobox popover max-width |
| `--input-popover-min-height` | Combobox popover min-height |
| `--input-popover-max-height` | Combobox popover max-height |
