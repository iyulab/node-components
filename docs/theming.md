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
--u-{role}-color-weakest   /* faint graphics — progress-bar buffers */
--u-{role}-color-weaker    /* borders */
--u-{role}-color-weak      /* graphics on the page background — fills, focus rings */
--u-{role}-color           /* solid surfaces — carries --u-{role}-txt-color on top */
--u-{role}-color-strong    /* text and icons on the page background */
```

The axis is intensity, but **the two darkest steps carry a contrast guarantee** and are therefore
bound to a usage:

| Step | Guarantee (WCAG 2.1) |
|---|---|
| `--u-{role}-color` | `--u-{role}-txt-color` on it ≥ 4.5 |
| `--u-{role}-color-strong` | ≥ 4.5 against `--u-bg-color` |
| `--u-{role}-bg-color` | body text ≥ 4.5 · `-strong` icon on it ≥ 3.0 |

Those two cannot be one step, because in dark the requirements point in **opposite directions**:
the page background is `#121212` and the on-color is `#FFFFFF`, so a shade readable on the page
cannot carry white text and vice versa. In light both requirements collapse into one condition
(`contrast(shade, #FFF) ≥ 4.5`), which is why the two steps sit closer together there.

A consequence worth knowing: **the palette shade behind a step differs per family and per theme.**
`--u-primary-color` is `blue-700` in light and `blue-600` in dark; `--u-success-color` is
`green-800`. Material-style ramps are ordered by hue, not luminance, so equal shade numbers do not
mean equal strength. The values are enforced by `tests/build/token-contrast.test.ts` — if you
remap a step, that test tells you whether the result is still readable.

`primary` and `info` share a default hue on purpose: they are different *roles*. Rebranding
changes `primary` and leaves informational blue where it is.

### What follows a role override

Overriding a role reaches **everything with that semantic**, including the semantic tokens
layered on top of it:

```
--u-primary-color         →  --u-input-border-color-focus       (border — non-text, 3.0)
--u-primary-color-strong  →  --u-txt-color-hover / -active      (text — 4.5)
                             --u-icon-color-hover / -active
                             --u-link-txt-color
--u-danger-color          →  --u-input-border-color-invalid
```

Note which side of the split each one lands on: **text routes through `-strong`, borders through
`-color`.** Before 1.16.0 the text tokens read `--u-primary-color`, which is a *surface* shade —
in dark that put 3.07:1 text on the page background.

Rather than listing components here (a list drifts — it was wrong before), the rule is enforced
in `tests/build/role-token-layer.test.ts`: **no rule outside a `[color=…]` selector may reference
a palette primitive directly.**

### What does *not* follow — the decorative axis

`u-tag`, `u-badge`, `u-button`, `u-checkbox` and `u-spinner` take a `color` attribute
(`color="purple"`). Those are **decorative** choices with no role meaning, so they read the
palette directly and are deliberately **immune** to role overrides. `<u-tag color="green">` stays
green after you rebrand.

`u-badge[color="blue"]` was the one exception until 1.16.0 — it read `--u-primary-color`, so a
rebrand moved the blue badge and left the other eight where they were. It now reads the palette
like its siblings.

### Role values on `color` — semantics instead of a hue (1.20.0)

The same `color` attribute also accepts the five **role** values. They are the opposite of the
decorative axis: they say *what the thing means*, they follow a rebrand, and they inherit the
contrast contract.

```html
<u-button color="danger">Delete</u-button>     <!-- means "destructive" -->
<u-button color="red">Delete</u-button>        <!-- means "red", stays red after rebrand -->
```

| Axis | Values | Follows rebrand | Contrast |
|---|---|---|---|
| **Role** | `primary` `info` `success` `warning` `danger` | yes | guaranteed by the contract tests |
| **Decorative** | `blue` `green` `red` `orange` `teal` `cyan` `purple` `pink` (`yellow` where applicable) | no — deliberately immune | you pick the hue, you own the pairing |

If your brand is red, `color="red"` makes *brand* and *danger* the same name. `color="danger"`
is how you say the second one.

**A role value brings its foreground with it.** That is the point of the axis, not a detail —
the surface and the text on it arrive as a pair, so `warning` renders dark text on yellow rather
than the white text every decorative value uses. The same applies where a mark sits on the page
background instead of on a filled surface (`variant="link"`, `u-checkbox[variant="outline"]`,
`u-spinner`): those read the `-strong` step, because a surface step used as text on the page
background measures 3.07 in dark and fails AA.

