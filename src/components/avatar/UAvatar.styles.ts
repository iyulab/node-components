import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5em;
    height: 2.5em;
    font-family: var(--u-font-base);
    font-weight: 600;
    color: var(--u-neutral-0);
    border-radius: 50%;
    background-color: var(--u-neutral-500);
    vertical-align: middle;
    overflow: hidden;
    user-select: none;
  }

  /* shape */
  :host([shape="square"]) {
    border-radius: 0;
  }
  :host([shape="rounded"]) {
    border-radius: 0.375em;
  }

  /* outline */
  :host([outline]) {
    box-shadow: 0 0 0 0.125em var(--u-border-color);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .label {
    font-size: 1em;
    line-height: 1;
    text-transform: uppercase;
  }

  ::slotted(*) {
    font-size: 1.2em;
  }
`;
