import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    gap: 0.2em;
    flex-shrink: 0;
    color: var(--u-txt-color-weak);
    font-size: inherit;
    line-height: 1.5em;
    cursor: pointer;
  }
  :host:hover {
    color: var(--u-blue-700);
  }
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
    cursor: default;
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.2em;
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease;
    cursor: inherit;
  }

  ::slotted([slot="prefix"]) {
    margin-right: 0.2em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.2em;
  }
`;
