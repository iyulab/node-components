import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-flex;
    
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    padding: 0.5em;
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    background-color: var(--u-bg-color);

    transition: all 0.2s ease;
    overflow: hidden;
    user-select: none;
    cursor: pointer;
  }

  /* Style variants */
  :host([variant="default"]) {
    color: var(--u-txt-color);
    border-color: var(--u-border-color);
    background-color: var(--u-bg-color);
  }
  :host([variant="default"]:hover) {
    background-color: var(--u-bg-color-hover);
  }
  :host([variant="default"]:active) {
    background-color: var(--u-bg-color-active);
  }

  :host([variant="borderless"]) {
    color: var(--u-txt-color);
    border-color: transparent;
    background-color: transparent;
  }
  :host([variant="borderless"]:hover) {
    background-color: var(--u-bg-color-hover);
  }
  :host([variant="borderless"]:active) {
    background-color: var(--u-bg-color-active);
  }

  :host([variant="link"]) {
    color: var(--u-txt-color);
    border-color: transparent;
    background-color: transparent;
  }
  :host([variant="link"]:hover) {
    color: var(--u-blue-500, #3b82f6);
  }
  :host([variant="link"]:active) {
    color: var(--u-blue-600, #2563eb);
  }

  :host(:active) {
    transform: translateY(1px);
  }

  :host([disabled]) {
    color: var(--u-txt-color-disabled);
    cursor: not-allowed;
  }
  :host([loading]) {
    cursor: wait;
  }
  :host([loading]) button {
    visibility: hidden;
  }

  button {
    all: unset;
    width: 100%;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  button:focus-visible {
    outline: 2px solid var(--u-blue-500, #3b82f6);
    outline-offset: 2px;
  }

  slot {
    flex: 1 0 auto;
    min-width: 0;
    display: inline-flex;
    justify-content: center;
  }
  ::slotted(*) {
    color: inherit;
    font-size: inherit;
  }
  /* 슬롯에 내용이 있을 때 gap 적용 */
  ::slotted([slot="prefix"]) {
    margin-right: 0.5em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.5em;
  }

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