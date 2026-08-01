# Design Tokens

> 자동 생성 문서 — 직접 편집하지 마세요. `src/assets/styles/light.css` 가 원본입니다.
> 갱신: `npm run docs:tokens`

문서 전역에 정의되는 토큰입니다. 컴포넌트가 노출하는 개별 훅은
[css-custom-properties.md](css-custom-properties.md), 넣는 방법과 브랜딩 지침은
[theming.md](theming.md) 를 보세요.

`dark.css` 는 같은 이름을 같은 구조로 정의하며 **값만** 다릅니다 — 다크 대응을 위해
컴포넌트나 소비자가 할 일은 없습니다.

**역할 25 · 스케일 7 · 시맨틱 45 · 팔레트 111**

---

## 역할 토큰 — 브랜딩은 여기서

의미가 있는 자리(상태·유효성·포커스·링크·선택)는 팔레트가 아니라 이 층을 참조합니다.
**하나를 덮으면 해당 의미를 가진 모든 컴포넌트가 따라옵니다.**

단은 **강도** 축입니다(weakest → strong). 용도(배경/테두리/텍스트)는 소비처가 정합니다.

| 역할 | `-weakest` | `-weaker` | `-weak` | `(기본)` | `-strong` |
|---|---|---|---|---|---|
| **primary** | `--u-blue-200` | `--u-blue-300` | `--u-blue-500` | `--u-blue-600` | `--u-blue-700` |
| **info** | `--u-blue-200` | `--u-blue-300` | `--u-blue-500` | `--u-blue-600` | `--u-blue-700` |
| **success** | `--u-green-200` | `--u-green-300` | `--u-green-500` | `--u-green-600` | `--u-green-700` |
| **warning** | `--u-yellow-200` | `--u-yellow-300` | `--u-yellow-500` | `--u-yellow-600` | `--u-yellow-700` |
| **danger** | `--u-red-200` | `--u-red-300` | `--u-red-500` | `--u-red-600` | `--u-red-700` |

> `primary` 와 `info` 는 기본 색상이 같지만 **다른 역할**입니다 — 리브랜딩은 `primary` 만 바꿉니다.

⚠ `color` 속성(`<u-tag color="purple">`)은 **장식 축**이라 역할 오버라이드에 반응하지 않습니다.

---

## 스케일 토큰

색이 아닌 축입니다. 테마와 무관하므로 두 시트가 같은 값을 가집니다.

| 토큰 | 값 |
|---|---|
| `--u-radius-none` | `0` |
| `--u-radius-sm` | `3px` |
| `--u-radius-md` | `4px` |
| `--u-radius-lg` | `6px` |
| `--u-radius-xl` | `8px` |
| `--u-radius-pill` | `9999px` |
| `--u-radius-circle` | `50%` |

---

## 시맨틱 토큰

텍스트·아이콘·테두리·배경 등 용도별 토큰입니다. 일부는 역할 층을 경유하므로
역할 토큰을 덮으면 함께 따라옵니다(아래 `var(--u-*-color*)` 표기).

| 토큰 | 기본값 |
|---|---|
| `--u-txt-color` | `var(--u-neutral-900)` |
| `--u-txt-color-inverse` | `var(--u-neutral-0)` |
| `--u-txt-color-hover` | `var(--u-primary-color)` |
| `--u-txt-color-active` | `var(--u-primary-color)` |
| `--u-txt-color-disabled` | `var(--u-neutral-400)` |
| `--u-txt-color-weak` | `var(--u-neutral-500)` |
| `--u-txt-color-strong` | `var(--u-neutral-1000)` |
| `--u-link-txt-color` | `var(--u-primary-color-strong)` |
| `--u-tooltip-txt-color` | `var(--u-neutral-0)` |
| `--u-icon-color` | `var(--u-neutral-700)` |
| `--u-icon-color-inverse` | `var(--u-neutral-0)` |
| `--u-icon-color-hover` | `var(--u-primary-color)` |
| `--u-icon-color-active` | `var(--u-primary-color)` |
| `--u-icon-color-disabled` | `var(--u-neutral-400)` |
| `--u-border-color` | `var(--u-neutral-300)` |
| `--u-border-color-weak` | `var(--u-neutral-200)` |
| `--u-border-color-strong` | `var(--u-neutral-400)` |
| `--u-border-color-hover` | `var(--u-neutral-400)` |
| `--u-input-border-color` | `var(--u-neutral-300)` |
| `--u-input-border-color-hover` | `var(--u-neutral-400)` |
| `--u-input-border-color-focus` | `var(--u-primary-color)` |
| `--u-input-border-color-invalid` | `var(--u-danger-color)` |
| `--u-bg-color` | `var(--u-neutral-0)` |
| `--u-bg-color-inverse` | `var(--u-neutral-900)` |
| `--u-bg-color-hover` | `var(--u-neutral-100)` |
| `--u-bg-color-active` | `var(--u-neutral-200)` |
| `--u-bg-color-disabled` | `var(--u-neutral-50)` |
| `--u-input-bg-color` | `var(--u-neutral-0)` |
| `--u-panel-bg-color` | `var(--u-neutral-0)` |
| `--u-overlay-bg-color` | `rgba(0, 0, 0, 0.5)` |
| `--u-tooltip-bg-color` | `rgba(0, 0, 0, 0.75)` |
| `--u-shadow-color-weaker` | `rgba(0, 0, 0, 0.04)` |
| `--u-shadow-color-weak` | `rgba(0, 0, 0, 0.08)` |
| `--u-shadow-color-normal` | `rgba(0, 0, 0, 0.12)` |
| `--u-shadow-color-strong` | `rgba(0, 0, 0, 0.16)` |
| `--u-shadow-color-stronger` | `rgba(0, 0, 0, 0.24)` |
| `--u-scrollbar-color` | `var(--u-neutral-400)` |
| `--u-scrollbar-color-hover` | `var(--u-neutral-500)` |
| `--u-scrollbar-track-color` | `transparent` |
| `--u-font-base` | `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'` |
| `--u-font-mono` | `ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, 'Courier New', monospace` |
| `--u-font-serif` | `'Georgia', 'Times New Roman', Times, serif` |
| `--u-font-display` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif` |
| `--u-font-modern` | `'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| `--u-font-rounded` | `'Nunito', 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |

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
