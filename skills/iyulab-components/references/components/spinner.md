# u-spinner

```ts
import '@iyulab/components/dist/components/spinner/USpinner.js';
```

**Tag:** `u-spinner`

Animated circular spinner for loading states. Optional label below the spinner via default slot.

```html
<u-spinner></u-spinner>

<u-spinner color="blue">Loading...</u-spinner>

<u-spinner color="green"></u-spinner>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Label text shown below the spinner |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `color` | `'neutral'\|'blue'\|'green'\|'yellow'\|'red'\|'orange'\|'teal'\|'cyan'\|'purple'\|'pink'` | — | ✓ | Spinner color preset |

## CSS Parts

| Part | Description |
|------|-------------|
| `svg` | Spinner SVG element |
| `label` | Label wrapper |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--spinner-track-width` | Track stroke width |
| `--spinner-track-color` | Track (background arc) color |
| `--spinner-indicator-color` | Animated arc color |
| `--spinner-indicator-speed` | Rotation animation duration |
