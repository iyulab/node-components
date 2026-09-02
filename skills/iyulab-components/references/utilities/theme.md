# Theme

```ts
import { Theme } from '@iyulab/components';
```

Manages the document theme (light / dark / system). Uses CSS custom properties and injects built-in stylesheets on init.

## Initialization

Call once at app startup before rendering any components:

```ts
await Theme.init({
  default: 'system',      // initial theme — 'system' | 'light' | 'dark'
  useBuiltIn: true,       // inject bundled CSS variables (default: true)
  store: {                // persist to storage (optional)
    type: 'localStorage',
    prefix: 'myapp-'
  },
  debug: false
});
```

## Brand accent

**Recommended — derive the whole ramp from one seed:**

```ts
Theme.accent('#7c3aed');   // computes --u-primary-color-{weakest…strong} + --u-primary-txt-color
Theme.accent(null);        // back to the sheet defaults
```

The computed ramp satisfies the contrast contract this library tests against — text on the accent
surface ≥ 4.5:1, accent text on the page background ≥ 4.5:1, `-strong` distinguishable from
`-color`, and `-weak` usable as a non-text graphic (≥ 3:1). It is **recalculated when the theme
changes**, because those targets are relative to the page background.

**Manual override** — set the steps you use, not just one:

```css
:root {
  --u-primary-color-weak: #a78bfa;    /* graphics on the page background */
  --u-primary-color: #7c3aed;         /* accent surface */
  --u-primary-color-strong: #5b21b6;  /* text/icons on the page background */
  --u-primary-txt-color: #ffffff;     /* text on the accent surface */
}
```

> ⚠ Overriding `--u-primary-color` **alone is not enough**. Hover, focus and link colors resolve
> from `--u-primary-color-strong`, so they stay on the default ramp and the brand looks
> half-applied. (The sheet derives no step from `--u-primary-color` — measured: 0 references.)

## API

| Member | Type | Description |
|--------|------|-------------|
| `Theme.init(options?)` | `Promise<void>` | Initialize and apply theme |
| `Theme.get()` | `ThemeType \| undefined` | Get current theme |
| `Theme.set(theme)` | `void` | Set theme (`'light'`, `'dark'`, `'system'`) |
| `Theme.resolved()` | `'light' | 'dark'` | The theme actually applied — use this, not `get()`, for brightness branches |
| `Theme.accent(seed)` | `void` | Derive the `--u-primary-*` ramp from a brand color; `null` clears it |
| `Theme.isInitialized` | `boolean` | Whether `init()` has been called |

## Types

```ts
type ThemeType = 'system' | 'light' | 'dark';

interface ThemeInitOptions {
  debug?: boolean;
  store?: false | BrowserStorageOptions;
  default?: ThemeType;
  useBuiltIn?: boolean;
}
```
