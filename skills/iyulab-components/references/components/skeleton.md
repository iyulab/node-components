# u-skeleton

```ts
import '@iyulab/components/dist/components/skeleton/USkeleton.js';
```

**Tag:** `u-skeleton`

Placeholder shape displayed while content is loading.

```html
<!-- Text line -->
<u-skeleton width="200px" height="1rem"></u-skeleton>

<!-- Circle avatar placeholder -->
<u-skeleton shape="circle" width="48px" height="48px"></u-skeleton>

<!-- Card placeholder -->
<u-skeleton shape="rounded" width="100%" height="120px" effect="shimmer"></u-skeleton>

<!-- Paragraph / list-row placeholder: 3 stacked bars, last one shortened -->
<u-skeleton lines="3" height="1em"></u-skeleton>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Content (hidden while skeleton is visible) |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `shape` | `'rectangle'\|'circle'\|'rounded'` | `'rectangle'` | ✓ | Shape of the placeholder |
| `effect` | `'none'\|'pulse'\|'shimmer'` | `'shimmer'` | ✓ | Animation style |
| `width` | `string` | — | — | CSS width value |
| `height` | `string` | — | — | CSS height value |
| `lines` | `number` | — | ✓ | Draw N stacked bars instead of one (takes effect at 2+); the last bar is shortened |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--skeleton-width` | Override width |
| `--skeleton-height` | Override height |
| `--skeleton-color` | Base placeholder color |
| `--skeleton-shimmer-color` | Shimmer highlight color |
| `--skeleton-line-gap` | Gap between bars when `lines` is set (default `0.5em`) |
| `--skeleton-last-line-width` | Width of the last bar when `lines` is set (default `60%`) |

## CSS Parts

| Part | Description |
|------|-------------|
| `line` | One bar of a multi-line placeholder (only rendered when `lines` is set) |
