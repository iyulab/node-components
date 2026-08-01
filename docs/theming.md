# Theming

`@iyulab/components` uses CSS custom properties for theming. **Components cannot render correctly
without them** — every border, background, and color in the shadow styles resolves through
`var(--u-…)`, and an undefined custom property makes the whole declaration invalid. CSS emits no
error when this happens: controls simply lose their borders and backgrounds, silently.

So the first question for any app is **how the tokens get into the document.** There are two ways,
and you need exactly one of them.

---

## Getting the tokens in (required)

### Option A — static CSS import (no runtime call)

```ts
import '@iyulab/components/styles/tokens.css';   // light + dark in one file
```

Dark mode activates when the document has `theme="dark"`; `tokens.css` scopes it as
`:root[theme="dark"]`, so both sheets coexist safely.

Use this when you are **not** calling `Theme.init()` — static pages, SSR, or any screen that
renders outside an app shell.

#### Which sheet: `tokens.css` or a single sheet?

| Your screen | Import | Why |
|---|---|---|
| Follows the user's theme preference | `styles/tokens.css` | Both sheets; `theme="dark"` switches them |
| **Fixed light design** — the layout hardcodes light panels (a login card on a dark photo, a print view, an embedded widget on a known background) | `styles/light.css` **only** | |
| Fixed dark design | `styles/dark.css` **only** | |

> ⚠ **A fixed-light screen must not import `tokens.css`.** If the user's OS is dark, the dark
> sheet wins and you get **dark input fields on a white card** — the layout was never going to
> follow the theme, but the tokens will. Ship only the sheet your design actually commits to.

### Option B — `Theme.init()` (runtime)

`Theme.init()` injects the same sheets **and** adds theme switching, persistence, and system-theme
detection. See [Initialization](#initialization).

> ⚠ **`Theme.init()` is not just a theme-switching utility — it is the style bootstrap.**
> If you use `@iyulab/modern-app`, its shell calls `Theme.init()` for you during boot. That means
> screens rendered **outside** the shell — login, onboarding, error pages, embedded widgets — do
> **not** get tokens from it. Use Option A there, or call `Theme.init()` yourself.

In development builds, components log a one-time console warning when no token sheet is found.

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

## Role tokens — the branding layer

Between the raw palette and the components sits a **role layer**. Components never reference
`--u-blue-600` for anything that carries meaning; they reference a role. That is what makes a
one-line brand override reach every control instead of half of them.

```css
/* my-theme.css */
:root {
  --u-primary-color: #6200EA;          /* brand accent — the usual one-liner */
  --u-primary-color-weak: #7C3AED;     /* optional: tune the other steps */
  --u-primary-color-strong: #4C1D95;
}
```

### The grid — 5 roles × 5 steps

| Role | Meaning | Default hue |
|---|---|---|
| `primary` | brand, emphasis, focus, links, checked states | blue |
| `info` | informational status | blue |
| `success` | success, completion | green |
| `warning` | caution | yellow |
| `danger` | error, risk, validation failure | red |

Each role has five steps on a single **intensity** axis:

```
--u-{role}-color-weakest   /* tinted backgrounds, progress tracks */
--u-{role}-color-weaker    /* borders */
--u-{role}-color-weak      /* focus rings, links */
--u-{role}-color           /* solid fills, icons, checked */
--u-{role}-color-strong    /* text on a tinted background, active */
```

Steps describe **intensity, not usage** — `--u-primary-color-weakest` is not "the background
step". A primary button's background is `--u-primary-color`, while an alert's background is the
weakest step. Binding a step to a property would make that contradiction unrepresentable.

`primary` and `info` share a default hue on purpose: they are different *roles*. Rebranding
changes `primary` and leaves informational blue where it is.

### What follows a role override

Overriding a role reaches **everything with that semantic**, including the semantic tokens
layered on top of it:

```
--u-primary-color  →  --u-txt-color-hover / -active
                      --u-icon-color-hover / -active
                      --u-link-txt-color
                      --u-input-border-color-focus
--u-danger-color   →  --u-input-border-color-invalid
```

Rather than listing components here (a list drifts — it was wrong before), the rule is enforced
in `tests/build/role-token-layer.test.ts`: **no rule outside a `[color=…]` selector may reference
a palette primitive directly.**

### What does *not* follow — the decorative axis

`u-tag`, `u-badge`, `u-button`, `u-checkbox` and `u-spinner` take a `color` attribute
(`color="purple"`). Those are **decorative** choices with no role meaning, so they read the
palette directly and are deliberately **immune** to role overrides. `<u-tag color="green">` stays
green after you rebrand.

### Deriving your own steps

Role tokens are palette aliases, not computed values — components may use `color-mix()` locally,
but the sheet does not. If you brand with a single color and want the other steps derived:

```css
:root {
  --u-primary-color: #6200EA;
  --u-primary-color-weak:    color-mix(in srgb, var(--u-primary-color) 80%, white);
  --u-primary-color-weakest: color-mix(in srgb, var(--u-primary-color) 15%, white);
  --u-primary-color-strong:  color-mix(in srgb, var(--u-primary-color) 80%, black);
}
```

Mechanical mixing loses the hand-tuned lightness curve of the built-in palette, which is why the
defaults are aliases. For a brand color it is usually the right trade.

---

## Custom Themes

You can override any token after `Theme.init()` — palette primitives included:

```css
:root {
  --u-neutral-50: #1A1A2E; /* dark surface */
}
```

Or override per-component via CSS custom properties:

```css
u-button {
  --btn-radius: 999px; /* pill buttons everywhere */
}
```

Two generated references, both checked against their source by tests:

- **[design-tokens.md](design-tokens.md)** — every global token (role, semantic, palette), generated
  from `light.css`.
- **[css-custom-properties.md](css-custom-properties.md)** — every per-component hook, generated from
  each component's `@cssprop` JSDoc.

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
