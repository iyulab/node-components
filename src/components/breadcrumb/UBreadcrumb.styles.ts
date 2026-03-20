import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    font-size: inherit;
    font-family: var(--u-font-base);
    color: var(--u-txt-color);
    user-select: none;
  }

  nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.15em;
    overflow: hidden;
  }

  ::slotted([data-last]) {
    font-weight: 500;
    pointer-events: none;
    cursor: default;
  }

  .separator {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    user-select: none;
  }
`;
