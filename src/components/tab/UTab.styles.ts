import { css } from "lit";

export const styles = css`
  :host {
    flex-shrink: 0;
    position: relative;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    padding: 0.5em 0.75em;
    font-size: 0.9em;
    font-weight: 500;
    color: var(--u-txt-color-weak);
    white-space: nowrap;
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

  ::slotted([slot="prefix"]) {
    margin-right: 0.2em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.2em;
  }

  .remove-btn {
    flex-shrink: 0;
    margin-left: 0.2em;
    font-size: 0.75em;
    color: inherit;
    opacity: 0.5;
    transition: opacity 0.15s ease;
  }
  .remove-btn:hover {
    opacity: 1;
  }
`;
