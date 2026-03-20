import { css } from "lit";

export const styles = css`
  :host {
    --tree-item-height: 30px;
    --tree-item-padding-y: 4px;
    --tree-item-padding-x: 6px;
    --tree-item-gap: 4px;
    --tree-item-radius: 4px;
    --tree-item-depth: 0;
  }

  :host {
    display: block;
  }

  :host(:focus-visible) {
    outline: none;
  }

  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }

  :host([dragging]) {
    opacity: 0.4;
  }
  :host([drag-over="before"]) .header {
    box-shadow: 0 -2px 0 0 var(--u-blue-500);
  }
  :host([drag-over="inside"]) .header {
    background-color: var(--u-blue-100);
    outline: 2px solid var(--u-blue-400);
    outline-offset: -2px;
    border-radius: var(--tree-item-radius);
  }
  :host([drag-over="after"]) .header {
    box-shadow: 0 2px 0 0 var(--u-blue-500);
  }

  /* ── header ── */
  .header {
    display: flex;
    align-items: center;
    gap: var(--tree-item-gap);
    min-height: var(--tree-item-height);
    padding: var(--tree-item-padding-y) var(--tree-item-padding-x);
    padding-left: calc(
      var(--tree-indent-size) * var(--tree-item-depth)
      + var(--tree-item-padding-x)
    );
    background-color: transparent;
    transition: background-color 0.15s ease, color 0.15s ease;
    user-select: none;
    cursor: pointer;
    line-height: 1.4;
    white-space: nowrap;
  }

  :host(:not([disabled])) .header:hover,
  :host(:not([disabled]):focus-visible) .header {
    background-color: var(--u-bg-color-hover);
  }

  /* selected */
  .header[selected] {
    color: var(--u-blue-700);
    background-color: var(--u-blue-100);
    font-weight: 600;
  }
  .header[selected]:hover,
  :host(:focus-visible) .header[selected] {
    background-color: var(--u-blue-100);
  }

  /* ── toggle icon ── */
  .toggle-icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 3px;
  }
  :host([trigger="icon"]) .toggle-icon:hover {
    background-color: var(--u-bg-color-active);
  }

  /* ── checkbox ── */
  .checkbox {
    display: inline-flex;
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    border: 1.5px solid var(--u-input-border-color);
    background-color: transparent;
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }
  .checkbox u-icon {
    width: 12px;
    height: 12px;
    visibility: hidden;
    color: #fff;
  }
  .checkbox[checked],
  .checkbox[indeterminate] {
    background-color: var(--u-blue-600);
    border-color: var(--u-blue-600);
  }
  .checkbox[checked] u-icon,
  .checkbox[indeterminate] u-icon {
    visibility: visible;
  }

  /* ── children ── */
  .children {
    display: block;
    position: relative;
  }

  .children::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(
      var(--tree-indent-size) * (var(--tree-item-depth) + 1)
      + var(--tree-indent-guide-offset)
    );
    border-left: var(--tree-indent-guide-width)
                 var(--tree-indent-guide-style)
                 var(--tree-indent-guide-color);
    pointer-events: none;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
