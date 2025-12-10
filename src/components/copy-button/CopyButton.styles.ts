import { css } from "lit";

export const styles = css`
  :host {
    display: inline-block;
    font-size: 16px;
  }

  u-icon-button {
    font-size: inherit;
  }
  u-icon-button[copied] {
    color: var(--u-green-600, #16a34a);
  }
`;