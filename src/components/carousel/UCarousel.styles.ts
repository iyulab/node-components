import { css } from "lit";

export const styles = css`
  /* ── Host ── */
  :host {
    --slide-gap: 0px;
    --slides-per-view: 1;
  }
  :host {
    display: block;
    position: relative;
    width: 100%;
    overflow: hidden;
    box-sizing: border-box;
  }
  
  /* ── Draggable ── */
  :host([draggable]) .slides-wrapper {
    cursor: grab;
    user-select: none;
  }
  :host([draggable]) .slides-wrapper:active {
    cursor: grabbing;
  }
  :host([draggable]) ::slotted(*) {
    -webkit-user-drag: none;
    user-select: none;
  }

  /* ── Slides ── */
  .slides-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    touch-action: pan-y;
  }

  .slides {
    display: flex;
    width: 100%;
    height: 100%;
    gap: var(--slide-gap, 0px);
    transition: transform 0.3s ease-in-out;
  }

  ::slotted(*) {
    flex: 0 0 calc(
      (100% - (var(--slides-per-view) - 1) * var(--slide-gap, 0px))
      / var(--slides-per-view)
    );
    min-width: 0;
    height: 100%;
    box-sizing: border-box;
  }

  /* ── Navigation ── */
  .nav-button {
    position: absolute;
    z-index: 10;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 16px;
    background-color: var(--u-panel-bg-color, #fff);
    box-shadow: 0 2px 8px var(--u-shadow-color-normal, rgba(0, 0, 0, 0.12));
    opacity: 0.9;
  }
  .nav-button:hover {
    opacity: 1;
    background-color: var(--u-bg-color-hover, #f3f4f6);
  }

  .nav-button.prev { left: 16px; }
  .nav-button.next { right: 16px; }

  /* ── Indicator ── */
  .indicator {
    position: absolute;
    z-index: 10;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
  }

  .dot {
    width: 10px;
    height: 10px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background-color: var(--u-neutral-400, rgba(0, 0, 0, 0.3));
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .dot:hover {
    background-color: var(--u-neutral-200, rgba(0, 0, 0, 0.5));
  }
  .dot.active {
    background-color: var(--u-neutral-100, rgba(0, 0, 0, 0.8));
    width: 24px;
    border-radius: 5px;
  }
`;
