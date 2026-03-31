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
| `rounded` | `boolean` | `false` | ✓ | Pill-shaped border radius |
| `disabled` | `boolean` | `false` | ✓ | Disable the button |
| `loading` | `boolean` | `false` | ✓ | Show loading spinner; disables interaction |
| `type` | `'button'\|'submit'\|'reset'` | `'button'` | — | Button `type` attribute |
| `href` | `string` | — | — | Link URL (renders as `<a>`) |
| `target` | `string` | — | — | Link `target` |
| `rel` | `string` | — | — | Link `rel` |
| `download` | `string` | — | — | Download filename |

## CSS Parts

| Part | Description |
|------|-------------|
| `button` | Inner `<button>` element |
| `link` | Inner `<a>` element (when `href` is set) |
| `content` | Content wrapper (prefix + label + suffix) |
| `mask` | Loading overlay mask |
