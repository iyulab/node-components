import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
  }

  :host([disabled]) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .menu-item-content {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    user-select: none;
    font-family: var(--u-font-modern, inherit);
    font-size: 14px;
    line-height: 1.5;
    color: var(--u-menu-item-text-color, #333);
    background-color: transparent;
    border-radius: 4px;
    transition: background-color 0.2s ease;
  }

  :host(:not([disabled])) .menu-item-content:hover {
    background-color: var(--u-menu-item-hover-bg-color, #f0f0f0);
  }

  :host([selected]) .menu-item-content {
    background-color: var(--u-menu-item-selected-bg-color, #e8f4f8);
    color: var(--u-menu-item-selected-text-color, #0066cc);
  }

  :host([disabled]) .menu-item-content {
    cursor: not-allowed;
    pointer-events: none;
  }

  .menu-item-prefix {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
  }

  .menu-item-check {
    opacity: 0;
    font-size: 12px;
    font-weight: bold;
    color: var(--u-menu-item-check-color, #0066cc);
    transition: opacity 0.2s ease;
  }

  .menu-item-check.checked {
    opacity: 1;
  }

  .menu-item-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
