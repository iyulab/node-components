import { css } from "lit";

export const styles = css`
  :host {
    display: block;

    --selected-color: var(--u-blue-600, #0066cc);
    --selected-bg-color: var(--u-blue-50, #e8f4f8);
  }
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }
  :host([disabled]) .container {
    cursor: not-allowed;
    pointer-events: none;
  }
  :host(:not([disabled])) .container:hover {
    background-color: var(--u-bg-color-hover, #f5f5f5);
  }
  :host([selected]) .container {
    color: var(--selected-color, #0066cc);
    background-color: var(--selected-bg-color, #e8f4f8);
  }

  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    line-height: 1.5;
    border-radius: 4px;
    background-color: transparent;
    transition: background-color 0.2s ease;
    user-select: none;
    cursor: pointer;
  }

  .checker {
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    width: 1em;
    font-size: 0.75em;
    font-weight: bold;
    color: var(--u-blue-600, #0066cc);
    transition: opacity 0.2s ease;
  }
  .checker[checked] {
    opacity: 1;
  }

  .content {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;