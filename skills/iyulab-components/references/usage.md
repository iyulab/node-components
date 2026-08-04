# Usage Guide

## Installation

```bash
npm install @iyulab/components
```

---

## Importing Components

### All at once

```ts
import '@iyulab/components';
```

### Individual (tree-shakable)

```ts
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/input/UInput.js';
```

### React wrappers

React wrappers are generated via `@lit/react` and live under the `react` sub-export.

```ts
import { UButton, UInput, USelect } from '@iyulab/components/react';
```

---

## Theme Setup

Call `Theme.init()` once at application startup (before rendering):

```ts
import { Theme } from '@iyulab/components';

await Theme.init({
  default: 'system',   // 'system' | 'light' | 'dark'
  useBuiltIn: true,    // load bundled CSS variables (default: true)
  store: {             // persist theme preference in localStorage (optional)
    type: 'localStorage',
    key: 'app-theme'
  }
});
```

### Switching themes at runtime

```ts
import { Theme } from '@iyulab/components';

Theme.set('dark');
Theme.set('light');
Theme.set('system');

const current = Theme.get(); // 'system' | 'light' | 'dark' | undefined
```

### Brand color customization

**Recommended — derive the whole ramp from one seed:**

```ts
import { Theme } from '@iyulab/components';

Theme.accent('#7c3aed');   // computes --u-primary-color-{weakest,weaker,weak,…,strong} + txt
Theme.accent(null);        // back to the sheet defaults
```

The computed ramp satisfies the contrast contract this library tests against — text on the
accent surface ≥ 4.5:1, accent text on the page background ≥ 4.5:1, `-strong` distinguishable
from `-color`, and `-weak` usable as a non-text graphic (≥ 3:1). It is **recalculated when the
theme changes**, because those targets are relative to the page background.

#### How many tokens does the `primary` role have? **Seven.**

`Theme.accent()` sets **six** of them:

| Token | `Theme.accent()` | What reads it |
|---|---|---|
| `--u-primary-color` | ✅ | accent surface — 21 source files |
| `--u-primary-color-strong` | ✅ | text/icons on the page background; hover · active · link · focus ring — 14 files |
| `--u-primary-color-weak` | ✅ | non-text graphics |
| `--u-primary-color-weaker` | ✅ | decorative |
| `--u-primary-color-weakest` | ✅ | decorative |
| `--u-primary-txt-color` | ✅ | text on the accent surface |
| **`--u-primary-bg-color`** | 🔴**no** | tinted **surface behind text** — `u-tag`'s `--tag-hue-surface` |

🔴 **`Theme.accent()` does not touch `--u-primary-bg-color`.** It stays on the sheet default
(a blue tint), so a seeded brand leaves tinted surfaces blue. Set it yourself alongside the seed:

```ts
Theme.accent('#7c3aed');
document.documentElement.style.setProperty('--u-primary-bg-color', '#f3e8ff');
```

Pick a tint that keeps your body text readable on it — the built-in sheet values sit at roughly
1.14:1 (light) and 1.03:1 (dark) against the page background. Deriving this step automatically is
tracked as open work, because the sheet pairs it by hand across five colour roles and two themes.

**Manual override** — you must set the steps you use, not just one:

```css
:root {
  --u-primary-color-weak: #a78bfa;    /* graphics on the page background */
  --u-primary-color: #7c3aed;         /* accent surface */
  --u-primary-color-strong: #5b21b6;  /* text/icons on the page background */
  --u-primary-txt-color: #ffffff;     /* text on the accent surface */
  --u-primary-bg-color: #f3e8ff;      /* tinted surface behind text */
}
```

⚠ Setting `--u-primary-color` alone is **not enough**: hover/focus/link colors resolve from
`--u-primary-color-strong`, so they stay on the default ramp and your brand looks half-applied.
The measured symptom is a *selected table row* or *tag* that stays blue while buttons turn brand —
that one is `--u-primary-bg-color`.

### Typography

The sheet defines seven semantic steps — `display`, `title`, `subtitle`, `body`, `label`,
`caption`, `overline` — each with `-size`, `-weight`, `-leading`, `-tracking`. Use them from
markup with [`u-text`](./components/text.md) instead of writing your own CSS:

