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

For registering custom libraries, see [icons.md](../utilities/icons.md).

---

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `lib` | `'internal'\|'tabler'\|'heroicons'\|'lucide'\|'bootstrap'\|string` | — | Icon library identifier |
| `name` | `string` | — | Icon name (library-specific; append `:filled` / `:solid` for filled variants) |
| `src` | `string` | — | Raw SVG string (overrides `lib`/`name`) |

## CSS Parts

| Part | Description |
|------|-------------|
| `svg` | The rendered `<svg>` element |
