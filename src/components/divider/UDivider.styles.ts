import { css } from "lit";

export const styles = css`
  :host {
    --divider-size: 1px;
    --divider-color: var(--u-neutral-200, #e5e7eb);
    --divider-spacing: 8px;
  }

  :host {
    display: block;
    background-color: var(--divider-color);
    height: var(--divider-size);
    margin: var(--divider-spacing) 0;
  }
  :host([vertical]) {
    width: var(--divider-size);
    height: auto;
    margin: 0 var(--divider-spacing);
  }
`;