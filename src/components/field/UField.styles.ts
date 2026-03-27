import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    color: var(--u-txt-color);
    font-size: inherit;
    font-family: var(--u-font-base);
  }
  :host([disabled]) {
    opacity: 0.6;
    cursor: not-allowed;
  }
  :host([invalid]) .footer {
    color: var(--u-red-600);
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8em;
    margin-bottom: 0.5em;
    user-select: none;
  }

  .label {
    font-weight: 500;
    line-height: 1.25;
    cursor: pointer;
  }

  .required {
    color: var(--u-red-600);
    margin-right: 0.2em;
  }
  
  .footer {
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    line-height: 1.2;
    margin-top: 0.5em;
  }
`;
