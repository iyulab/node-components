# Design Tokens

> 자동 생성 문서 — 직접 편집하지 마세요. `src/assets/styles/light.css` 가 원본입니다.
> 갱신: `npm run docs:tokens`

문서 전역에 정의되는 토큰입니다. 컴포넌트가 노출하는 개별 훅은
[css-custom-properties.md](css-custom-properties.md), 넣는 방법과 브랜딩 지침은
[theming.md](theming.md) 를 보세요.

`dark.css` 는 같은 이름을 같은 구조로 정의하며 **값만** 다릅니다 — 다크 대응을 위해
컴포넌트나 소비자가 할 일은 없습니다.

**역할 25 · 스케일 19 · 시맨틱 99 · 팔레트 111**

---

## 역할 토큰 — 브랜딩은 여기서

의미가 있는 자리(상태·유효성·포커스·링크·선택)는 팔레트가 아니라 이 층을 참조합니다.
**하나를 덮으면 해당 의미를 가진 모든 컴포넌트가 따라옵니다.**

단은 **강도** 축입니다(weakest → strong). 용도(배경/테두리/텍스트)는 소비처가 정합니다.

| 역할 | `-weakest` | `-weaker` | `-weak` | `(기본)` | `-strong` |
|---|---|---|---|---|---|
| **primary** | `--u-blue-200` | `--u-blue-300` | `--u-blue-500` | `--u-blue-700` | `--u-blue-800` |
| **info** | `--u-blue-200` | `--u-blue-300` | `--u-blue-500` | `--u-blue-700` | `--u-blue-800` |
| **success** | `--u-green-200` | `--u-green-300` | `--u-green-500` | `--u-green-800` | `--u-green-900` |
| **warning** | `--u-yellow-200` | `--u-yellow-300` | `--u-yellow-500` | `--u-yellow-600` | `--u-yellow-1000` |
| **danger** | `--u-red-200` | `--u-red-300` | `--u-red-500` | `--u-red-700` | `--u-red-800` |

> `primary` 와 `info` 는 기본 색상이 같지만 **다른 역할**입니다 — 리브랜딩은 `primary` 만 바꿉니다.

⚠ `color` 속성(`<u-tag color="purple">`)은 **장식 축**이라 역할 오버라이드에 반응하지 않습니다.

---

## 스케일 토큰

색이 아닌 축입니다. 테마와 무관하므로 두 시트가 같은 값을 가집니다.

⚠ `--u-space-*` 는 **컨테이너·오버레이의 레이아웃 여백**입니다(카드·대화상자·드로어·
알림·메뉴·툴팁). 폼·인라인 요소의 여백은 `em` 이라 **상속된 `font-size` 에 비례**합니다 —
`body { font-size: 18px }` 를 주면 버튼·입력의 여백도 따라 커집니다. 그 비례를 유지하려고
일부러 절대 스케일에 넣지 않았으니, 폼 여백을 조정할 때는 이 토큰이 아니라
해당 컴포넌트의 훅(`--btn-padding-*` 등) 또는 타이포를 쓰세요.

### 토큰 시트를 로드하지 않는 경우

컴포넌트는 **시트 없이도 렌더됩니다** — 토큰 참조에 기본 테마 값이 폴백으로 배선돼
있습니다(`var(--u-txt-color, #212121)`). 시트를 로드하면 폴백은 평가되지 않으므로
두 경우의 렌더는 같습니다.

⚠**폰트 계열(`--u-font-*`)만 예외**입니다 — 폴백이 없습니다. 폰트 스택은 리터럴이
길어 모든 사용처에 넣으면 얻는 것보다 잃는 것이 크고, 시트가 없으면 브라우저 기본
폰트로 대체되어 **화면이 깨지지 않습니다**(색·테두리는 깨집니다). 폰트를 지정하려면
시트를 로드하거나 `font-family` 를 직접 주세요.

