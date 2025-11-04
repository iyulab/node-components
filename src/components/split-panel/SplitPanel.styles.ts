import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;

    --divider-size: 2px;
    --divider-color: var(--u-neutral-200, #e0e0e0);
    --divider-active-size: 6px;
    --divider-active-color: var(--u-blue-500, #3b82f6);
  }
  :host([orientation="horizontal"]) {
    flex-direction: row;
  }
  :host([orientation="vertical"]) {
    flex-direction: column;
  }

  .divider {
    width: var(--divider-size);
    height: var(--divider-size);
  }
`;