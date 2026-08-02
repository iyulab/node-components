import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.25em;
    font-size: inherit;
    font-weight: 600;
    font-family: var(--u-font-base);
    line-height: 1;
    white-space: nowrap;
    user-select: none;
  }

  /* === Variant (형태) === */
  /* 여백은 내부 요소가 진다 — :host 에 두면 소비 앱 CSS 리셋에 지워진다. */
  .base {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: inherit;
    padding: var(--badge-padding-block, 0.2em) var(--badge-padding-inline, 0.5em);
    border-radius: inherit;
  }

  :host([variant="square"]) {
    border-radius: 0.2em;
  }
  :host([variant="pill"]) {
    border-radius: var(--u-radius-pill, 9999px);
  }
  :host([variant="dot"]) {
    width: 0.6em;
    height: 0.6em;
    min-width: 0.6em;
    min-height: 0.6em;
    border-radius: var(--u-radius-circle, 50%);
  }

  /* === Color (색상) === */
  :host([color="neutral"]) {
    color: var(--u-neutral-800, #424242);
    background-color: var(--u-neutral-200, #EEEEEE);
  }
  :host([color="blue"]) {
    color: var(--u-neutral-0, #FFFFFF);
    /* ★장식 축이므로 팔레트를 직접 읽는다 — 여기만 역할 토큰(--u-primary-color)이었다.
       그 탓에 브랜드를 바꾸면 color="blue" 배지만 함께 움직였다(color="green" 등 8색은
       안 움직인다). u-tag 에는 이 오염을 막는 네거티브 컨트롤이 있는데 u-badge 에는
       없어서 드러나지 않았다. 단은 이 컴포넌트의 다른 장식 색과 같은 500 으로 맞춘다. */
    background-color: var(--u-blue-500, #2196F3);
  }
  :host([color="green"]) {
    color: var(--u-neutral-0, #FFFFFF);
    background-color: var(--u-green-500, #4CAF50);
  }
  :host([color="yellow"]) {
    color: var(--u-neutral-0, #FFFFFF);
    background-color: var(--u-yellow-600, #FDD835);
  }
  :host([color="red"]) {
    color: var(--u-neutral-0, #FFFFFF);
    background-color: var(--u-red-500, #F44336);
  }
  :host([color="orange"]) {
    color: var(--u-neutral-0, #FFFFFF);
    background-color: var(--u-orange-500, #FF9800);
  }
  :host([color="teal"]) {
    color: var(--u-neutral-0, #FFFFFF);
    background-color: var(--u-teal-500, #009688);
  }
  :host([color="cyan"]) {
    color: var(--u-neutral-0, #FFFFFF);
    background-color: var(--u-cyan-500, #00BCD4);
  }
  :host([color="purple"]) {
    color: var(--u-neutral-0, #FFFFFF);
    background-color: var(--u-purple-500, #9C27B0);
  }
  :host([color="pink"]) {
    color: var(--u-neutral-0, #FFFFFF);
    background-color: var(--u-pink-500, #E91E63);
  }

  /* === Anchor (위치 고정) === */
  :host([anchor]) {
    position: absolute;
    z-index: 1;
  }
  :host([anchor="top-right"]) {
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
  }
  :host([anchor="top-left"]) {
    top: 0;
    left: 0;
    transform: translate(-50%, -50%);
  }
  :host([anchor="bottom-right"]) {
    bottom: 0;
    right: 0;
    transform: translate(50%, 50%);
  }
  :host([anchor="bottom-left"]) {
    bottom: 0;
    left: 0;
    transform: translate(-50%, 50%);
  }

  /* === Slots === */
  ::slotted([slot="prefix"]) {
    margin-right: 0.25em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.25em;
  }
`;
