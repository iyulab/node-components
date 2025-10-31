import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    font-size: inherit;
    color: var(--u-icon-color, currentColor);
  }

  svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }
`;