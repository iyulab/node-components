import { css } from "lit";

export const styles = css`
  :host {
    /* --btn-color 하나만 정해지면 hover/active/surface/outline 톤이 전부 자동 파생 */
    --btn-color: var(--u-primary-color, #1976D2);

    /* ★색 슬롯이 셋인 이유 — 같은 색이 세 자리에서 요구가 다르다.
       시트의 역할 층이 이미 이 구분을 갖고 있어(-color = 면 · -strong = 바탕 위 글자 ·
       -txt-color = 면 위 글자) 슬롯 이름을 그 어법에 1:1 로 맞춘다.

         --btn-color         면(solid 배경 · 테두리 · surface 혼합의 원료)
         --btn-txt-color     그 면 **위**의 글자   ← solid
         --btn-color-strong  바탕 **위**의 글자    ← link

       ⚠셋을 하나로 접으면 다크에서 깨진다: 바탕(#121212)과 on-color(#FFFFFF)가 정반대라
       한 단이 둘을 맡을 수 없다(Cycle 141 실측 — 다크 primary 면 6.09 ✓ / 바탕 3.07 ✗).
       장식 축(color="purple" 등)은 세 슬롯이 종전 값으로 수렴하므로 렌더가 변하지 않는다. */
    --btn-txt-color: #fff;
    --btn-color-strong: var(--btn-color);
    --btn-color-strong-hover: color-mix(in srgb, var(--btn-color-strong) 85%, black);
    --btn-color-strong-active: color-mix(in srgb, var(--btn-color-strong) 70%, black);

    --btn-color-hover: color-mix(in srgb, var(--btn-color) 85%, black);
    --btn-color-active: color-mix(in srgb, var(--btn-color) 70%, black);
    --btn-color-surface: color-mix(in srgb, var(--btn-color) 12%, var(--u-bg-color, #FFFFFF));
    --btn-color-surface-hover: color-mix(in srgb, var(--btn-color) 22%, var(--u-bg-color, #FFFFFF));
    --btn-color-surface-active: color-mix(in srgb, var(--btn-color) 32%, var(--u-bg-color, #FFFFFF));
    --btn-color-border: color-mix(in srgb, var(--btn-color) 45%, var(--u-bg-color, #FFFFFF));
    --btn-color-border-hover: color-mix(in srgb, var(--btn-color) 60%, var(--u-bg-color, #FFFFFF));
    --btn-color-border-active: color-mix(in srgb, var(--btn-color) 75%, var(--u-bg-color, #FFFFFF));
    --btn-color-outline-hover: color-mix(in srgb, var(--btn-color) 6%, var(--u-bg-color, #FFFFFF));
    --btn-color-outline-active: color-mix(in srgb, var(--btn-color) 12%, var(--u-bg-color, #FFFFFF));
  }

  :host {
    position: relative;
    display: inline-flex;

    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    border-radius: var(--u-radius-lg, 6px);
    background-color: transparent;

    transition: all var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    overflow: hidden;
    user-select: none;
    cursor: pointer;
  }

  /* === Role tokens (의미 축) ===
     color="danger" 는 *"위험한 동작"* 을 뜻하고, 그 색이 무엇인지는 소비자의 역할 토큰이
     정한다. 장식 축과 반대로 **리브랜딩을 따라오고**, 대비 계약(token-contrast.test.ts)이
     지키는 짝을 그대로 물려받는다.

     ★장식 램프(shade-600)로 해석하면 안 된다 — 라이트에서 그 단 위의 흰 글자는 8색 중
     6색이 AA 미달이다(green 3.30 · orange 2.37 · cyan 2.74 …). 역할 값을 쓰는 이유가
     *의미 이름*인데 그 대가로 대비를 잃으면 앞뒤가 맞지 않는다. */
  :host([color="primary"]) {
    --btn-color: var(--u-primary-color, #1976D2);
    --btn-color-strong: var(--u-primary-color-strong, #1565C0);
    --btn-txt-color: var(--u-primary-txt-color, #FFFFFF);
  }
  :host([color="info"]) {
    --btn-color: var(--u-info-color, #1976D2);
    --btn-color-strong: var(--u-info-color-strong, #1565C0);
    --btn-txt-color: var(--u-info-txt-color, #FFFFFF);
  }
  :host([color="success"]) {
    --btn-color: var(--u-success-color, #2E7D32);
    --btn-color-strong: var(--u-success-color-strong, #1B5E20);
    --btn-txt-color: var(--u-success-txt-color, #FFFFFF);
  }
  :host([color="warning"]) {
    --btn-color: var(--u-warning-color, #FDD835);
    --btn-color-strong: var(--u-warning-color-strong, #8A4A00);
    --btn-txt-color: var(--u-warning-txt-color, #000000);
  }
  :host([color="danger"]) {
    --btn-color: var(--u-danger-color, #D32F2F);
    --btn-color-strong: var(--u-danger-color-strong, #C62828);
    --btn-txt-color: var(--u-danger-txt-color, #FFFFFF);
  }

  /* 역할 축의 link 는 쉬는 상태가 **이미 대비로 선택된 단**(-strong)이라 더 어둡게 하면
     계약을 벗어난다. 강조는 밑줄이 맡는다 — neutral link 가 쓰는 어법과 같다.
     장식 축은 종전대로 혼합 파생을 유지한다. */
  :host([color="primary"]),
  :host([color="info"]),
  :host([color="success"]),
  :host([color="warning"]),
  :host([color="danger"]) {
    --btn-color-strong-hover: var(--btn-color-strong);
    --btn-color-strong-active: var(--btn-color-strong);
  }

  /* === Color tokens (장식 축) === */
  :host([color="blue"])   { --btn-color: var(--u-blue-600, #1E88E5); }
  :host([color="green"])  { --btn-color: var(--u-green-600, #43A047); }
  :host([color="red"])    { --btn-color: var(--u-red-600, #E53935); }
  :host([color="orange"]) { --btn-color: var(--u-orange-600, #FB8C00); }
  :host([color="teal"])   { --btn-color: var(--u-teal-600, #00897B); }
  :host([color="cyan"])   { --btn-color: var(--u-cyan-600, #00ACC1); }
  :host([color="purple"]) { --btn-color: var(--u-purple-600, #8E24AA); }
  :host([color="pink"])   { --btn-color: var(--u-pink-600, #D81B60); }

  /* === Size ===
   *
   * ★**크기 축은 font-size 하나로 움직인다** — 여백·최소높이가 전부 em 이라 비례로 따라온다.
   *   이것은 결손이 아니라 설계다: 폼·인라인 요소의 여백은 상속된 font-size 에 비례하는 것이
   *   의도이며(--u-space-* 는 컨테이너/오버레이의 레이아웃 여백 축이라 여기 닿지 않는다),
   *   px 계단을 따로 두면 두 축이 갈라진다.
   *
   * ⚠**그런데 두 값이 그 비례에서 빠져 있었다** (1.20.0 에서 해소):
   *   ⑴ 가로 여백이 세로와 **같은 0.5em** 이라 글자가 테두리에 붙었다(실측 md 7px/7px).
   *   ⑵ min-height 가 **없어서** 아이콘만 든 버튼이 글자 버튼과 높이가 달랐다 —
   *      실측: 같은 size 인데 md 아이콘 32px vs 글자 37px. 툴바에서 5px 어긋난다.
   *      그리고 아이콘 버튼의 계단(30/32/34)이 글자 버튼(32/37/42)과 기울기가 달라
   *      size 를 올릴수록 어긋남이 커졌다.
   */
  :host([size="sm"]) {
    font-size: 12px;
  }
  :host([size="lg"]) {
    font-size: 16px;
  }

  /* === States === */
  :host(:active) {
    transform: translateY(1px);
  }
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }
  :host([loading]) {
    opacity: 0.8;
    pointer-events: none;
    cursor: wait;
  }
  :host([loading]) button,
  :host([loading]) a {
    visibility: hidden;
  }
  :host([rounded]) {
    border-radius: var(--u-radius-pill, 9999px);
  }
  :host([has-spinner]) u-spinner {
    display: none;
  }

  /* === Variant styles === */

  /* solid: 강한 채움 (기본 color="neutral") */
  :host([variant="solid"]) {
    color: var(--btn-txt-color);
    background-color: var(--btn-color);
    --btn-border-color: var(--btn-color);
  }
  :host([variant="solid"]:hover) {
    background-color: var(--btn-color-hover);
    --btn-border-color: var(--btn-color-hover);
  }
  :host([variant="solid"]:active) {
    background-color: var(--btn-color-active);
    --btn-border-color: var(--btn-color-active);
  }

  /* surface: 채우기 + 경계 */
  :host([variant="surface"]) {
    color: var(--u-txt-color, #212121);
    background-color: var(--btn-color-surface);
    --btn-border-color: var(--btn-color-border);
  }
  :host([variant="surface"]:hover) {
    background-color: var(--btn-color-surface-hover);
    --btn-border-color: var(--btn-color-border-hover);
  }
  :host([variant="surface"]:active) {
    background-color: var(--btn-color-surface-active);
    --btn-border-color: var(--btn-color-border-active);
  }

  /* filled: 채우기만 */
  :host([variant="filled"]) {
    color: var(--u-txt-color, #212121);
    background-color: var(--btn-color-surface);
    --btn-border-color: transparent;
  }
  :host([variant="filled"]:hover) {
    background-color: var(--btn-color-surface-hover);
  }
  :host([variant="filled"]:active) {
    background-color: var(--btn-color-surface-active);
  }

  /* outlined: 경계만 */
  :host([variant="outlined"]) {
    color: var(--u-txt-color, #212121);
    --btn-border-color: var(--btn-color-border);
    background-color: transparent;
  }
  :host([variant="outlined"]:hover) {
    --btn-border-color: var(--btn-color-border-hover);
    background-color: var(--btn-color-outline-hover);
  }
  :host([variant="outlined"]:active) {
    --btn-border-color: var(--btn-color-border-active);
    background-color: var(--btn-color-outline-active);
  }

  /* ghost: transparent */
  :host([variant="ghost"]) {
    color: var(--u-txt-color, #212121);
    --btn-border-color: transparent;
    background-color: transparent;
  }
  :host([variant="ghost"]:hover) {
    background-color: var(--u-bg-color-hover, #F5F5F5);
  }
  :host([variant="ghost"]:active) {
    background-color: var(--u-bg-color-active, #EEEEEE);
  }

  /* link: blue 링크 스타일 (기본값, color="neutral"일 때도 유지 — 기존 동작 보존)
     ★종전 3단(weak → color → strong)은 쉬는 상태가 --u-primary-color-weak (흰 바탕 3.12)라
     링크 글자가 AA 미달이었고, 그 사이 토큰 층의 --u-link-txt-color 는 어디에서도 쓰이지
     않았다. 링크 색을 정의해 둔 토큰을 링크가 무시하고 있었던 셈이다.
     쉬는 상태를 그 토큰으로 되돌리고, 강조는 밑줄과 -strong 한 단으로 표현한다. */
  :host([variant="link"]) {
    color: var(--u-link-txt-color, #1565C0);
    --btn-border-color: transparent;
    background-color: transparent;
    --btn-padding-inline: 0;
  }
  :host([variant="link"]:hover),
  :host([variant="link"]:active) {
    color: var(--u-primary-color-strong, #1565C0);
    text-decoration: underline;
  }
  /* link + 명시적 non-neutral color: 링크 자체 색상을 재정의 (예: 파괴적 액션 링크)
     ★여기는 **바탕 위의 글자**다 — 면 슬롯(--btn-color)이 아니라 --btn-color-strong 을
     읽는다. 장식 축에서는 둘이 같은 값이라 렌더가 변하지 않고, 역할 축에서만 갈린다. */
  :host([variant="link"][color]:not([color="neutral"])) {
    color: var(--btn-color-strong);
  }
  :host([variant="link"][color]:not([color="neutral"]):hover) {
    color: var(--btn-color-strong-hover);
  }
  :host([variant="link"][color]:not([color="neutral"]):active) {
    color: var(--btn-color-strong-active);
  }

  /* === Inner ===
   *
   * 여백·테두리는 내부 요소가 그린다. :host 에 두면 소비 앱의 CSS 리셋
   * (* { padding:0; border:0 } — Tailwind preflight 등 사실상 표준 관행)에 지워진다.
   * 호스트 요소에 대해서는 문서 작성자 스타일이 섀도의 :host 규칙을 이기기 때문이며,
   * 그 결과 버튼이 글자 높이만 남는다(에러는 없다). 내부 요소는 문서 리셋의 사정권 밖이다.
   *
   * 테두리 색은 여전히 :host([variant=...]) 가 정한다 — --btn-border-color 로 내려보내므로
   * variant/hover/active 규칙은 호스트에 그대로 남는다.
   */
  button, a {
    all: unset;
    box-sizing: border-box;   /* all:unset 이 content-box 로 되돌리므로 다시 지정 */
    width: 100%;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    padding: var(--btn-padding-block, 0.5em) var(--btn-padding-inline, 1em);
    border: 1px solid var(--btn-border-color, transparent);
    border-radius: inherit;

    /* ★**글자 버튼의 자연 높이를 그대로 바닥값으로 쓴다** — 값을 새로 고른 것이 아니라
     * 같은 식을 다시 쓴 것이다:
     *
     *     line-height(1.5em) + 상하 여백 ×2 + 테두리 ×2
     *
     * 그래서 글자 버튼의 높이는 **변하지 않고**(sm 32 · md 37 · lg 42 그대로),
     * 아이콘만 든 버튼이 같은 높이로 올라온다. 상수를 박으면 이 성질이 깨진다 —
     * 소비자가 --btn-padding-block 을 덮는 순간 둘이 다시 갈라진다. */
    min-height: calc(1.5em + 2 * var(--btn-padding-block, 0.5em) + 2px);

  }
  a {
    text-decoration: none;
    color: inherit;
  }
  a[disabled] {
    pointer-events: none;
  }

  /* === Slots === */
  ::slotted(*) {
    color: inherit;
    font-size: inherit;
  }
  ::slotted([slot="prefix"]) {
    margin-right: 0.5em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.5em;
  }

  .content {
    flex: 1 0 auto;
    min-width: 0;
    line-height: 1.5;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* === Mask (로딩 오버레이) === */
  .mask {
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: inherit;
    font-size: inherit;
    border-radius: inherit;
    background-color: inherit;
    pointer-events: none;
  }
`;
