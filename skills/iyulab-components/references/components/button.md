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
| `color` | `'neutral'\|'primary'\|'info'\|'success'\|'warning'\|'danger'\|'blue'\|'green'\|'red'\|'orange'\|'teal'\|'cyan'\|'purple'\|'pink'` | `'neutral'` | ✓ | Semantic color, independent of `variant`. `ghost` is unaffected (see notes below). |
| `size` | `'sm'\|'md'\|'lg'` | `'md'` | ✓ | Button size (12px/14px/16px font-size; padding, spinner, and icon slots scale proportionally). |
| `rounded` | `boolean` | `false` | ✓ | Pill-shaped border radius |
| `disabled` | `boolean` | `false` | ✓ | Disable the button |
| `loading` | `boolean` | `false` | ✓ | Show loading spinner; disables interaction |
| `type` | `'button'\|'submit'\|'reset'` | `'button'` | — | Button `type` attribute |
| `name` | `string` | — | ✓ | Form field name — submitted with the form |
| `value` | `string` | — | ✓ | Form field value — submitted with the form |
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

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--u-primary-color` | Base color when `color="neutral"` — set it and hover/active/surface tones auto-derive via `color-mix()` |
| `--btn-color` | The button's **fill** color. Every derived token below is `color-mix()`'d from this one — usually the only one you need to override |
| `--btn-txt-color` | Text color on the fill, read by `variant="solid"` (default `#fff`, or `--u-{role}-txt-color` when a semantic `color` is set) |
| `--btn-color-strong` | Text color on the surrounding page background, read by `variant="link"` — opposite contrast need from the fill, so it's a separate token (default: same as `--btn-color`, or `--u-{role}-color-strong` for a semantic `color`) |
| `--btn-color-hover` / `--btn-color-active` | `solid` background hover/active (default: `--btn-color` at 85%/70% + black) |
| `--btn-color-surface` / `-hover` / `-active` | `surface` background states (default: `--btn-color` at 12%/22%/32%) |
| `--btn-color-border` / `-hover` / `-active` | Border states (default: `--btn-color` at 45%/60%/75%) |
| `--btn-color-outline-hover` / `-active` | `outlined`/`ghost` background hover/active (default: 6%/12%) |
| `--btn-color-strong-hover` / `-active` | `link` text hover/active — the role value itself doesn't move; hover adds an underline instead (default: `--btn-color-strong` at 85%/70% + black) |
| `--btn-border-color` | Border color read by variant/hover/active rules (default: `transparent`) |
| `--btn-padding-block` | Vertical inner padding (default `0.5em`) |
| `--btn-padding-inline` | Horizontal inner padding (default `1em`, `0` for `variant="link"`) — overriding it does not change the min-height, which is derived from `--btn-padding-block` instead |
