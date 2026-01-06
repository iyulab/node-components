import { css } from "lit";

export const styles = css`
  :host {
    --indent-level: 0;
    --indent-size: 20px;
  }

  :host {
    display: block;
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
    padding-left: calc(var(--indent-level, 0) * var(--indent-size));
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
    transition: transform 0.2s ease, color 0.2s ease;
    cursor: pointer;
  }
  
  slot[name="prefix"],
  slot[name="suffix"] {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  
  .label {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .children {
    display: block;
  }
`;