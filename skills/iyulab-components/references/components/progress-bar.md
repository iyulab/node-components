# u-progress-bar

```ts
import '@iyulab/components/dist/components/progress-bar/UProgressBar.js';
```

**Tag:** `u-progress-bar`

Linear progress indicator. Supports buffer, segments, striped effect, and indeterminate state.

```html
<u-progress-bar value="60"></u-progress-bar>

<u-progress-bar value="40" buffer="70" status="info"></u-progress-bar>

<u-progress-bar value="30" striped rounded indeterminate></u-progress-bar>

<!-- Segmented -->
<u-progress-bar value="75" segments="5" status="success"></u-progress-bar>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Content overlaid on top of the bar |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `number` | `0` | Current progress value |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `buffer` | `number` | — | Buffer level (secondary fill) |
| `indeterminate` | `boolean` | `false` | Animated indeterminate state |
| `striped` | `boolean` | `false` | Striped fill pattern |
| `rounded` | `boolean` | `false` | Rounded bar ends |
| `status` | `'default'\|'success'\|'warning'\|'error'\|'info'` | `'default'` | Color preset |
| `segments` | `number` | `0` | Split into N segments |
| `segmentGap` | `number` | `3` | Gap between segments in px |

## CSS Parts

| Part | Description |
|------|-------------|
| `buffer` | Buffer fill track |
| `indicator` | Progress fill |
| `segments` | Segment dividers overlay |
| `content` | Default slot wrapper |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--progress-bar-height` | Bar height |
| `--progress-bar-color` | Fill color |
| `--progress-bar-track-color` | Track (background) color |
| `--progress-bar-buffer-color` | Buffer fill color |
