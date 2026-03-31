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
Toast.success('Saved!');
Toast.error('Something went wrong.', { duration: 5000 });
Toast.message('Hello world', { position: 'bottom-center' });
```
