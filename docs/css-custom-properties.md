# CSS Custom Properties

> 자동 생성 문서 — 직접 편집하지 마세요. 컴포넌트 JSDoc 의 `@cssprop` 이 원본입니다.
> 갱신: `npm run docs:cssprops`

컴포넌트가 노출하는 CSS 커스텀 프로퍼티 목록입니다. 소비자는 이 이름들을 덮어
컴포넌트를 조절합니다 — 내부 선택자를 침투하지 않아도 됩니다.

```css
/* 전역 */
u-button { --btn-color: #c42839; }

/* 개별 인스턴스 */
u-button.cta { --btn-color: #0f9d58; }
```

전역 테마 토큰(`--u-*`)의 전체 목록은 [design-tokens.md](design-tokens.md),
넣는 방법과 브랜딩 지침은 [theming.md](theming.md) 를 보세요.

**컴포넌트 29개 · 프로퍼티 127개**

## `<u-alert>`

| 프로퍼티 | 설명 |
|---|---|
| `--alert-background-color` | 배경색 (status에 따라 자동 설정, variant="outlined"는 transparent) |
| `--alert-border-color` | 테두리 색상 (status에 따라 자동 설정, variant="filled"는 transparent) |
| `--alert-icon-color` | 아이콘 색상 (status에 따라 자동 설정) |
| `--alert-padding-block` | 세로 여백 |
| `--alert-padding-inline` | 가로 여백 |
| `--alert-border-width` | 테두리 두께 (variant 이 정한다) |

## `<u-badge>`

| 프로퍼티 | 설명 |
|---|---|
| `--badge-padding-block` | 세로 여백 (`variant="dot"` 은 콘텐츠를 렌더하지 않아 적용되지 않는다) |
| `--badge-padding-inline` | 가로 여백 (`variant="dot"` 은 콘텐츠를 렌더하지 않아 적용되지 않는다) |

## `<u-button>`

