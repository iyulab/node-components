import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-flex;
    padding: 8px;
    font-size: 16px;
    border: 1px solid var(--u-border-color-mid);
    border-radius: 8px;
    background-color: var(--u-background-color-0);
    cursor: pointer;
  }
  :host(:hover) {
    background-color: var(--u-background-color-100);
  }
  :host(:active) {
    background-color: var(--u-background-color-200);
  }
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }
  :host([loading]) {
    pointer-events: none;
    cursor: wait;
  }

  .overlay {
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    display: none;
    align-items: center;
    justify-content: center;

    padding: inherit;
    font-size: inherit;
    border-radius: inherit;
    background-color: inherit;
  }
  .overlay[visible] {
    display: flex;
  }
  .overlay > * {
    font-size: inherit;
  }
`;