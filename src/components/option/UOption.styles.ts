import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    align-items: center;
    padding: 0.4em 0.8em;
    cursor: pointer;
    user-select: none;
    font-size: 0.9em;
    line-height: 1.5;
    transition: background-color 0.1s ease;
    white-space: nowrap;
  }
  :host(:hover) {
    background-color: var(--u-neutral-100);
  }
  :host([selected]) {
    background-color: var(--u-blue-50);
    color: var(--u-blue-700);
    font-weight: 500;
  }
  :host([disabled]) {
    opacity: 0.5;
    cursor: not-allowed;
  }
  :host([disabled]:hover) {
    background-color: transparent;
  }
  :host([aria-current="true"]) {
    background-color: var(--u-neutral-100);
  }
`;
