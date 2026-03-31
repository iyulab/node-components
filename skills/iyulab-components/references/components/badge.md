# u-badge

```ts
import '@iyulab/components/dist/components/badge/UBadge.js';
```

**Tag:** `u-badge`

Status badge for numbers, labels, or dot indicators. Use `anchor` to position it absolutely on a parent element.

```html
<!-- Standalone -->
<u-badge color="red">5</u-badge>

<!-- Anchored on another element -->
<div style="position:relative; display:inline-block;">
  <u-icon lib="tabler" name="bell"></u-icon>
  <u-badge variant="dot" color="red" anchor="top-right"></u-badge>
</div>
```

---

## Slots

| Name | Description |
|------|-------------|
| `prefix` | Content before the main label |
| *(default)* | Badge label (text or icon) |
| `suffix` | Content after the main label |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `variant` | `'pill'\|'dot'\|'square'` | `'pill'` | ✓ | Shape variant; `dot` renders no content |
| `color` | `'neutral'\|'blue'\|'green'\|'yellow'\|'red'\|'orange'\|'teal'\|'cyan'\|'purple'\|'pink'` | `'neutral'` | ✓ | Badge color |
| `anchor` | `'top-right'\|'top-left'\|'bottom-right'\|'bottom-left'` | — | ✓ | Absolute anchor position relative to parent |
