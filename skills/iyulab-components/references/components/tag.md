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
| `color` | `'neutral'\|'blue'\|'green'\|'yellow'\|'red'\|'orange'\|'teal'\|'cyan'\|'purple'\|'pink'` | `'neutral'` | ✓ | Color |
| `rounded` | `boolean` | `false` | ✓ | Pill shape |

## CSS Parts

| Part | Description |
|------|-------------|
| `content` | Inner content wrapper |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--tag-color` | Text color |
| `--tag-bg-color` | Background color |
| `--tag-border-color` | Border color |
