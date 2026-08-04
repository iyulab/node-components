# u-icon

```ts
import '@iyulab/components/dist/components/icon/UIcon.js';
```

**Tag:** `u-icon`

Renders an SVG icon by name from a registered icon library. Inline `src` also accepted.

```html
<!-- Built-in -->
<u-icon lib="internal" name="check-circle-fill"></u-icon>

<!-- Tabler (CDN) -->
<u-icon lib="tabler" name="home"></u-icon>
<u-icon lib="tabler" name="home:filled"></u-icon>

<!-- Heroicons -->
<u-icon lib="heroicons" name="academic-cap:solid"></u-icon>

<!-- Lucide -->
<u-icon lib="lucide" name="activity"></u-icon>

<!-- Bootstrap Icons -->
<u-icon lib="bootstrap" name="alarm"></u-icon>
<u-icon lib="bootstrap" name="alarm:filled"></u-icon>

<!-- Inline SVG -->
<u-icon src='<svg ...>...</svg>'></u-icon>
```

```html
<!-- Fallback: drawn when the name does not resolve -->
<u-icon name="might-not-exist" fallback='<svg viewBox="0 0 16 16">...</svg>'></u-icon>
```

For registering custom libraries, see [icons.md](../utilities/icons.md).

> **When you need `fallback`.** An icon that fails to resolve renders nothing. That is usually
> harmless — but not where the icon is the only hit target. A collapsed sidebar hides labels, so
> a nav item with no visible icon becomes an **empty row the user cannot click**: the screen
> becomes unreachable. `fallback` covers all three failure modes (no `name`, 404, unparseable SVG).
> Keep the fallback **inline**; a fallback that fetches reproduces the very failure it covers.

---

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `lib` | `'internal'\|'tabler'\|'heroicons'\|'lucide'\|'bootstrap'\|string` | — | Icon library identifier |
| `name` | `string` | — | Icon name (library-specific; append `:filled` / `:solid` for filled variants) |
| `src` | `string` | — | Raw SVG string (overrides `lib`/`name`) |
| `fallback` | `string` | — | Raw SVG drawn when `name`/`src` cannot be resolved (missing, 404, or unparseable) |

## CSS Parts

| Part | Description |
|------|-------------|
| `svg` | The rendered `<svg>` element |
