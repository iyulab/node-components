import { css } from "lit";

export const styles = css`
  :host {
    --splitter-size: 4px;
    --splitter-hit-size: 24px;
    --splitter-color: var(--u-neutral-200, #EEEEEE);
    --splitter-color-hover: var(--u-primary-color-weaker, #64B5F6);
    --splitter-color-active: var(--u-primary-color-strong, #1565C0);

    /* The handle's box: the larger of the visible line and the pointer area. It takes real
       layout space, so it never overlaps a panel — each panel is a scroll container and its
       scrollbar sits right against the handle. */
    --_splitter-box: max(var(--splitter-size), var(--splitter-hit-size));
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

  :host([disabled]) .splitter {
    pointer-events: none;
    opacity: 0.4;
  }

  /* Splitter — the box receives the pointer; the line inside it is what you see */
  .splitter {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: none;
  }
  .splitter::before {
    content: "";
    position: absolute;
    z-index: -1;
    background-color: var(--splitter-color);
    transition: background-color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    pointer-events: none;
  }
  .splitter:hover::before {
    background-color: var(--splitter-color-hover);
  }
  .splitter:active::before,
  .splitter:focus-visible::before {
    background-color: var(--splitter-color-active);
  }
  /* The handle spans the host's full cross axis and the host clips overflow, so the base
     focus ring (drawn 2px outside) would lose two of its sides. Draw it inside the box. */
  .splitter:focus-visible {
    outline-offset: -2px;
  }
  :host([orientation="horizontal"]) .splitter {
    width: var(--_splitter-box);
    cursor: col-resize;
  }
  :host([orientation="horizontal"]) .splitter::before {
    inset-block: 0;
    left: calc(50% - var(--splitter-size) / 2);
    width: var(--splitter-size);
  }
  :host([orientation="vertical"]) .splitter {
    height: var(--_splitter-box);
    cursor: row-resize;
  }
  :host([orientation="vertical"]) .splitter::before {
    inset-inline: 0;
    top: calc(50% - var(--splitter-size) / 2);
    height: var(--splitter-size);
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
  /* The ghost is placed at the box's leading edge; the margin centres it on the line. */
  :host([orientation="horizontal"]) .splitter-ghost {
    top: 0;
    width: var(--splitter-size);
    height: 100%;
    margin-left: calc((var(--_splitter-box) - var(--splitter-size)) / 2);
  }
  :host([orientation="vertical"]) .splitter-ghost {
    left: 0;
    width: 100%;
    height: var(--splitter-size);
    margin-top: calc((var(--_splitter-box) - var(--splitter-size)) / 2);
  }
`;
