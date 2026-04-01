---
name: iyulab-components
description: Web component library built on Lit. Covers all u-* custom elements (buttons, forms, overlays, navigation, data display), utilities (Theme, Toast, Dialog, icons), and base classes for extension. Use when working with @iyulab/components package.
license: MIT
metadata:
  author: iyulab
  version: "1.0.0"
---

# @iyulab/components

Web component library built on [Lit](https://lit.dev/). All components are custom elements (`u-*` tags) that work in any framework or vanilla HTML.

## Quick Start

Install the package:

```bash
npm install @iyulab/components
```

Initialize theme and import all components:

```ts
import { Theme } from '@iyulab/components';
import '@iyulab/components'; // registers all u-* custom elements

await Theme.init(); // optional — applies system/light/dark theme
```

Import individual components (tree-shakable):

```ts
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/input/UInput.js';
```

React wrappers (requires `@lit/react`):

```ts
import { UButton, UInput } from '@iyulab/components/react';
```

> For detailed guidance on theming, icon setup, and advanced usage, see [./references/usage.md](./references/usage.md).

---

## Components

### Feedback

- [`u-alert`](./references/components/alert.md) — Closable message banner with status variants and auto-dismiss
- [`u-spinner`](./references/components/spinner.md) — Animated loading indicator
- [`u-skeleton`](./references/components/skeleton.md) — Placeholder shape shown while content loads
- [`u-progress-bar`](./references/components/progress-bar.md) — Linear progress indicator with buffer and segment support
- [`u-progress-ring`](./references/components/progress-ring.md) — Circular progress indicator

### Buttons & Actions

- [`u-button`](./references/components/button.md) — Versatile button with multiple variants; renders as `<a>` when `href` is set
- [`u-icon-button`](./references/components/icon-button.md) — Square icon-only button with built-in tooltip
- [`u-button-group`](./references/components/button-group.md) — Groups buttons with shared variant and disabled state

### Form Controls

- [`u-input`](./references/components/input.md) — Text input; combobox mode when `u-option` children are present
- [`u-textarea`](./references/components/textarea.md) — Multi-line text input with auto-resize and character counter
- [`u-select`](./references/components/select.md) — Dropdown select; single or multiple, with search
- [`u-checkbox`](./references/components/checkbox.md) — Checkbox with indeterminate state support
- [`u-radio`](./references/components/radio.md) — Radio group built from `u-option` children
- [`u-switch`](./references/components/switch.md) — Toggle switch
- [`u-slider`](./references/components/slider.md) — Range slider; single-thumb or dual-thumb (range) mode
- [`u-rating`](./references/components/rating.md) — Star/custom-symbol rating input
- [`u-field`](./references/components/field.md) — Layout wrapper providing label, description, and validation message
- [`u-form`](./references/components/form.md) — Form group with two-way model binding and validation
- [`u-option`](./references/components/option.md) — Selectable option item for `u-select`, `u-radio`, `u-input`

### Overlay & Floating

- [`u-dialog`](./references/components/dialog.md) — Modal/non-modal dialog with configurable placement
- [`u-drawer`](./references/components/drawer.md) — Side-panel that slides in from any edge
- [`u-popover`](./references/components/popover.md) — Anchored floating panel with flexible trigger/dismiss policies
- [`u-tooltip`](./references/components/tooltip.md) — Hover/focus tooltip anchored to a target element

### Navigation

- [`u-breadcrumb`](./references/components/breadcrumb.md) — Hierarchical location indicator
- [`u-breadcrumb-item`](./references/components/breadcrumb.md) — Individual breadcrumb link/label
- [`u-menu`](./references/components/menu.md) — Menu container with keyboard navigation and selection modes
- [`u-menu-item`](./references/components/menu.md) — Menu entry with optional sub-menu
- [`u-tab-panel`](./references/components/tab-panel.md) — Tab-based content switcher
- [`u-tab`](./references/components/tab-panel.md) — Individual tab button used inside `u-tab-panel`
- [`u-tree`](./references/components/tree.md) — Hierarchical tree with select, check, and drag-and-drop
- [`u-tree-item`](./references/components/tree.md) — Individual node inside `u-tree`

### Layout & Display

- [`u-card`](./references/components/card.md) — Content card with media, header, and footer slots
- [`u-carousel`](./references/components/carousel.md) — Slide carousel with autoplay, navigation, and pagination
- [`u-split-panel`](./references/components/split-panel.md) — Resizable two-panel layout
- [`u-panel`](./references/components/panel.md) — General-purpose content panel with optional collapsing
- [`u-divider`](./references/components/divider.md) — Horizontal or vertical separator line

### Data Display

- [`u-avatar`](./references/components/avatar.md) — User avatar with image, initials, or custom slot
- [`u-badge`](./references/components/badge.md) — Status badge; can be anchored on top of other elements
- [`u-chip`](./references/components/chip.md) — Selectable/removable chip tag
- [`u-tag`](./references/components/tag.md) — Non-interactive label tag
- [`u-icon`](./references/components/icon.md) — SVG icon from built-in or external icon library

---

## Utilities

- [`Theme`](./references/utilities/theme.md) — Apply and manage light/dark/system theme
- [`Toast`](./references/utilities/toast.md) — Programmatically show toast notifications
- [`Dialog`](./references/utilities/dialog.md) — Programmatically show alert/confirm/prompt dialogs
- [`IconRegistry`](./references/utilities/icons.md) — Register and resolve icon libraries
- [`BrowserStorage`](./references/utilities/browser-storage.md) — Unified localStorage / Cookie API
- [`converters`](./references/utilities/converters.md) — Lit property attribute converters (array, JSON, date, url…)
- [`sanitizers`](./references/utilities/sanitizers.md) — XSS-safe HTML/URL escape helpers
- [`elements`](./references/utilities/elements.md) — Shadow-DOM-aware DOM query helpers
- [`OverlayManager`](./references/utilities/overlay-manager.md) — Internal overlay stack and z-index manager

---

## Extensions

`@iyulab/components` exposes abstract base classes you can extend to build custom components that integrate seamlessly with the library's patterns (form association, overlays, floating positioning, etc.).

> See [./references/extensions/](./references/extensions/) for per-class details.

- [`UElement`](./references/extensions/element.md) — Root base for all components; provides `fire()`, `relay()`, `replace()` helpers
- [`UFormControlElement<T>`](./references/extensions/form-control.md) — Base for form-associated controls; handles `disabled`, `readonly`, `invalid`, validation lifecycle
- [`UFloatingElement`](./references/extensions/floating.md) — Base for anchored floating UI (popover, tooltip); wraps `@floating-ui/dom`
- [`UOverlayElement`](./references/extensions/overlay.md) — Base for full-screen overlays (dialog, drawer); manages focus-trap, scroll-lock, ESC/backdrop close
- [`UDataElement`](./references/extensions/data.md) — Base for data-driven components; auto-loads JSON from inline `<script type="application/json">`
