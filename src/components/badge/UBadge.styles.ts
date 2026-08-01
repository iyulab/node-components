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
    border-radius: 999px;
  }
  :host([variant="dot"]) {
    width: 0.6em;
    height: 0.6em;
    min-width: 0.6em;
    min-height: 0.6em;
    --badge-padding-block: 0;
    --badge-padding-inline: 0;
    border-radius: 50%;
  }

  /* === Color (색상) === */
  :host([color="neutral"]) {
    color: var(--u-neutral-800);
    background-color: var(--u-neutral-200);
  }
  :host([color="blue"]) {
    color: var(--u-neutral-0);
    background-color: var(--u-primary-color, var(--u-blue-500));
  }
  :host([color="green"]) {
    color: var(--u-neutral-0);
    background-color: var(--u-green-500);
  }
  :host([color="yellow"]) {
    color: var(--u-neutral-0);
    background-color: var(--u-yellow-600);
  }
  :host([color="red"]) {
    color: var(--u-neutral-0);
    background-color: var(--u-red-500);
  }
  :host([color="orange"]) {
    color: var(--u-neutral-0);
    background-color: var(--u-orange-500);
  }
  :host([color="teal"]) {
    color: var(--u-neutral-0);
    background-color: var(--u-teal-500);
  }
  :host([color="cyan"]) {
    color: var(--u-neutral-0);
    background-color: var(--u-cyan-500);
  }
  :host([color="purple"]) {
    color: var(--u-neutral-0);
    background-color: var(--u-purple-500);
  }
  :host([color="pink"]) {
    color: var(--u-neutral-0);
    background-color: var(--u-pink-500);
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
