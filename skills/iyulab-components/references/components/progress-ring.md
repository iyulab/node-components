# u-progress-ring

```ts
import '@iyulab/components/dist/components/progress-ring/UProgressRing.js';
```

**Tag:** `u-progress-ring`

Circular progress indicator. Supports buffer, segments, and indeterminate state.

```html
<u-progress-ring value="75"></u-progress-ring>

<u-progress-ring value="50" status="success" rounded>
  50%
</u-progress-ring>

<u-progress-ring indeterminate></u-progress-ring>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Content rendered in the center of the ring |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `number` | `0` | Current progress value |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `buffer` | `number` | — | Buffer level |
| `indeterminate` | `boolean` | `false` | Animated indeterminate state |
| `rounded` | `boolean` | `false` | Round stroke line caps |
| `status` | `'default'\|'success'\|'warning'\|'error'\|'info'` | `'default'` | Color preset |
| `segments` | `number` | `0` | Split into N arc segments |
| `segmentGap` | `number` | `2` | Gap between segments (path length units) |

## CSS Parts

| Part | Description |
|------|-------------|
| `svg` | Root SVG element |
| `content` | Center slot wrapper |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--progress-ring-size` | Outer diameter |
| `--progress-ring-color` | Arc fill color |
| `--progress-ring-track-width` | Stroke width |
| `--progress-ring-track-color` | Track (background arc) color |
| `--progress-ring-buffer-color` | Buffer arc color |