⚠ Role values are **additive** — every decorative value renders exactly as before.

#### `neutral` does not mean the same thing everywhere

Adding `primary` exposed an existing asymmetry rather than creating one. `color="neutral"` is
the default on every component that has the attribute, but it resolves two different ways:

| Component | `color="neutral"` resolves to | So `color="primary"` is… |
|---|---|---|
| `u-button` · `u-tag` · `u-spinner` | the **brand hook** (`--u-primary-color`) | the same colour, said explicitly |
| `u-badge` · `u-checkbox` | a **grey** (`--u-neutral-800` / `--u-neutral-600`) | a genuinely different colour |

Prefer `color="primary"` when you mean *"the brand colour"* — it says so, and it reads the same
on all five components. `neutral` is kept as-is because changing either group would move
already-published renders; unifying it is a visual change, not a naming one.

`u-spinner` has a second wrinkle: it draws on the page background, so `color="primary"` reads the
`-strong` step while the default still reads the surface step. Both clear the 3.0 non-text
threshold (dark: 3.07 vs 5.17), so the default is not a defect — but the explicit value is the
safer one in dark.

### Surfaces — three different jobs

Backgrounds are not one axis. Three families exist because they answer different questions:

```
--u-bg-color[-hover|-active|-disabled]   interaction state of a surface
--u-bg-color-raised                      chrome adjacent to the page — toolbars, table
                                         headers, footers, pagination
--u-panel-bg-color                       a container floating above the page — cards,
                                         dialogs, drawers, menus
--u-{role}-bg-color                      a status surface — alert backgrounds, selected rows
```

The last three look similar in light and diverge in dark, which is where mixing them shows:

- `--u-panel-bg-color` is **white in light** — a floating panel is lifted by its shadow, not by a
  tint. In dark it lightens, because shadows do not read there.
- `--u-bg-color-raised` is **tinted in both** — chrome has no shadow, so it needs a tint even in
  light (`neutral-50` light / `neutral-300` dark).
- `--u-{role}-bg-color` is a pale status tint that keeps body text at 4.5 and its own
  `-strong` icon at 3.0. `--u-warning-bg-color` sits one palette step differently from the other
  four; yellow's tint strength is asymmetric between themes and matching the *number* would have
  made the light surface nearly invisible.

Do not express elevation with `--u-bg-color-hover` — it is an interaction state, and a raised
surface that is also hoverable would have nothing left to say.

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

⚠**Derived steps do not inherit the contrast guarantee.** The defaults were picked by measurement
(see the table above); `color-mix()` has no idea what `--u-{role}-txt-color` is or what the page
background is. If you derive, check the two that carry guarantees:

```
contrast(--u-{role}-color,        --u-{role}-txt-color)  ≥ 4.5
contrast(--u-{role}-color-strong, --u-bg-color)          ≥ 4.5
```

The same applies when you override `--u-primary-color` outright — the built-in default is AA
against white, your brand color may not be. `--u-{role}-txt-color` exists so you can adjust the
foreground rather than being stuck with white (`--u-warning-txt-color` ships dark for exactly this
reason: no yellow shade carries white text at 4.5).

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

## Fonts and Non-Latin Scripts

`--u-font-base` ships a system-UI stack. On the platforms most consumers target it already
resolves to a font that covers the script the OS is configured for — `-apple-system` and
`BlinkMacSystemFont` map to the platform UI font, which on a Japanese macOS is Hiragino Sans
and on a Korean Windows is Malgun Gothic. **For most apps nothing needs to change.**

Where it goes wrong is the **mixed case**: a browser whose UI language differs from the
content's script. Then the stack falls through to `Helvetica`/`Arial`, neither of which has
CJK coverage, and the browser substitutes per-glyph — often a different face than the rest
of the paragraph, with a different vertical rhythm. The symptom is subtle: text is readable
but the line looks uneven, and numerals or punctuation sit at a different weight.

### Adding a script-specific stack

Insert the script's face **before** the generic families and keep the rest of the stack
intact — you are extending the fallback chain, not replacing it:

