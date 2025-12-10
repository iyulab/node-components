import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-flex;
    
    font-size: 16px;
    padding: 0.5em;
    color: var(--u-icon-color);
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    background-color: var(--u-bg-color);

    transition: all 0.2s ease;
    user-select: none;
    cursor: pointer;
  }
  :host(:hover) {
    color: var(--u-icon-color-hover);
    background-color: var(--u-bg-color-hover);
  }
  :host(:active) {
    color: var(--u-icon-color-active);
    background-color: var(--u-bg-color-active);
    transform: translateY(1px);
  }
  :host([borderless]) {
    border: none;
    background-color: transparent;
  }
  :host([loading]),
  :host([disabled]) {
    color: var(--u-icon-color-disabled);
    pointer-events: none;
  }

  button {
    all: unset;
    display: inline-flex;
  }
  button:focus-visible {
    outline: 2px solid var(--u-blue-500, #3b82f6);
    outline-offset: 2px;
  }

  u-spinner,
  u-icon {
    color: inherit;
    font-size: inherit;
  }
`;