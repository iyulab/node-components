import { css } from "lit";

export const styles = css`
  :host {
    --divider-size: 2px;
    --handler-size: 4px;
    --handler-color: var(--u-blue-500, #3b82f6);
  }

  :host {
    position: relative;
    background-color: var(--u-neutral-200, #e5e7eb);
  }
  :host([orientation="horizontal"]) {
    width: var(--divider-size, 2px);
    min-height: 0px;
  }
  :host([orientation="vertical"]) {
    min-width: 0px;
    height: var(--divider-size, 2px);
  }

  .handler {
    position: absolute;
    z-index: 100;
    display: block;
    background-color: var(--handler-color, #3b82f6);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .handler[orientation="horizontal"] {
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: var(--handler-size, 4px);
    height: 100%;
    cursor: col-resize;
  }
  .handler[orientation="vertical"] {
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: var(--handler-size, 4px);
    cursor: row-resize;
  }
  .handler[moving],
  .handler:hover {
    opacity: 1;
  }
`;