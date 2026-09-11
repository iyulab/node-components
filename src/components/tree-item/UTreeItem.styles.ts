import { css } from "lit";

export const styles = css`
  :host {
    --tree-item-depth: 0;
    --tree-item-color: var(--u-primary-color, #1976D2);
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
    transition: background-color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    user-select: none;
    cursor: pointer;
  }
  :host(:not([disabled])[trigger="item"]) .header:hover,
  :host(:not([disabled])[trigger="item"]:focus-visible) .header {
    background-color: var(--u-bg-color-hover, #F5F5F5);
  }
  .header[selected] {
    color: color-mix(in srgb, var(--tree-item-color) 85%, black);
    font-weight: 600;
    background-color: color-mix(in srgb, var(--tree-item-color) 15%, var(--u-bg-color, #FFFFFF));
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

  /* ── toggler ──
     The box that takes the pointer is 24x24 (WCAG 2.2 SC 2.5.8); the square you see is still
     18x18, drawn by the pseudo-element. The negative margins give the extra 3px on each side
     back, so the glyph, the label and the row height sit exactly where they did — the extra
     area lands on the header's own padding and the gap before the label, never on another
     target. */
  .prefix-toggler {
    position: relative;
    flex-shrink: 0;
    margin: -3px 1px -3px -3px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }
  .prefix-toggler::before {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: var(--u-radius-sm, 3px);
    transition: background-color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .prefix-toggler > * {
    position: relative;
  }
  .prefix-toggler u-icon {
    font-size: 12px;
    pointer-events: none;
  }
  :host(:not([disabled])[trigger="icon"]) .prefix-toggler:hover::before,
  :host(:not([disabled])[trigger="icon"]:focus-visible) .prefix-toggler::before {
    background-color: var(--u-bg-color-hover, #F5F5F5);
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
    border-radius: var(--u-radius-sm, 3px);
    border: 1.5px solid var(--u-input-border-color, #E0E0E0);
    background-color: transparent;
    transition: background-color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), border-color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    cursor: pointer;
  }
  .prefix-checkbox u-icon {
    visibility: hidden;
    font-size: 12px;
    color: #fff;
    pointer-events: none;
  }
  .prefix-checkbox[checked],
  .prefix-checkbox[indeterminate] {
    border-color: var(--tree-item-color);
    background-color: var(--tree-item-color);
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
