import { css } from "lit";

export const styles = css`
  :host {
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

  /* ── header ── */
  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px 8px;
    padding-left: calc(
      var(--tree-indent-size) * var(--tree-item-depth)
      + var(--tree-indent-guide-offset)
    );
    transition: background-color 0.15s ease, color 0.15s ease;
    user-select: none;
    cursor: pointer;
  }
  :host(:not([disabled])[trigger="item"]) .header:hover,
  :host(:not([disabled])[trigger="item"]:focus-visible) .header {
    background-color: var(--u-bg-color-hover);
  }
  .header[selected] {
    color: var(--u-blue-700);
    font-weight: 600;
    background-color: var(--u-blue-100);
  }

  ::slotted([slot="prefix"]) {
    margin-right: 0.2em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.2em;
  }

  /* ── content ── */
  .content {
    flex: 1;
    min-width: 0;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* ── toggler ── */
  .prefix-toggler {
    flex-shrink: 0;
    margin-right: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 3px;
  }
  .prefix-toggler u-icon {
    font-size: 12px;
  }
  :host(:not([disabled])[trigger="icon"]) .prefix-toggler:hover,
  :host(:not([disabled])[trigger="icon"]:focus-visible) .prefix-toggler {
    background-color: var(--u-bg-color-hover);
  }

  /* ── checkbox ── */
  .prefix-checkbox {
    flex-shrink: 0;
    margin-right: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    border: 1.5px solid var(--u-input-border-color);
    background-color: transparent;
    transition: background-color 0.15s ease, border-color 0.15s ease;
    cursor: pointer;
  }
  .prefix-checkbox u-icon {
    visibility: hidden;
    font-size: 12px;
    color: #fff;
  }
  .prefix-checkbox[checked],
  .prefix-checkbox[indeterminate] {
    border-color: var(--u-blue-600);
    background-color: var(--u-blue-600);
  }
  .prefix-checkbox[checked] u-icon,
  .prefix-checkbox[indeterminate] u-icon {
    visibility: visible;
  }

  /* ── children ── */
  .subtree {
    display: block;
    position: relative;
  }

  .subtree::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: calc(
      var(--tree-indent-size) * (var(--tree-item-depth) + 1)
    );
    border-left: var(--tree-indent-guide-width)
                 var(--tree-indent-guide-style)
                 var(--tree-indent-guide-color);
    pointer-events: none;
  }
`;
