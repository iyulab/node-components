# Theming

`@iyulab/components` uses CSS custom properties for theming. All design tokens are defined in `src/assets/styles/light.css` and `dark.css`, which are injected by `Theme.init()`.

---

## Initialization

```ts
import { Theme } from '@iyulab/components';

await Theme.init({
  default: 'system',     // 'light' | 'dark' | 'system'
  useBuiltIn: true,      // inject light.css / dark.css (default: true)
  store: {               // persist to localStorage (optional)
    type: 'localStorage',
    key: 'theme'
  }
});
```

`useBuiltIn: false` is used when you provide your own CSS variable definitions.

---

## Color Token System

All tokens follow `--u-{color}-{shade}`:

| Color | Variable prefix |
|-------|----------------|
| Neutral (grays) | `--u-neutral-` |
| Blue | `--u-blue-` |
| Green | `--u-green-` |
| Yellow | `--u-yellow-` |
| Red | `--u-red-` |
| Orange | `--u-orange-` |
| Teal | `--u-teal-` |
| Cyan | `--u-cyan-` |
| Purple | `--u-purple-` |
| Pink | `--u-pink-` |

Shade scale: `0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000`

Example:
```css
--u-blue-500: #2196F3;   /* primary blue */
--u-neutral-100: #F5F5F5; /* light background */
```

---

## How Theme Switching Works

1. `Theme.init()` reads the stored preference (if `store` is configured) or uses `options.default`.
2. For `'system'`, a `prefers-color-scheme` media query listener is set up.
3. The matching stylesheet (`light.css` or `dark.css`) is injected into `document.head` as a `<style>` tag (or `adoptedStyleSheets`).
4. Switching via `Theme.set('dark')` replaces the injected sheet.

Components use the tokens internally, so all components automatically respond to theme changes.

---

## Custom Themes

You can override any token after `Theme.init()`:

```css
/* my-theme.css */
:root {
  --u-primary-color: #6200EA; /* global brand/accent color */
  --u-neutral-50: #1A1A2E; /* dark surface */
}
```

### Primary Color Token (`--u-primary-color`)

Interactive components now derive their accent states from `--u-primary-color`.

- A single override updates hover/active/surface/outline accents across major controls.
- Internally, components compute state colors with `color-mix()` from `--u-primary-color` instead of relying on a fixed palette token.

Typical affected components include `u-button`, `u-checkbox`, `u-radio`, `u-switch`, `u-tab-panel`, `u-badge`, and `u-tag`.

Or override per-component via CSS custom properties (see individual component docs):

```css
u-button {
  --btn-radius: 999px; /* pill buttons everywhere */
}
```

---

## Disabling Built-in Styles

To fully manage your own design system:

```ts
await Theme.init({ useBuiltIn: false });
```

Then provide all `--u-*` tokens yourself. Components will still read them from the document.

---

## Styling Internals with `::part()`

Tokens cover color and typography globally. For per-component presentation that is **an application design decision rather than a library default**, style the exposed CSS parts directly.

```css
u-input::part(input) { font-size: 1.125rem; }
u-input::part(container) { border-radius: 0.5rem; }
```

Each component's parts are listed in its `@csspart` JSDoc.

### Text Alignment

Components do not set `text-align` — they inherit the browser default. Alignment is a design decision, so apply it in your app:

```css
/* Right-align numeric inputs */
u-input[type="number"]::part(input) {
  text-align: right;
  font-variant-numeric: tabular-nums;  /* fixed-width digits */
}
```

Attribute selectors like `[type="number"]` only work on properties the component **reflects** back to the host element. `u-input` reflects `type`, `variant`, and `clearable`, so the selector above matches whether you set it as an HTML attribute or as a JS/React property. For non-reflected properties, select by a class you control instead:

```css
u-input.amount::part(input) { text-align: right; }
```

`font-variant-numeric: tabular-nums` is what makes right alignment actually useful — it locks digit width so place values line up. Without it, proportional digits leave the columns ragged.

> **Why isn't right alignment the default for numeric inputs?**
> Right alignment pays off when values are **stacked vertically** and place values are compared down a column — which is why [`@iyulab/flex-table`](https://github.com/iyulab/flex-table) right-aligns its number columns and cell editors. A standalone form field has no column to align against, and forcing it would silently shift existing layouts and push the value away from a currency symbol placed in the `prefix` slot. Opt in where the comparison context actually exists.

### Numeric Formatting

`u-input` does not format values (thousands separators, currency, locale decimals). Its `value` is the raw string the control holds, so it stays a faithful form primitive. Format for display in your app layer, or use a grid component such as `flex-table` when you need formatted, column-aligned numbers.