```html
<u-text level="1" variant="display">Document title</u-text>
<u-text variant="subtitle" tone="weak">One-line description</u-text>
<u-text>Body copy</u-text>
<u-text variant="caption" tone="weak">Helper text</u-text>
```

`variant` is the visual step and `level` is the document level — they are independent, and
`level` renders a real `<h1>`–`<h6>` so the heading is read as one.

To rebrand typography, override the tokens rather than the screens:

```css
:root { --u-text-title-size: 22px; --u-text-title-weight: 800; }
```

---

## Icon Setup

### Built-in icons

Built-in icons are bundled at build time and served from `/assets/icons/` by default.  
If you serve static assets from a different path, update the base URL:

```ts
import { setDefaultBaseUrl } from '@iyulab/components';

setDefaultBaseUrl('/static/icons/');
```

### Using a third-party icon library

Third-party libraries are loaded on-demand from CDN. Supported libraries:

| `lib` value | Source | Notes |
|---|---|---|
| `internal` | Bundled SVGs | Default, no network |
| `tabler` | [tabler.io/icons](https://tabler.io/icons) | `name` or `name:filled` |
| `heroicons` | [heroicons.com](https://heroicons.com) | `name` or `name:solid` |
| `lucide` | [lucide.dev](https://lucide.dev) | Only outline style |
| `bootstrap` | [icons.getbootstrap.com](https://icons.getbootstrap.com) | outline / filled |

```html
<u-icon lib="tabler" name="home"></u-icon>
<u-icon lib="tabler" name="home:filled"></u-icon>
<u-icon lib="heroicons" name="academic-cap:solid"></u-icon>
<u-icon lib="lucide" name="activity"></u-icon>
```

### Registering a custom icon library

```ts
import { IconRegistry } from '@iyulab/components';

IconRegistry.register('my-icons', async (name) => {
  const res = await fetch(`/icons/${name}.svg`);
  if (!res.ok) return undefined;
  return res.text();
});
```

```html
<u-icon lib="my-icons" name="logo"></u-icon>
```

### Unregistering

```ts
IconRegistry.unregister('my-icons');
```

---

## CSS Custom Properties

Components expose `--` CSS custom properties for visual customization. Apply them on a wrapping element or `:root`:

```css
:root {
  --alert-background-color: #1a1a2e;
  --spinner-indicator-color: royalblue;
}

u-button {
  --btn-radius: 999px;
}
```

---

## CSS `part` Styling

Shadow DOM internals are exposed via `::part()`:

```css
u-input::part(input) {
  font-size: 1rem;
  letter-spacing: 0.02em;
}

u-dialog::part(panel) {
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
```

---

## Form Integration

All form control components (`u-input`, `u-select`, `u-checkbox`, etc.) use the native [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals) API (`formAssociated = true`) and work inside standard `<form>` elements.

```html
<form id="my-form">
  <u-input name="email" type="email" required></u-input>
  <u-select name="role">
    <u-option value="admin">Admin</u-option>
    <u-option value="viewer">Viewer</u-option>
  </u-select>
  <u-button type="submit">Submit</u-button>
</form>
```

### Validating programmatically

```ts
const input = document.querySelector('u-input');
input.validate(); // returns boolean, sets `invalid` attribute
input.reset();    // clears value and validation state
```

### Using `u-form` for model binding

```ts
import { UForm } from '@iyulab/components';

const form = document.querySelector('u-form') as UForm;
form.model = { email: 'user@example.com', role: 'admin' };

form.addEventListener('change', () => {
  console.log(form.model); // updated model
});
```

---

## Overlay / Dialog Utilities

Open dialogs and toasts programmatically without creating elements manually:

```ts
import { Dialog, Toast } from '@iyulab/components';

// Alert
await Dialog.alert('Operation completed.');

// Confirm
const confirmed = await Dialog.confirm('Delete this item?');

// Prompt
const name = await Dialog.prompt('Enter your name:', { default: 'Alice' });

// Toast
Toast.DefaultOptions = { position: 'bottom-center', duration: 3000 };
Toast.success('Saved!');
Toast.error('Something went wrong.', { duration: 5000 });
Toast.message('Hello world', { position: 'bottom-center' });
```
