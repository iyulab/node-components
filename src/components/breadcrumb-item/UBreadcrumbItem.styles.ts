import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    font-size: inherit;
    color: var(--u-txt-color-weak);
    line-height: 1.5em;
    cursor: pointer;
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
  a:hover {
    color: var(--u-blue-700);
  }
`;
