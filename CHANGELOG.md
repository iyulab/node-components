# Changelog

## [1.4.0] - 2026-07-06

### Changed
- 폼 유효성 검증 아키텍처를 `UFormControlElement.validate()` 템플릿 메서드 + 컴포넌트별 `setValidity()` 구현 구조로 재정비하고, `commit(flags, message, anchor)` 헬퍼로 `setCustomValidity()` 커스텀 메시지 우선순위를 일관화. `validate(report)`로 `checkValidity`/`reportValidity`와 동일한 조용한 검증 모드도 지원.
- 로케일 시스템을 `src/core/locale.ts` 기반 레지스트리에서 `Locale` 유틸(`Locale.register()`, `Locale.set()`, `Locale.getValue()`)로 전환하고, en/ko/ja/zh-CN/zh-TW/es/fr/de/pt-BR/vi/th/id/ru/ar 14개 로케일 JSON을 빌드 시점 내장하도록 변경.
- 인터랙티브 컴포넌트의 색상 체계를 `--u-primary-color` 중심 토큰으로 전환해 hover/active/surface/outline 상태를 `color-mix()`로 파생하도록 개선. 이제 `--u-primary-color` 재정의만으로 전역 테마 컬러 커스터마이징 가능.
- 개발 스크립트를 `dev`에서 `start`로 정리하고 `test:watch` 스크립트를 제거.

### Fixed
- 오버레이/컨테이너 계열 커스텀 이벤트(`show`/`hide`/`remove`/`expand`/`collapse`/`shift`)를 `bubbles:false`, `composed:false`로 조정해 중첩 컴포넌트에서 자식 이벤트를 조상 이벤트로 오인하던 문제를 해결.
- `UFloatingElement`가 `--anchor-width`/`--anchor-height`를 실제 픽셀 기준으로 노출하도록 개선하고, `USelect`/`UInput` 팝오버 폭 계산이 strategy(`fixed`)와 무관하게 일관되게 동작하도록 수정.
- `UOption.getText()`가 텍스트 노드만 추출하도록 보정하고 `getContent()`를 추가해 `USelect` 선택값 표시에서 리치 콘텐츠 처리를 개선.
- `UTabPanel`의 `change` 이벤트가 초기 마운트/직접 값 대입 시 오발생하지 않도록 사용자 조작(클릭/키보드)에서만 발생하게 수정.
- `Toast`에 전역 기본 옵션을 추가하고 hide 이벤트 처리에서 `target`을 검사하도록 바꿔 내부 엘리먼트 이벤트 오탐을 방지.

### Removed
- **Breaking:** `UDataElement` 및 관련 스타일 파일(`UDataElement.styles.ts`) 제거.
- **Breaking:** `sanitizers` 유틸과 `buildElementHTML`(in `utilities/elements.ts`) 제거, 이에 따른 `src/index.ts` export 정리.
- 브라우저 테스트 `tests/browser/input-display-token.browser.test.ts` 제거.

## [1.3.4] - 2026-07-03

### Documentation
- `README.md`의 `## React` 섹션에 peerDependency 설치 안내(`npm install @iyulab/components @lit/react react`)를 추가. 기존 문서는 래퍼 사용 예제만 있어 `@lit/react`·`react`를 별도 설치해야 한다는 전제가 누락되어 있었고, 예제를 그대로 따라하면 `@lit/react` 미설치로 모듈 해석 오류가 났다. `@iyulab/data-components` README의 `/react` 안내와 형식을 통일.

## [1.3.3] - 2026-07-03

### Fixed
- `UCheckbox`: 클래스 JSDoc에 `@event change` 태그 누락으로 공식 React 래퍼(`@iyulab/components/react`)의 `UCheckbox` props가 빈 `{}`로 생성되어 `onChange`가 노출되지 않던 결함 수정. 런타임은 `this.relay(e)`로 `change`를 정상 발생시키지만, 래퍼 생성기가 `@event` 태그(또는 `this.fire<T>('name')` 리터럴)로만 이벤트 맵을 도출하므로 태그가 없으면 이벤트가 누락된다. (`USwitch`/`UInput`/`UTextarea`는 태그 보유 — `relay()`를 쓰는 폼 컨트롤 중 `UCheckbox`만 누락되어 있었음.) yesung-oms dogfooding에서 발견.

### Changed
- `plugins/vite-plugin-react-wrapper.ts`: `@customElement` 컴포넌트가 `this.relay(...)`/`this.dispatchEvent(...)`로 이벤트를 발생시키지만 수집된 이벤트가 0건이면 빌드 시 경고를 출력하도록 개선 — 위 `UCheckbox`류의 "태그 누락으로 이벤트가 조용히 사라지는" 결함 재발 방지. (`this.fire<T>('name')`은 이름이 정적으로 잡히므로 경고 대상이 아님.)

## [1.3.2] - 2026-07-02

### Documentation
- `docs/form-controls.md`: `UCheckbox`의 `label` attribute가 다른 폼 컨트롤과 달리 default slot의 fallback content로 쓰인다는 점(slot이 있으면 attribute보다 우선)을 "Common Properties" 표 아래에 명시.

## [1.3.1] - 2026-07-02

### Added
- `UInput`: `--u-input-display` CSS 커스텀 프로퍼티 추가(기본값 `inline-block`, 기존과 동일). 폼/그리드 셀에서 전체 폭을 채우려는 소비자는 `u-input { --u-input-display: block; }`로 오버라이드 가능 — 이전에는 전역 `u-input{ display:block; width:100% }` 같은 하드코딩 우회가 필요했다.

## [1.3.0] - 2026-07-02

### Fixed
- `UFloatingElement.strategy`에 `reflect: true` 누락 수정 — JS로 `.strategy = 'fixed'`를 설정해도 host 속성이 갱신되지 않아 `:host([strategy="fixed"])` CSS 셀렉터가 매치되지 않던 버그.

### Changed
- `USelect` 내부 `<u-popover>`의 기본 위치 전략을 `strategy="fixed"`로 변경. 기존 `absolute` 기본값은 `UDrawer` body(`overflow:auto`)처럼 스크롤 컨테이너 안에 `u-select`가 놓이면 팝오버가 잘리는 문제가 있었다(흔한 "폼 드로어 + 셀렉트" 조합에서 재현). `fixed`는 뷰포트 기준으로 그려져 조상의 `overflow`에 클리핑되지 않으며, `@floating-ui/dom`의 `autoUpdate`가 스크롤/리사이즈 시 위치를 계속 재계산하므로 기존 동작과 시각적으로 동일하게 보인다.

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
