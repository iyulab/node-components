import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: block;
    flex-shrink: 0;
    background-color: var(--u-neutral-200, #e5e7eb);
    transition: background-color 0.2s ease;

    --splitter-size: 2px;
    --handler-size: 6px;
    --handler-color: var(--u-blue-500, #3b82f6);
  }
  :host([orientation="horizontal"]) {
    width: var(--splitter-size, 2px);
    height: 100%;
    cursor: col-resize;
  }
  :host([orientation="vertical"]) {
    width: 100%;
    height: var(--splitter-size, 2px);
    cursor: row-resize;
  }

  .handler {
    position: absolute;
    z-index: 100;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: block;
    width: 300%;
    height: 300%;
    background-color: var(--handler-color, #3b82f6);
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .handler[dragging],
  .handler:hover {
    opacity: 1;
  }
`;