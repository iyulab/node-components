# u-radio

```ts
import '@iyulab/components/dist/components/radio/URadio.js';
import '@iyulab/components/dist/components/option/UOption.js';
```

**Tag:** `u-radio`

Radio group built from `u-option` children. Form-associated.

```html
<u-radio name="size" value="md">
  <u-option value="sm">Small</u-option>
  <u-option value="md">Medium</u-option>
  <u-option value="lg">Large</u-option>
</u-radio>

<!-- Button style, horizontal -->
<u-radio name="plan" type="button" orientation="horizontal" variant="outlined">
  <u-option value="free">Free</u-option>
  <u-option value="pro">Pro</u-option>
  <u-option value="enterprise">Enterprise</u-option>
</u-radio>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | `u-option` elements |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `value` | `string` | — | — | Currently selected value |
| `type` | `'default'\|'button'` | `'default'` | ✓ | `button` renders options as toggle buttons |
| `variant` | `'filled'\|'outlined'` | `'filled'` | ✓ | Visual style |
| `orientation` | `'vertical'\|'horizontal'` | `'vertical'` | ✓ | Layout direction |
| `disabled` | `boolean` | `false` | ✓ | Disable all options |
| `readonly` | `boolean` | `false` | ✓ | Read-only |
| `required` | `boolean` | `false` | ✓ | Required |
| `invalid` | `boolean` | `false` | ✓ | Validation failed |
| `name` | `string` | — | — | Form field name |

## Events

| Event | Description |
|-------|-------------|
| `change` | Fires when selection changes |

## Methods

| Method | Description |
|--------|-------------|
| `validate()` | Validate; sets `invalid` |
| `reset()` | Reset selection |
| `focus(options?)` | Focus the first option (regardless of selection) |
| `blur()` | Blur the currently focused option, if any |

## CSS Parts

| Part | Description |
|------|-------------|
| `field` | Outer field wrapper |
| `container` | Options container |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--radio-color` | Base color of the selected state (default `--u-primary-color`) |
| `--radio-color-active` | Selected-state active tone (default `--radio-color` at 85% + black) |
