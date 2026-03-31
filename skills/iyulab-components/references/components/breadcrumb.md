# u-breadcrumb / u-breadcrumb-item

```ts
import '@iyulab/components/dist/components/breadcrumb/UBreadcrumb.js';
import '@iyulab/components/dist/components/breadcrumb-item/UBreadcrumbItem.js';
```

**Tags:** `u-breadcrumb`, `u-breadcrumb-item`

Hierarchical location indicator. Compose `u-breadcrumb-item` elements inside `u-breadcrumb`.

```html
<u-breadcrumb>
  <u-breadcrumb-item href="/">Home</u-breadcrumb-item>
  <u-breadcrumb-item href="/products">Products</u-breadcrumb-item>
  <u-breadcrumb-item>Detail</u-breadcrumb-item>
</u-breadcrumb>

<!-- Custom separator -->
<u-breadcrumb>
  <span slot="separator">/</span>
  <u-breadcrumb-item href="/">Home</u-breadcrumb-item>
  <u-breadcrumb-item>Page</u-breadcrumb-item>
</u-breadcrumb>
```

---

## u-breadcrumb

### Slots

| Name | Description |
|------|-------------|
| *(default)* | `u-breadcrumb-item` elements |
| `separator` | Custom separator content (default: chevron icon) |

### CSS Parts

| Part | Description |
|------|-------------|
| `nav` | `<nav>` wrapper element |

---

## u-breadcrumb-item

### Slots

| Name | Description |
|------|-------------|
| `prefix` | Content before the label |
| *(default)* | Item label |
| `suffix` | Content after the label |

### Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `disabled` | `boolean` | `false` | ✓ | Disable the item |
| `href` | `string` | — | — | Link URL; renders as `<a>` when set |
| `target` | `string` | — | — | Link `target` attribute |
| `rel` | `string` | — | — | Link `rel` attribute |

### Events

| Event | Cancelable | Description |
|-------|------------|-------------|
| `navigate` | ✓ | Fires when the item is clicked |

### CSS Parts

| Part | Description |
|------|-------------|
| `link` | Inner `<a>` or `<span>` element |
