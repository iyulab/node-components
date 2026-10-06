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

## Accessibility

A `radiogroup` (named by `label`) of radios named `1`…`max` — a screen reader adds the position ("3 of 5").

**Keyboard** — like a native radio group: one Tab stop (the chosen star, or the first when there is none);
`ArrowRight`/`ArrowUp` and `ArrowLeft`/`ArrowDown` move **and choose** (firing `change`), `Home`/`End` choose the
first/last; `Space`/`Enter` choose the focused star (again on the chosen one clears it). `focus()` goes to the Tab stop.

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
| `focus(options?)` | Focus the first symbol (regardless of value) |
| `blur()` | Blur the currently focused symbol, if any |

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
