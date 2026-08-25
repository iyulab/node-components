# Changelog

## [1.33.2] - 2026-08-25

### Fixed

- **`u-popover[trigger="hover"]` and `u-tooltip` closed immediately on touch devices.**
  Neither component distinguished pointer type in its hover handlers — a tap fires
  `pointerenter` followed almost instantly by `pointerleave` (touch/pen have no
  sustained "hover" state the way a mouse does), so the hover-opened element closed
  again before a user could interact with it. `u-popover` now falls back to a
  click-like toggle on `touch`/`pen` pointers (its content can be actionable menu
  items, so it needs a working entry point on touch); `u-tooltip` now simply does not
  open for `touch`/`pen` (its content is supplementary, matching the common
  convention of disabling hover tooltips on coarse pointers). Keyboard-driven
  `focus`/`focusin` triggers are unaffected either way.

## [1.33.1] - 2026-08-25

### Fixed

- **`aria-label` set on `<u-button>` never reached the accessibility tree.** The host
  attribute was present, but the actual interactive node exposed to assistive technology is
  the native `<button>`/`<a>` rendered inside the shadow root — ARIA content attributes on a
  shadow host do not cross the shadow boundary to label a descendant. Icon-only buttons using
  `aria-label` for their accessible name were announced as unnamed controls. `render()` now
  forwards the host's `aria-label` onto the internal element, and attribute changes made after
  connection are observed and re-rendered (previously only the initial value would have had
  any chance of being picked up).

## [1.33.0] - 2026-08-21

### Added

- **`u-radio` and `u-rating` now support `.focus()`/`.blur()` on the host element too**,
  completing the same contract added to the rest of the form controls in `1.32.0`. Both are
  option/symbol *groups* rather than a single target, so `.focus()` delegates to the first
  option (`u-radio`) or the first symbol (`u-rating`) regardless of the current selection —
  the same "one fixed delegation target" contract every other control in this library now
  shares, rather than adding value-aware branching.

## [1.32.0] - 2026-08-21

### Added

- **`u-select`, `u-date-picker`, `u-textarea`, `u-checkbox`, `u-switch`, and `u-slider` now
  support `.focus()`/`.blur()` on the host element**, matching `u-input`'s existing contract.
  Previously only `u-input` delegated `.focus()` to its actual interactive element; calling
  `.focus()` on any of the others was a silent no-op, since the host element itself carries no
  `tabindex` — only an internal element does (the container, the native `<input>`/`<textarea>`,
  or, for `u-slider`, the first thumb). Any consumer building a generic "scroll to and focus
  the first invalid field" flow now gets consistent behavior across every form control this
  library ships, instead of having to special-case each one.
