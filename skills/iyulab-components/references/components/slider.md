# u-slider

```ts
import '@iyulab/components/dist/components/slider/USlider.js';
```

**Tag:** `u-slider`

Range slider. Single-thumb or dual-thumb (range) mode. Supports marks, value display, and tooltip on drag. Form-associated.

```html
<u-slider name="volume" value="50"></u-slider>

<!-- Range mode -->
<u-slider name="priceRange" range value="[20,80]"></u-slider>

<!-- With marks and tooltip -->
<u-slider name="steps" min="0" max="100" step="25" show-tooltip>
</u-slider>
```

---

## Slots

| Name | Description |
|------|-------------|
| `thumb` | Custom thumb handle (single or start thumb in range mode) |
| `thumb-end` | Custom end thumb handle (range mode only) |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `number \| number[]` | — | Current value (array for range mode) |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step size |
| `range` | `boolean` | `false` | Enable dual-thumb range mode |
| `showValue` | `boolean` | `false` | Display current value next to slider |
| `showTooltip` | `boolean` | `false` | Show value tooltip while dragging |
| `formatter` | `(v: number) => string` | — | Custom value formatter |
| `marks` | `SliderMark[]` | — | Tick marks (`{ value, label? }`) |
| `offset` | `number` | — | Start value offset (single mode) |
| `disabled` | `boolean` | `false` | Disable |
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
| `container` | Track and thumbs container |
| `track` | Slider track |
| `fill` | Filled portion of track |
| `thumb` | Start/single thumb |
| `thumb-end` | End thumb (range mode) |
| `thumb-tooltip` | Drag tooltip |
| `mark` | Tick mark dot |
| `mark-label` | Tick mark label |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--slider-fill-color` | Track fill color |
| `--slider-track-height` | Track height |
| `--slider-track-color` | Track background color |
| `--slider-thumb-size` | Thumb diameter |
| `--slider-thumb-color` | Thumb fill color |
| `--slider-thumb-border-color` | Thumb border color |
| `--slider-mark-size` | Mark dot size |
| `--slider-mark-color` | Mark dot color |
