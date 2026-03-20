import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    user-select: none;
    cursor: default;
  }
  :host([selectable]) {
    cursor: pointer;
  }

  :host([selectable]:hover) u-tag {
    filter: brightness(0.95);
  }
  :host([selectable][selected]) u-tag {
    outline: 2px solid currentColor;
    outline-offset: -1px;
    font-weight: 600;
  }

  .check-icon {
    font-size: 1em;
  }

  .remove-btn {
    font-size: 0.7em;
  }
`;
