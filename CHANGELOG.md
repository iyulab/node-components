# Changelog

## [1.2.1] - 2026-07-02

### Fixed
- `plugins/vite-plugin-react-wrapper.ts`: 생성된 `dist/react/*.js` 래퍼가 `import { X } from '...'`와 `export const X = ...`를 동일 스코프에 선언해 **모든** React 래퍼(및 barrel `@iyulab/components/react`)가 `SyntaxError: Identifier 'X' has already been declared`로 로드 자체가 실패하던 결함 수정. `.d.ts` 템플릿은 이미 `as ${className}Element` 별칭을 썼으나 `.js` 템플릿만 누락되어 있었음 — `.js` 생성기에 동일한 별칭을 적용해 근본 수정. 이 서브패스를 문서화·검증하는 과정에서 발견(README 예시를 실제로 import해보다가 SyntaxError 재현).

## [1.2.0] - 2026-07-02

### Added
- `UButton`: `color` property (`"neutral" | "blue" | "green" | "red" | "orange" | "teal" | "cyan" | "purple" | "pink"`, default `"neutral"`) — semantic color axis independent of `variant`, e.g. `variant="solid" color="red"` for a destructive action button.
  - Default `"neutral"` renders identically to the previous (pre-1.2.0) output — fully backward compatible.
  - Applies to `solid`/`surface`/`filled`/`outlined` (background/border) and `link` (text color, only when explicitly set to a non-neutral color — the default blue `link` look is preserved). `ghost` is unaffected: its hover/active backgrounds use the generic `--u-bg-color-hover`/`--u-bg-color-active` tokens rather than the neutral color scale, so there is no palette to redirect.
  - Verified visually via a live browser render (all variant × color combinations) in addition to `npm run build`/`npm test`.
- `UButton`: `size` property (`"sm" | "md" | "lg"`, default `"md"`) — scales the button by changing `font-size` only; padding, the spinner, and prefix/suffix margins are already `em`-relative so they scale proportionally with zero extra CSS.
  - Default `"md"` (14px) renders identically to the previous (pre-1.2.0) output — fully backward compatible. `sm` = 12px, `lg` = 16px.
  - Verified visually via a live browser render (sm/md/lg, including with `loading` and prefix icon slots).

## [1.1.1] - 2026-06-26

