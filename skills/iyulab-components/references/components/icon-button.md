# u-icon-button

```ts
import '@iyulab/components/dist/components/icon-button/UIconButton.js';
```

**Tag:** `u-icon-button`

Square icon-only button with a built-in tooltip (shown from the default slot). Renders as `<a>` when `href` is set.

```html
<u-icon-button lib="tabler" name="trash">
  Delete
</u-icon-button>

<u-icon-button variant="outlined" rounded lib="heroicons" name="plus:solid">
  Add item
</u-icon-button>

<u-icon-button href="/settings" lib="tabler" name="settings">
  Settings
</u-icon-button>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Tooltip content (shown on hover) |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `variant` | `'solid'\|'surface'\|'filled'\|'outlined'\|'ghost'\|'link'` | `'ghost'` | ✓ | Button variant |
| `rounded` | `boolean` | `false` | ✓ | Circular shape |
| `disabled` | `boolean` | `false` | ✓ | Disable the button |
| `loading` | `boolean` | `false` | ✓ | Loading state |
| `href` | `string` | — | — | Link URL (renders as `<a>`) |
| `target` | `string` | — | — | Link `target` |
| `rel` | `string` | — | — | Link `rel` |
| `lib` | `string` | — | — | Icon library |
| `name` | `string` | — | — | Icon name |
| `src` | `string` | — | — | Raw SVG source |
| `tooltipPlacement` | `Placement` | `'top'` | — | Tooltip position |
| `tooltipOffset` | `OffsetOptions` | `4` | — | Tooltip offset from button |

## CSS Parts

| Part | Description |
|------|-------------|
| `button` | Inner `<button>` or `<a>` |
| `icon` | `u-icon` element |
| `tooltip` | Built-in `u-tooltip` element |
