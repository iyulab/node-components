import { css } from "lit";

export const styles = css`
  :host {
    display: inline-block;
  }
  :host([borderless]) u-button {
    border: none;
    box-shadow: none;
  }
  :host([copied]) u-icon {
    color: var(--u-green-600, #16a34a);
  }
`;