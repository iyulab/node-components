import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    padding: 0.25em 0.5em;
    border-radius: 4px;
    font-weight: 500;
    line-height: 1.5em;
    white-space: nowrap;
    user-select: none;
    opacity: 1;
    transform: scale(1);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  /* Style variants */
  :host([variant="default"]) {
    color: var(--u-neutral-800);
    border: 1px solid var(--u-neutral-300);
    background-color: var(--u-neutral-100);
  }
  :host([variant="info"]) {
    color: var(--u-blue-800);
    border: 1px solid var(--u-blue-300);
    background-color: var(--u-blue-100);
  }
  :host([variant="success"]) {
    color: var(--u-green-800);
    border: 1px solid var(--u-green-300);
    background-color: var(--u-green-100);
  }
  :host([variant="warning"]) {
    color: var(--u-yellow-800);
    border: 1px solid var(--u-yellow-300);
    background-color: var(--u-yellow-100);
  }
  :host([variant="danger"]) {
    color: var(--u-red-800);
    border: 1px solid var(--u-red-300);
    background-color: var(--u-red-100);
  }
  /* Rounded variant */
  :host([rounded]) {
    border-radius: 999px;
  }

  /* Slot styles */
  ::slotted([slot="prefix"]) {
    margin-right: 0.2em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.2em;
  }

  /* Remove button */
  .remove-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5em;
    width: 1em;
    height: 1em;
    line-height: 1.2em;
    padding: 0;
    border: none;
    border-radius: 50%;
    color: currentColor;
    background-color: transparent;
    transition: background-color 0.2s ease;
    cursor: pointer;
  }
  .remove-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
  .remove-btn:active {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;
