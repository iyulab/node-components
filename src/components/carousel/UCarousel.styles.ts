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
    user-select: none;
    cursor: grab;
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
    transition: transform var(--u-duration-slow, 320ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
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
    padding: var(--u-space-sm, 8px);
    font-size: 20px;
    color: var(--u-neutral-900, #212121);
    background-color: var(--u-neutral-100, #F5F5F5);
    box-shadow: var(--u-shadow-md, 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05));
  }
  .nav-button:hover {
    background-color: var(--u-neutral-200, #EEEEEE);
    box-shadow: var(--u-shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.06));
    transform: translateY(-50%) scale(1.1);
  }
  .nav-button:active {
    background-color: var(--u-neutral-300, #E0E0E0);
    transform: translateY(-50%) scale(0.95);
  }

  .nav-button.prev { left: 12px; }
  .nav-button.next { right: 12px; }

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
    gap: var(--u-space-sm, 8px);
    transform: translateX(-50%);
  }

  .dot {
    width: 10px;
    height: 10px;
    padding: 0;
    border: none;
    border-radius: var(--u-radius-circle, 50%);
    background-color: var(--u-neutral-400, #BDBDBD);
    cursor: pointer;
    transition: all var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .dot:hover {
    background-color: var(--u-neutral-200, #EEEEEE);
  }
  .dot[active] {
    width: 24px;
    border-radius: 5px;
    background-color: var(--u-neutral-100, #F5F5F5);
  }
`;
