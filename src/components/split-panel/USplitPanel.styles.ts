import { css } from "lit";

export const styles = css`
  :host {
    --splitter-size: 4px;
    --splitter-color: var(--u-neutral-200, #e5e7eb);
    --splitter-active-color: var(--u-blue-500, #3b82f6);
  }

  :host {
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

  /* Splitter */
  .splitter {
    flex-shrink: 0;
    background-color: var(--splitter-color);
    transition: background-color 0.15s ease;
  }
  .splitter[orientation="horizontal"] {
    width: var(--splitter-size);
    cursor: col-resize;
  }
  .splitter[orientation="vertical"] {
    height: var(--splitter-size);
    cursor: row-resize;
  }
  .splitter:hover,
  .splitter.active {
    background-color: var(--splitter-active-color);
  }

  /* Slotted panels */
  ::slotted(*) {
    overflow: auto;
  }
`;