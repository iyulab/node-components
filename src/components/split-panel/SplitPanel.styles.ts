import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;

    --divider-size: 2px;
    --divider-color: var(--u-neutral-200, #d1d5db);
    --divider-handle-size: 4px;
    --divider-handle-color: var(--u-blue-500, #3b82f6);
  }
  :host([orientation="horizontal"]) {
    display: flex;
    flex-direction: row;
  }
  :host([orientation="vertical"]) {
    display: flex;
    flex-direction: column;
  }

  ::slotted(u-divider) {
    background-color: var(--divider-color, var(--u-neutral-200, #d1d5db));

    --divider-size: var(--divider-size, 2px);
    --handler-size: var(--divider-handle-size, 4px);
    --handler-color: var(--divider-handle-color, var(--u-blue-500, #3b82f6));
  }
`;