### Fixed
- `UAlert`: Moved padding from `:host` to the Shadow DOM `.container`. A consumer-side light-DOM reset (e.g. Tailwind preflight's `*{padding:0}`) targets the host element directly and overrode the `:host` padding, collapsing toast/alert spacing to zero. Padding on a Shadow DOM inner element is immune to outer-tree resets.
- `UDrawer`: `.panel` now honors `--drawer-size`. Previously the panel never referenced the variable, so setting `--drawer-size` had no effect and the panel sized to its intrinsic content width. Slide-axis size is now `width: var(--drawer-size, 28rem)` (left/right) / `height: var(--drawer-size, 16rem)` (top/bottom), with `max-width`/`max-height: 100%` for narrow viewports.

### Added
- `UDrawer`: Documented `--drawer-size` as a public CSS custom property (`@cssproperty`).

## [1.1.0] - 2026-06-22

### Added
- Validation messages: Introduced a locale registry (English default + `registerLocale`) so consumers can register and switch validation-message locales.

## [1.0.10] - 2026-06-09

### Fixed
- `UInput`: Fixed broken IME composition input and prevented duplicate `input` event dispatch.

## [1.0.9] - 2026-05-27

### Changed
- `Toast`: Default duration changed from 3000ms to 4000ms.

## [1.0.8] - 2026-05-21

### Added
- `vite-plugin-react-wrapper`: Added an `exclude` option.

## [1.0.7] - 2026-05-21

### Changed
- `UAlert`: Increased padding (8px→12px vertical, 12px→16px horizontal) to improve toast spacing.

## [1.0.6] - 2026-05-15

### Changed
- `UButton`: Updated form-association handling and aligned submit/reset actions to use the element internals form reference.
- Theme tokens: adjusted `--u-txt-color-weak` in light theme to improve weak-text contrast behavior.

### Fixed
- `URadio`: Option disabled state is now consistently synchronized for both `disabled` and `readonly` states.
- `UOption`: Added spacing rules for slotted `prefix` and `suffix` content to improve option layout consistency.

### Removed
- `UButton`: Removed the `associatedForm` getter from the public API.

## [1.0.5] - 2026-05-07

### Fixed
- `UCheckbox`: `label` attribute/property가 slot fallback으로 렌더되지 않던 버그 수정. `<u-checkbox label="활성">` 형태의 attribute 방식이 이제 동작함. slot에 children이 있는 기존 사용은 영향 없음

## [1.0.4] - 2026-04-20

### Fixed
- `UButton`: Fixed `type="submit"`/`"reset"` not triggering ancestor `<form>` actions. The button rendered inside Shadow DOM cannot propagate submit/reset to the host form by default. Implemented form-associated custom element pattern (`static formAssociated = true` + `attachInternals()`) so `type="submit"` calls `requestSubmit()` and `type="reset"` calls `reset()` on the associated form. Adds `form` (ID), `name`, `value` properties for HTML `<button>` standard parity. Exposes `associatedForm` getter for inspection.

## [1.0.2] - 2026-04-07

### Fixed
- `Toast`: Fixed toast not being removed from DOM after hide — changed event listener from `'u-hide'` to `'hide'` to match actual event dispatched by `UAlert`
- `Dialog`: Fixed dialog promise never resolving after close — changed event listener from `'u-hide'` to `'hide'` to match actual event dispatched by `UOverlayElement`

## [1.0.1] - 2026-04-01

### Changed
- `@lit/react` moved from `dependencies` to optional `peerDependencies`

### Fixed
- `UIcon`: Auto-apply `fill="currentColor"` only for fill-based icons; skip when `stroke="currentColor"` is present. Removed global `fill: currentColor` CSS rule
- `URadio` / `USelect`: `options` field is now a `@state()` so the UI re-renders when options change; `onChangeValue()` now triggers on both `value` and `options` changes
- `UTextarea`: Replaced `all: unset` with explicit CSS reset for better cross-browser compatibility; height recalculation moved inside `requestAnimationFrame` to stabilize auto-resize
- `Dialog`: Fixed `prompt()` input not capturing user text — switched to property binding (`.value`) and native `@input` event

## [1.0.0] - 2026-04-01

### Added
- New components: `u-avatar`, `u-badge`, `u-breadcrumb` / `u-breadcrumb-item`, `u-chip`, `u-field`, `u-icon-button`, `u-option`, `u-panel`, `u-radio`, `u-rating`, `u-select`, `u-slider`, `u-switch`, `u-tab` / `u-tab-panel`
- `Toast` utility: semantic API replacing `Notifier.toast()` — `Toast.show()`, `Toast.success()`, `Toast.error()`, etc.
- `Dialog` utility: imperative API — `Dialog.confirm()`, `Dialog.prompt()`, etc.
- `OverlayManager`: built-in overlay stack management and ESC key handling
- `icons.ts`: full rewrite of `IconRegistry` with bundled SVG support via Vite `import.meta.glob` and built-in CDN resolvers for Tabler, Heroicons, Lucide, and Bootstrap Icons
- Vite plugins: `vite-plugin-glob-resolve` and `vite-plugin-react-wrapper` for automatic React wrapper generation
- `skills/iyulab-components/` agent skill with 39 component references, 9 utility references, and 5 extension references
- `docs/` developer documentation (architecture, guidelines, events, theming, form-controls, icons)

### Changed
- **Breaking:** Removed `U`-prefixed event types (`UChangeEvent`, `UInputEvent`, `UShowEvent`, `UHideEvent`, `USelectEvent`, `UResizeEvent`) — replaced with `ShowEvent`, `HideEvent`, `PickEvent`, `CheckEvent`, `ExpandEvent`, `CollapseEvent`, `NavigateEvent`, `RemoveEvent`, `ShiftEvent`
- **Breaking:** `Notifier` replaced by `Toast`; `IconRegistry` rewritten as `icons.ts` — existing API is not compatible, migration required
- **Breaking:** `UModalElement` removed — merged into `UOverlayElement`; extend `UOverlayElement` instead
- Heavy components extract render logic into a separate `U<Name>.component.ts` file
- `converters.ts` extended with additional type conversion utilities
- `README.md` overhauled with Agent Skills installation guide

## [0.4.0] - 2026-03-02

### Added
- `UJsonElement`: new base class that reads JSON from a `<script type="application/json">` tag in light DOM and maps properties to the component automatically; includes built-in error UI (`error()` method) and `buildHTML()` static helper
- `sanitizers.ts` utility: `stripZeroWidth()`, `escapeHtmlText()`, `escapeHtmlAttr()`, `escapeHtmlHref()` for HTML/XSS protection
- New icon assets: `arrow-down-up`, `code-slash`, `download`, `sort-alpha-down`, `sort-alpha-up`

### Changed
- **Breaking:** `BaseElement`, `FloatingElement`, `ModalElement` renamed to `UElement`, `UFloatingElement`, `UModalElement` — all components updated accordingly

### Fixed
- `UCarousel`: Fixed tap vs drag detection — pointer target is tracked to dispatch a `click` event on tap when drag distance is below threshold

## [0.3.0] - 2026-02-26

### Added
- `UCard`: card layout component with `header`, `footer`, `media` slots
- `UCarousel`: carousel component with autoplay, drag, navigation, and multi-slide view

### Changed
- Moved `@lit/react` and `react` to optional `peerDependencies`
- Updated devDependencies

## [0.2.3] - 2026-02-09

### Added
- `UInput`: `inputmode`, `enterkeyhint`, `size`, `multiple` properties for improved mobile UX and HTML standard compliance (#4)

## [0.2.2] - 2026-02-09

### Added
- `UInput`: `min`, `max`, `step` properties for number/date/time input types (#1)

## [0.2.1] - 2026-02-09

### Added
- Events documentation: complete event API reference with all `u-*` events, detail types, and usage examples (#3)
- CSS Custom Properties reference: full `--u-*` variable list with light/dark values (#2)
- Theming guide: setup, switching, and external design system integration
- Component list with tags and descriptions

## [0.2.0] - 2026-01-16

### Added
- `UTag`: tag component for labels, categories, and status; variants: `default`, `info`, `success`, `warning`, `danger`; removable with animation; prefix/suffix slots
- `UButton`: `variant` property with `default`, `borderless`, and `link` styles
- `UTooltip`: `interactive` property for keeping tooltip open on hover
- New icon assets: `arrow-repeat`, `box-arrow-up-right`, `file-earmark`, `flag`, `globe`, `hand-thumbs-up`, `hand-thumbs-up-fill`, `hand-thumbs-down`, `hand-thumbs-down-fill`, `share`, `stop-circle`, `tools`
- `converters.ts`: `arrayAttrConverter()` for array attribute conversion
- `elements.ts`: DOM helpers — `getParentElement`, `querySelectorWithin`, `querySelectorAllWithin`

### Changed
- **Breaking:** `IconRegistry` changed from singleton instance to static class (use `IconRegistry.register()` instead of `icons.register()`)
- **Breaking:** `Notifier` changed from singleton instance to static class (use `Notifier.toast()` instead of `notifier.toast()`)
- **Breaking:** `Theme` changed from singleton instance to static class (use `Theme.init()` instead of `theme.init()`)
- **Breaking:** `UIconButton` removed — use `UButton` with icon slot instead
- `FloatingElement`: enhanced positioning and anchor management logic
- `UButton`: improved click event handling for disabled and loading states
- `UDialog` / `UDrawer`: updated to use improved modal element patterns
- `UMenu`: refactored submenu handling and dropdown logic
- `IconRegistry`: reorganized and improved icon loading architecture
- Internal utilities moved to public: `internals/attribute-converters.ts` → `utilities/converters.ts`, `internals/node-helpers.ts` → `utilities/elements.ts`, `utilities/icons.ts` → `utilities/IconRegistry.ts`

## [0.1.11] - 2026-01-06

### Added
- `UTreeItem`: `loading` property with spinner indicator and `MutationObserver` for dynamic child loading
- `UMenuItem`: `loading` property with spinner indicator

### Changed
- `UDivider`: simplified component (removed movable functionality)
- `USplitPanel`: completely rewritten with native splitter implementation
- `UMenu` / `UMenuItem`: refactored submenu handling logic
- `UTreeItem`: improved children slot handling with `processChildren` method; indent styling now uses CSS custom property (`--indent-level`)

### Fixed
- Fixed d.ts generation error for `Theme` class by exporting the class

## [0.1.10] - 2025-12-19

### Fixed
- Fixed circular dependency issue between `UMenu` and `UMenuItem`
- `UMenuItem` now uses tag name check instead of `instanceof` for submenu detection

## [0.1.9] - 2025-12-19

### Added
- `Tree` and `TreeItem` components for hierarchical data display
- Updated React wrapper plugin to support new file structure

### Removed
- Removed `CopyButton` component

### Changed
- React wrapper output directory changed to `react-components`

## [0.1.8] - 2025-12-18

### Changed
- **Breaking:** Added `U` prefix to all component class names (e.g., `Alert` → `UAlert`)
- **Breaking:** File naming convention changed: `{Name}.ts` → `U{Name}.component.ts`, `{Name}.styles.ts` → `U{Name}.styles.ts`, `index.ts` → `U{Name}.ts`

## [0.1.7] - 2025-12-12

### Added
- `FloatingElement` base class for shared popover and tooltip logic
- `ModalElement` base class for shared dialog and drawer logic
- `Drawer` component
- `Skeleton` component

### Changed
- `Menu`: improved with dropdown, context menu, and submenu support
- `Dialog`: refactored to extend `ModalElement`

### Removed
- Removed `ContextMenu` and `DropdownMenu` — functionality merged into `Menu`

## [0.1.5] - 2025-12-10

### Changed
- Improved `Icon` component and refactored icon utilities
- Improved `Input` component styles and validation
- Improved `Tooltip`, `Divider`, `SplitPanel` components
- Improved `notifier` utility
- Updated theme styles (light/dark)

### Removed
- Removed `Panel` component

## [0.1.4] - 2025-12-05

### Fixed
- Fixed miscellaneous issues

## [0.1.3] - 2025-11-17

### Added
- `ProgressBar` component for displaying top-of-page loading progress

### Fixed
- Fixed theme `useBuiltIn` option not working as expected

## [0.1.2] - 2025-11-13

### Fixed
- Fixed a type issue in `theme` utility

## [0.1.1] - 2025-11-13

### Added
- `BrowserStorage` utility supporting `localStorage` and `cookie` with async get/set/remove methods

### Changed
- Theme `persist` option renamed to `store`

### Removed
- Removed `toggle` method from theme utility

## [0.1.0] - 2025-11-12

### Added
- Initial release
