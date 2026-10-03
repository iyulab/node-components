# u-tag

```ts
import '@iyulab/components/dist/components/tag/UTag.js';
```

**Tag:** `u-tag`

Non-interactive label tag for categories, status, or metadata display.

```html
<u-tag>Default</u-tag>
<u-tag color="blue" appearance="outlined">TypeScript</u-tag>
<u-tag color="green" rounded>Active</u-tag>
<u-tag color="success" dot>Shipped</u-tag>

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
| `appearance` | `'solid'\|'soft'\|'outlined'\|'plain'` | `'soft'` | ✓ | How much chrome: `solid` filled · `soft` tint · `outlined` · `plain` coloured text only |
| `color` | `'neutral'\|'primary'\|'info'\|'success'\|'warning'\|'danger'\|'blue'\|'green'\|'yellow'\|'red'\|'orange'\|'teal'\|'cyan'\|'purple'\|'pink'` | `'neutral'` | ✓ | Color — `neutral` (the default) is grey |
| `rounded` | `boolean` | `false` | ✓ | Pill shape |
| `icon` | `boolean` | `false` | ✓ | Adds a status icon so the meaning survives without color (`info`/`success`/`warning`/`danger` only) |
| `dot` | `boolean` | `false` | ✓ | Adds a small leading mark in the text colour — for status labels repeated down a table column. `icon` wins when both are set |

## CSS Parts

| Part | Description |
|------|-------------|
| `base` | Outer tag box |
| `content` | Inner content wrapper |
| `icon` | Status icon (rendered only with `icon` + a semantic `color`) |
| `dot` | Leading mark (rendered only with `dot`) |

## Color axes

`color` carries **two** axes. The **role** axis (`primary`·`info`·`success`·`warning`·`danger`)
means *semantics* — it follows re-branding and inherits the contrast contract. The **decorative**
axis (`blue`·`purple` …) means *the color itself* and is deliberately immune to re-branding.

`neutral` (the default) is **achromatic** — a grey label, the same meaning `neutral` has on `u-button`,
`u-badge` and `u-checkbox`. Use it for a label that should carry no colour at all — a status such as "Pending" next
to an `info` "Shipped". For a tag tinted with the brand colour, use `primary`.

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
| `--tag-dot-size` | Diameter of the leading `dot` (default 6px) |
