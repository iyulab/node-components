import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    --tree-indent: 20px;
  }

  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  :host([disabled]) .header {
    cursor: not-allowed;
    pointer-events: none;
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    line-height: 1.5;
    border-radius: 4px;
    background-color: transparent;
    transition: background-color 0.2s ease;
    user-select: none;
    cursor: pointer;
  }

  :host(:not([disabled])) .header:hover {
    background-color: var(--u-bg-color-hover, #f5f5f5);
  }

  :host([selected]) .header {
    color: var(--u-blue-600, #0066cc);
    background-color: var(--u-blue-0, #e8f4f8);
  }

  .expand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 10px;
    color: var(--u-icon-color, #757575);
    transition: transform 0.2s ease, color 0.2s ease;
    cursor: pointer;
  }

  .expand-icon:hover {
    color: var(--u-icon-color-hover, #0066cc);
  }

  .expand-icon.placeholder {
    cursor: default;
    opacity: 0;
    pointer-events: none;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 14px;
    color: var(--u-icon-color, #757575);
  }

  .label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    color: var(--u-text-color, #212121);
  }

  :host([selected]) .label {
    color: var(--u-blue-700, #1976d2);
  }

  .children {
    display: block;
  }

  .children[hidden] {
    display: none;
  }
`;
