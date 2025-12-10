import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    color: var(--u-icon-color, currentColor);
    font-size: inherit;
  }

  svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }
`;