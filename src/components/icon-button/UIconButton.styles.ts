import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    color: var(--u-icon-color);
    font-size: 20px;
  }

  :host([variant="solid"]) {
    color: #fff;
  }
  :host([variant="link"]) {
    color: var(--u-blue-500);
  }

  u-button {
    color: inherit;
    font-size: inherit;
    padding: 0.4em;
  }
`;
