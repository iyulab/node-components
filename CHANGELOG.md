# Changelog

## 1.0.0 (2026-04-01)

### Breaking Changes

- **Event type renames**: Removed `U`-prefixed event types (`UChangeEvent`, `UInputEvent`, `UShowEvent`, `UHideEvent`, `USelectEvent`, `UResizeEvent`) in favour of action-based names
  - `ShowEvent` / `HideEvent` / `PickEvent` / `CheckEvent` / `ExpandEvent` / `CollapseEvent` / `NavigateEvent` / `RemoveEvent` / `ShiftEvent`
- **Utility API overhaul**: `Notifier` replaced by `Toast`; `IconRegistry` rewritten as `icons.ts` — existing API is not compatible, migration required
- **`UModalElement` removed**: Merged into `UOverlayElement`. Components that extended `UModalElement` must now extend `UOverlayElement`

### New Components

- `u-avatar` — user avatar with image or initials fallback
- `u-badge` — numeric or status badge
- `u-breadcrumb` / `u-breadcrumb-item` — navigation breadcrumb trail
- `u-chip` — selectable chip with `pick` and `remove` events
- `u-field` — form field layout wrapper (label, description, validation message)
- `u-icon-button` — icon-only button
- `u-option` — option item for `u-select` and combobox inputs
- `u-panel` — general-purpose container panel
- `u-radio` — single-choice radio button
- `u-rating` — star/score input
- `u-select` — dropdown select control
- `u-slider` — range slider
- `u-switch` — toggle switch
- `u-tab` / `u-tab-panel` — tab navigation

### Improvements

- **Component file split**: Heavy components extract render logic into a separate `U<Name>.component.ts`, keeping the class declaration lean
- **`Toast` utility**: Replaces `Notifier.toast()` with a semantic API — `Toast.show()`, `Toast.success()`, `Toast.error()`, etc.
- **`Dialog` utility**: Imperative dialog API added — `Dialog.confirm()`, `Dialog.prompt()`, etc.
- **`OverlayManager`**: Built-in overlay stack management and ESC key handling
- **`icons.ts`**: Full rewrite of `IconRegistry` with bundled SVG support via Vite `import.meta.glob` and built-in CDN resolvers for Tabler, Heroicons, Lucide, and Bootstrap Icons
- **`converters.ts`**: Extended type conversion utilities
- **Vite plugins**: Added `vite-plugin-glob-resolve` and `vite-plugin-react-wrapper` for automatic React wrapper generation

### Documentation

- `skills/iyulab-components/` — full agent skill added with 39 component references, 9 utility references, and 5 extension references
- `docs/` — developer documentation added (architecture, guidelines, events, theming, form-controls, icons)
- `README.md` overhauled with Agent Skills installation guide

---

## 0.4.0 (2026-03-02)

### Breaking Changes
- **BaseElement / FloatingElement / ModalElement**: Renamed to `UElement`, `UFloatingElement`, `UModalElement` to align with the `U` prefix naming convention
  - All components updated to use the renamed base classes

### Features
- **UJsonElement**: Added new base class that reads JSON from a `<script type="application/json">` tag in light DOM and maps properties to the component automatically
  - Includes built-in error UI rendering via `error()` method
  - Provides static `buildHTML()` helper to generate safe component HTML from JSON data
- **Icons**: Added new icon assets
  - `arrow-down-up`, `code-slash`, `download`, `sort-alpha-down`, `sort-alpha-up`

### New Utilities
- **sanitizers.ts**: Added HTML/XSS protection utilities
  - `stripZeroWidth()`: Removes zero-width characters (ZWSP, BOM, etc.)
  - `escapeHtmlText()`: Escapes special characters for HTML text context
  - `escapeHtmlAttr()`: Escapes special characters for HTML attribute context
  - `escapeHtmlHref()`: Sanitizes and validates `href`/`src` values (blocks `javascript:`, `data:`, `vbscript:` protocols)

### Bug Fixes
- **UCarousel**: Fixed tap vs drag detection — pointer target is now tracked to dispatch a `click` event on tap when drag distance is below threshold

## 0.3.0 (2026-02-26)

### Features
- **UCard**: Added card layout component with `header`, `footer`, `media` slots
- **UCarousel**: Added carousel component with autoplay, drag, navigation, multi-slide view

### Improvements
- Moved `@lit/react`, `react` to optional peerDependencies
- Updated devDependencies

## 0.2.3 (2026-02-09)

