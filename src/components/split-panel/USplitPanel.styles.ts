import { css } from "lit";

export const styles = css`
  :host {
    --splitter-size: 4px;
    --splitter-color: var(--u-neutral-200);
    --splitter-color-hover: var(--u-blue-300);
    --splitter-color-active: var(--u-blue-500);

    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  :host([orientation="horizontal"]) {
    flex-direction: row;
  }
  :host([orientation="vertical"]) {
    flex-direction: column;
  }

  :host([disabled]) .splitter {
    pointer-events: none;
    opacity: 0.4;
  }

  /* Splitter */
  .splitter {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--splitter-color);
    transition: background-color 0.15s ease;
    touch-action: none;
  }
  .splitter:hover {
    background-color: var(--splitter-color-hover);
  }
  .splitter:active {
    background-color: var(--splitter-color-active);
  }
  :host([orientation="horizontal"]) .splitter {
    width: var(--splitter-size);
    cursor: col-resize;
  }
  :host([orientation="vertical"]) .splitter {
    height: var(--splitter-size);
    cursor: row-resize;
  }

  /* Ghost Splitter (lazy) */
  .splitter-ghost {
    display: none;
    position: absolute;
    z-index: 10;
    background-color: var(--splitter-color-active);
    opacity: 0.5;
    pointer-events: none;
  }
  .splitter-ghost[active] {
    display: block;
  }
  :host([orientation="horizontal"]) .splitter-ghost {
    top: 0;
    width: var(--splitter-size);
    height: 100%;
  }
  :host([orientation="vertical"]) .splitter-ghost {
    left: 0;
    width: 100%;
    height: var(--splitter-size);
  }
`;
