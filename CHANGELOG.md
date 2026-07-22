# Changelog

## [1.8.0] - 2026-07-22

### Fixed
- **`u-icon` 아이콘 리졸브가 재렌더·재마운트마다 다시 fetch되던 스톰 수정** — `IconRegistry.resolve()`가 리졸버 결과를 캐시하지 않아, SSE 스트리밍처럼 같은 아이콘이 반복 재마운트되는 UI에서 단일 아이콘에 수백 회 fetch가 발생했다(미존재 아이콘은 404 스톰으로 콘솔 오염 + dev 서버 부하 — SMI.AIMS 실측, ISSUE-components-20260722-iconregistry-resolver-no-cache). 이제 레지스트리가 (lib, name) 단위 캐싱과 동시 요청 in-flight dedupe를 소유해, 커스텀 리졸버를 포함한 모든 라이브러리에서 아이콘당 세션 1회만 리졸브된다. `u-icon`의 `src` 경로·무-lib 기본(baseUrl) 경로도 신설 `IconRegistry.resolveUrl(url)`을 경유해 동일하게 캐시된다.
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
- **폼 컨트롤 `change` 이벤트 의미론을 네이티브 규약으로 교정** — `USelect`/`URadio`/`URating`/`USlider`가 `updated()` 경로에서 무조건 `change`를 발화해, (1) 옵션 slot 등록 시 `value===undefined` 상태의 change가 발화되어 React 등 controlled 래퍼의 state를 오염시키고(옵션 등록 전 세팅한 초기값이 유실·서버 enum 기본값으로 저장되는 무증상 데이터 결함 — yesung 실측), (2) 프로그램적 `value` 세팅이 사용자 이벤트로 위장되어 에코 루프를 만들던 문제 수정. 이제 `change`는 **사용자 상호작용**(옵션 클릭·키보드·칩 제거·지우기·드래그 확정)에서만 발화한다(ISSUE-components-20260717-uselect-value-before-options). `UInput`(blur 발화)·`UMenu`/`UTree`(핸들러 발화)는 원래 규약대로였으며 변경 없음.
- `USlider`: 문서("드래그 완료 후 발생")와 달리 **드래그 중 매 pointermove마다 change가 연사**되던 결함 수정 — 이제 `pointerup` 시 값이 실제로 바뀐 경우 1회 발화. 단일 select에서 동일 옵션 재선택, 선택된 라디오 재클릭도 네이티브와 동일하게 미발화.
- `USelect`/`URadio`/`URating`의 `onChangeValue()`가 `updated()` 내부에서 `validate()`→`requestUpdate()`를 호출해 v1.5.1 검증 아키텍처를 위반하고 "scheduled an update after an update completed" Lit 경고를 재유발하던 잔재 제거 — 검증 UI 갱신(`validate()`)은 사용자 상호작용 경로에서만 수행하고, 프로그램적 세팅은 base의 silent `setValidity()`로 internals만 갱신한다.
- **마크업 `value` attribute 선언이 일반 문자열에서 silently null이 되던 갭 수정** — base가 `type: Object`(JSON.parse)여서 `<u-input value="hello">`·`<u-select value="b">`가 null로 해석됐다. 기본 해석을 raw 문자열로 바꾸고, `u-rating`/`u-slider`는 숫자, `u-select`(multiple)/`u-slider`(range)는 JSON 배열(`value='["a","b"]'`)을 지원한다.
- `USlider` range 표시 텍스트의 구분자 인코딩 오염(`5 ??10`) → `5 ~ 10`으로 교정. `URating` min/max 주석 모지바케 정리.

### Changed
- 프로그램적 `value` 세팅은 이제 `change` 발화·`invalid` 플래그 자동 갱신을 하지 않는다(`ElementInternals` validity는 계속 동기화됨). 프로그램적 변경 후 검증 UI 갱신이 필요하면 `validate()`를 명시 호출할 것. `value='"quoted"'` 형태(JSON 문자열)로 attribute를 우회 선언하던 경우 이제 따옴표 포함 raw 문자열로 해석된다.

## [1.6.0] - 2026-07-16

### Added
- `UCopyButton`(`u-copy-button`): **인라인 텍스트 라벨** 지원 — `label` prop을 지정하면 아이콘 옆에 보이는 텍스트 라벨을 렌더한다(예: `label="결과 복사"`). 지금까지 u-copy-button은 아이콘 전용(기본 슬롯은 툴팁으로 소비)이라 "📋 결과 복사"처럼 라벨이 붙은 복사 버튼을 표현할 수 없어, 소비자가 검증된 클립보드 로직(취소 가능 `copy` ClipboardEvent + copied 상태 + 아이콘 토글)을 재사용하지 못하고 자체 재구현하던 역량 갭을 해소(ISSUE-20260715-ucopybutton-no-inline-label). 비파괴 — `label` 미지정 시 기존 아이콘 전용 형태(및 기본 슬롯=툴팁 의미)를 그대로 유지한다. 라벨 지정 시 내부적으로 `u-button`(아이콘 prefix + 텍스트)으로 렌더하고, 클립보드 로직은 두 형태에서 동일하다. online-tools(NT-U4) dogfooding에서 발견.

### Fixed
- `u-drawer`/`u-dialog`: **테마 토큰 미정의 시 패널이 투명하게 렌더**되어 모달이 "안 뜬 것처럼" 보이던 결함 수정(ISSUE-20260715-uoverlay-panel-token-no-fallback). backdrop(`--u-overlay-bg-color`)에는 폴백이 있는데 패널 배경/테두리(`--u-panel-bg-color`/`--u-border-color`)에는 폴백이 없어, `Theme.init()`로 토큰을 주입하지 않은 소비자에게 backdrop만 흐려지고 패널은 투명하게 떠 슬롯 콘텐츠가 뒤 페이지와 겹쳐 읽히던 footgun. backdrop과 동일 정책으로 패널 배경에 `Canvas`, 테두리에 `color-mix(in srgb, CanvasText 20%, Canvas)` CSS 시스템 컬러 폴백을 부여 — 토큰 미정의 소비자도 라이트·다크 자동 적응되는 가시 패널을 얻고, 토큰 정의 소비자는 기존과 동일(폴백 미사용). 실 브라우저 렌더 회귀 가드 추가. online-tools(NT-U2) dogfooding에서 발견.

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