| 프로퍼티 | 설명 |
|---|---|
| `--u-primary-color` | color="neutral"일 때 버튼 기준색. 지정 시 hover/active/surface 톤이 color-mix()로 자동 파생. |
| `--btn-padding-block` | 내부 버튼의 상하 여백 (기본: 0.5em) |
| `--btn-padding-inline` | 내부 버튼의 좌우 여백 (기본: 1em, variant="link"는 0). ⚠1.20.0 에서 0.5em → 1em. 세로와 같은 값이라 글자가 테두리에 붙어 있었다. 최소높이는 상하 여백에서 파생되므로(`1.5em + 상하×2 + 2px`) 이 값을 덮어도 높이는 안 변한다. |
| `--btn-border-color` | 내부 버튼의 테두리 색. variant/hover/active 규칙이 이 값을 정한다 (기본: transparent) |
| `--btn-color` | 버튼의 **면** 색. 아래 파생 토큰이 전부 이 값에서 color-mix()로 계산된다 — 보통 이것 하나만 덮으면 된다. |
| `--btn-txt-color` | 그 **면 위**의 글자색 — variant="solid" 가 읽는다 (기본: #fff · 역할 값 지정 시 --u-{role}-txt-color) |
| `--btn-color-strong` | **바탕 위**의 글자색 — variant="link" 가 읽는다. 면과 요구가 반대라 슬롯이 따로 있다 (기본: --btn-color 와 동일 · 역할 값 지정 시 --u-{role}-color-strong) |
| `--btn-color-strong-hover` | 바탕 위 글자 hover (기본: 85% + black · 역할 값은 움직이지 않고 밑줄로 강조) |
| `--btn-color-strong-active` | 바탕 위 글자 active (기본: 70% + black · 역할 값은 고정) |
| `--btn-color-hover` | solid 배경 hover (기본: --btn-color 85% + black) |
| `--btn-color-active` | solid 배경 active (기본: --btn-color 70% + black) |
| `--btn-color-surface` | surface 배경 (기본: --btn-color 12% + 배경색) |
| `--btn-color-surface-hover` | surface 배경 hover (기본: 22%) |
| `--btn-color-surface-active` | surface 배경 active (기본: 32%) |
| `--btn-color-border` | 테두리 (기본: --btn-color 45% + 배경색) |
| `--btn-color-border-hover` | 테두리 hover (기본: 60%) |
| `--btn-color-border-active` | 테두리 active (기본: 75%) |
| `--btn-color-outline-hover` | outline 배경 hover (기본: 6%) |
| `--btn-color-outline-active` | outline 배경 active (기본: 12%) |

## `<u-card>`

| 프로퍼티 | 설명 |
|---|---|
| `--card-border-width` | 테두리 두께 (`borderless` 는 0) |
| `--card-border-color` | 테두리 색 |

## `<u-checkbox>`

| 프로퍼티 | 설명 |
|---|---|
| `--checkbox-color` | 체크 표시 색상 (outline variant) |
| `--checkbox-border-color` | 체크박스 테두리 색상 |
| `--checkbox-background-color` | 체크박스 배경색 (filled variant) |
| `--checkbox-fill-color` | 체크된 상태의 채움색 (기본: --u-primary-color) |

## `<u-date-picker>`

| 프로퍼티 | 설명 |
|---|---|
| `--date-picker-popover-width` | width of the calendar popover (default: 296px, independent of trigger width — a fixed-width calendar reads more naturally) |

## `<u-divider>`

| 프로퍼티 | 설명 |
|---|---|
| `--divider-size` | 선의 두께 (기본: 1px) |
| `--divider-color` | 선의 색상 |
| `--divider-spacing` | 상하/좌우 간격 (기본: 8px) |

## `<u-drawer>`

| 프로퍼티 | 설명 |
|---|---|
| `--drawer-size` | 드로어 패널의 슬라이드 축 방향 크기 (기본값: 좌우 28rem / 상하 16rem). 좌우(left/right) placement는 너비, 상하(top/bottom) placement는 높이로 적용된다(상하 기본 16rem). 화면이 좁으면 max-width/max-height:100%로 자동 축소된다. |

## `<u-file-input>`

| 프로퍼티 | 설명 |
|---|---|
| `--u-file-input-display` | 호스트의 display (기본값: inline-block) |
| `--u-file-input-width` | 호스트의 width (기본값: auto) |

## `<u-input>`

| 프로퍼티 | 설명 |
|---|---|
| `--u-input-display` | 호스트의 display (기본값: inline-block). 폼/그리드 셀에서 컨테이너 폭을 채우려면 `block`으로 지정한다. |
| `--u-input-width` | 호스트의 width (기본값: auto). flex 컨테이너처럼 block만으로는 늘어나지 않는 맥락에서 `100%`로 지정한다. |
| `--input-popover-width` | 드롭다운 팝오버의 너비 (기본값: 앵커(트리거) 너비) |
| `--input-popover-min-height` | 드롭다운 팝오버의 최소 높이 (기본값: 0px) |
| `--input-popover-max-height` | 드롭다운 팝오버의 최대 높이 (기본값: 50vh) |

## `<u-menu>`

| 프로퍼티 | 설명 |
|---|---|
| `--menu-indent-size` | 하위 메뉴 아이템의 들여쓰기 크기 (기본값: 20px) |
| `--menu-padding` | 내부 여백 (`borderless` 는 0) |
| `--menu-border-width` | 테두리 두께 (`borderless` 는 0) |
| `--menu-border-color` | 테두리 색 |

## `<u-menu-item>`

| 프로퍼티 | 설명 |
|---|---|
| `--menu-item-color` | 선택/활성 상태의 기준색 (기본: --u-primary-color) |

## `<u-option>`

| 프로퍼티 | 설명 |
|---|---|
| `--option-color-interactive` | 호버/포커스 시 텍스트 색상 |
| `--option-border-color-interactive` | 호버/포커스 시 테두리 색상 |
| `--option-background-color-interactive` | 호버/포커스 시 배경 색상 |
| `--option-color-active` | 선택된 상태의 텍스트 색상 |
| `--option-border-color-active` | 선택된 상태의 테두리 색상 |
| `--option-background-color-active` | 선택된 상태의 배경 색상 |
| `--option-color-active-interactive` | 선택된 상태에서 호버/포커스 시 텍스트 색상 |
| `--option-border-color-active-interactive` | 선택된 상태에서 호버/포커스 시 테두리 색상 |
| `--option-background-color-active-interactive` | 선택된 상태에서 호버/포커스 시 배경 색상 |
| `--option-color` | 선택 상태의 기준색. 위 active 계열이 이 값에서 파생된다 (기본: --u-primary-color) |
| `--option-padding-block` | 세로 여백 |
| `--option-padding-inline` | 가로 여백 |

## `<u-progress-bar>`

| 프로퍼티 | 설명 |
|---|---|
| `--progress-bar-height` | 바의 높이 (기본: 0.5em) |
| `--progress-bar-color` | 바 색상 |
| `--progress-bar-track-color` | 트랙 배경색 |
| `--progress-bar-buffer-color` | 버퍼 바 색상 |

## `<u-progress-ring>`

| 프로퍼티 | 설명 |
|---|---|
| `--progress-ring-size` | 링의 크기 (기본: 6em) |
| `--progress-ring-color` | 링 색상 |
| `--progress-ring-track-width` | 트랙/링 두께 (기본: 6) |
| `--progress-ring-track-color` | 트랙 배경색 |
| `--progress-ring-buffer-color` | 버퍼 링 색상 |

## `<u-radio>`

| 프로퍼티 | 설명 |
|---|---|
| `--radio-color` | 선택 상태의 기준색 (기본: --u-primary-color) |
| `--radio-color-active` | 선택 상태 active 톤 (기본: --radio-color 85% + black) |

## `<u-rating>`

| 프로퍼티 | 설명 |
|---|---|
| `--rating-symbol-color` | 활성화된 심볼 색상 |
| `--rating-symbol-off-color` | 비활성화된 심볼 색상 |

## `<u-select>`

| 프로퍼티 | 설명 |
|---|---|
| `--select-popover-width` | 팝오버의 너비 (기본값: 앵커(트리거) 너비, strategy와 무관하게 동일). 옵션 텍스트가 길어도 이 값을 넘겨 넓어지지 않으며, 넘치는 텍스트는 UOption에서 ellipsis 처리된다. |
| `--select-popover-min-height` | 팝오버의 최소 높이 (기본값: 0px) |
| `--select-popover-max-height` | 팝오버의 최대 높이 (기본값: 50vh) |

## `<u-skeleton>`

| 프로퍼티 | 설명 |
|---|---|
| `--skeleton-width` | 스켈레톤의 너비 (기본값: 100%) |
| `--skeleton-height` | 스켈레톤의 높이 (기본값: 1em) |
| `--skeleton-color` | 스켈레톤의 기본 색상 (기본값: var(--u-neutral-200, #EEEEEE)) |
| `--skeleton-shimmer-color` | shimmer 효과의 색상 (기본값: var(--u-neutral-100, #F5F5F5)) |

## `<u-slider>`

| 프로퍼티 | 설명 |
|---|---|
| `--slider-fill-color` | 활성화 영역 색상 |
| `--slider-track-height` | 트랙 높이 |
| `--slider-track-color` | 트랙 배경 색상 |
| `--slider-thumb-size` | thumb 크기 |
| `--slider-thumb-color` | thumb 색상 |
| `--slider-thumb-border-color` | thumb 테두리 색상 |
| `--slider-mark-size` | 마크 크기 |
| `--slider-mark-color` | 마크 색상 |
| `--slider-mark-border-color` | 마크 테두리 색상 |

## `<u-spinner>`

| 프로퍼티 | 설명 |
|---|---|
| `--spinner-track-width` | 트랙 두께 (기본: 0.125em) |
| `--spinner-track-color` | 트랙 배경색 |
| `--spinner-indicator-color` | 인디케이터 색상 |
| `--spinner-indicator-speed` | 회전 속도 (기본: 2s) |

## `<u-split-panel>`

| 프로퍼티 | 설명 |
|---|---|
| `--splitter-size` | 스플리터 크기 (default: 4px) |
| `--splitter-color` | 스플리터 색상 |
| `--splitter-color-hover` | 스플리터 호버 색상 |
| `--splitter-color-active` | 스플리터 활성 색상 |

## `<u-switch>`

| 프로퍼티 | 설명 |
|---|---|
| `--switch-track-width` | 트랙 너비 (2.4em) |
| `--switch-track-height` | 트랙 높이 (1.4em) |
| `--switch-track-color` | 비활성 트랙 배경색 |
| `--switch-track-color-checked` | 활성 트랙 배경색 |
| `--switch-thumb-size` | thumb 크기 (1.1em) |
| `--switch-thumb-offset` | thumb 간격 (0.15em) |
| `--switch-thumb-color` | thumb 색상 (#fff) |
| `--switch-thumb-color-checked` | 활성 thumb 색상 (#fff) |
| `--switch-radius` | border-radius (9999px, pill 형태) |
| `--switch-duration` | 전환 애니메이션 시간 (0.25s) |

## `<u-tab>`

| 프로퍼티 | 설명 |
|---|---|
| `--tab-padding-block` | 세로 여백 |
| `--tab-padding-inline` | 가로 여백 |

## `<u-tab-panel>`

| 프로퍼티 | 설명 |
|---|---|
| `--tab-panel-color` | 활성 탭의 기준색 (기본: --u-primary-color) |

## `<u-tag>`

| 프로퍼티 | 설명 |
|---|---|
| `--tag-color` | 텍스트 색상 |
| `--tag-bg-color` | 배경 색상 |
| `--tag-border-color` | 테두리 색상 |
| `--tag-fill-color` | variant 별 채움 기준색 (기본: --u-primary-color) |
| `--tag-padding-block` | 세로 여백 |
| `--tag-padding-inline` | 가로 여백 |
| `--tag-gap` | prefix/본문/suffix 사이 간격 |

## `<u-tooltip>`

| 프로퍼티 | 설명 |
|---|---|
| `--tooltip-padding-block` | 세로 여백 |
| `--tooltip-padding-inline` | 가로 여백 |

## `<u-tree>`

| 프로퍼티 | 설명 |
|---|---|
| `--tree-indent-size` | 깊이 한 단계당 들여쓰기 폭 (기본: 14px). 하위 u-tree-item 이 상속받는다. |
| `--tree-indent-guide-offset` | 들여쓰기 가이드 선의 좌측 오프셋 (기본: 8px) |
| `--tree-indent-guide-width` | 가이드 선 두께 (기본: 1px) |
| `--tree-indent-guide-style` | 가이드 선 스타일 (기본: solid) |
| `--tree-indent-guide-color` | 가이드 선 색상 (기본: --u-border-color-weak) |

## `<u-tree-item>`

| 프로퍼티 | 설명 |
|---|---|
| `--tree-item-color` | 선택/활성 상태의 기준색 (기본: --u-primary-color) |
