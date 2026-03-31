# u-rating

```ts
import '@iyulab/components/dist/components/rating/URating.js';
```

**Tag:** `u-rating`

Star/custom-symbol rating input. Supports fractional precision and custom symbols via slots. Form-associated.

```html
<u-rating name="score" value="3"></u-rating>

<!-- Half-star precision -->
<u-rating name="score" value="3.5" precision="0.5" max="5"></u-rating>

<!-- Custom symbols -->
<u-rating name="priority" max="3">
  <u-icon slot="symbol" lib="tabler" name="heart:filled"></u-icon>
  <u-icon slot="symbol-off" lib="tabler" name="heart"></u-icon>
</u-rating>
```

---

## Slots

| Name | Description |
|------|-------------|
| `symbol` | Active (filled) symbol |
| `symbol-off` | Inactive (empty) symbol |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `number` | — | Current rating value |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `5` | Maximum value (= number of symbols) |
| `precision` | `number` | `1` | Step size (e.g. `0.5` for half stars) |
| `disabled` | `boolean` | `false` | Disable interaction |
| `readonly` | `boolean` | `false` | Read-only |
| `required` | `boolean` | `false` | Required |
| `invalid` | `boolean` | `false` | Validation failed |
| `name` | `string` | — | Form field name |

## Events

| Event | Description |
|-------|-------------|
| `change` | Fires when value changes |

## Methods

| Method | Description |
|--------|-------------|
| `validate()` | Validate; sets `invalid` |
| `reset()` | Reset value |

## CSS Parts

| Part | Description |
|------|-------------|
| `field` | Outer wrapper |
| `container` | Symbols container |
| `symbol` | Individual symbol wrapper |
| `symbol-fg` | Filled portion overlay |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--rating-symbol-color` | Active symbol color |
| `--rating-symbol-off-color` | Inactive symbol color |