- **`u-field` now exposes `.focus()` publicly**, delegating to the first focusable slotted
  child — the same lookup its label-click handler already used internally, now available to
  consumers slotting an arbitrary form control (not one of this library's own) directly into
  `<u-field>`.

## [1.31.0] - 2026-08-20

### Added

- **`u-chip`'s remove button and `u-tab`'s close button are now keyboard-operable.** Both
  render a real `<u-button>`, but it carried an explicit `tabindex="-1"` — which, despite the
  inner native `<button>` still reporting `tabIndex === 0`, removes it from the browser's
  actual Tab sequence (verified in real Chromium; the property alone doesn't tell you this).
  Neither component offered any alternative keyboard path to trigger removal, so a
  keyboard-only user could see a removable chip or a closable tab but never dismiss it without
  a mouse. The `tabindex="-1"` override is removed, restoring each button's normal default
  focusability — Tab now reaches it like any other button, and Enter/Space activate it
  natively.

## [1.30.0] - 2026-08-20

### Added

- **`u-input`, `u-select`, and `u-date-picker`'s suffix action icons (clear, password
  show/hide, and the new number stepper) are now keyboard-operable.** They were mouse-only —
  a plain `u-icon` with a click handler, no `tabindex`, no role, no accessible name — so a
  keyboard-only or screen-reader user had no way to clear a field or toggle password
  visibility. They now get `role="button"`, `tabindex="0"`, an `aria-label`, and Enter/Space
  activation, matching how the rest of the library already treats icon-triggered actions.
  Three new `Locale` keys — `clear`, `showPassword`, `hidePassword` — join `increment`/
  `decrement` from `1.29.0`, translated into all 14 built-in locales.

## [1.29.0] - 2026-08-20

### Added

- **`u-input[type="number"]` now has click `−`/`+` stepper buttons.** The native browser spin
  buttons were already hidden by CSS with nothing put in their place, so there was no way to
  adjust a number field with the mouse — only by typing or, undiscoverably, the keyboard arrow
  keys. The new buttons delegate to the native `stepUp()`/`stepDown()`, so `min`/`max`/`step`
  are respected exactly as they already were for the keyboard path; a button dims (and stops
  responding to clicks) once its direction would go past `min`/`max`. Hidden when the field is
  `disabled`, `readonly`, or not `type="number"`. Two new `Locale` keys, `increment`/
  `decrement`, back their `aria-label`s and are translated into all 14 built-in locales.

## [1.28.0] - 2026-08-17

### Added

- **`u-alert` now sets its own ARIA `role`/`aria-atomic` instead of leaving it to the
  consumer.** `status="error"`/`"warning"` renders `role="alert"` (implicit
  `aria-live="assertive"`); every other status (including no status) renders `role="status"`
  (implicit `aria-live="polite"`). `aria-atomic="true"` is always set so the whole message is
  announced as one unit. Previously a screen-reader user got no announcement at all when an
  alert appeared unless the consumer manually attached `role="alert"` at every call site —
  `status` already carries the severity, so the component derives the role from it.

## [1.27.3] - 2026-08-11

### Fixed

- **`u-textarea`'s form submission value now stays in sync with `value` across every change
  path**, not just on `change`. Previously, `ElementInternals.setFormValue()` was only called
  from the `change` handler, so submitting a form before the field lost focus (an initial
  `value` attribute or a programmatic `.value =` assignment) could send a stale or missing
  value. Sync now happens reactively whenever `value` changes, matching `u-input`'s contract.
- **`u-checkbox`/`u-switch`'s form submission value now stays in sync with `checked` across
  every change path**, not just on the native `change` event. Previously,
  `ElementInternals.setFormValue()` was only called from the click handler, so submitting a
  form before interaction (an initial `checked` attribute or a programmatic `.checked =`
  assignment) could send a stale or missing value. Sync now happens reactively whenever
  `checked` (or `value`) changes.

## [1.27.2] - 2026-08-11

### Fixed

- **`u-input`'s form submission value now stays in sync with `value` across every change
  path**, not just on blur. Previously, `ElementInternals.setFormValue()` was only called from
  the blur handler, so submitting a form before a field lost focus (an initial `value`
  attribute, a programmatic `.value =` assignment, or the clear button from 1.27.1) could send a
  stale or missing value. Sync now happens reactively whenever `value` changes, matching
  `u-select`'s existing contract.

## [1.27.1] - 2026-08-11

### Fixed

- **`u-input[clearable]`'s built-in clear button now dispatches `change`**, matching the
  existing contract on `u-select` and `u-date-picker`. Previously, clicking the clear icon
  emptied the value visually but fired no event, so consumers binding to `change` (e.g. a
  filter bound to `.value`/`@input`) never saw the reset.

## [1.27.0] - 2026-08-08

### Added

- **`formatNumber`/`formatCurrency`/`formatDate` utilities** (`utilities/format.ts`). Thin
  wrappers around `Intl.NumberFormat`/`Intl.DateTimeFormat` that default to the active
  `Locale.get()` locale. `formatCurrency` has no default currency — callers must pass one
  explicitly.
- **`u-date-picker`** — a single-date picker form control (`UFormControlElement`), matching
  the value contract of a native `input[type=date]` (ISO `YYYY-MM-DD`). Renders a calendar
  grid in a popover with full keyboard navigation (arrow keys, Home/End, Enter/Space, Escape)
  following the WAI-ARIA Date Picker Dialog pattern. `min`/`max` mark out-of-range days
  `aria-disabled` (focusable but not selectable, so keyboard users can still perceive and
  navigate past them) and drive `rangeUnderflow`/`rangeOverflow` validity. Date ranges and
  `datetime-local` are out of scope for this release.

## [1.26.0] - 2026-08-07

### Added

- **`--u-density` switch.** `u-button`, `u-form`, and `u-button-group` now read
  `font-size: var(--u-density, <current default>)` at their base rule instead of a hardcoded
  literal. Setting `--u-density` on an ancestor rescales these controls (and, since padding/
  min-height are expressed in `em`, everything proportional to them) without touching each
  component individually. Unset, rendering is byte-identical to before. An explicit `size="sm"`/
  `size="lg"` on `u-button` still wins — the switch only affects the unattributed default, not an
  author's explicit per-instance choice.
- **New token `--u-bg-color-raised-hover`.** In dark, `--u-bg-color-raised` and the global
  `--u-bg-color-hover` resolved to the same value, so hovering a card or table header produced no
  visible feedback — a single global hover token has no way to know what surface it sits on. The
  new token is computed relative to `--u-bg-color-raised` via `color-mix()` in dark; in light it
  aliases the existing hover token, since that palette already keeps raised and hover apart.
  Purely additive.

### Fixed

- 🔴**`sideEffects` omitted this package's own entry barrel, so bundlers dropped every element
  registration.** The barrel that `exports["."]` resolves to exists solely to register the custom
  elements, but it was not in the `sideEffects` allowlist. A consumer writing
  `import '@iyulab/components'` — the form this package's own documentation recommends — had the module
  elided entirely in a production build. The failure is silent: the build succeeds with no warning,
  the tags remain in the DOM, and an unregistered custom element renders nothing.

  Registration modules were already listed correctly. That was not enough: a dropped barrel means
  they are never reached.

  Measured on a minimal Vite production build importing only the barrel, the emitted chunk went from
  **692 B with zero `customElements.define` calls** to the full bundle with registrations intact
  once the barrel was declared — a one-line manifest difference, identical sources.

  The `./react` subpath entry had the same gap.

  Both the source-resolved and published-artifact forms of every affected entry point are now
  declared, so workspace consumers and installed consumers get the same guarantee.

## [1.25.0] - 2026-08-05

### Fixed

- 🔴**`u-field`: the documented `validation-message` attribute never applied.** Lit derives
  the default attribute name by **lowercasing** the property name — not by kebab-casing it —
  so `validationMessage` was only reachable as `validationmessage`. Every usage in the
  documentation and examples wrote `validation-message`, which set nothing and left the
  error text invisible. The attribute name is now declared explicitly, matching the
  convention already used elsewhere (`show-delay`, `hide-delay`).

  ```html
  <u-field label="Name" invalid validation-message="Name is required.">
    <u-input></u-input>
  </u-field>
  ```

  Property bindings (`.validationMessage=${…}`) are unaffected.

## [1.24.0] - 2026-08-04

### Added

- 🔴**`u-text` — 의미 타이포그래피 스케일(7단)을 마크업에서 쓰는 자리.**
  시트는 `1.21.0` 부터 단마다 **크기·굵기·행간·자간** 네 값을 갖고 있었지만 **그 단을
  적용하는 컴포넌트가 없었다** — 소비자가 스케일을 쓰려면 자기 CSS 에서 토큰을 직접
  참조해야 했고, 그러면 «컴포넌트만으로 화면을 짓는다»가 그 자리에서 깨졌다.
  ⇒ 우리가 준 것은 **값**이고 필요했던 것은 **자리**다.

  ```html
  <u-text level="1" variant="display">문서 제목</u-text>
  <u-text variant="subtitle" tone="weak">한 줄 설명</u-text>
  <u-text>본문</u-text>
  <u-text variant="caption" tone="weak">보조 문구</u-text>
  ```

  ★**시각 축(`variant`)과 의미 축(`level`)이 독립**이다 — `level` 을 주면 섀도 루트에 실제
  `<h1>`~`<h6>` 을 렌더해 heading 으로 읽히고(슬롯 텍스트가 접근가능 이름), 주지 않으면
  `<p>` 다. 그래서 *"페이지의 두 번째 제목이 시각적으로 가장 큰"* 배치가 마크업을
  거짓말시키지 않고 표현된다.

  ⚠**`tone` 은 중립 강조 축이다**(`default`·`weak`·`strong`·`inverse`) — 역할색이
  아니다. 소비 화면 실측에서 나온 색 다섯 중 셋이 이 축이었고 나머지 둘은 **링크**와
  **콜아웃 박스**라 이 컴포넌트의 축이 아니었다.

  ⚠**값을 새로 정의하지 않는다** — 7단 × 4속성을 시트에서 읽기만 한다. 회귀 12건이
  *"어떤 크기인가"* 가 아니라 ***"시트가 말한 그 값을 쓰는가"*** 를 잰다.
  같은 이유로 `overline` 에 `text-transform: uppercase` 를 **붙이지 않았다** — 관습이긴 하나
  소비자가 쓴 글자를 바꾸고, CJK 에는 효과가 없어 **같은 단이 언어에 따라 다르게 보인다.**

### Fixed

- 🔴**`u-field` 안의 컨트롤이 필드 폭을 채우지 않아 폼 격자가 어긋났다.** 실측: 같은 231px
  칸 안에서 `u-input` 202 · `u-select` 71/92/108 · `u-textarea` 168 — **오른쪽 끝이 다섯
  군데에서 다 달랐다.** 컨트롤 자신의 기본값(`inline-block`)은 옳지만, `u-field` 로 감싼
  순간 그것은 **폼의 한 칸**이다 ⇒ 라벨·설명·검증 문구의 배치를 책임지는 이 컴포넌트가
  폭도 함께 정한다(`::slotted(*) { width: 100% }`).
  ⚠소비자가 인라인 `style` 로 폭을 주면 그쪽이 이긴다.

### Added

- **`u-icon[fallback]`** — 이름·URL 이 해석되지 않을 때 대신 그릴 SVG 원문.
  «아이콘이 안 보인다»가 **«누를 것이 없다»** 가 되는 자리가 있다(접힌 사이드바의 메뉴 항목).
  해석 실패는 이름 미지정 · 404 · SVG 파싱 실패를 **모두** 포함한다.

### Documentation

- 🔴**`Theme.accent(seed)` 가 `primary` 역할 토큰 **7종 중 6종**만 세팅한다는 것을 명시했다.**
  `--u-primary-bg-color`(`u-tag` 의 `--tag-hue-surface` 가 읽는 «글자를 얹는 옅은 면»)는
  시트 기본값으로 남으므로, **시드만 넣으면 태그·선택된 행 같은 옅은 면이 파랑으로 남는다.**
  실측된 증상이 *"버튼은 브랜드인데 선택된 표 행은 파랑"* 이다.
  ⇒ `usage.md` 브랜드 절에 **7종 표**와 한 줄 해법을, `Theme.accent` JSDoc 에 같은 내용을 적었다.

  ⚠**파생을 붙이지 않은 이유**: 이 토큰은 `info`·`success`·`danger`·`warning` 과 한 세트로
  **5계열 × 2테마 = 10개 값이 손으로 짝지어져** 있고, 두 테마가 같은 계약을 쓰지 않는다
  (바탕 대비비 실측 — 라이트 **1.142** · 다크 **1.030**). 도출식으로 바꾸는 것은 팔레트
  값 결정이라 별도 판단이 필요하다.

  브라우저 회귀 2건이 이 문서가 참인지 잰다 — **결손을 고정하는 것이 아니라**, 나중에 파생이
  붙으면 그 테스트가 뒤집히면서 문서도 고치라고 알린다.

## [1.23.0] - 2026-08-04

### Added

- **`u-expander` — 제목을 눌러 본문을 접고 펴는 디스클로저.**

  ```html
  <u-expander label="배송 정보" open>
    <p>본문</p>
  </u-expander>
  ```

  헤더는 **네이티브 `<button>`** 이라 Enter/Space·포커스 순서가 그대로 따라온다. 높이 전환은
  grid 트랙(`0fr` ↔ `1fr`)이라 콘텐츠 높이를 JS 로 재지 않으며, `prefers-reduced-motion:
  reduce` 에서 멈춘다(접힘/펼침의 결과는 정지 상태에서도 그대로 읽히므로 이 전환은 장식이다).

  ⚠**접힘의 요점은 높이가 아니라 «도달 불가»다** — `overflow: hidden` 만으로 접으면 화면에서
  사라진 콘텐츠가 **접근성 트리와 탭 순서에 그대로 남는다.** `visibility` 를 함께 옮겨
  접힌 본문이 포커스를 받지 못하게 한다(회귀 테스트가 이 조건만 따로 잰다).

### Changed

- **콘솔 진단 문구가 영어로 이주했다** — 토큰 시트 부재 경고 · `[Dialog]` 표시 실패 ·
  `[IconRegistry]` 리졸브 실패. 화면 문자열이 아니라 **개발자 대면 진단**이고, 검색 가능성과
  이슈 재현 공유에서 영어가 유리하다는 판단이다(로케일 레지스트리에 넣지 않는다 — 사용자가
  읽는 문자열이 아니다). 문구를 판별식으로 쓰던 테스트가 있다면 *"무엇을 말하는가"* 로 좁힐 것.

### Removed

- 🔴**한 번도 동작한 적 없는 선언 3종을 걷었다.** 전부 «선언 + 문서»만 있고 그 값을 읽는
  코드가 **어디에도 없었다**(전수 검색). 동작이 없었으므로 **깨질 동작도 없다.**

  | 제거 | 문서가 약속하던 것 | 대체 |
  |---|---|---|
  | `u-panel[collapsible]` | *"Allow the panel to collapse"* | **`u-expander`**(위) |
  | `u-tab-panel[editable]` | *"Allow adding/removing tabs"* | 없음 — 탭 추가/삭제는 소비자가 슬롯을 직접 다룬다 |
  | `u-tree[droppable]` · `u-tree-item[droppable]` | *"Enable drop" / "Accepts drops"* | 없음 — 아래 참조 |

  ⚠**`draggable` 은 남는다** — 그것은 네이티브 전역 속성이라 브라우저가 드래그 자체는
  켜 준다. 다만 문서가 *"Allow reordering tabs by drag"*·*"Enable drag"* 로 **재정렬/드롭
  기능을 약속**하고 있었고 그런 코드는 존재한 적이 없다 ⇒ **문서를 사실로 정정**했다
  (*"native drag attribute — no built-in reordering"*). 드래그 재정렬·트리 드롭은 수요가
  모이면 기능으로 설계한다.

- **`Locale.namespace()` — 상위 패키지가 자기 화면 문자열을 담을 자리.**

  ```ts
  const t = Locale.namespace<'empty' | 'loading'>('u-data-view');
  t.register('en', { empty: 'No data', loading: 'Loading…' });
  t.register('ko', { empty: '데이터가 없습니다' });
  t.text('empty');                     // 활성 로케일 기준
  ```

  종전의 `Locale.register`/`getValue` 는 **검증 메시지 9키의 닫힌 유니온**(`LocaleMessageKey`)만
  받는다. 상위 패키지의 화면 문자열은 그 유니온에 없고, 넣으면 기반 라이브러리에 소비자
  도메인 어휘가 쌓인다. ⇒ 결과적으로 각 패키지가 **자기 레지스트리를 손으로 만들거나**
  문자열을 하드코딩해 왔다.

  ⚠**순수 가산이다** — `LocaleMessageKey`·`register`·`getValue` 세 시그니처를 하나도
  건드리지 않는다. 키 유니온은 **소비자가** 제네릭으로 정하므로 라이브러리 키셋은 커지지 않는다.

  조회 사슬(정확 일치 → base 언어 → `en`)과 `{name}` 치환은 검증 메시지와 **같은 구현을
  공유한다** — 두 벌로 두면 한쪽만 고쳐진다. 사슬에 없는 키는 **키 자체**를 돌려준다
  (조용히 빈 문자열이 되는 것보다 화면에 드러나는 편이 낫다).

- **`Theme.accent(seed)` — 브랜드 색 하나로 `--u-primary-*` 램프를 만든다.**

  ```ts
  Theme.accent('#6A1B9A');   // 램프 5단 + 면 위 글자색이 계산된다
  Theme.accent(null);        // 해제 — 시트 기본값으로
  ```

  종전에는 소비자가 램프를 **손으로 열 줄 적었고**, 그 값이 대비 계약을 만족하는지는
  아무것도 확인하지 않았다. 이제 **계산해서** 넣는다 — 면 위 글자 4.5 · 바탕 위 글자 4.5 ·
  `-strong` ↔ `-color` 구분 1.20 · 그래픽 3.0.

  ⚠**CSS `color-mix()` 만으로는 안 된다** — 고정 비율은 밝은 시드에서 깨진다(노랑의
  `-strong` 이 바탕 대비 **2.21**, 기준 4.5). 목표 대비까지 섞으려면 대비를 **계산**해야
  하고 CSS 에는 그 수단이 없다. ⇒ 계산은 JS, 결과만 커스텀 프로퍼티로.

  ⚠**테마가 바뀌면 다시 계산된다** — 대비 목표가 «바탕 기준»이라 라이트와 다크는 같은
  시드에서 **다른 램프**를 갖는다. 바탕은 계산 시점의 `--u-bg-color` 를 읽으므로 소비자가
  바탕을 덮었으면 그 값이 기준이 된다.

- **`u-skeleton` 에 `lines` — 여러 줄 자리표시자.**

  ```html
  <u-skeleton lines="3" height="1em"></u-skeleton>   <!-- 막대 3개 · 마지막 줄은 짧게 -->
  ```

  종전에는 목록 한 줄·문단 자리표시자를 만들 때 **폭만 다른 막대를 손으로 반복**해야 했다
  (이 리포 안에서만 12사용처). 마지막 줄을 짧게 그리는 것은 장식이 아니라 **문단의 끝**을
  나타내는 신호다(`--skeleton-last-line-width`, 기본 60%). 줄 간격은
  `--skeleton-line-gap`(기본 `0.5em`).

  ⚠**단일 막대의 모양은 바뀌지 않는다** — `lines` 가 없으면 종전과 완전히 같고, 회귀
  테스트가 그 계약을 감시한다. `pulse`/`shimmer` 는 줄마다 적용되며 `prefers-reduced-motion`
  에서 함께 멈춘다.

- **오버레이가 열릴 때 `autofocus` 를 존중하고, 없으면 첫 입력으로 간다** (`u-dialog`·`u-drawer`).

  ```html
  <u-drawer closable>
    <span slot="header">주문 편집</span>
    <u-input label="수량" autofocus></u-input>   <!-- 여기로 간다 -->
  </u-drawer>
  ```

  종전에는 `focus-trap` 의 기본값(**첫 tabbable 노드**)에 맡겨져 있었다. 그 결과 ⑴`autofocus`
  가 **무시되고**(focus-trap 은 그 속성을 보지 않는다) ⑵**버튼이 마크업 앞에 있으면 버튼이
  포커스를 가져갔다**(확인/취소가 먼저 오는 다이얼로그가 그 모양이다 — 실측: 입력이 아니라
  첫 버튼). ⇒ 순서를 계약으로 고정한다: `[autofocus]` → 첫 입력 컨트롤 → 첫 tabbable.

  ⚠**시각적 변화가 있을 수 있다** — 버튼이 앞에 오는 다이얼로그는 이제 **입력**에서 시작한다.
  기존 동작을 원하면 그 버튼에 `autofocus` 를 준다.

- **`u-tag`·`u-badge` 에 `icon` — 상태가 «색 없이도» 구분된다.**

  ```html
  <u-tag color="danger" icon>실패</u-tag>     <!-- ✕ 원형 아이콘 -->
  <u-tag color="success" icon>완료</u-tag>    <!-- ✓ 원형 아이콘 -->
  ```

  대비 계약(1.20.0)은 각 상태색이 **자기 바탕에서 읽히는가**를 지키지만 *구별되는가* 는 지키지
  않는다 — 색각 이상(남성 약 8%)이나 흑백 인쇄에서는 «성공»과 «실패»가 같은 회색 알약이 된다.
  역할 색 충돌 검사가 **색 공간에서**(ΔE) 세운 구분을 이 축은 **모양 공간에서** 세운다.

  ⚠**의미가 없는 색에는 그리지 않는다** — 장식 축(`blue`·`purple` …)은 *색 자체*를 뜻하고
  `neutral`·`primary` 는 상태가 아니다. 없는 의미를 아이콘으로 지어내면 그 아이콘이 **잘못된
  정보를 나른다**. `u-badge variant="dot"` 도 콘텐츠를 렌더하지 않으므로 대상이 아니다.

  ⚠**렌더는 가산이다** — `icon` 을 주지 않으면 종전 그대로다. 아이콘은 **내장 번들**에서 오므로
  네트워크를 타지 않는다(오프라인에서도 그려진다).

  ⚠**다만 번들 크기는 가산이 아니다** — `u-tag`·`u-badge` 가 `u-icon` 을 import 하고, 내부
  아이콘 번들은 **빌드 시점 eager glob** 이다. 그래서 `dist/components/tag/UTag.js` 만 deep
  import 하던 소비자도 이제 `UIcon`(2.3 KB)과 내장 SVG 세트(**~9.8 KB**, 19종)를 함께 받는다.
  전체 라이브러리를 쓰는 소비자에게는 변화가 없다(이미 포함돼 있다).

- **`u-skeleton` 의 `pulse`/`shimmer` 가 `prefers-reduced-motion: reduce` 에서 멈춘다.**

  ⚠**스피너는 그대로 돈다** — 갈림길은 *멈추냐 마냐*가 아니라 **어느 움직임이 의미를
  나르는가**였다. 스피너의 회전은 **신호**라 죽이면 진행 여부를 알 수 없다(WCAG 2.2.2 는
  로딩 표시처럼 움직임이 본질인 것을 예외로 둔다). 스켈레톤은 **기본값이 이미 정적**이고
  정지한 블록이 «로딩 중»을 그대로 나르므로 `pulse`/`shimmer` 는 장식이다.

  ⚠시트의 reduce 규칙(`--u-duration-*: 0ms`)은 **`animation` 을 쓰는 자리에 닿지 않는다** —
  지속시간 축을 경유하지 않기 때문이다. 그래서 컴포넌트에서 명시적으로 멈춘다.

### Changed

- ⚠**`u-dialog`·`u-drawer` 제목이 2px 작아진다** — `18px` 리터럴 → `--u-text-subtitle-size`(16px).

  종전에는 *다이얼로그 제목 18 · 얼럿 제목 16* 으로 **같은 위계가 두 값**이었다. 18px 는
  타입 스케일 7단에 **없는 단**이라 리터럴로만 존재할 수 있었고, 그래서 소비자가 스케일을
  조율해도 이 두 자리는 따라오지 않았다.

  ⚠**단을 늘리지 않았다** — 18px 를 요구하는 타이포 자리는 전수 **둘뿐**이고(`u-copy-button`
  의 18px 는 아이콘 크기다), 단일 수요로 축을 늘리는 것은 선제 확장이다. 같은 패키지의
  `u-alert` 가 이미 `subtitle` 을 쓰고 있어 **선례를 따랐다**.

  ⚠**헤더의 닫기 버튼은 `font-size: inherit` 이라 함께 2px 작아진다.**

  `tests/build/type-scale.test.ts` 가 *"제목 위계를 가진 컴포넌트가 같은 단을 읽는가"* 를
  대조한다 — 리터럴로 다시 갈라지면 발화한다.

### Fixed

- **역할 색의 «의미 충돌» 검사를 뒀다**(`tests/build/role-color-collision.test.ts`).
  대비 검사는 각 역할색을 **자기 바탕에 대해** 재므로 *"저장(primary)과 삭제(danger)가
  같은 색"* 인 상태도 **양쪽 다 통과한다** — 대비는 *읽히는가*를 묻지 *구별되는가*를 묻지
  않는다. 이제 역할끼리의 거리를 CIELAB ΔE 로 잰다(임계 20).

  ⚠**`primary` 와 `info` 는 기본값이 의도적으로 같으므로 면제**다(브랜딩은 `primary` 만
  바꾼다). 면제쌍의 **근거가 시트 주석에 남아 있는지**도 함께 잰다 — 근거 없는 면제가
  쌓이면 검사가 아무것도 지키지 않게 된다.

  실측: 면제쌍을 뺀 최소 거리가 **38.7**(라이트 `-strong` 의 warning/danger)이라 정상적인
  램프 조율에는 발화하지 않는다.

## [1.22.0] - 2026-08-03

### Added

- **`u-button` 의 `variant="ghost"` 가 `color` 축을 따른다.** 종전에는 `color` 를 무엇으로
  주든 같은 중립색이 나왔다 — `solid`·`outlined`·`link` 셋은 따르는데 **`ghost` 한 자리에서만
  축이 끊겨** 있었다.

  ```html
  <u-button variant="ghost" color="danger">삭제</u-button>   <!-- 이제 위험색 -->
  ```

  ★**`ghost` 는 색이 «필요 없는» variant 가 아니라 색이 «유일한 신호»인 variant 다.** 면도
  테두리도 없으므로 글자색이 사라지면 남는 구분이 없다 — 파괴적 액션을 `ghost` 로 두는
  화면에서 위험 신호가 통째로 없어진다.

  `link` 와 같은 이유로 면 슬롯(`--btn-color`)이 아니라 **`--btn-color-strong`**(바탕 위 글자
  단)을 읽는다. 실측 대비: primary **5.75** · danger **5.62**(흰 바탕).

  ⚠**`color` 를 주지 않은 `ghost` 는 변화 없다** — 가산 변경이다.

  ⚠**축이 한 자리에서만 끊기면 개별 확인으로는 보이지 않는다.** `ghost` 를 혼자 보면
  *"원래 수수한 것"* 으로 읽힌다. `tests/browser/button-variant-color-grid.browser.test.ts`
  가 **variant × color 를 격자로** 놓고 행 사이를 비교한다 — variant 마다 축이 나타나는
  자리가 다르므로(면·테두리·글자) 그 자리를 각각 잰다.

## [1.21.0] - 2026-08-03

> **디자인 파운데이션 릴리스.** 이 패키지에는 **글자 크기·굵기·행간·자간 토큰이 하나도
> 없었다**(폰트 패밀리 6개가 전부였다). 그래서 소비자는 화면의 모든 글자 크기를 리터럴로
> 적었고, 한 앱 안에 12·12.5·13·13.5·14 가 섞였다. 위계가 없으면 화면이 평평해 보이고,
> 평평한 화면은 낡아 보인다. 이 릴리스는 **축을 연다** — 값의 취향은 상위 계층 몫이다.

### Added

- **타입 스케일 축** — 7단 × 4속성. 단 이름은 크기가 아니라 **역할**이다.

  ```
  --u-text-{display,title,subtitle,body,label,caption,overline}-{size,weight,leading,tracking}
  ```

  ★**네 값을 단 단위로 묶어 낸다.** 크기만 주면 소비자가 굵기·행간을 각자 정해 결국
  제각각이 된다 — 스케일이 스케일로 동작하려면 한 단이 네 값을 모두 소유해야 한다.

  🔴**한글 기준으로 값을 골랐다**: ⑴행간 **전 단 1.4 이상**(라틴 관례 1.2 는 한글에서
  답답하다 — 받침 때문에 글자 상자가 세로로 꽉 차 있다) ⑵자간은 **0 이 기본**이고 큰
  제목만 음수(한글에 양수 자간은 가독성을 떨어뜨린다) ⑶양수 자간은 `overline` 하나뿐이고
  그 단은 **영문·숫자 라벨**을 전제한다.
  ⚠**`text-transform` 은 토큰으로 내지 않는다** — 한글에 대문자가 없어 `uppercase` 가
  아무 효과가 없고, 영문이 섞이면 그것만 커져 오히려 어수선해진다.

  ★**이 축의 1차 소비자는 컴포넌트가 아니라 소비 앱이다** — 화면의 제목·라벨·캡션을
  짓는 쪽이다. 컴포넌트는 대부분 자기 크기가 이미 정해져 있고(툴팁은 툴팁이다),
  `u-button` 의 `size` 축 리터럴(12/14/16px)은 **결손이 아니라 설계**다(여백·최소높이가
  전부 `em` 이라 그 한 값으로 비례한다). ⇒ 컴포넌트 배선은 **값이 이미 단과 일치하는
  자리에만** 했다(시각 변경 0): `u-alert` 머리줄 → `subtitle` · `u-tooltip`·`u-tag` →
  `caption`.

  ⚠**남은 것 하나를 숨기지 않고 적는다**: `u-dialog`·`u-drawer` 의 제목은 **18px** 인데
  **스케일에 18px 단이 없다**(title 20 / subtitle 16). 값이 어긋나므로 배선하지 않았다 —
  맞추려면 제목이 2px 작아지거나(시각 변경) 스케일에 단을 하나 더해야 한다(7 → 8단).
  **사람 판단으로 올린다.**

- **모션 축** — `--u-duration-{instant,fast,normal,slow}` · `--u-ease-{standard,decelerate,accelerate}`.
  ★**`prefers-reduced-motion: reduce` 존중을 라이브러리가 진다** — 지속시간을 0 으로 눌러
  이 축을 경유하는 모든 애니메이션이 함께 멈춘다. 소비자마다 각자 처리하게 두면 반드시
  빠뜨리는 앱이 나오고, 그 앱은 접근성 감사 전까지 아무도 모른다.

  **컴포넌트 `transition` 37곳 · 24파일 배선.** ⚠**리터럴 지속시간이 남아 있으면 그 자리는
  `prefers-reduced-motion` 을 비껴간다** — 축이 있어도 경유하지 않으면 아무것도 멈추지
  않기 때문이다. 회귀 테스트가 **컴포넌트 시트에 리터럴 지속시간 0건**을 지킨다(폴백은
  제외 — 시트 부재 시 렌더를 살리는 장치다). 컴포넌트-로컬 지속시간 토큰
  (`--switch-duration`)의 **기본값도 공용 축에서 파생**시켰다. 그러지 않으면 그
  컴포넌트만 비껴간다.

  ⚠**지속시간이 계단으로 접히면서 값이 움직인다**(최대 편차는 진행바 `0.4s → 0.32s`,
  −20%). 나머지는 ±10% 이내다(`0.15s → 140ms` · `0.2s → 220ms` · `0.3/0.35s → 320ms`).
  **값 보존 대신 계단을 고른 이유**: 7가지 지속시간을 그대로 토큰화하면 축이 아니라
  사전이 되고, 그러면 이 축의 존재 이유(전수 경유 → 한 번에 멈춤)가 성립하지 않는다.

- **여백 스케일 상단 4단** — `xl: 20px` · `2xl: 24px` · `3xl: 32px` · `4xl: 40px`.
  종전에는 `lg`(16px)에서 끊겨 **카드 안쪽 여백·섹션 간격·페이지 여백 구간이 통째로
  비어 있었다** — LOB 화면 여백의 대부분이 그 구간이다.
  ⚠`xs: 6px` 는 4px 격자를 벗어나 있으나 **바꾸지 않는다**(배선된 컨트롤 여백이 전부
  움직인다). 신규 단은 전부 4의 배수이며 테스트가 지킨다.

- **반경 스케일 상단 2단** — `2xl: 12px` · `3xl: 16px`. **면(surface)용**이다.
  카드·패널·대화상자처럼 큰 사각형은 컨트롤과 같은 반경을 쓰면 각져 보인다.
  ⚠**기존 5단(3/4/6/8px)의 값은 바꾸지 않았다** — 컨트롤용이고, 바꾸면 모든 소비자의
  버튼·입력이 동시에 움직인다.

### Changed

- ⚠**그림자가 2겹이 된다** — 접촉 그림자가 추가됐다(예: `--u-shadow-md` 는
  `0 2px 8px rgba(0,0,0,.12)` → `0 2px 8px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.05)`).
  1겹 그림자는 경계가 탁해 회색이 낀 것처럼 보인다. **기존 레이어의 값은 그대로**이므로
  기존 인상은 유지되고 접촉면만 또렷해진다.
  ★배치 순서가 **지배 레이어 먼저**인 것은 의도다 — elevation 계약이 값의 첫 레이어로
  단의 세기를 읽으므로, 그 계약과 알파 짝(`--u-shadow-color-*`)이 단일 출처로 남는다.

- ⚠**`--u-font-base` 에 CJK 폴백이 들어간다** — 국제화이지 취향이 아니다.
  종전 스택(`-apple-system, Segoe UI, Noto Sans, Helvetica, Arial`)에는 **한중일 글립을
  가진 폰트가 하나도 없었다.** Windows 는 UA 가 임의로 맑은 고딕을 고르고 macOS 는
  Apple SD Gothic Neo 를 줘서 **같은 앱이 OS 마다 다른 글꼴로 렌더**됐다.
  스택 맨 앞의 `Pretendard` 는 **소비자가 로드했을 때만** 잡히는 선택적 이름이다 —
  라이브러리는 웹폰트를 네트워크로 요청하지 않는다(소비자 CSP·오프라인 환경을 깬다).

- `u-alert` glass variant 의 반경 리터럴 `16px` 이 `--u-radius-3xl` 배선으로 바뀐다(값 동일).

### 계약 테스트

`tests/build/type-scale.test.ts` 신설 — 단·속성 존재, 두 시트 동일, 인접 단 비율 1.05~1.35,
크기 역전 없음, **행간 1.4 이상**, **양수 자간은 overline 하나뿐**, 굵기 100 단위,
`prefers-reduced-motion` 에서 지속시간 0.

## [1.20.0] - 2026-08-03

> ⚠**이 릴리스는 시각이 바뀐다.** 아래 항목들은 값을 고르는 문제가 아니라 **관계가
> 어긋나 있던 것**을 맞춘 것이며, 그 결과 버튼 폭·높이 등이 움직인다.

### Added

- **`color` 속성이 역할 값을 받는다** — `primary` · `info` · `success` · `warning` · `danger`.
  대상: `u-button` · `u-tag`(→ `u-chip`) · `u-badge` · `u-checkbox` · `u-spinner`.

  ```html
  <u-button color="danger">삭제</u-button>   <!-- 의미: 파괴적 동작 -->
  <u-button color="red">삭제</u-button>      <!-- 의미: 빨강. 리브랜딩해도 빨강 -->
  ```

  종전에는 `color` 가 **원색 이름만** 받았다. 브랜드가 빨강인 제품에서는 *브랜드*와
  *위험*이 같은 이름이 되고, 의미가 색에 종속된다.

  두 축은 성질이 반대이며 **병존**한다:

  | 축 | 값 | 리브랜딩 | 대비 |
  |---|---|---|---|
  | **역할** | `primary` `info` `success` `warning` `danger` | 따라온다 | 계약 검사가 지킨다 |
  | **장식** | `blue` `green` `red` `orange` `teal` `cyan` `purple` `pink` | 의도적 면역 | 소비자가 고른 색 |

  ★**역할 값은 전경색을 함께 가져온다.** 장식 축은 면 위 글자가 흰색 고정인데, 역할 축은
  `--u-{role}-txt-color` 를 쌍으로 받는다 — 그래서 `warning` 이 노란 면 위에 **검은 글자**로
  렌더된다. 같은 표시가 **바탕 위**에 서는 자리(`variant="link"` · `u-checkbox[variant="outline"]` ·
  `u-spinner`)는 면 단이 아니라 `-strong` 을 읽는다. 면 단을 바탕 위 글자로 쓰면 다크에서
  **3.07** 로 AA 미달이기 때문이다.

  ⚠**순수 가산 — 장식 값의 렌더는 변하지 않는다.** 계산색 대조로 실증했다(기존 장식
  매트릭스 브라우저 테스트 통과).

- **대비 계약 단언 1종** — `--u-{role}-color-strong` on `--u-{role}-bg-color`(유채색 면 위의
  **그 역할 글자**). `u-tag` 의 `surface`/`filled` 가 쓰는 실제 조합이며 두 테마 10/10 통과
  (최저 다크 warning 4.58). 종전 단언은 같은 면 위의 **중립 본문**만 재고 있었다 — 태그는
  의미를 색으로도 전달하므로 중립으로 대체할 수 없어 요구가 다르다.

- **대비 계약이 표면 3종을 교차 검증한다** — 중립 텍스트 단을 `--u-bg-color` 하나가 아니라
  `-raised`·`-active` 까지 대조한다. `--u-bg-color-raised` 는 1.18.0 신설인데 **면 축을
  늘리면서 검사의 곱집합을 늘리지 않아** 그 조합이 한 번도 측정되지 않았다.

  ★현재 미달 4칸(`--u-txt-color-weak` × `-raised`/`-active`, 두 테마)은 **측정값으로 핀**해
  감시한다 — 값을 고치는 것은 게시된 전 컴포넌트의 보조 텍스트를 움직이는 사람 판단이다.
  해소안은 실측해 두었다(양 테마 한 단씩 → 6/6 통과, 다만 보조↔본문 위계비가 다크
  2.33 → 1.46 으로 약해진다).

- ★**높이(elevation) 축 — `--u-shadow-sm` · `-md` · `-lg` · `-xl`**

  그림자 **색** 축(`--u-shadow-color-*`)은 있었지만 **높이** 축이 없었다. 그래서
  컴포넌트가 그림자를 리터럴로 썼고, 같은 리듬을 의도한 자리에 **서로 다른 값 11가지**가
  생겼다 — `u-card` 는 `0 2px 8px rgba(0,0,0,.1)`, `u-carousel` 은 같은 형태에 `.15`.

  ⚠**더 큰 문제는 그 리터럴들이 테마를 몰랐다는 것이다.** `rgba(0,0,0,.1)` 은 다크
  바탕에서 사실상 보이지 않는다 — **다크에서 카드·드롭다운의 높이 표현이 없었다.**
  색 축은 다크에서 3배 가까이 진한 값을 갖고 있었는데(`.12` → `.35`) 아무도 읽지 않았다.

  ```
              라이트                        다크                    쓰이는 곳
  sm   0 1px 3px  rgba(0,0,0,.08)   0 1px 3px  rgba(0,0,0,.25)   탭 · 슬라이더/스위치 손잡이
  md   0 2px 8px  rgba(0,0,0,.12)   0 2px 8px  rgba(0,0,0,.35)   카드 · 캐러셀 · 메뉴 항목
  lg   0 4px 12px rgba(0,0,0,.16)   0 4px 12px rgba(0,0,0,.45)   드롭다운 · 알림 · hover 상승
  xl   0 6px 18px rgba(0,0,0,.24)   0 6px 18px rgba(0,0,0,.60)   대화상자 · 드로어 · 툴팁
  ```

  **소비자 영향**: 15곳의 그림자가 이 4단으로 수렴하므로 일부 컴포넌트의 그림자가
  미세하게 바뀐다(대부분 알파 ±0.04). **다크에서는 눈에 띄게 진해진다** — 종전이
  결손 상태였다. 개별 조정이 필요하면 토큰을 덮으면 된다.

  ⚠**예외 하나**: `u-alert[variant="glass"]` 는 이 축을 쓰지 않는다 — 그 값은 유리
  질감 레시피의 일부이지 높이가 아니다(주석에 명시).

### Changed

- **라이브러리가 스스로 그리는 숫자를 고정폭 자릿수로 낸다** — `u-slider` 의 값 표시와
  썸 툴팁, `u-select` 의 개수 표시(`n / m`).

  셋 다 **제자리에서 값이 바뀌는** 자리다. 비례폭 숫자는 자릿수가 바뀔 때마다 폭이
  달라져 옆 요소를 밀어내므로, 슬라이더를 끌 때 값이 흔들리고 선택할 때마다 라벨 줄이
  움직였다.

  ⚠**눈금 라벨과 입력 필드는 대상이 아니다** — 눈금 라벨은 값이 바뀌지 않고 각자 제
  위치에 정렬되며, 입력 필드는 소비자가 정할 몫이다(`u-input[type="number"]` 의
  `::part(input)` 오버라이드 예시가 문서에 있다).

- ★**`u-button` 의 크기 축이 실제로 비례하게 됐다.**

  크기 축은 `font-size` 하나로 움직이고 나머지가 `em` 으로 따라오는 설계인데,
  **두 값이 그 비례에서 빠져 있었다.**

  ```
  ⑴ 가로 여백 = 세로 여백 (둘 다 0.5em)       →  글자가 테두리에 붙었다
  ⑵ min-height 없음                            →  아이콘 버튼과 글자 버튼의 높이가 달랐다
  ```

  ⑵ 는 툴바에서 눈에 띄는 어긋남이었다 — 실측(같은 `size`):

  ```
              sm      md      lg
  글자 버튼   32px    37px    42px
  아이콘 버튼 30px    32px    34px      ← 계단의 기울기가 달라 size 를 올릴수록 벌어진다
  ```

  **바뀐 것**

  | | 종전 | 1.20.0 |
  |---|---|---|
  | `--btn-padding-inline` 기본값 | `0.5em` | **`1em`** |
  | 내부 버튼 `min-height` | 없음 | `calc(1.5em + 2 × --btn-padding-block + 2px)` |

  ★**최소높이는 상수가 아니라 글자 버튼의 자연 높이를 그대로 다시 쓴 식**이다
  (줄높이 + 상하 여백 ×2 + 테두리 ×2). 그래서 **글자 버튼의 높이는 변하지 않고**
  아이콘 버튼만 같은 높이로 올라온다. 상하 여백을 덮어도 둘이 함께 움직인다.

  **소비자 영향**: 버튼이 **가로로 넓어진다**(md 기준 좌우 7px → 14px). 좁은 폭을
  유지해야 하면 `--btn-padding-inline` 을 덮으면 된다 — 높이는 그 값에서 파생되지
  않으므로 영향받지 않는다.

### Fixed

- ★**다크 테마에서 입력 오류·포커스를 테두리로 알 수 없던 문제** — 상태 테두리 두 토큰이
  **면**의 단(`-color`)을 읽고 있었다. 테두리는 면이 아니라 **면 위에 그리는 선**이므로
  `-strong` 이 맞고, 그 어긋남이 다크에서 WCAG 1.4.11(비텍스트 3.0) 미달로 나타났다.

  ```
                                입력면 위 대비        라이트          다크
  --u-input-border-color-focus    → -strong        4.60 → 5.75    2.74 ✗ → 4.74 ✓
  --u-input-border-color-invalid  → -strong        4.98 → 5.62    2.44 ✗ → 4.34 ✓
  ```

  두 테마 모두 **더 잘 보이는 쪽으로만** 움직인다. 영향 범위는 `u-input` · `u-textarea` ·
  `u-select` · `u-checkbox` · `u-switch` 의 포커스/오류 표시다.

  ⚠**리브랜딩 시**: 상태 테두리는 이제 `--u-primary-color-strong` · `--u-danger-color-strong`
  을 따른다. 역할당 5단을 모두 재정의하는 정규 경로를 쓰고 있다면 조치가 필요 없다.
  `--u-primary-color` **한 단만** 덮고 있었다면 포커스 테두리가 따라오지 않으므로
  `-strong` 도 함께 덮을 것.

- **역할 축 검사에 구멍이 있었다** — `role-token-layer.test.ts` 의 장식 축 면제 판정이
  `[color=…]` 전체였다. 역할 값도 같은 형태의 선택자를 쓰므로, **역할 규칙이 팔레트를
  직접 읽어도 검사가 침묵**했다. 면제를 장식 값에만 준다.

- ★**다크 테마에서 키보드 포커스 링이 잘 보이지 않던 문제** — 모든 컴포넌트에 적용된다.

  포커스 링(`UElement` 의 `:focus-visible`)이 `--u-primary-color-weak` 를 읽고 있었다.
  포커스 링은 **바탕 위에 그리는 그래픽**이라 바탕 기준으로 재야 하는데, 그 단은
  **다크에서 2.31**(WCAG 1.4.11 기준 3.0)이다. `-strong` 으로 옮겨 라이트 5.75 ·
  다크 5.32 로 두 테마 모두 통과한다.

- ★**바탕·트랙 위 그래픽이 `-weak` 를 읽던 자리를 `-strong` 으로 옮겼다.**

  ```
  진행바 · 진행 링 (5상태 각각)      트랙(neutral-200) 위에서 재야 한다
  별점 기호                          라이트에서 노랑(#FFEB3B) 대 흰 바탕 = 1.22
  스플리터 활성 표시
  포커스 링 (위 항목)
  ```

  실측(비텍스트 3.0 기준, 5역할 × 2테마 = 10칸):

  ```
             바탕 위        트랙 위
  -weak      4칸 통과       1칸 통과      ← 종전
  -strong    10칸 통과      10칸 통과     ← 1.20.0 (최저 4.34)
  ```

  ⚠**진행바·진행 링 안에도 비대칭이 있었다** — 같은 컴포넌트인데 `success`·`error` 는
  `--u-*-color`(면의 단), `warning`·`info` 는 `--u-*-color-weak` 를 읽고 있었다.
  다섯 상태가 이제 같은 단을 읽는다.

  ⚠**시각 변경**: 진행바·진행 링·별점이 진해진다. 특히 **라이트에서 별점이
  노랑 → 어두운 호박**으로 바뀐다. 종전 값(#FFEB3B)은 흰 바탕에서 1.22 였고, 빈 별
  (`--rating-symbol-off-color`, #E0E0E0)과의 구분도 사실상 없었다 — *별점을 읽을 수
  없는 상태*였다. 금색 별이 필요하면 `--rating-symbol-color` 를 덮으면 된다.

  ⚠**`u-tag` 의 테두리(`--tag-hue-line`)는 옮기지 않았다** — 그 선은 바탕이 아니라
  **태그 자신의 면을 두르며**, 장식 축이 같은 자리에서 `shade-300` 을 쓰므로 역할 축만
  옮기면 두 축의 대응이 깨진다. "장식 테두리가 1.4.11 대상인가"는 별개의 판단이다.

### Documentation

- **비라틴 문자권(CJK·태국어·아랍어) 폰트 스택 지침** — `docs/theming.md` 에 절을 신설했다.
  `--u-font-base` 는 시스템 UI 스택이라 **대부분의 앱은 조정할 필요가 없다**. 문제가
  드러나는 것은 **브라우저 UI 언어와 콘텐츠 문자가 다른 경우**로, 그때 스택이
  `Helvetica`/`Arial` 까지 떨어지고 브라우저가 글자마다 대체 서체를 골라 줄이 고르지
  않게 보인다. `:root:lang(…)` 별 권장 스택 6종과 **순서 규칙**(플랫폼 UI 폰트를 앞에
  유지하고 명시 서체를 그 뒤 대비책으로), 그리고 `--u-font-mono` 에 CJK 커버리지가
  없다는 점을 함께 적었다.

## [1.18.0] - 2026-08-02

### Added

- **`--u-bg-color-raised`** — 바탕에 인접해 있으면서 한 단 구분되는 **크롬 면**
  (툴바 · 표 헤더 · 푸터 · 페이지네이션).

  ```
  라이트  neutral-50  (#FAFAFA)   다크  neutral-300 (#2A2A2A)
  ```

  종전에는 배경 역할 토큰이 **상호작용 상태 이름뿐**이었다(`-hover`·`-active`·
  `-disabled`). *"바탕보다 한 단 올라온 면"* 을 뜻할 수단이 없어, 소비 패키지가
  `:host-context([theme="dark"])` 로 다크만 손으로 보정했다 — 그리고 그 선택자는
  **Firefox·Safari 에서 미지원**이라 그 브라우저에서는 다크가 적용된 적이 없었다.

  ⚠**`--u-panel-bg-color` 와 다르다.** 그쪽은 *떠 있는* 패널(카드·대화상자·메뉴)이라
  라이트에서 페이지와 같은 흰색이고 그림자가 높이를 나른다. 크롬 면은 그림자가 없어
  라이트에서도 틴트가 필요하다.

  ⚠**한 단만 정의한다.** 두 단째의 실측 수요는 라이트 한쪽뿐이었고, 다크에서는 소비 측
  오버라이드가 두 값을 이미 같은 단으로 합치고 있었다. 상호작용 상태 축에 높이를 얹지도
  않는다 — 의미가 어긋난다.

## [1.17.0] - 2026-08-02

### Fixed

- ★**알림(`u-alert`) 아이콘이 알림 배경 위에서 보이지 않던 문제 — 라이트 4/4 미달.**

  ```
  라이트 (기준 3.0)   error 2.31 ✗   warning 1.48 ✗   info 2.63 ✗   success 2.50 ✗
  다크                 3.18 ✓         3.80 ✓          3.48 ✓        3.95 ✓
  ```

  원인은 **전경이 아니라 배경**이었다. 알림 배경이 `--u-*-color-weakest`(라이트
  shade-200)였는데, 그 단은 **진행바 버퍼 같은 그래픽**에도 쓰인다 — 그래픽으로 보이려면
  진해야 하고 면으로 쓰이려면 옅어야 한다. 두 요구를 한 단에 겹쳐 둔 것이 결함의 뿌리다.

  ⇒ 알림 배경을 **면 토큰 `--u-*-bg-color`** 로 옮겼다. 두 테마 **4/4 통과**(4.58~7.00).
  `-weakest` 는 그래픽 단으로 남는다.

  **라이트 알림 배경이 옅어진다** — error `#EF9A9A` → `#FFEBEE` · info `#90CAF9` →
  `#E3F2FD` · success `#A5D6A7` → `#E8F5E9` (warning 은 `#FFF59D` 유지).

- **라이트 `--u-warning-color-strong` 이 어떤 배경에서도 읽히지 않던 문제.**
  yellow-700(`#FBC02D`)은 흰 바탕 1.66 · 노란 면 위 1.61 이다. 노랑 램프는 900 까지도
  2.65 로 미달이고 **1000(`#8A4A00`)에서 처음 6.86** 이 된다.

  ⇒ 라이트만 `yellow-1000` 으로 옮겼다(다크는 yellow-700 = 5.30 으로 이미 정상).
  경고 아이콘·문구가 **밝은 노랑에서 어두운 호박색으로** 바뀐다 — 이 단의 용도는 면이
  아니라 글자·아이콘이므로 색상보다 가독성이 앞선다.

  ⇒ 1.16.0 이 대비 검사에서 **제외해 두었던 라이트 warning 이 제외 없이 통과**한다.

### Added

- **`--u-warning-bg-color`** — 1.16.0 에서 유일하게 빠져 있던 유채색 면 토큰.

  당시 판정은 *"라이트 황색 틴트가 Δ0.071 로 거의 보이지 않아 세기를 맞출 단 짝이 없다"*
  였는데, 그 측정은 **shade-0 짝만** 재고 있었다. 노랑만 한 단 내려 잡으면 라이트 쪽
  세기가 맞는다 — 바탕 대비 휘도 델타 실측:

  ```
  blue-0 0.131 · red-0 0.132 · green-0 0.117 · yellow-200 0.110   (yellow-0 은 0.027)
  ```

  라이트 `yellow-200` / 다크 `yellow-100`. ⚠단 이름이 계열마다 다른 것은 이 층의 정상
  상태다 — 라이트 팔레트는 휘도 순이 아니라 같은 단 번호가 같은 세기를 뜻하지 않는다.

- **대비 계약 단언 2종** — `상태 아이콘이 그 상태의 면 위에서 보인다`(비텍스트 3.0)와
  면 토큰 위의 본문(5역할 전부). 1.16.0 이 측정값으로만 기록해 둔 항목이 단언으로 승격됐다.

### Known issues

1.16.0 의 다음 둘은 그대로다 — **다크 `-weak` 의 구조적 충돌**(바탕 위 그래픽과 흰 글자를
받는 면이 팔레트의 반대쪽을 요구한다)과 **`--u-border-color-strong` 3.0 미달**.
알림 테두리(`-weaker`)도 면 위에서 3.0 에 못 미치지만(1.13~2.61), 알림은 상호작용
컴포넌트가 아니라 WCAG 1.4.11 적용 여부 자체가 판단을 요구하므로 이번에 손대지 않았다.

## [1.16.0] - 2026-08-02

### Fixed

- ★**역할 토큰의 유채색 단이 WCAG AA 를 받치지 못하던 문제 — 두 테마 모두.**

  1.15.0 은 *"라이트 shade-600 위의 흰 글자가 8색 중 6색 미달, 다크는 8/8 통과"* 로
  기록했다. 그 측정은 **한 방향만** 재고 있었다 — 같은 토큰이 **바탕 위의 글자**로도
  쓰이는데, 그쪽은 다크가 미달이었다:

  ```
  바탕 위의 글자 (기준 4.5)          면 위의 흰 글자 (기준 4.5)
  라이트  --u-primary-color  3.68 ✗   라이트  3.68 ✗
  다크    --u-primary-color  3.07 ✗   다크    6.09 ✓
  다크    --u-danger-color   2.74 ✗   다크    6.83 ✓
  ```

  실제로 깨져 있던 자리: **입력 오류 문구**(`u-field`·`u-checkbox`·`u-switch`),
  **링크 버튼**(`variant="link"` 쉬는 상태 3.12), **복사 완료 표시**, hover/active
  텍스트·아이콘.

  ⇒ **단을 대비로 다시 골랐다.** 단 번호가 아니라 측정이 기준이다:

  | 토큰 | 라이트 | 다크 |
  |---|---|---|
  | `--u-primary-color` · `--u-info-color` | blue-600 → **blue-700** (4.60) | 변경 없음 (면, 6.09) |
  | `--u-primary-color-strong` · `--u-info-color-strong` | blue-700 → **blue-800** (5.75) | blue-700 → **blue-800** (5.32) |
  | `--u-danger-color` | red-600 → **red-700** (4.98) | 변경 없음 (면, 6.83) |
  | `--u-danger-color-strong` | red-700 → **red-800** (5.62) | red-700 → **red-800** (4.87) |
  | `--u-success-color` | green-600 → **green-800** (5.13) | 변경 없음 (면, 4.93) |
  | `--u-success-color-strong` | green-700 → **green-900** (7.87) | 변경 없음 (5.15) |

  ⚠**계열마다 단이 다르고 테마마다 다르다.** Material 램프는 휘도가 아니라 색상 기준으로
  만들어져 있어 같은 단 번호가 같은 세기를 뜻하지 않는다(green 은 700 도 4.12 로 미달이라
  두 단을 건너뛴다). 종전에는 두 시트가 **같은 단**을 쓰도록 테스트가 강제하고 있었고,
  그 규칙이 라이트만 미달인 결함을 세 번 반복해서 만들었다.

  ⚠**라이트와 다크에서 요구가 갈리는 이유**: 라이트는 바탕도 on-color 도 흰색이라 두
  요구가 한 조건으로 합쳐지지만, 다크는 바탕 `#121212` · on-color `#FFFFFF` 로 **정반대
  방향**이다. 한 단이 둘을 맡을 수 없다. 그래서 `-color` 는 **면**, `-strong` 은
  **글자·아이콘**으로 용도를 확정했고, 다크에서 두 단이 벌어진다.

- **`--u-warning-txt-color` 가 노란 면 위에서 읽히지 않던 문제** — `#FFFFFF` 는 라이트
  노랑 위에서 1.40 이다. 노랑은 **어떤 단으로 옮겨도** 흰 글자로 AA 를 못 받치므로
  (라이트 최대 2.65 @900, 그마저 갈색) 전경을 뒤집었다: `var(--u-neutral-1000)` —
  라이트 `#000000`(15.05 ✓) · 다크 `#FFFFFF`(4.65 ✓). 한 줄로 양 테마를 만족한다.

- **`u-badge[color="blue"]` 가 장식 축에서 역할 토큰을 읽던 문제.** 이 한 색만
  `--u-primary-color` 를 참조해, 브랜드 색을 바꾸면 `color="blue"` 배지가 함께 움직였다
  (`color="green"` 등 나머지 8색은 팔레트 직참조라 움직이지 않는다). `--u-blue-500` 로
  되돌렸다 — 이 컴포넌트의 다른 장식 색과 같은 단이다. **배지 파랑이 `#1E88E5` →
  `#2196F3` 로 바뀐다.**

- **`u-button[variant="link"]` 이 `--u-link-txt-color` 를 무시하던 문제.** 링크 색을
  정의해 둔 토큰이 **어디에서도 쓰이지 않았고**, 링크는 대신 `--u-primary-color-weak`
  (흰 바탕 3.12 ✗)를 썼다. 쉬는 상태를 그 토큰으로 되돌리고, hover/active 는 밑줄 +
  `-strong` 한 단으로 합쳤다.

### Added

- **`tests/build/token-contrast.test.ts`** — 역할 토큰의 **조합 대비**를 단언하는 회귀망.
  값 하나를 재는 것으로는 토큰이 안전한지 알 수 없다는 것이 위 결함의 교훈이므로,
  `(전경, 배경, 기준)` 표를 두 테마에 대해 검사한다. 소비자가 `--u-primary-color` 를
  덮어써도 살아남는 형태의 계약이다.

- **`node scripts/token-fallbacks.mjs --refresh`** — 시트 값이 바뀐 뒤 **이미 배선된**
  폴백 리터럴을 다시 굽는다. 종전 생성기는 배선만 하고 갱신을 못 해서, 매핑을 바꿀 때마다
  수십 곳을 손으로 고쳐야 했다(*"폴백은 손으로 쓰지 말고 생성한다"* 는 원칙에 갱신 경로가
  없었다). 이번 변경의 49곳이 이 명령으로 처리됐다.

### Changed

- **시각 변화 요약** — 전부 *진해지는* 방향이며 레이아웃에 영향이 없다.
  주 강조색 `#1E88E5` → `#1976D2` · 오류색 `#E53935` → `#D32F2F` ·
  성공색 `#43A047` → `#2E7D32` · 링크/hover 텍스트가 한 단 더 · 경고 면 위 글자가
  흰색 → 검정 · 배지 파랑 `#1E88E5` → `#2196F3`.
  다크에서는 **글자로 쓰이는 자리만** 밝아진다(면 색은 그대로).

### Known issues

- **알림(`u-alert`) 아이콘이 알림 배경 위에서 3.0 에 미달** — 라이트 danger 2.61 ·
  warning 1.48 (info 3.28 ✓ · success 4.79 ✓ 는 이번 재매핑으로 해소됐다). 원인은
  전경이 아니라 **배경(`-weakest` = shade-200)이 너무 진한 것**이라 면 토큰 쪽을
  손봐야 한다. 다크는 4/4 통과한다.

- **다크에서 `-weak`(진행바 채움·별점·포커스 링)가 바탕 위 3.0 미달** (2.31).
  이 자리는 재매핑으로 못 고친다 — 다크에서 `-weak`(바탕 위 그래픽, 밝아야 함)와
  `-color`(흰 글자를 받는 면, 어두워야 함)가 팔레트의 **반대쪽**을 요구하므로 강도 축
  하나로 표현되지 않는다. 새 축 신설 여부는 설계 결정이다.

- **`--u-border-color-strong` 이 양 테마 모두 3.0 미달** (라이트 1.88 · 다크 2.40).
  무엇이 "UI 컴포넌트 경계"인지의 판단이 선행돼야 한다.

- **장식 축(`[color=X]`)의 shade-600 위 흰 글자는 여전히 8색 중 6색 미달** — 아래
  1.15.0 항목 참조. 역할 층과 달리 장식 축은 소비자가 고른 색이라 라이브러리가 단을
  대신 고를 수 없다.

## [1.15.0] - 2026-08-02

### Fixed

- ★**`--u-txt-color-weak` 가 라이트 테마에서 WCAG AA 에 미달하던 문제.**
  흰 배경 대비 **2.68** (AA 기준 4.5) 이었다. neutral-500 → **neutral-600** 으로 한 단
  내려 **4.61** 로 통과한다. 다크 매핑(neutral-700 = 5.43)은 원래 정상이었으므로 그대로
  둔다 — **라이트 한쪽만의 결함**이었다.

  이 토큰은 컴포넌트 전반의 보조 텍스트가 쓴다. **보조 텍스트가 한 단 진해진다** —
  방향이 단조로워(가독성만 상승) 레이아웃·위계에는 영향이 없다. 배선된 폴백 리터럴
  17곳(11파일)도 함께 맞췄다.

### Added

- **유채색 표면 토큰 4종** — `--u-primary-bg-color` · `--u-info-bg-color` ·
  `--u-success-bg-color` · `--u-danger-bg-color`.

  종전에는 역할 층의 유채색이 **전경 5단뿐**이라, 상태 배경(선택된 행, 정보 패널,
  오류 줄 …)이 필요한 컴포넌트는 팔레트를 직접 읽고 다크를 손으로 보정해야 했다.

  ⚠**두 테마가 같은 단이 아니라 같은 세기가 되도록 짝지었다.** 팔레트의 유채색 틴트는
  다크에서 짓눌린다 — 바탕 대비 델타의 다크/라이트 비가 중립은 1.34~1.62배인 반면
  청색은 **0.38~0.54배**다. 그래서 라이트 shade-0 ↔ 다크 shade-100 으로 맞췄고,
  실측 세기 비는 blue 1.09 · red 1.12 · green 0.91 이다.

  ⚠**경고(yellow)는 빠져 있다.** 라이트 황색 틴트가 Δ0.071 로 거의 보이지 않아 어떤
  단 짝을 골라도 비가 2배 밑으로 내려가지 않는다(최선 1.99). 팔레트 리터럴 재설계가
  선행돼야 한다.

- **유채색 배경 위의 글자 토큰 5종** — `--u-primary-txt-color` 외.
  `--u-txt-color-inverse` 는 다크에서 neutral-100(`#121212`)이라 유채색 버튼 위에서
  읽히지 않는다. 브랜드 색을 바꾸는 소비자가 전경색도 함께 조절할 수 있도록 분리했다.
  값은 두 테마 모두 `#FFFFFF` 이며 **현재 렌더는 바뀌지 않는다**(컴포넌트가 이미
  리터럴 흰색을 쓰고 있었다).

### Known issues

- ★**라이트 팔레트의 shade-600 위에서 흰 글자가 AA 에 미달한다 — 8색 중 6색.**
  `u-button[variant="solid"]` 이 그 조합이다. 실측(흰 글자 기준):

  | 계열 | 라이트 shade-600 | 라이트 shade-700 | 다크 shade-600 |
  |---|---|---|---|
  | blue | 3.68 ✗ | 4.60 ✓ | 6.09 ✓ |
  | green | 3.30 ✗ | 4.12 ✗ | 4.93 ✓ |
  | red | 4.23 ✗ | 4.98 ✓ | 6.83 ✓ |
  | orange | 2.37 ✗ | 2.70 ✗ | 5.34 ✓ |
  | teal | 4.32 ✗ | 5.32 ✓ | 4.91 ✓ |
  | cyan | 2.74 ✗ | 3.51 ✗ | 4.56 ✓ |
  | purple | 7.04 ✓ | 8.20 ✓ | 6.03 ✓ |
  | pink | 4.95 ✓ | 5.87 ✓ | 5.47 ✓ |

  **다크는 8/8 통과**한다. 한 단 내리는 것(shade-700)으로는 3색만 해결되고 green·
  orange·cyan 은 여전히 미달이라, **라이트 유채색 램프의 리터럴 재설계**가 필요하다.
  위 `--u-txt-color-weak` 와 같은 성격이며 — 다크는 대비를 검증하며 만들어졌고 라이트는
  그렇지 않다 — 범위가 훨씬 크다. 이번 릴리스에서는 고치지 않았다.

## [1.14.1] - 2026-08-01

### Fixed

- ★**Vite 플러그인 진입점이 게시본에 실려 있지 않던 문제 수정** —
  `@iyulab/components/plugins/vite-plugin-react-wrapper.js` 를 임포트하는 소비 패키지의
  **빌드가 실패**했다(`ERR_MODULE_NOT_FOUND`).

  플러그인을 타입 검사 전용(`noEmit`)으로 바꾸면서 `.js` 산출물이 사라졌는데
  `exports`·`files` 선언은 그대로 남아 있었다. **이 패키지 안에서는 아무 증상이 없다** —
  로컬 빌드는 상대 경로로 `.ts` 소스를 직접 읽기 때문이다. 깨지는 곳은 게시본을 설치한
  다른 패키지이고, 그것도 버전 범위가 새 버전을 잡을 때까지 잠복한다.

  산출물을 **`dist/plugins/`** 로 내보내고 `exports` 가 그곳을 가리키게 했다.
  **임포트 경로는 종전과 같다** — 소비 패키지는 변경할 것이 없다.
  (산출물을 소스 옆이 아니라 `dist/` 밑에 두는 것은 의도적이다. 옆에 두면 확장자 없는
  임포트가 컴파일본을 소스보다 먼저 잡아 로컬만 낡은 산출물을 쓰게 된다.)

  `exports` 대상이 실재하는지 검사하는 테스트를 추가했다 — 게시 계약은 게시하는 쪽에서
  확인해야 한다. 소비하는 쪽은 너무 늦게 안다.

## [1.14.0] - 2026-08-01

### Added

- **토큰 시트 없이도 렌더된다** — 시트 토큰 참조 **411곳**에 use-site 리터럴 폴백을
  배선했다(`var(--u-txt-color)` → `var(--u-txt-color, #212121)`).

  토큰 시트(`styles/tokens.css`)를 로드하지 않으면 `var(--u-*)` 는 무효가 되고 **그 선언이
  통째로 버려진다** — 색이 빠지는 게 아니라 규칙이 사라지는 것이라, 텍스트가 안 보이거나
  패널이 완전히 투명해진다. 이제 시트가 없어도 기본 테마 값으로 렌더된다.

  **시트를 쓰는 경우 시각 변화는 없다** — 폴백은 시트가 없을 때만 평가된다. 리터럴이
  시트 값과 어긋나지 않도록 대조 테스트가 강제하며, 폴백은 손으로 쓰지 않고 생성한다.

- **`Theme.resolved()`** — 문서에 **실제로 적용된** 테마(`'light' | 'dark'`)를 돌려준다.

  `Theme.get()` 은 사용자의 **선호**를 돌려주며 거기에는 `'system'` 이 있고, 그것이
  기본값이다. 그래서 `get() === 'dark'` 로 분기하는 소비자는 **system + OS 다크에서
  밝은 화면을 그리게 된다** — 가장 흔한 경로에서 틀린다. 실효 테마를 알 방법이 없어
  소비자마다 다르게 추측하고 있었다.

  ⚠**폰트 계열(`--u-font-*`)은 예외**다 — 폴백을 배선하지 않았다. 폰트 스택은 리터럴이
  100자를 넘어 모든 사용처에 굽으면 얻는 것보다 잃는 것이 크고, 시트가 없으면 UA 기본
  폰트로 대체되어 **화면이 깨지지 않는다**(색·테두리는 깨진다).

### Fixed

- ★**토큰 시트를 쓰지 않을 때 버튼만 다른 브랜드 색으로 렌더되던 문제 수정** —
  `u-button` 의 폴백 3곳(`#3b82f6`·`#2563eb`·`#1d4ed8`)이 디자인 시트의 파랑
  (`#2196F3`·`#1E88E5`·`#1976D2`)과 다른 계열이었다. 시트를 로드한 환경에서는 폴백이
  평가되지 않아 드러나지 않았고, **시트 없이 쓰는 소비자에게만** 버튼이 다른 파랑으로
  보였다. 시트 값으로 맞췄다.
- **오버레이 배경 불투명도 불일치 수정** — 폴백이 `rgba(0,0,0,0.4)`, 시트가 `0.5` 였다.
- **`u-badge` 의 폴백이 다른 명도 단을 가리키던 문제 수정** —
  `var(--u-primary-color, var(--u-blue-500))` 이 시트 정의(`--u-blue-600`)와 어긋나 있었다.

### Changed

- **토큰 시트 부재 경고 문구를 실제 거동에 맞췄다.** 종전에는 *"테두리·배경·색이 무효가
  됩니다"* 였으나 폴백 배선으로 더는 무효가 되지 않는다. 이제 남는 손실을 정확히 말한다 —
  **다크 테마와 테마 변수 오버라이드가 적용되지 않는다.** 경고 자체는 유지한다: 폴백은
  *"조용히 사라지지 않게"* 하는 안전망이지 *"시트 없이 써도 된다"* 가 아니다.
- **`u-tree` 의 기본 글자 크기가 `rem` 에서 `em` 으로 바뀌었다.** 루트 기준이라 소비자가
  컨테이너 타이포를 키워도 트리만 따라오지 않았다. **기본 상황에서는 두 단위가 같은 값
  (14px)이므로 시각 변화가 없고**, 상속 컨텍스트에서만 동작이 달라진다 —
  `<div style="font-size:24px"><u-tree>` 안에서 트리가 21px 로 함께 커진다.

## [1.13.0] - 2026-08-01

### Added

- **여백 스케일 토큰** `--u-space-3xs|2xs|xs|sm|md|lg` (2·4·6·8·12·16px). 컨테이너·오버레이
  (`u-card`·`u-dialog`·`u-drawer`·`u-alert`·`u-menu`·`u-tooltip`·`u-carousel`·`u-divider`·
  `u-slider`·`u-button-group`)의 레이아웃 여백 **선언 28곳(토큰 참조 33건)**을 이 스케일로 배선했다.
  반경 스케일과 마찬가지로 테마와 무관하며 두 시트가 같은 값을 갖는다.

  **시각 변화는 없다** — 배선은 `var(--u-space-md, 12px)` 형태로 원래 리터럴을 폴백에
  보존하며, 토큰 값이 그 리터럴과 같다(테스트로 강제한다). 토큰 시트를 넣지 않은 소비자도
  종전과 동일하게 렌더된다.

### ⚠ 이 스케일을 폼 여백에 쓰지 마세요

**여백은 하나의 축이 아니다.** 폼·인라인 요소(`u-button`·`u-input`·`u-select`·`u-checkbox`·
`u-radio`·`u-switch`·`u-badge`·`u-tab`·`u-field` 등)의 여백은 `em` 이라 **상속된 `font-size`
에 비례**한다 — `body { font-size: 18px }` 를 지정하면 그 컴포넌트들의 여백도 함께 커진다.
그 비례는 의도된 동작이므로 절대 스케일로 흡수하지 않았다.

폼 여백을 조정할 때는 이 토큰이 아니라 해당 컴포넌트의 훅(`--btn-padding-block` 등)이나
타이포를 쓰세요. 어떤 토큰이 어느 축에 속하는지는 `docs/design-tokens.md` 에 있다.

### Fixed

- ★**`u-divider` 의 간격이 소비 앱 CSS 리셋에 지워지던 문제 수정** — 마지막 남은 리셋 취약
  컴포넌트였다. 간격을 `:host` 의 `margin` 에서 **내부 요소(`::part(base)`)의 `padding`** 으로
  옮겼다. 기본 렌더는 동일하다.
  ★종전에는 *"구분선 간격은 형제를 밀어내는 것이라 내부 요소로 옮기면 상쇄된다"* 는 이유로
  해법이 없다고 봤는데, 그것은 **`margin` 을 옮길 때만** 참이다. `padding` 은 호스트 박스
  자체를 키우므로 형제는 종전대로 밀려나고, 섀도 내부에 있어 문서 리셋이 닿지 못한다.
  실제 렌더 측정(리셋 적용 전후의 형제 간 거리)으로 검증했다.
  ⚠**호환성**: `u-divider { margin: … }` 처럼 호스트에 직접 간격을 주던 소비자는 이제 효과가
  없다. `--divider-spacing` 을 쓴다(리셋 아래에서도 동작하는 것을 테스트로 확인했다).
  `u-divider` 에 `part="base"` 가 추가됐다.

### Changed

- **`u-tag` 의 prefix/suffix 간격을 `--tag-gap` 하나로 일원화** — 종전에는 `gap`(4px)과 슬롯
  margin(0.15em, 약 1.8px)이 **같은 자리에 겹쳐** 있어, 소비자가 `--tag-gap` 을 0 으로 줘도
  1.8px 이 남았고 그 값에는 훅이 없었다. `--tag-gap` 기본값을 합계(약 6px)로 올려 흡수했다 —
  렌더 간격 차이는 서브픽셀이다.

### Documentation

- **타이포에 반응하는 컴포넌트 / 그렇지 않은 컴포넌트**를 `docs/design-tokens.md` 에 명시했다.
  대부분은 `font-size: inherit` 이라 소비자 타이포를 따르지만, `u-tag`·`u-tree-item`(12px)·
  `u-copy-button`(18px)·`u-icon-button`(20px)은 **의도적으로 자기 크기를 고정**한다 —
  주변 텍스트와 무관하게 일정해야 읽히는 것들이다. 이 넷의 `em` 여백은 고정 크기 위에
  얹히므로 실질적으로 절대값이며, 크기 조정은 각 컴포넌트의 여백 훅으로 한다.

## [1.12.0] - 2026-08-01

### ⚠ 업그레이드 전 확인 (호스트 직접 오버라이드)

`u-tag` · `u-badge` · `u-tab` · `u-option` · `u-menu` · `u-tooltip` · `u-alert` · `u-card` 의 **여백·테두리가 섀도 내부 요소로 이전**됐다. 1.10.0 의 `u-button` 과 같은 변경이며 이유도 같다 — `:host` 에 둔 여백은 소비 앱의 CSS 리셋(`* { padding:0; border:0 }`, Tailwind preflight 포함)에 **에러 없이 지워진다**.

호스트에 **직접** 여백/테두리를 주고 있었다면 조용히 무효가 된다:

```css
/* 이전 — 더 이상 적용되지 않는다 */
u-tag { padding: 4px 10px; }

/* 이후 — 전용 훅을 쓴다 */
u-tag { --tag-padding-block: 4px; --tag-padding-inline: 10px; }
```

`::part()` 오버라이드는 **종전대로 동작한다.** 기존 part 는 변경되지 않았고, 레이아웃 래퍼가 필요한 컴포넌트에는 `part="base"` 가 추가됐다(`u-alert` 는 기존 `::part(container)` 가 그 역할을 맡는다).

### Added
- 여백/테두리 훅 19개 — `--tag-padding-block`·`-inline`·`--tag-gap` · `--badge-padding-block`·`-inline` · `--tab-padding-block`·`-inline` · `--option-padding-block`·`-inline` · `--menu-padding`·`--menu-border-width`·`--menu-border-color` · `--tooltip-padding-block`·`-inline` · `--alert-padding-block`·`-inline`·`--alert-border-width` · `--card-border-width`·`--card-border-color`
- `part="base"` — 레이아웃 래퍼 (`u-tag`·`u-badge`·`u-tab`·`u-option`·`u-menu`·`u-tooltip`·`u-card`). `u-alert` 는 기존 `::part(container)` 가 그 역할을 맡으므로 새 part 를 만들지 않았다.

### Fixed
- **소비 앱 CSS 리셋에 컴포넌트 여백·테두리가 지워지던 문제** (8개 컴포넌트) — 호스트 요소에 대해서는 문서 작성자 스타일이 섀도의 `:host` 규칙을 이긴다. 컴포넌트는 정상 동작하고 작아지기만 하므로 소비자는 *"업스트림이 못생겼다"* 로 읽고 각자 다시 칠했다.

### Changed (내부 구조 — 시각 변화 없음)
- **`u-tag` 의 `variant × color` 매트릭스를 접었다** — 하드코딩 선택자 **36개 → 9개**. 각 색이 hue 슬롯 5개를 채우고 variant 규칙이 그것을 소비하며, 슬롯이 비면(`color="neutral"`) 종전대로 `--tag-fill-color`(브랜드) 경로를 탄다.
  - 36조합의 렌더 색을 팔레트 단과 대조하는 브라우저 테스트를 **리팩터 전에** 만들어 통과시킨 뒤 접었다 — 같은 테스트가 접은 후에도 통과한다.
  - `yellow` 가 `solid`(600)·`outlined` 텍스트(700)에서 한 단 진한 예외는 그대로 보존했다. 종전에는 4개 규칙에 흩어져 있어 보이지 않던 것이 이제 한 곳에 데이터로 드러난다.
  - `color` 속성과 `--tag-color`/`--tag-bg-color`/`--tag-border-color` 는 **공개 API 그대로**다. 새 `--tag-hue-*` 슬롯은 내부 구현이라 공개하지 않는다.
- **`u-checkbox` 의 `variant × color × state` 매트릭스를 접었다** — 16개 → 8개. `u-tag` 와 **같은 방식**이다: `color=` 는 hue 슬롯만 채우고 variant 규칙이 폴백과 함께 읽는다. 슬롯이 채워지면 `color=` 가 최종 권한을 갖고, 비면(기본 `blue`) 채움색 훅을 탄다.
  - 기본값 `blue` 는 규칙을 갖지 않는다 = 슬롯이 비어 브랜드 훅을 탄다. 종전에도 `[color="blue"]` 규칙은 훅을 재진술만 하고 있었다.
  - 두 컴포넌트의 오버라이드 우선순위가 같은지 회귀 테스트로 결박했다 — 소비자가 채움색 훅을 덮어도 `color=` 지정이 이긴다.
  - 여기도 32조합(2 variant × 8색 × 2상태)의 렌더 색을 대조하는 브라우저 테스트를 리팩터 전에 만들어 통과시킨 뒤 접었다.

### Added — 스케일 토큰 (반경)
- `--u-radius-none`/`-sm`/`-md`/`-lg`/`-xl`/`-pill`/`-circle`. 컴포넌트의 반경 리터럴 **40건**을 이 축으로 배선했다.
  ★리터럴을 흩뿌리면 값이 갈린다 — 실제로 pill 이 `999px`(2곳)와 `9999px`(3곳) 두 표기로 나뉘어 있었다(시각 차이는 없으나 의도가 하나임을 코드가 말하지 못했다).
  - em 기반·다중값·`calc()` 반경은 **의도적으로 제외**했다. 폰트 크기를 따라야 하거나 기하 계산이라 스케일 축이 아니다.
  - 반경은 테마와 무관하므로 두 시트가 같은 값을 갖는다(테스트로 강제).
  - 여백(space)·타이포 축은 `em` 기반이라 별도 분석이 필요하다 — 이번 범위 밖.

### 미해소 (1개)
- `u-divider` — `:host` 의 `margin` 은 **형제 간 간격**이라 내부 요소로 옮기면 의미가 달라진다(내부 margin 은 호스트 박스 안에서 상쇄되어 형제를 밀어내지 못한다). 별도 설계가 필요하다.

## 1.12.0 에 포함된 가산 층 — 역할 토큰 (별도 게시본 없음)

> ⚠**`1.11.0` 이라는 게시본은 존재하지 않는다.** 이 층은 원래 1.11.0 으로 따로 낼 계획이었으나
> 1.12.0 에 함께 출하됐다. 버전 헤딩으로 남기면 체인지로그 파서와 릴리스 링크가 없는 버전을
> 가리키게 되므로, 헤딩은 버전 형태를 쓰지 않는다.
> 아래 변경은 전부 **순수 가산**이며 1.12.0 에 그대로 들어 있다. 1.12.0 의 파괴적 변경과
> 층을 구분해 두기 위해 항목을 나눠 남긴다.

### Added
- **역할 토큰 층 (5역할 × 5단 = 25개)** — `--u-{primary,info,success,warning,danger}-color{-weakest,-weaker,-weak,,-strong}`.
  ★**이것이 중요한 이유**: 종전에는 컴포넌트가 팔레트 프리미티브(`--u-blue-600`, `--u-red-700` …)를 **직접** 참조했다. 그래서 브랜드 색을 바꾸려면 소비자가 팔레트 자체를 하이잭하거나(모든 파랑이 함께 바뀐다) 컴포넌트마다 CSS 를 덮어써야 했다. 이제 **`--u-primary-color` 한 줄**이면 버튼·체크박스·라디오·스위치·슬라이더·트리·메뉴·탭·진행바 등이 함께 따라온다.
  - 단은 **강도 축**이다(weakest → strong). 용도(배경/테두리/텍스트)는 소비처가 정한다 — 단을 속성에 묶으면 *"primary 버튼의 배경은 어느 단인가"* 같은 모순이 생긴다.
  - `primary` 와 `info` 는 기본 색상이 같지만 **다른 역할**이다. 리브랜딩은 `primary` 만 바꾸고 정보성 파랑은 그대로 둔다.
  - 실사용이 없는 조합도 **전 그리드를 정의**한다 — 브랜딩 도중 특정 단만 없는 것을 발견하는 비용이 더 크다.
- **시맨틱 토큰이 역할 층을 경유** — `--u-txt-color-hover`·`-active`, `--u-icon-color-hover`·`-active`, `--u-link-txt-color`, `--u-input-border-color-focus` → `--u-primary-color` 계열. `--u-input-border-color-invalid` → `--u-danger-color`. 값은 동일하며 참조 경로만 바뀌었다 — 역할 하나를 덮으면 시맨틱 층까지 따라온다.
- **`docs/theming.md` 역할 토큰 절** — 그리드·파급 범위·파생 예제. 어느 시트를 넣을지에 대한 선택 기준도 추가했다(아래 Fixed 참조).
- **전역 토큰 레퍼런스 `docs/design-tokens.md`** — 역할 25 · 시맨틱 45 · 팔레트 111. `light.css` 에서 생성(`npm run docs:tokens`)하며 테스트가 drift 를 막는다.
  ★기존 `css-custom-properties.md` 는 **컴포넌트 JSDoc 만** 훑으므로 시트 레벨 토큰이 한 건도 실리지 않았다 — `--u-primary-color` 같은 브랜드 훅이 생성 레퍼런스에서 통째로 빠져 있었고, 소비자는 생성 문서를 먼저 연다. 세 문서가 서로를 가리키는지도 테스트로 확인한다.

### Fixed
- **문서가 브랜드 오버라이드의 파급 범위를 잘못 적고 있던 문제** — `u-badge`·`u-tag` 가 `--u-primary-color` 를 따른다고 안내했으나, `u-badge` 는 실제로 `color` 속성(장식 축)만 사용해 브랜드 색에 반응하지 않는다. 목록을 나열하는 대신 **규칙**(역할 축은 팔레트를 직접 참조하지 않는다)으로 서술하고 테스트로 강제한다.
- **낡은 폴백 안내 7건** — `@cssprop` 설명의 *"미지정 시 blue-600"* 은 `--u-primary-color` 가 정의되지 않던 시절의 서술이다.

### Changed
- 컴포넌트 스타일의 역할 축 팔레트 직참조 **64건 → 0건**. 시각 결과는 **라이트·다크 모두 변경 없다** — 역할 토큰이 종전과 동일한 팔레트 단을 가리키고, 팔레트 값 자체가 이미 시트별로 다르기 때문이다.
- `var(--u-primary-color, var(--u-blue-600))` 형태의 폴백 체인 **13건 정리** — `--u-primary-color` 가 실제로 정의되면서 폴백 arm 이 죽은 코드가 됐다(두 토큰 모두 같은 시트에서만 정의되므로 손실 없음).

### Unchanged (의도적)
- **`color` 속성(장식 축)은 그대로다** — `u-tag`·`u-badge`·`u-button`·`u-checkbox`·`u-spinner` 의 `color="purple"` 류는 역할 의미가 없는 **소비자의 색 선택**이므로 팔레트를 직접 읽으며, 브랜드 오버라이드에 **의도적으로 면역**이다. `<u-tag color="green">` 은 리브랜딩 후에도 녹색이다.

## [1.10.0] - 2026-08-01

### Added
- **디자인 토큰의 정적 CSS 진입점** — `import '@iyulab/components/styles/tokens.css'` 한 줄로 런타임 호출 없이 토큰을 보장한다(light + dark 한 장, 다크는 `:root[theme="dark"]` 스코프라 안전하게 공존한다). 개별 시트(`styles/light.css`·`styles/dark.css`)도 그대로 쓸 수 있다.
  ★**이것이 중요한 이유**: 토큰이 없으면 컴포넌트 시트의 `var(--u-…)` 가 전부 무효가 되어 **테두리·배경이 에러 없이 사라진다**. 종전에는 토큰 주입 경로가 `Theme.init()` 런타임 호출 하나뿐이었고, `@iyulab/modern-app` 셸이 그것을 대신 호출하는 구조였다 — 그래서 셸 **밖**에서 렌더되는 화면(로그인·온보딩·오류 페이지·임베드 위젯)은 같은 컴포넌트를 쓰면서도 조용히 무스타일로 렌더됐다.
- **토큰 부재 진단 경고** — 개발 빌드에서 토큰 시트가 없으면 첫 컴포넌트 연결 시 1회 콘솔 경고. 종전에는 CSS 가 아무 신호도 내지 않아 소비자가 자기 CSS 를 며칠 의심했다.
- **CSS 커스텀 프로퍼티 레퍼런스** — `docs/css-custom-properties.md`(23컴포넌트·98프로퍼티). 컴포넌트 JSDoc 에서 생성(`npm run docs:cssprops`)하며 테스트가 drift 를 막는다.
- **React 이벤트 레퍼런스** — `docs/react-events.md`(24컴포넌트·37이벤트). 종전에는 소비자가 `dist/react/*.js` 를 열어봐야 알 수 있었다. ★`onClick` 같은 **네이티브 이벤트는 매핑 없이도 동작한다**는 점을 문서 상단에 명시(수동 `addEventListener` 배선이 불필요하다).
- `--u-input-display` / `--u-input-width` 정식 선언 — 폼/그리드 셀에서 입력이 컨테이너 폭을 채우게 하려면 `--u-input-display: block`. 종전에도 전자는 동작했으나 문서화되지 않아 소비자가 `u-input { display:block; width:100% }` 를 각자 작성했다.
- `--u-border-color-hover` 토큰 신설 — `--u-bg-color-hover`·`--u-input-border-color-hover` 는 있는데 일반 border 계열에만 hover 가 없던 결손을 채운다.
- `@cssprop` 선언 25건 추가(`u-button` 파생 색 11 · `u-tree` 들여쓰기 5 · 그 외).

### Fixed
- **React 래퍼가 상속받은 이벤트를 노출하지 않던 결함** — 래퍼 생성기가 leaf 파일만 파싱해, `show`/`hide` 를 베이스(`UOverlayElement`)가 발화하는 `u-dialog`·`u-drawer` 가 `events: {}` 로 생성됐다. React 소비자가 `onShow`/`onHide` 를 붙여도 **에러도 경고도 없이 아무 일이 일어나지 않았다**. 이제 상속 체인을 따라 수집하며, `u-popover`·`u-tooltip` 의 이벤트 detail 타입도 함께 정밀해진다. 누락 시 **빌드가 실패**한다.
- **`u-menu-item` 하위 메뉴 팝오버가 오버플로 조상에 클리핑되던 문제** — `u-select`·`u-input` 과 달리 `strategy="fixed"` 가 지정돼 있지 않았다.
- **`u-option` 의 hover 테두리가 무효였던 문제** — 정의된 적 없는 `--u-border-color-hover` 를 폴백 없이 참조해 선언 전체가 무효였다.

### Changed
- ⚠**`u-button` 의 여백·테두리를 내부 요소(`::part(button)`/`::part(link)`)로 옮겼다.** 기본 렌더는 동일하다.
  ★**이유**: `:host` 에 둔 여백·테두리는 소비 앱의 CSS 리셋(`* { padding:0; border:0 }` — Tailwind preflight 등 사실상 표준 관행)에 **지워진다**. 호스트 요소에 대해서는 문서 작성자 스타일이 섀도의 `:host` 규칙을 이기기 때문이며, 그 결과 버튼이 글자 높이만 남았다(에러 없음).
  ⚠**호환성**: `u-button { padding: … }` 처럼 **호스트에 직접** 여백을 주던 소비자는 이제 효과가 없다. `--btn-padding-block`/`--btn-padding-inline` 토큰이나 `::part(button)` 을 쓴다. `::part(button)` 오버라이드는 종전대로 동작한다.
- 빌드 스크립트 정리 — 플러그인은 이제 타입 검사만 하고 산출물을 내보내지 않는다(`typecheck:plugins`). 종전에는 컴파일된 `plugins/*.js` 가 `.ts` 소스를 가려 **플러그인 수정이 한 빌드 늦게 반영**되고, 산출물이 없는 신규 클론/CI 와 로컬의 동작이 달랐다.

## [1.9.0] - 2026-07-28

### Fixed
- **열린 팝오버가 페이지 스크롤 한 번에 닫히던 결함 수정** (u-select listbox·u-input combobox 실사용 및 E2E 구동 불능). `UPopover.dismiss` 기본값의 `scroll` 이 document 캡처 단계로 등록되는 한편 `UFloatingElement.show()` 는 **모든** 플로팅 엘리먼트에 floating-ui `autoUpdate`(스크롤 시 앵커 추종 재배치)를 설치한다 — 같은 스크롤 이벤트에 재배치와 닫기가 동시에 걸리고 닫기가 이기는 자기모순이었다. 이제 `scroll` 은 **앵커가 스크롤로 의미를 잃을 때만** 닫는다: 실제 엘리먼트에 앵커된 팝오버(드롭다운·제안 목록·서브메뉴·툴팁)는 재배치되어 열린 채 유지되고, `trigger="contextmenu"` 의 좌표 기반 가상 앵커는 종전대로 닫힌다. Playwright 의 "scroll into view" 가 목록을 닫아 `getByRole('option').click()` 이 완주하지 못하던 문제도 함께 해소된다. 회귀 테스트 3건 추가.
- **`dismiss: 'resize'` 도 같은 원칙으로 정합** — `autoUpdate` 는 `ancestorResize` 로 window 리사이즈도 구독해 재배치하므로 scroll 과 동일한 자기모순이었다. 이제 리사이즈도 좌표 기반 가상 앵커에서만 닫는다. 이로써 모바일에서 `u-select searchable` 의 검색 입력을 탭할 때 가상 키보드가 레이아웃 뷰포트를 줄이며 발생시키는 리사이즈로 드롭다운이 닫히던 문제가 해소된다. 회귀 테스트 2건 추가.

- **React 래퍼가 `ref` 를 타입 수준에서 거부하던 문제 수정** — 생성된 `.d.ts` 가 `React.ForwardRefExoticComponent<P>` 를 쓰면서 P 에 `React.RefAttributes` 를 넣지 않았다. `ForwardRefExoticComponent<P>` 는 ref 를 자동으로 더해 주지 않으므로, `@lit/react` 가 런타임에 ref 를 정상 전달하는데도(`ReactWebComponent` 자신은 `PropsWithoutRef<…> & React.RefAttributes<I>` 로 선언돼 있다) `<UButton ref={…} />` 가 TS2322 로 거부됐다. 이제 42개 래퍼 전부가 ref 를 받으며, ref 타입은 `HTMLElement` 가 아니라 **해당 엘리먼트 클래스**로 좁혀진다. 신설 React 타입 스모크가 첫 실행에서 잡아낸 결함이다.

### Added
- **React strict 소비 타입 스모크** — 소비자가 React 19 + TS strict 에서 겪은 래퍼 결함들(JSX children TS2747, 이벤트 핸들러 교집합, 위 ref 누락)은 전부 **런타임에 드러나지 않는 타입 실패**라 vitest 로는 잡히지 않는다. `tests/types/react-consumption.tsx` 를 두고 `tsconfig.react-smoke.json` 전용 프로젝트로 컴파일하며, 검증 대상이 빌드 산출물(`dist/react/*.d.ts`)이므로 `build` 파이프라인 끝에 건다(`npm run build` 에 포함). 소비자와 동일한 진입점 `@iyulab/components/react` 를 통과시켜 `exports` 맵까지 함께 검증한다.
- **앵커 이탈 시 팝오버 자동 숨김** — 위 수정으로 실앵커 팝오버가 스크롤에 닫히지 않게 되면서 드러난 케이스 대응. `strategy="fixed"` 팝오버는 overflow 조상에 클립되지 않으므로(그것이 fixed 를 쓰는 이유), 앵커가 스크롤 패널 밖으로 나가면 팝오버만 화면에 남아 무관한 콘텐츠를 덮을 수 있었다. floating-ui `hide` middleware 를 `UFloatingElement.reposition()` 에 도입해, 앵커가 클리핑 영역(스크롤 컨테이너·뷰포트)을 완전히 벗어나면 `anchor-hidden` 속성이 붙고 엘리먼트가 숨겨진다. **닫히지는 않으므로**(`open` 유지) 되돌려 스크롤하면 열린 상태 그대로 복귀한다. `anchor-hidden` 은 읽기 전용 파생 상태이며 스타일 훅으로 사용할 수 있다. 회귀 테스트 2건 추가.

## [1.8.1] - 2026-07-24

### Fixed
- **u-field 합성 폼 컨트롤이 접근성 트리에서 이름 없이 노출되던 문제 수정** (WCAG 1.3.1·4.1.2 — Playwright E2E 실측). 라벨은 `u-field` 의 별도 섀도 스코프에 렌더되어 `label[for]` 로 컨트롤과 연결될 수 없었고, 섀도 경계 탓에 cross-root `aria-labelledby` 도 현 브라우저에서 신뢰성 있게 배송되지 않는다. 이제 각 컴포넌트가 자신의 접근 이름 호스트에 라벨을 `aria-label`(설명은 `aria-description`)로 미러링한다 — `u-input`/`u-textarea`(네이티브 컨트롤), `u-rating`/`u-radio`(`role=radiogroup`), `u-select`(`role=combobox` + `aria-expanded`/`aria-haspopup`/`aria-controls`), `u-slider`(`role=slider` + `aria-valuenow`/`valuemin`/`valuemax`/`valuetext`). 아울러 `u-option` 이 사용 맥락에 맞는 자식 역할·상태를 노출한다 — radiogroup(`marker='radio'`) 안에서는 `role=radio` + `aria-checked`, listbox(`u-select`/`u-input` combobox) 에서는 `role=option` + `aria-selected`(+ `aria-disabled`) — 이름만 있고 비어 보이던 radiogroup/combobox 위젯이 자식까지 정합하게 읽힌다. `u-rating` 심볼(`role=radio`)도 커밋 값 기준 `aria-checked` 를 노출한다. `getByLabel`/`getByRole({name})` 로케이터와 스크린리더가 컨트롤을 이름으로 인식한다.
- **React 래퍼 `.d.ts` 타이핑 2건 수정** (React 19 + TS strict 컴파일 차단 — 실사용에서 관측). (1) `React.HTMLAttributes` 의 이벤트 핸들러(`onChange` 등)와 래퍼의 CustomEvent 시그니처가 교집합되어 어떤 핸들러도 대입 불가였던 것을, HTMLAttributes 쪽 동명 이벤트 키를 `Omit` 해 CustomEvent 시그니처만 남기도록 교정. (2) `Partial<Element>` 의 DOM `children: HTMLCollection` 이 JSX children 을 가려 `<UButton>text</UButton>` 이 TS2747 로 실패하던 것을, `Omit<Partial<Element>, keyof HTMLAttributes>` 로 DOM 전용 키를 제거하고 React 친화 타입(`children: ReactNode`)이 HTMLAttributes 에서 공급되도록 교정. 소비자의 `as unknown as ComponentType` 우회 제거 가능.

## [1.8.0] - 2026-07-22

### Fixed
- **`u-icon` 아이콘 리졸브가 재렌더·재마운트마다 다시 fetch되던 스톰 수정** — `IconRegistry.resolve()`가 리졸버 결과를 캐시하지 않아, SSE 스트리밍처럼 같은 아이콘이 반복 재마운트되는 UI에서 단일 아이콘에 수백 회 fetch가 발생했다(미존재 아이콘은 404 스톰으로 콘솔 오염 + dev 서버 부하 — 실사용에서 관측). 이제 레지스트리가 (lib, name) 단위 캐싱과 동시 요청 in-flight dedupe를 소유해, 커스텀 리졸버를 포함한 모든 라이브러리에서 아이콘당 세션 1회만 리졸브된다. `u-icon`의 `src` 경로·무-lib 기본(baseUrl) 경로도 신설 `IconRegistry.resolveUrl(url)`을 경유해 동일하게 캐시된다.
- 내장 CDN 리졸버(tabler/heroicons/lucide/bootstrap)가 네트워크 오류를 `undefined`로 삼키던 것을 throw 전파로 교정 — 일시 장애가 세션 내 not-found로 오인·고착되지 않고 다음 조회에서 재시도된다.

### Changed
- **`IconResolver` 계약 명확화 (동작 변경)** — 리졸버의 `undefined` 반환은 이제 **not-found 확정**을 뜻하며 네거티브 캐시되어 세션 내 재호출되지 않는다(탈출구: `IconCache.clear()`). **일시 오류(네트워크 장애 등)에는 `undefined` 대신 `throw`를 사용할 것** — throw는 캐시되지 않아 다음 조회 시 재시도된다. 일시 실패에 `undefined`를 반환하던 커스텀 리졸버는 throw로 전환해야 재시도 동작을 유지한다.
- `IconRegistry.unregister(lib)`가 해당 라이브러리의 캐시 항목을 함께 비운다 — 내장 CDN 라이브러리를 로컬 리졸버로 교체(`unregister` → `register`, 폐쇄망 대응)할 때 이전 리졸버의 stale 결과가 남지 않는다.

### Added
- `IconRegistry.resolveUrl(url)` — URL 직접 리졸브(캐시 + dedupe). 예약 네임스페이스 `url`로 `IconCache`에 저장되며 소비앱의 prewarm 용도로도 사용 가능.
- `IconCache.clear(lib)` — 특정 라이브러리 항목만 클리어(전체 클리어는 기존대로 인자 없이).
- `IconCache.set()`이 `undefined`(네거티브 항목) 저장을 허용.

### Documentation
- `docs/icons.md`·skills 레퍼런스에 리졸버 계약(성공/not-found/일시 오류)·캐싱 동작·내장 라이브러리 오버라이드 절차(`unregister`→`register`) 문서화. CDN 버전 표기 드리프트 교정(lucide 0.577.0, bootstrap 1.13.1).

## [1.7.2] - 2026-07-19

### Fixed
- **`Dialog.show()`가 영구 대기(hang)에 빠지던 결함 수정** — 프로미스 executor 가 `async` 였던 탓에 `await dialog.updateComplete` 가 reject 되면 예외가 삼켜지고 `hide` 리스너가 등록조차 되지 않아, `await Dialog.show(...)` 호출자가 **영원히 매달렸다**. 이제 리스너를 `await` **이전에** 등록하고(대기 중 발생한 `hide` 를 놓치던 경합도 함께 해소), 업데이트 실패 시 `console.error` 후 문서화된 "닫힘 = null" 규약대로 `null` 로 종료하며 고아 엘리먼트를 DOM 에서 제거한다. 회귀 테스트 3건 추가(정상 resolve / 닫힘 null / updateComplete reject).
- `UOverlayElement`: 삼항 연산자를 문(statement)으로 사용하던 `open ? setup() : cleanup()` 을 `if/else` 로 교정.
- `URating`/`USelect`/`UTree`: `switch` case 블록 안의 `const` 선언이 블록 스코프를 벗어나 다른 case 로 누출될 수 있던 형태를 중괄호 블록으로 격리(`no-case-declarations`).

### Changed
- **이 패키지의 eslint 가 실제로 동작하기 시작했다.** `eslint.config.js` 의 두 결함 — (1) `files: ["src/**/*"]` 가 ESLint 9 에서 universal 패턴으로 취급돼 `.ts` 를 린팅 대상으로 opt-in 하지 못함, (2) 배열 프리셋(`tseslint.configs.recommended`)을 객체 스프레드해 프리셋이 통째로 무력화됨 — 을 수정했다. `build` 스크립트에 `eslint &&` 게이트가 있었으나 매칭 파일이 0개라 **항상 통과**하고 있었다. 위 결함들은 모두 이 복구로 처음 드러난 것이다.
- `npm run lint` / `npm run lint:fix` 스크립트 추가(flex-table·u-widgets 와 통일).
- 내부 타입 정밀화: `Dialog`/`Theme`/`UTooltip`/`UInput`/`UTextarea` 의 `any` 캐스팅을 실제 타입(`CloseOnPolicy[]`, `UInput`, `InputType`, `VirtualElement`, `unknown[]`)으로 교체. 공개 API 시그니처 변경 없음.

## [1.7.1] - 2026-07-19

### Fixed
- `UInput.type` 을 host 요소로 **reflect** 하도록 수정 — 미반영 시 `u-input[type="number"]::part(input)` 같은 속성 셀렉터가 HTML 속성으로 준 경우에만 매칭되고, React/Lit 의 property 바인딩(`.type=`, `el.type=`)에서는 host 에 속성이 나타나지 않아 무효였다. 형제 컴포넌트 `URadio.type` 은 이미 reflect 하고 있어 리포 내 비일관이기도 했다.

### Documentation
- `docs/theming.md` 에 `::part()` 커스터마이즈 섹션 신설 — 텍스트 정렬 레시피(`text-align` + `font-variant-numeric: tabular-nums`), 숫자 입력 우측정렬을 기본값으로 두지 않는 근거, 비반영 속성용 클래스 셀렉터 대안, 숫자 포맷팅 책임 범위.
- `docs/architecture.md` CSS Parts 절에서 `theming.md` 로 상호 링크. `UInput` 의 `@csspart input` JSDoc 보강.

## [1.7.0] - 2026-07-17

### Fixed
- **폼 컨트롤 `change` 이벤트 의미론을 네이티브 규약으로 교정** — `USelect`/`URadio`/`URating`/`USlider`가 `updated()` 경로에서 무조건 `change`를 발화해, (1) 옵션 slot 등록 시 `value===undefined` 상태의 change가 발화되어 React 등 controlled 래퍼의 state를 오염시키고(옵션 등록 전 세팅한 초기값이 유실·서버 enum 기본값으로 저장되는 무증상 데이터 결함 — 실사용에서 관측), (2) 프로그램적 `value` 세팅이 사용자 이벤트로 위장되어 에코 루프를 만들던 문제 수정. 이제 `change`는 **사용자 상호작용**(옵션 클릭·키보드·칩 제거·지우기·드래그 확정)에서만 발화한다. `UInput`(blur 발화)·`UMenu`/`UTree`(핸들러 발화)는 원래 규약대로였으며 변경 없음.
- `USlider`: 문서("드래그 완료 후 발생")와 달리 **드래그 중 매 pointermove마다 change가 연사**되던 결함 수정 — 이제 `pointerup` 시 값이 실제로 바뀐 경우 1회 발화. 단일 select에서 동일 옵션 재선택, 선택된 라디오 재클릭도 네이티브와 동일하게 미발화.
- `USelect`/`URadio`/`URating`의 `onChangeValue()`가 `updated()` 내부에서 `validate()`→`requestUpdate()`를 호출해 v1.5.1 검증 아키텍처를 위반하고 "scheduled an update after an update completed" Lit 경고를 재유발하던 잔재 제거 — 검증 UI 갱신(`validate()`)은 사용자 상호작용 경로에서만 수행하고, 프로그램적 세팅은 base의 silent `setValidity()`로 internals만 갱신한다.
- **마크업 `value` attribute 선언이 일반 문자열에서 silently null이 되던 갭 수정** — base가 `type: Object`(JSON.parse)여서 `<u-input value="hello">`·`<u-select value="b">`가 null로 해석됐다. 기본 해석을 raw 문자열로 바꾸고, `u-rating`/`u-slider`는 숫자, `u-select`(multiple)/`u-slider`(range)는 JSON 배열(`value='["a","b"]'`)을 지원한다.
- `USlider` range 표시 텍스트의 구분자 인코딩 오염(`5 ??10`) → `5 ~ 10`으로 교정. `URating` min/max 주석 모지바케 정리.

### Changed
- 프로그램적 `value` 세팅은 이제 `change` 발화·`invalid` 플래그 자동 갱신을 하지 않는다(`ElementInternals` validity는 계속 동기화됨). 프로그램적 변경 후 검증 UI 갱신이 필요하면 `validate()`를 명시 호출할 것. `value='"quoted"'` 형태(JSON 문자열)로 attribute를 우회 선언하던 경우 이제 따옴표 포함 raw 문자열로 해석된다.

## [1.6.0] - 2026-07-16

### Added
- `UCopyButton`(`u-copy-button`): **인라인 텍스트 라벨** 지원 — `label` prop을 지정하면 아이콘 옆에 보이는 텍스트 라벨을 렌더한다(예: `label="결과 복사"`). 지금까지 u-copy-button은 아이콘 전용(기본 슬롯은 툴팁으로 소비)이라 "📋 결과 복사"처럼 라벨이 붙은 복사 버튼을 표현할 수 없어, 소비자가 검증된 클립보드 로직(취소 가능 `copy` ClipboardEvent + copied 상태 + 아이콘 토글)을 재사용하지 못하고 자체 재구현하던 역량 갭을 해소. 비파괴 — `label` 미지정 시 기존 아이콘 전용 형태(및 기본 슬롯=툴팁 의미)를 그대로 유지한다. 라벨 지정 시 내부적으로 `u-button`(아이콘 prefix + 텍스트)으로 렌더하고, 클립보드 로직은 두 형태에서 동일하다.

### Fixed
- `u-drawer`/`u-dialog`: **테마 토큰 미정의 시 패널이 투명하게 렌더**되어 모달이 "안 뜬 것처럼" 보이던 결함 수정. backdrop(`--u-overlay-bg-color`)에는 폴백이 있는데 패널 배경/테두리(`--u-panel-bg-color`/`--u-border-color`)에는 폴백이 없어, `Theme.init()`로 토큰을 주입하지 않은 소비자에게 backdrop만 흐려지고 패널은 투명하게 떠 슬롯 콘텐츠가 뒤 페이지와 겹쳐 읽히던 footgun. backdrop과 동일 정책으로 패널 배경에 `Canvas`, 테두리에 `color-mix(in srgb, CanvasText 20%, Canvas)` CSS 시스템 컬러 폴백을 부여 — 토큰 미정의 소비자도 라이트·다크 자동 적응되는 가시 패널을 얻고, 토큰 정의 소비자는 기존과 동일(폴백 미사용). 실 브라우저 렌더 회귀 가드 추가.

## [1.5.1] - 2026-07-07

### Fixed
- `UFormControlElement.updated()`가 `value`/`required` 변경 시마다 `setValidity()` 이후 `requestUpdate()`를 무조건 호출해 "scheduled an update after an update completed" 개발자 경고가 매 입력마다 발생하던 문제 수정(`USelect`/`UInput`/`UCheckbox`/`UTextarea` 등 폼 컨트롤 전반에 영향). `updated()`에서는 `internals.setValidity()` 갱신만 수행하고 화면 재렌더 강제는 제거했으며, `validationMessage` 재렌더는 기존처럼 `validate()`를 호출하는 blur/change 핸들러에서만 처리한다.

## [1.5.0] - 2026-07-07

### Added
- `UCopyButton`(`u-copy-button`) 컴포넌트 추가. 클릭 시 클립보드에 텍스트를 복사하고 아이콘(`copy`/`check`)으로 복사 상태를 표시하며, 실제 쓰기 전에 취소 가능한 `copy` 커스텀 이벤트(`ClipboardEvent`)를 발행해 리스너가 복사를 취소하거나 `clipboardData.setData()`로 복사될 값을 바꿀 수 있음.

### Changed
- **Breaking:** 내부 아이콘 세트(`lib="internal"`)의 이름 규칙을 정리: `x-lg`→`x`, `check-lg`→`check`, `dash-lg`→`minus`, `eye-slash`→`eye-off`, `exclamation-circle-fill`→`alert-circle-fill`, `exclamation-triangle-fill`→`alert-triangle-fill`, `check-circle-fill`→`circle-check-fill`, `plus-lg`→`plus`. `lib="internal"`로 위 이름을 직접 참조하던 코드는 갱신 필요. 미사용 아이콘(`three-dots`, `three-dots-vertical`) 제거, 신규 아이콘(`copy`) 추가.
- `IconRegistry.register()`가 이미 등록된 라이브러리 이름에 대해 경고를 출력하는 대신 조용히 무시하도록 변경.
- `UIconButton`이 `inline-flex`로 레이아웃되도록 개선.

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
- `UCheckbox`: 클래스 JSDoc에 `@event change` 태그 누락으로 공식 React 래퍼(`@iyulab/components/react`)의 `UCheckbox` props가 빈 `{}`로 생성되어 `onChange`가 노출되지 않던 결함 수정. 런타임은 `this.relay(e)`로 `change`를 정상 발생시키지만, 래퍼 생성기가 `@event` 태그(또는 `this.fire<T>('name')` 리터럴)로만 이벤트 맵을 도출하므로 태그가 없으면 이벤트가 누락된다. (`USwitch`/`UInput`/`UTextarea`는 태그 보유 — `relay()`를 쓰는 폼 컨트롤 중 `UCheckbox`만 누락되어 있었음.)

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
- `plugins/vite-plugin-react-wrapper.ts`: 생성된 `dist/react/*.js` 래퍼가 `import { X } from '...'`와 `export const X =...`를 동일 스코프에 선언해 **모든** React 래퍼(및 barrel `@iyulab/components/react`)가 `SyntaxError: Identifier 'X' has already been declared`로 로드 자체가 실패하던 결함 수정. `.d.ts` 템플릿은 이미 `as ${className}Element` 별칭을 썼으나 `.js` 템플릿만 누락되어 있었음 — `.js` 생성기에 동일한 별칭을 적용해 근본 수정. 이 서브패스를 문서화·검증하는 과정에서 발견(README 예시를 실제로 import해보다가 SyntaxError 재현).

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
