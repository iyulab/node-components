import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    font-size: 18px;
  }

  u-icon-button {
    font-size: inherit;
  }
  u-icon-button::part(button) {
    padding: 0.2em;
  }

  :host([copied]) u-icon-button {
    color: var(--u-green-500);
  }
`;