```css
:root:lang(ja) {
  --u-font-base: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Yu Gothic',
                 'Noto Sans JP', 'Segoe UI', sans-serif;
}
:root:lang(ko) {
  --u-font-base: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic',
                 'Noto Sans KR', 'Segoe UI', sans-serif;
}
:root:lang(zh-CN) {
  --u-font-base: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei',
                 'Noto Sans SC', 'Segoe UI', sans-serif;
}
:root:lang(zh-TW) {
  --u-font-base: -apple-system, BlinkMacSystemFont, 'PingFang TC', 'Microsoft JhengHei',
                 'Noto Sans TC', 'Segoe UI', sans-serif;
}
:root:lang(th) {
  --u-font-base: -apple-system, BlinkMacSystemFont, 'Thonburi', 'Leelawadee UI',
                 'Noto Sans Thai', 'Segoe UI', sans-serif;
}
:root:lang(ar) {
  --u-font-base: -apple-system, BlinkMacSystemFont, 'Geeza Pro', 'Segoe UI',
                 'Noto Sans Arabic', sans-serif;
}
```

This requires `<html lang="ja">` to be set. If your app switches language at runtime, set
`lang` on the same element you set `theme` on — both are document-level state.

**Note the ordering rule.** `-apple-system`/`BlinkMacSystemFont` stay first: when the OS
already matches the content language they resolve correctly *and* give you the platform's
own metrics. The named faces are the fallback for the mismatch case, and `Noto Sans <script>`
is last among them because it is the one a consumer might have installed but the OS would
not pick on its own.

### Monospace and CJK

`--u-font-mono` has no CJK coverage by design — the fixed-width faces in it are Latin-only.
Where code blocks contain CJK comments, the browser substitutes a proportional face for those
runs and the column alignment breaks. If that matters, append a CJK monospace explicitly:

```css
:root:lang(ja) {
  --u-font-mono: ui-monospace, 'Cascadia Code', Menlo, 'BIZ UDGothic', 'MS Gothic', monospace;
}
```

### Two limits worth knowing

⚠**These tokens have no literal fallback.** Unlike colours, font stacks are not wired into
each use site — the literals are long enough that baking them everywhere costs more than it
returns, and a missing font stack degrades to the browser default without breaking the layout
(a missing colour does break it). So a consumer who does not load the token sheet gets the
browser default font, not the stack above. Load the sheet or set `font-family` yourself.

⚠**`--u-font-display`/`-modern`/`-rounded` name webfonts** (`Inter`, `Nunito`, `Quicksand`)
that this package does not ship. They fall through to the system stack unless you load the
font yourself. They are opt-in accents, not defaults — `--u-font-base` never depends on a
webfont.

---

## Typography scale — seven semantic steps

Alongside the font stacks, the sheet defines seven **semantic steps** — `display`, `title`,
`subtitle`, `body`, `label`, `caption`, `overline` — each with four properties
(`-size`, `-weight`, `-leading`, `-tracking`). Rebranding typography means overriding those
tokens, not restyling every screen:

```css
:root {
  --u-text-title-size: 22px;
  --u-text-title-weight: 800;
}
```

Use the steps from markup with [`u-text`](../skills/iyulab-components/references/components/text.md)
rather than referencing the tokens in your own CSS:

```html
<u-text level="1" variant="display">Document title</u-text>
<u-text variant="subtitle" tone="weak">One-line description</u-text>
<u-text variant="caption" tone="weak">Helper text</u-text>
```

The visual step (`variant`) and the document level (`level`) are independent, so a
second-level heading can be the largest thing on the page without the outline lying about it.

⚠**Referencing the tokens directly is right in one case** — when you are authoring a component
with its own shadow CSS. Then write them with a fallback, e.g.
`font-size: var(--u-text-title-size, 20px)`. If page markup is reaching for these tokens, that
place wants `u-text` instead.

⚠**A step is four properties, not five.** `overline` is not upper-cased for you: transforming
text changes what the author wrote and does nothing for CJK, which would make the same step
look different depending on the language. Apply `text-transform` at the site that wants it.

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

`type="number"` ships a click stepper (`min`/`max`/`step` aware — see the [`u-input` reference](../skills/iyulab-components/references/components/input.md)), but the *size* of that step is a field-meaning decision the library cannot make: a quantity field wants `step="1"`, a KRW amount usually wants `step="1000"`, a two-decimal currency wants `step="0.01"`. Set `step` per field; there is no built-in "currency" input type.
