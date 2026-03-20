import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    padding: 0.6em 1em;
    font-size: 0.9em;
    font-weight: 500;
    color: var(--u-txt-color-weak);
    white-space: nowrap;
    transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
    user-select: none;
    cursor: pointer;
  }
  :host(:hover:not([disabled])) {
    color: var(--u-txt-color);
  }
  :host([disabled]) {
    color: var(--u-txt-color-disabled);
    cursor: not-allowed;
  }
  :host([active]) {
    color: var(--u-blue-600);
  }

  ::slotted([slot="prefix"]) {
    margin-right: 0.2em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.2em;
  }

  .close-btn {
    margin-left: 0.2em;
    font-size: 0.75em;
    color: inherit;
    opacity: 0.5;
    flex-shrink: 0;
    transition: opacity 0.15s ease;
  }
  .close-btn:hover {
    opacity: 1;
  }
`;
