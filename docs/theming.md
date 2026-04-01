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
  --u-blue-500: #6200EA;   /* custom brand color */
  --u-neutral-50: #1A1A2E; /* dark surface */
}
```

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
