import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-flex;

    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    padding: 0.5em;
    border: 1px solid transparent;
    border-radius: 6px;
    background-color: transparent;

    transition: all 0.2s ease;
    overflow: hidden;
    user-select: none;
    cursor: pointer;
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
    border-radius: 9999px;
  }
  :host([has-spinner]) u-spinner {
    display: none;
  }

  /* === Variant styles === */

  /* solid: 강한 채움 (neutral) */
  :host([variant="solid"]) {
    color: #fff;
    background-color: var(--u-neutral-600, #525252);
    border-color: var(--u-neutral-600, #525252);
  }
  :host([variant="solid"]:hover) {
    background-color: var(--u-neutral-700, #404040);
    border-color: var(--u-neutral-700, #404040);
  }
  :host([variant="solid"]:active) {
    background-color: var(--u-neutral-800, #262626);
    border-color: var(--u-neutral-800, #262626);
  }

  /* surface: 채우기 + 경계 */
  :host([variant="surface"]) {
    color: var(--u-txt-color);
    background-color: var(--u-neutral-100, #f5f5f5);
    border-color: var(--u-neutral-300, #d4d4d4);
  }
  :host([variant="surface"]:hover) {
    background-color: var(--u-neutral-200, #e5e5e5);
    border-color: var(--u-neutral-400, #a3a3a3);
  }
  :host([variant="surface"]:active) {
    background-color: var(--u-neutral-300, #d4d4d4);
    border-color: var(--u-neutral-500, #737373);
  }

  /* filled: 채우기만 */
  :host([variant="filled"]) {
    color: var(--u-txt-color);
    background-color: var(--u-neutral-100, #f5f5f5);
    border-color: transparent;
  }
  :host([variant="filled"]:hover) {
    background-color: var(--u-neutral-200, #e5e5e5);
  }
  :host([variant="filled"]:active) {
    background-color: var(--u-neutral-300, #d4d4d4);
  }

  /* outlined: 경계만 */
  :host([variant="outlined"]) {
    color: var(--u-txt-color);
    border-color: var(--u-neutral-300, #d4d4d4);
    background-color: transparent;
  }
  :host([variant="outlined"]:hover) {
    border-color: var(--u-neutral-400, #a3a3a3);
    background-color: var(--u-neutral-50, #fafafa);
  }
  :host([variant="outlined"]:active) {
    border-color: var(--u-neutral-500, #737373);
    background-color: var(--u-neutral-100, #f5f5f5);
  }

  /* ghost: transparent */
  :host([variant="ghost"]) {
    color: var(--u-txt-color);
    border-color: transparent;
    background-color: transparent;
  }
  :host([variant="ghost"]:hover) {
    background-color: var(--u-bg-color-hover);
  }
  :host([variant="ghost"]:active) {
    background-color: var(--u-bg-color-active);
  }

  /* link: blue 링크 스타일 */
  :host([variant="link"]) {
    color: var(--u-blue-500, #3b82f6);
    border-color: transparent;
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
  }
  :host([variant="link"]:hover) {
    color: var(--u-blue-600, #2563eb);
    text-decoration: underline;
  }
  :host([variant="link"]:active) {
    color: var(--u-blue-700, #1d4ed8);
  }

  /* === Inner === */
  button, a {
    all: unset;
    width: 100%;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
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
