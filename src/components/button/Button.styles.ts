import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-flex;
    
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    padding: 0.5em 1em;
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    background-color: var(--u-bg-color);

    transition: all 0.2s ease;
    overflow: hidden;
    user-select: none;
    cursor: pointer;
  }
  :host(:hover) {
    color: var(--u-txt-color-hover);
    background-color: var(--u-bg-color-hover);
  }
  :host(:active) {
    color: var(--u-txt-color-active);
    background-color: var(--u-bg-color-active);
    transform: translateY(1px);
  }
  :host([loading]),
  :host([disabled]) {
    color: var(--u-txt-color-disabled);
    pointer-events: none;
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
  /* 슬롯에 내용이 있을 때 gap 적용 */
  ::slotted([slot="prefix"]) {
    margin-right: 0.5em;
  }
  ::slotted([slot="suffix"]) {
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