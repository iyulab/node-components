import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-flex;
    
    font-size: 16px;
    color: var(--u-icon-color);
    padding: 0.5em;
    background-color: var(--u-bg-color);
    border: 1px solid var(--u-border-color);
    border-radius: 6px;

    transition: all 0.2s ease;
    user-select: none;
    cursor: pointer;
  }
  :host([borderless]) {
    border: none;
    background-color: transparent;
  }
  :host([borderless]:hover) {
    border: none;
    background-color: transparent;
  }
  :host([borderless]:active) {
    border: none;
    background-color: transparent;
  }
  :host([loading]),
  :host([disabled]) {
    pointer-events: none;
  }
  :host([disabled]) {
    opacity: 0.6;
    color: var(--u-icon-color-disabled);
  }
  :host(:hover) {
    color: var(--u-icon-color-hover);
    background-color: var(--u-bg-color-hover);
    border-color: var(--u-border-color-strong);
  }
  :host(:active) {
    color: var(--u-icon-color-active);
    background-color: var(--u-bg-color-active);
    transform: translateY(1px);
  }

  button {
    all: unset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  button:focus-visible {
    outline: 2px solid var(--u-blue-500, #3b82f6);
    outline-offset: 2px;
    border-radius: inherit;
  }

  u-icon,
  u-spinner {
    font-size: inherit;
    color: inherit;
  }
`;