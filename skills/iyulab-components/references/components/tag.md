# u-tag

```ts
import '@iyulab/components/dist/components/tag/UTag.js';
```

**Tag:** `u-tag`

Non-interactive label tag for categories, status, or metadata display.

```html
<u-tag>Default</u-tag>
<u-tag color="blue" variant="outlined">TypeScript</u-tag>
<u-tag color="green" rounded>Active</u-tag>

<!-- With icon prefix -->
<u-tag color="red">
  <u-icon slot="prefix" lib="tabler" name="alert-circle"></u-icon>
  Error
</u-tag>
```

For interactive chips (selectable/removable), use [`u-chip`](./chip.md) instead.

---

## Slots

| Name | Description |
|------|-------------|
| `prefix` | Leading content |
| *(default)* | Tag label |
| `suffix` | Trailing content |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `variant` | `'solid'\|'surface'\|'filled'\|'outlined'` | `'filled'` | ✓ | Visual style |
| `color` | `'neutral'\|'primary'\|'info'\|'success'\|'warning'\|'danger'\|'blue'\|'green'\|'yellow'\|'red'\|'orange'\|'teal'\|'cyan'\|'purple'\|'pink'` | `'neutral'` | ✓ | Color |
| `rounded` | `boolean` | `false` | ✓ | Pill shape |
| `icon` | `boolean` | `false` | ✓ | Adds a status icon so the meaning survives without color (`info`/`success`/`warning`/`danger` only) |

## CSS Parts

| Part | Description |
|------|-------------|
| `content` | Inner content wrapper |
| `icon` | Status icon (rendered only with `icon` + a semantic `color`) |

## Color axes

`color` carries **two** axes. The **role** axis (`primary`·`info`·`success`·`warning`·`danger`)
means *semantics* — it follows re-branding and inherits the contrast contract. The **decorative**
axis (`blue`·`purple` …) means *the color itself* and is deliberately immune to re-branding.

`icon` only applies to the four **status** roles — `neutral` and `primary` are not states, and the
decorative axis carries no meaning, so no icon is drawn there.

```html
<!-- distinguishable in grayscale / for color-vision deficiency -->
<u-tag color="danger" icon>Failed</u-tag>
<u-tag color="success" icon>Done</u-tag>
```

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--tag-color` | Text color |
| `--tag-bg-color` | Background color |
| `--tag-border-color` | Border color |
