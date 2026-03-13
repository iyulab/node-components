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
  :host([variant="square"]) {
    padding: 0.2em 0.5em;
    border-radius: 0.2em;
  }
  :host([variant="pill"]) {
    padding: 0.2em 0.5em;
    border-radius: 999px;
  }
  :host([variant="dot"]) {
    width: 0.6em;
    height: 0.6em;
    min-width: 0.6em;
    min-height: 0.6em;
    padding: 0;
    border-radius: 50%;
  }

  /* === Color (색상) === */
  :host([color="neutral"]) {
    color: var(--u-neutral-800);
    background-color: var(--u-neutral-200);
  }
  :host([color="blue"]) {
    color: var(--u-neutral-0);
    background-color: var(--u-blue-500);
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
  ::slotted([slot="prefix"]),
  ::slotted([slot="suffix"]) {
    display: inline-flex;
    align-items: center;
  }
`;
