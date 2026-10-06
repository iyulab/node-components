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

<u-icon-button appearance="outlined" rounded lib="heroicons" name="plus:solid">
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
| `appearance` | `'solid'\|'soft'\|'outlined'\|'plain'\|'link'` | `'plain'` | ✓ | Button appearance (see [`u-button`](./button.md)) |
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

## Accessibility

The icon has no text, so the button is named by its tooltip text (the default slot) — or by an `aria-label`
on the host, which wins. One of the two is required. `aria-label` and the button states
(`aria-pressed`, `aria-expanded`, `aria-controls`, `aria-haspopup`) set on the host reach the
inner button, as on `u-button`.

## CSS Parts

| Part | Description |
|------|-------------|
| `button` | Inner `<button>` or `<a>` |
| `icon` | `u-icon` element |
| `tooltip` | Built-in `u-tooltip` element |