> 비라틴 문자권(CJK·태국어·아랍어)에서 스택을 조정하는 방법은
> [theming.md 의 *Fonts and Non-Latin Scripts*](theming.md#fonts-and-non-latin-scripts) 를 보세요.

### 타이포에 반응하는 컴포넌트 / 그렇지 않은 컴포넌트

대부분의 컴포넌트는 `font-size: inherit` 이라 소비자의 타이포를 그대로 따릅니다.
**네 컴포넌트는 의도적으로 자기 크기를 고정**합니다 — 배지·트리 항목·아이콘 버튼처럼
주변 텍스트와 무관하게 일정한 크기여야 읽히는 것들입니다:

| 컴포넌트 | 고정 크기 | 타이포 상속 |
|---|---|---|
| `u-tag` · `u-tree-item` | `12px` | ✗ |
| `u-copy-button` | `18px` | ✗ |
| `u-icon-button` | `20px` | ✗ |
| 그 외 전부 | — | ✓ `inherit` |

이 넷의 여백은 `em` 으로 쓰여 있지만 고정 크기 위에 얹히므로 **실질적으로 절대값**입니다.
`body` 타이포를 키워도 이 넷은 커지지 않습니다 — 크기를 바꾸려면 각 컴포넌트의
여백 훅(`--tag-padding-block` 등)을 쓰세요.

### 의미 타이포 7단을 쓰는 법 — `u-text`

아래 `--u-text-*` 는 **7단 × 4속성**(크기·굵기·행간·자간)입니다. 이 값들을 직접
참조하지 말고 [`u-text`](../skills/iyulab-components/references/components/text.md) 를
쓰세요 — 자기 CSS 를 쓰지 않고 스케일에 올라탈 수 있습니다.

```html
<u-text level="1" variant="display">문서 제목</u-text>
<u-text variant="subtitle" tone="weak">한 줄 설명</u-text>
<u-text>본문</u-text>
<u-text variant="caption" tone="weak">보조 문구</u-text>
```

★**시각 축(`variant`)과 의미 축(`level`)은 독립**입니다. `level` 을 주면 실제
`<h1>`~`<h6>` 으로 렌더되어 heading 으로 읽히므로, *"페이지의 두 번째 제목이
시각적으로 가장 큰"* 배치도 마크업을 거짓말시키지 않고 표현됩니다.

⚠아래 표를 직접 참조하는 것이 맞는 경우도 있습니다 — **자기 섀도 CSS 를 가진
컴포넌트**를 만들 때입니다. 그때는 `var(--u-text-title-size, 20px)` 처럼 폴백과 함께
쓰세요. 반면 **화면 마크업**에서 이 토큰을 참조하고 있다면 그 자리는 `u-text` 입니다.

| 토큰 | 값 |
|---|---|
| `--u-radius-none` | `0` |
| `--u-radius-sm` | `3px` |
| `--u-radius-md` | `4px` |
| `--u-radius-lg` | `6px` |
| `--u-radius-xl` | `8px` |
| `--u-radius-2xl` | `12px` |
| `--u-radius-3xl` | `16px` |
| `--u-radius-pill` | `9999px` |
| `--u-radius-circle` | `50%` |
| `--u-space-3xs` | `2px` |
| `--u-space-2xs` | `4px` |
| `--u-space-xs` | `6px` |
| `--u-space-sm` | `8px` |
| `--u-space-md` | `12px` |
| `--u-space-lg` | `16px` |
| `--u-space-xl` | `20px` |
| `--u-space-2xl` | `24px` |
| `--u-space-3xl` | `32px` |
| `--u-space-4xl` | `40px` |

---

## 시맨틱 토큰

텍스트·아이콘·테두리·배경 등 용도별 토큰입니다. 일부는 역할 층을 경유하므로
역할 토큰을 덮으면 함께 따라옵니다(아래 `var(--u-*-color*)` 표기).

| 토큰 | 기본값 |
|---|---|
| `--u-txt-color` | `var(--u-neutral-900)` |
| `--u-txt-color-inverse` | `var(--u-neutral-0)` |
| `--u-primary-txt-color` | `#FFFFFF` |
| `--u-info-txt-color` | `#FFFFFF` |
| `--u-success-txt-color` | `#FFFFFF` |
| `--u-danger-txt-color` | `#FFFFFF` |
| `--u-warning-txt-color` | `var(--u-neutral-1000)` |
| `--u-txt-color-hover` | `var(--u-primary-color-strong)` |
| `--u-txt-color-active` | `var(--u-primary-color-strong)` |
| `--u-txt-color-disabled` | `var(--u-neutral-400)` |
| `--u-txt-color-weak` | `var(--u-neutral-600)` |
| `--u-txt-color-strong` | `var(--u-neutral-1000)` |
| `--u-link-txt-color` | `var(--u-primary-color-strong)` |
| `--u-tooltip-txt-color` | `var(--u-neutral-0)` |
| `--u-icon-color` | `var(--u-neutral-700)` |
| `--u-icon-color-inverse` | `var(--u-neutral-0)` |
| `--u-icon-color-hover` | `var(--u-primary-color-strong)` |
| `--u-icon-color-active` | `var(--u-primary-color-strong)` |
| `--u-icon-color-disabled` | `var(--u-neutral-400)` |
| `--u-border-color` | `var(--u-neutral-300)` |
| `--u-border-color-weak` | `var(--u-neutral-200)` |
| `--u-border-color-strong` | `var(--u-neutral-400)` |
| `--u-border-color-hover` | `var(--u-neutral-400)` |
| `--u-input-border-color` | `var(--u-neutral-300)` |
| `--u-input-border-color-hover` | `var(--u-neutral-400)` |
| `--u-input-border-color-focus` | `var(--u-primary-color-strong)` |
| `--u-input-border-color-invalid` | `var(--u-danger-color-strong)` |
| `--u-bg-color` | `var(--u-neutral-0)` |
| `--u-bg-color-inverse` | `var(--u-neutral-900)` |
| `--u-bg-color-hover` | `var(--u-neutral-100)` |
| `--u-bg-color-active` | `var(--u-neutral-200)` |
| `--u-bg-color-disabled` | `var(--u-neutral-50)` |
| `--u-bg-color-raised` | `var(--u-neutral-50)` |
| `--u-primary-bg-color` | `var(--u-blue-0)` |
| `--u-info-bg-color` | `var(--u-blue-0)` |
| `--u-success-bg-color` | `var(--u-green-0)` |
| `--u-danger-bg-color` | `var(--u-red-0)` |
| `--u-warning-bg-color` | `var(--u-yellow-200)` |
| `--u-input-bg-color` | `var(--u-neutral-0)` |
| `--u-panel-bg-color` | `var(--u-neutral-0)` |
| `--u-overlay-bg-color` | `rgba(0, 0, 0, 0.5)` |
| `--u-tooltip-bg-color` | `rgba(0, 0, 0, 0.75)` |
| `--u-shadow-color-weaker` | `rgba(0, 0, 0, 0.04)` |
| `--u-shadow-color-weak` | `rgba(0, 0, 0, 0.08)` |
| `--u-shadow-color-normal` | `rgba(0, 0, 0, 0.12)` |
| `--u-shadow-color-strong` | `rgba(0, 0, 0, 0.16)` |
| `--u-shadow-color-stronger` | `rgba(0, 0, 0, 0.24)` |
| `--u-shadow-sm` | `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.04)` |
| `--u-shadow-md` | `0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05)` |
| `--u-shadow-lg` | `0 4px 12px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.06)` |
| `--u-shadow-xl` | `0 6px 18px rgba(0, 0, 0, 0.24), 0 2px 6px rgba(0, 0, 0, 0.08)` |
| `--u-text-display-size` | `26px` |
| `--u-text-display-weight` | `700` |
| `--u-text-display-leading` | `1.4` |
| `--u-text-display-tracking` | `-0.02em` |
| `--u-text-title-size` | `20px` |
| `--u-text-title-weight` | `700` |
| `--u-text-title-leading` | `1.45` |
| `--u-text-title-tracking` | `-0.01em` |
| `--u-text-subtitle-size` | `16px` |
| `--u-text-subtitle-weight` | `600` |
| `--u-text-subtitle-leading` | `1.5` |
| `--u-text-subtitle-tracking` | `0` |
| `--u-text-body-size` | `14px` |
| `--u-text-body-weight` | `400` |
| `--u-text-body-leading` | `1.6` |
| `--u-text-body-tracking` | `0` |
| `--u-text-label-size` | `13px` |
| `--u-text-label-weight` | `600` |
| `--u-text-label-leading` | `1.5` |
| `--u-text-label-tracking` | `0` |
| `--u-text-caption-size` | `12px` |
| `--u-text-caption-weight` | `400` |
| `--u-text-caption-leading` | `1.5` |
| `--u-text-caption-tracking` | `0` |
| `--u-text-overline-size` | `11px` |
| `--u-text-overline-weight` | `700` |
| `--u-text-overline-leading` | `1.45` |
| `--u-text-overline-tracking` | `0.06em` |
| `--u-duration-instant` | `80ms` |
| `--u-duration-fast` | `140ms` |
| `--u-duration-normal` | `220ms` |
| `--u-duration-slow` | `320ms` |
| `--u-ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--u-ease-decelerate` | `cubic-bezier(0, 0, 0, 1)` |
| `--u-ease-accelerate` | `cubic-bezier(0.3, 0, 1, 1)` |
| `--u-scrollbar-color` | `var(--u-neutral-400)` |
| `--u-scrollbar-color-hover` | `var(--u-neutral-500)` |
| `--u-scrollbar-track-color` | `transparent` |
| `--u-font-base` | `'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', 'Hiragino Sans', 'Yu Gothic UI', 'Microsoft YaHei', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'` |
| `--u-font-mono` | `ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, 'Courier New', monospace` |
| `--u-font-serif` | `'Georgia', 'Times New Roman', Times, serif` |
| `--u-font-display` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif` |
| `--u-font-modern` | `'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| `--u-font-rounded` | `'Nunito', 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| `--u-duration-instant` | `0ms` |
| `--u-duration-fast` | `0ms` |
| `--u-duration-normal` | `0ms` |
| `--u-duration-slow` | `0ms` |

---

## 팔레트 프리미티브

`--u-{hue}-{shade}` — shade 는 `0, 100, … 1000`.
**직접 참조는 장식 축에서만 하세요.** 의미가 있는 자리는 역할 토큰을 씁니다.

| Hue | 단 수 |
|---|---|
| `--u-neutral-*` | 12 |
| `--u-blue-*` | 11 |
| `--u-green-*` | 11 |
| `--u-yellow-*` | 11 |
| `--u-red-*` | 11 |
| `--u-orange-*` | 11 |
| `--u-teal-*` | 11 |
| `--u-cyan-*` | 11 |
| `--u-purple-*` | 11 |
| `--u-pink-*` | 11 |