### Features
- **UInput**: Added `inputmode`, `enterkeyhint`, `size`, `multiple` properties for improved mobile UX and HTML standard compliance (closes #4)

## 0.2.2 (2026-02-09)

### Features
- **UInput**: Added `min`, `max`, `step` properties for number/date/time input types (closes #1)

## 0.2.1 (2026-02-09)

### Documentation
- **Events**: Added complete event API reference with all `u-*` events, detail types, and usage examples (closes #3)
- **CSS Custom Properties**: Added full `--u-*` variable reference with light/dark values (closes #2)
- **Theming**: Added theme setup, switching, and external design system integration guide
- **Components**: Added component list with tags and descriptions

## 0.2.0 (2026-01-16)

### Breaking Changes
- **Utilities**: Refactored utility class architecture to static-only pattern
  - `IconRegistry`: Changed from singleton instance to static class (use `IconRegistry.register()` instead of `icons.register()`)
  - `Notifier`: Changed from singleton instance to static class (use `Notifier.toast()` instead of `notifier.toast()`)
  - `Theme`: Changed from singleton instance to static class (use `Theme.init()` instead of `theme.init()`)
- **IconButton**: Removed `UIconButton` component (use `UButton` with icon slot instead)

### Features
- **UTag**: Added new Tag component for displaying labels, categories, and status
  - Supports variants: `default`, `info`, `success`, `warning`, `danger`
  - Removable tag functionality with smooth animation
  - Prefix/suffix slots for custom content
- **UButton**: Added `variant` property with support for `default`, `borderless`, and `link` styles
- **UTooltip**: Added `interactive` property for keeping tooltip open when hovering over it
- **Icons**: Added new icon assets
  - `arrow-repeat`, `box-arrow-up-right`, `file-earmark`, `flag`, `globe`
  - `hand-thumbs-up`, `hand-thumbs-up-fill`, `hand-thumbs-down`, `hand-thumbs-down-fill`
  - `share`, `stop-circle`, `tools`
- **Utilities**: Added new utility functions
  - `converters.ts`: `arrayAttrConverter()` for array attribute conversion
  - `elements.ts`: DOM helper functions (`getParentElement`, `querySelectorWithin`, `querySelectorAllWithin`)

### Improvements
- **FloatingElement**: Enhanced positioning and anchor management logic
- **UButton**: Improved click event handling for disabled and loading states
- **UDialog/UDrawer**: Updated to use improved modal element patterns
- **UMenu**: Refactored submenu handling and dropdown logic
- **IconRegistry**: Reorganized and improved icon loading architecture
- **Utilities**: Moved internal utilities to public utilities directory
  - `internals/attribute-converters.ts` → `utilities/converters.ts`
  - `internals/node-helpers.ts` → `utilities/elements.ts`
  - `utilities/icons.ts` → `utilities/IconRegistry.ts`

## 0.1.11 (2026-01-06)

### Fixes
- Fixed d.ts generation error for `Theme` class by exporting the class

### Features
- **UTreeItem**: Added `loading` property with spinner indicator
- **UTreeItem**: Added MutationObserver for dynamic child loading support
- **UMenuItem**: Added `loading` property with spinner indicator

### Improvements
- **UDivider**: Simplified component (removed movable functionality)
- **USplitPanel**: Completely rewritten with native splitter implementation
- **UMenu/UMenuItem**: Refactored submenu handling logic
- **UTreeItem**: Improved children slot handling with `processChildren` method
- **UTreeItem**: Changed indent styling to use CSS custom property (`--indent-level`)

## 0.1.10 (2025-12-19)
- Fixed circular dependency issue between `UMenu` and `UMenuItem`
- Changed `UMenuItem` to use tagName check instead of `instanceof` for submenu detection

## 0.1.9 (2025-12-19)
- Added `Tree`, `TreeItem` components for hierarchical data display
- Updated React wrapper plugin to support new file structure
- Removed `CopyButton` component
- Changed React wrapper output directory to `react-components`

## 0.1.8 (2025-12-18)
- **Breaking Change**: Added `U` prefix to all component class names (e.g., `Alert` → `UAlert`)
- **Breaking Change**: Changed file naming convention
  - `{Name}.ts` → `U{Name}.component.ts` (class implementation)
  - `{Name}.styles.ts` → `U{Name}.styles.ts` (styles)
  - `index.ts` → `U{Name}.ts` (element definition)

## 0.1.7 (2025-12-13)
- Added `FloatingElement` base class for popover, tooltip common logic
- Added `ModalElement` base class for dialog, drawer common logic
- Added `Drawer` component
- Added `Skeleton` component
- Improved `Menu` component with dropdown, contextmenu, submenu support
- Refactored `Dialog` component based on `ModalElement`
- Removed `ContextMenu`, `DropdownMenu` (merged into `Menu`)

## 0.1.5 (2025-12-10)
- Improved `Icon` component and refactored icon utilities
- Improved `Input` component styles and validation
- Improved `Tooltip`, `Divider`, `SplitPanel` components
- Improved `notifier` utility
- Removed `Panel` component
- Updated theme styles (light/dark)

## 0.1.4 (2025-12-05)
- Fixes some issues

## 0.1.3 (2025-11-17)
- fixed a theme `useBuiltIn` Option, now it works as expected.
- added `ProgressBar` component to show loading progress at the top of the page.

## 0.1.2 (2025-11-13)
- fixed a type issue in `theme` utility.

## 0.1.1 (2025-11-13)
- added `BrowserStorage` which supports `localStorage` and `cookie` with async methods for getting, setting, and removing items.
- changed theme `persist` option to `store` option, and fixed some issues.
- removed `toggle` method from theme utility.

## 0.1.0 (2025-11-12)
- Initial library version release
