# Changelog

## [1.14.0] - 2026-08-01

### Added

- **토큰 시트 없이도 렌더된다** — 시트 토큰 참조 **411곳**에 use-site 리터럴 폴백을
  배선했다(`var(--u-txt-color)` → `var(--u-txt-color, #212121)`).

  토큰 시트(`styles/tokens.css`)를 로드하지 않으면 `var(--u-*)` 는 무효가 되고 **그 선언이
  통째로 버려진다** — 색이 빠지는 게 아니라 규칙이 사라지는 것이라, 텍스트가 안 보이거나
  패널이 완전히 투명해진다. 이제 시트가 없어도 기본 테마 값으로 렌더된다.

  **시트를 쓰는 경우 시각 변화는 없다** — 폴백은 시트가 없을 때만 평가된다. 리터럴이
  시트 값과 어긋나지 않도록 대조 테스트가 강제하며, 폴백은 손으로 쓰지 않고 생성한다.

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
