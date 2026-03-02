import { css } from "lit";

export const styles = css`
  :host {
    --slide-gap: 0px;
    --slides-per-view: 1;
  }
  :host {
    position: relative;
    display: block;
    width: 100%;
    overflow: hidden;
  }
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
    flex-direction: row;
    width: 100%;
    height: 100%;
    gap: var(--slide-gap, 0px);
    transition: transform 0.3s ease-in-out;
  }

  ::slotted(*) {
    flex: 0 0 calc(
      (100% - (var(--slides-per-view) - 1) * var(--slide-gap, 0px)) / var(--slides-per-view)
    );
    min-width: 0;
    height: 100%;
  }

  /* ── Navigation ── */
  .nav-button {
    position: absolute;
    z-index: 10;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: var(--u-neutral-900);
    border: none;
    background-color: transparent;
  }
  .nav-button:hover {
    opacity: 0.5;
    transform: scale(1.2) translateY(-40%);
  }
  .nav-button:active {
    opacity: 0.8;
    transform: scale(1.1) translateY(-45%);
  }

  .nav-button.prev { left: 16px; }
  .nav-button.next { right: 16px; }

  /* ── Pagination ── */
  .indicator {
    position: absolute;
    z-index: 10;
    bottom: 16px;
    left: 50%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transform: translateX(-50%);
  }

  .dot {
    width: 10px;
    height: 10px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background-color: var(--u-neutral-400);
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .dot:hover {
    background-color: var(--u-neutral-200);
  }
  .dot[active] {
    width: 24px;
    border-radius: 5px;
    background-color: var(--u-neutral-100);
  }
`;
