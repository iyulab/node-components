# u-button

```ts
import '@iyulab/components/dist/components/button/UButton.js';
```

**Tag:** `u-button`

Versatile button with multiple appearances. Renders as an `<a>` element when `href` is provided.

```html
<u-button>Default</u-button>
<u-button appearance="outlined">Outlined</u-button>
<u-button appearance="plain" loading>Loading</u-button>
<u-button href="https://example.com" target="_blank">Link</u-button>

<!-- Semantic color (independent of appearance) -->
<u-button appearance="solid" color="red">Delete</u-button>
<u-button appearance="soft" color="green">Approve</u-button>
<u-button color="neutral">Cancel</u-button>

<!-- Size -->
<u-button size="sm">Small</u-button>
<u-button size="lg">Large</u-button>

<!-- With prefix/suffix icons -->
<u-button appearance="solid">
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
| `appearance` | `'solid'\|'soft'\|'outlined'\|'plain'\|'link'` | `'solid'` | ✓ | How much chrome: `solid` filled with the colour · `soft` tint, no outline · `outlined` · `plain` no chrome · `link` |
| `color` | `'neutral'\|'primary'\|'info'\|'success'\|'warning'\|'danger'\|'blue'\|'green'\|'red'\|'orange'\|'teal'\|'cyan'\|'purple'\|'pink'` | `'primary'` | ✓ | Color, independent of `appearance`. `primary` is the brand colour; `neutral` is an achromatic (grey) button (see notes below). |
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

- `solid`/`soft`/`outlined`: background/border switch to the chosen color's scale. `neutral` is an achromatic (grey) button — the brand colour is `primary` (the default).
- `plain`/`link`: these have no fill, so for `primary` (the default) and `neutral` they keep body text (`plain`) or link text (`link`); any other `color` switches the text color (e.g. `appearance="link" color="danger"` for a destructive link).

## Accessibility

Set ARIA on the `u-button` host as you would on a native button — the component moves it to the
inner `<button>`/`<a>` that actually takes focus: `aria-label`, and the button states
`aria-pressed` (toggle), `aria-expanded` + `aria-controls` (disclosure) and `aria-haspopup`
(menu button). `aria-pressed` is dropped on a link (`href`), where it is not allowed.
`aria-controls` is an id reference, which cannot cross the shadow boundary, so it is carried as an
element reference (`ariaControlsElements`) resolved when the button renders.

```html
<u-button aria-expanded="false" aria-controls="details">Details</u-button>
<u-button aria-pressed="true">Bold</u-button>
```

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
| `--u-primary-color` | Base color for the default `color="primary"` — set it and hover/active/soft tones auto-derive via `color-mix()` |
| `--btn-color` | The button's **fill** color. Every derived token below is `color-mix()`'d from this one — usually the only one you need to override |
| `--btn-txt-color` | Text color on the fill, read by `appearance="solid"` (default `#fff`, or `--u-{role}-txt-color` when a semantic `color` is set) |
| `--btn-color-strong` | Text color on the surrounding page background, read by `appearance="link"` and `"plain"` — opposite contrast need from the fill, so it's a separate token (default: same as `--btn-color`, or `--u-{role}-color-strong` for a semantic `color`) |
| `--btn-color-hover` / `--btn-color-active` | `solid` background hover/active (default: `--btn-color` at 85%/70% + black) |
| `--btn-color-surface` / `-hover` / `-active` | `soft` background states — role colors (`primary`·`info`·`success`·`warning`·`danger`) use `--u-{role}-bg-color` and deepen it with 18%/30% of `--btn-color`; other colors mix `--btn-color` at 12%/22%/32%. A colored `plain` button hovers onto the same surface |
| `--btn-color-border` / `-hover` / `-active` | Border states (default: `--btn-color` at 45%/60%/75%) |
| `--btn-color-outline-hover` / `-active` | `outlined`/`plain` background hover/active (default: 6%/12%) |
| `--btn-color-strong-hover` / `-active` | `link` text hover/active — the role value itself doesn't move; hover adds an underline instead (default: `--btn-color-strong` at 85%/70% + black) |
| `--btn-border-color` | Border color read by appearance/hover/active rules (default: `transparent`) |
| `--btn-padding-block` | Vertical inner padding (default `0.5em`) |
| `--btn-padding-inline` | Horizontal inner padding (default `1em`, `0` for `appearance="link"`) — overriding it does not change the min-height, which is derived from `--btn-padding-block` instead |
