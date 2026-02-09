# @iyulab/components

Modern web components library built with Lit-Element for building reactive user interfaces.

Visit our [Demo Site](https://components.iyulab.com) to explore all components and their features.

## Installation

```bash
npm install @iyulab/components
```

## Usage

```js
import "@iyulab/components";
```

## Components

| Component | Tag | Description |
|-----------|-----|-------------|
| UAlert | `u-alert` | Alert messages with variants |
| UButton | `u-button` | Button with variants, loading state |
| UDialog | `u-dialog` | Modal dialog |
| UDrawer | `u-drawer` | Slide-in drawer panel |
| UDivider | `u-divider` | Visual divider |
| UForm | `u-form` | Form container with validation |
| UIcon | `u-icon` | Icon display |
| UInput | `u-input` | Text input with validation |
| UMenu | `u-menu` | Dropdown/context menu |
| UMenuItem | `u-menu-item` | Menu item |
| UProgressBar | `u-progress-bar` | Progress bar |
| UProgressRing | `u-progress-ring` | Circular progress indicator |
| USkeleton | `u-skeleton` | Loading placeholder |
| USpinner | `u-spinner` | Loading spinner |
| USplitPanel | `u-split-panel` | Resizable split panel |
| UTag | `u-tag` | Label/status tag |
| UTooltip | `u-tooltip` | Tooltip |
| UTree | `u-tree` | Tree view |
| UTreeItem | `u-tree-item` | Tree view item |

## Events

All custom events use the `u-<action>` naming convention. Events bubble across Shadow DOM boundaries (`bubbles: true`, `composed: true`).

### Event Reference

| Event | Emitted By | Detail | Description |
|-------|-----------|--------|-------------|
| `u-input` | `u-input` | `{ value: string }` | Fires on every keystroke (real-time input) |
| `u-change` | `u-input` | `{ value: string }` | Fires when value is committed (blur/enter) |
| `u-select` | `u-tree-item` | `{ value: string, item: UTreeItem }` | Fires when a leaf item is selected |
| `u-show` | `u-dialog`, `u-drawer`, `u-tooltip` | — | Fires when the element becomes visible |
| `u-hide` | `u-dialog`, `u-drawer`, `u-tooltip` | — | Fires when the element is hidden |
| `u-toggle` | `u-tree-item` | `{ expanded: boolean, item: UTreeItem }` | Fires when a branch item expands/collapses |
| `u-resize` | `u-split-panel` | — | Fires when the panel is resized |

### TypeScript Support

All events are typed and registered on `GlobalEventHandlersEventMap`:

```typescript
import type { UInputEvent, UChangeEvent, USelectEvent, UShowEvent, UHideEvent, UResizeEvent } from '@iyulab/components';

element.addEventListener('u-input', (e: UInputEvent) => {
  console.log(e.detail.value);
});
```

### Listening to Events

```html
<!-- Lit template -->
<u-input @u-input=${this.handleInput} @u-change=${this.handleChange}></u-input>
```

```javascript
// Vanilla JS
document.querySelector('u-input').addEventListener('u-input', (e) => {
  console.log('Real-time value:', e.detail.value);
});

document.querySelector('u-input').addEventListener('u-change', (e) => {
  console.log('Committed value:', e.detail.value);
});
```

## CSS Custom Properties

All CSS custom properties use the `--u-` prefix and are defined on `:root`. They respond to light/dark theme changes automatically.

### Semantic Colors

These variables reference the color palette and should be used in most cases:

#### Text

| Variable | Light | Dark |
|----------|-------|------|
| `--u-txt-color` | neutral-900 | neutral-900 |
| `--u-txt-color-inverse` | neutral-0 | neutral-100 |
| `--u-txt-color-hover` | blue-600 | blue-600 |
| `--u-txt-color-active` | blue-600 | blue-600 |
| `--u-txt-color-disabled` | neutral-400 | neutral-500 |
| `--u-txt-color-weak` | neutral-700 | neutral-700 |
| `--u-txt-color-strong` | neutral-1000 | neutral-1000 |
| `--u-link-txt-color` | blue-700 | blue-700 |
| `--u-tooltip-txt-color` | neutral-0 | neutral-100 |

#### Icon

| Variable | Light | Dark |
|----------|-------|------|
| `--u-icon-color` | neutral-700 | neutral-800 |
| `--u-icon-color-inverse` | neutral-0 | neutral-100 |
| `--u-icon-color-hover` | blue-600 | blue-600 |
| `--u-icon-color-active` | blue-600 | blue-600 |
| `--u-icon-color-disabled` | neutral-400 | neutral-500 |

#### Border

| Variable | Light | Dark |
|----------|-------|------|
| `--u-border-color` | neutral-300 | neutral-400 |
| `--u-border-color-weak` | neutral-200 | neutral-300 |
| `--u-border-color-strong` | neutral-400 | neutral-500 |
| `--u-input-border-color` | neutral-300 | neutral-400 |
| `--u-input-border-color-hover` | neutral-400 | neutral-500 |
| `--u-input-border-color-focus` | blue-600 | blue-600 |
| `--u-input-border-color-invalid` | red-600 | red-600 |

#### Background

| Variable | Light | Dark |
|----------|-------|------|
| `--u-bg-color` | neutral-0 | neutral-100 |
| `--u-bg-color-inverse` | neutral-900 | neutral-0 |
| `--u-bg-color-hover` | neutral-100 | neutral-300 |
| `--u-bg-color-active` | neutral-200 | neutral-400 |
| `--u-bg-color-disabled` | neutral-50 | neutral-100 |
| `--u-input-bg-color` | neutral-0 | neutral-200 |
| `--u-panel-bg-color` | neutral-0 | neutral-200 |
| `--u-overlay-bg-color` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` |
| `--u-tooltip-bg-color` | `rgba(0,0,0,0.75)` | `rgba(255,255,255,0.85)` |

#### Shadow

| Variable | Light | Dark |
|----------|-------|------|
| `--u-shadow-color-weaker` | `rgba(0,0,0,0.04)` | `rgba(0,0,0,0.15)` |
| `--u-shadow-color-weak` | `rgba(0,0,0,0.08)` | `rgba(0,0,0,0.25)` |
| `--u-shadow-color-normal` | `rgba(0,0,0,0.12)` | `rgba(0,0,0,0.35)` |
| `--u-shadow-color-strong` | `rgba(0,0,0,0.16)` | `rgba(0,0,0,0.45)` |
| `--u-shadow-color-stronger` | `rgba(0,0,0,0.24)` | `rgba(0,0,0,0.60)` |

#### Scrollbar

| Variable | Light | Dark |
|----------|-------|------|
| `--u-scrollbar-color` | neutral-400 | neutral-500 |
| `--u-scrollbar-color-hover` | neutral-500 | neutral-600 |
| `--u-scrollbar-track-color` | `transparent` | `transparent` |

### Typography

| Variable | Value |
|----------|-------|
| `--u-font-base` | -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif |
| `--u-font-mono` | ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, monospace |
| `--u-font-serif` | 'Georgia', 'Times New Roman', Times, serif |
| `--u-font-display` | 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif |
| `--u-font-modern` | 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif |
| `--u-font-rounded` | 'Nunito', 'Quicksand', -apple-system, BlinkMacSystemFont, sans-serif |

### Color Palette

The base color palettes (`neutral`, `blue`, `green`, `yellow`, `red`) range from `0` (lightest) to `1000` (darkest) in light mode, and are inverted for dark mode.

```css
--u-neutral-{0|50|100|200|300|400|500|600|700|800|900|1000}
--u-blue-{0|100|200|300|400|500|600|700|800|900|1000}
--u-green-{0|100|200|300|400|500|600|700|800|900|1000}
--u-yellow-{0|100|200|300|400|500|600|700|800|900|1000}
--u-red-{0|100|200|300|400|500|600|700|800|900|1000}
```

### Customizing Styles

Override any `--u-*` variable on `:root` or on specific elements:

```css
/* Global override */
:root {
  --u-blue-600: #3B82F6;
  --u-font-base: 'Pretendard', sans-serif;
}

/* Scoped override */
u-button {
  --u-bg-color: var(--my-brand-primary);
  --u-txt-color: var(--my-brand-on-primary);
}
```

### Integrating with External Design Systems

Bridge `--u-*` variables with your design tokens:

```css
/* Tailwind CSS bridge */
:root {
  --u-blue-500: var(--color-blue-500);
  --u-blue-600: var(--color-blue-600);
  --u-neutral-0: var(--color-white);
  --u-neutral-900: var(--color-gray-900);
  --u-font-base: var(--font-sans);
}

/* Material Design bridge */
:root {
  --u-blue-600: var(--md-sys-color-primary);
  --u-bg-color: var(--md-sys-color-surface);
  --u-txt-color: var(--md-sys-color-on-surface);
}
```

## Theming

### Setup

```typescript
import { Theme } from '@iyulab/components';

await Theme.init({
  default: 'system',      // 'light' | 'dark' | 'system'
  useBuiltIn: true,        // use built-in light/dark CSS (default: true)
  store: {                 // persist theme preference
    type: 'localStorage',
    prefix: 'my-app',
  },
});
```

### Switching Themes

```typescript
Theme.set('dark');         // apply dark theme
Theme.set('light');        // apply light theme
Theme.set('system');       // follow OS preference
const current = Theme.get(); // get current theme
```

### External Theme Toggle Integration

When using an external dark mode toggle (e.g., Tailwind's `dark:` class), disable built-in styles and bridge the variables:

```typescript
// Disable built-in theme styles
await Theme.init({ useBuiltIn: false });
```

```css
/* Provide your own light/dark values */
:root {
  --u-bg-color: #ffffff;
  --u-txt-color: #212121;
}

[data-theme="dark"] {
  --u-bg-color: #121212;
  --u-txt-color: #d4d4d4;
}
```

## Core Dependencies

- [lit](https://www.npmjs.com/package/lit) - Fast web components framework
- [@floating-ui/dom](https://www.npmjs.com/package/@floating-ui/dom) - Positioning library for tooltips and popovers

## License

MIT © [iyulab](https://www.iyulab.com)
