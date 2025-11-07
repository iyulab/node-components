import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-flex;
    
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    padding: 0.5em 1em;
    background-color: var(--u-bg-color);
    border: 1px solid var(--u-border-color);
    border-radius: 6px;

    transition: all 0.2s ease;
    user-select: none;
    cursor: pointer;
  }
  :host([loading]),
  :host([disabled]) {
    pointer-events: none;
  }
  :host([disabled]) {
    color: var(--u-text-color-disabled);
  }
  :host(:hover) {
    color: var(--u-text-color-hover);
    background-color: var(--u-bg-color-hover);
    border-color: var(--u-border-color-strong);
  }
  :host(:active) {
    color: var(--u-text-color-active);
    background-color: var(--u-bg-color-active);
    transform: translateY(1px);
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
    flex: 1 1 auto;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  slot[name="prefix"],
  slot[name="suffix"] {
    flex: 0 0 auto;
  }
  /* 슬롯에 내용이 있을 때만 gap 적용 */
  slot[name="prefix"]:not(:empty) {
    margin-right: 0.5em;
  }
  slot[name="suffix"]:not(:empty) {
    margin-left: 0.5em;
  }

  .overlay {
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
  }
`;