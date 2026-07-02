# u-button

```ts
import '@iyulab/components/dist/components/button/UButton.js';
```

**Tag:** `u-button`

Versatile button with multiple visual variants. Renders as an `<a>` element when `href` is provided.

```html
<u-button>Default</u-button>
<u-button variant="outlined">Outlined</u-button>
<u-button variant="ghost" loading>Loading</u-button>
<u-button href="https://example.com" target="_blank">Link</u-button>

<!-- Semantic color (independent of variant) -->
<u-button variant="solid" color="red">Delete</u-button>
<u-button variant="surface" color="green">Approve</u-button>

<!-- Size -->
<u-button size="sm">Small</u-button>
<u-button size="lg">Large</u-button>

<!-- With prefix/suffix icons -->
<u-button variant="solid">
  <u-icon slot="prefix" lib="tabler" name="download"></u-icon>
  Download
</u-button>
```

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | Button label |
| `prefix` | Content before the label |
| `suffix` | Content after the label |
| `spinner` | Custom spinner shown when `loading` |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `variant` | `'solid'\|'surface'\|'filled'\|'outlined'\|'ghost'\|'link'` | `'solid'` | ✓ | Visual style |
| `color` | `'neutral'\|'blue'\|'green'\|'red'\|'orange'\|'teal'\|'cyan'\|'purple'\|'pink'` | `'neutral'` | ✓ | Semantic color, independent of `variant`. `ghost` is unaffected (see notes below). |
| `size` | `'sm'\|'md'\|'lg'` | `'md'` | ✓ | Button size (12px/14px/16px font-size; padding, spinner, and icon slots scale proportionally). |
| `rounded` | `boolean` | `false` | ✓ | Pill-shaped border radius |
| `disabled` | `boolean` | `false` | ✓ | Disable the button |
| `loading` | `boolean` | `false` | ✓ | Show loading spinner; disables interaction |
| `type` | `'button'\|'submit'\|'reset'` | `'button'` | — | Button `type` attribute |
| `href` | `string` | — | — | Link URL (renders as `<a>`) |
| `target` | `string` | — | — | Link `target` |
| `rel` | `string` | — | — | Link `rel` |
| `download` | `string` | — | — | Download filename |

### `color` notes

- `solid`/`surface`/`filled`/`outlined`: background/border switch to the chosen color's scale.
- `link`: text color switches, but only when `color` is set to something other than `"neutral"` — the default `link` look stays blue (backward compatible).
- `ghost`: no visual effect — its hover/active backgrounds use generic surface tokens (`--u-bg-color-hover`/`--u-bg-color-active`), not the neutral color scale.

## CSS Parts

| Part | Description |
|------|-------------|
| `button` | Inner `<button>` element |
| `link` | Inner `<a>` element (when `href` is set) |
| `content` | Content wrapper (prefix + label + suffix) |
| `mask` | Loading overlay mask |
