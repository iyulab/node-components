import { css } from "lit";

export const styles = css`
  :host {
    --icon-primary-color: var(--u-neutral-700);
    --min-content-rows: 1;
    --max-content-rows: 3;
  }

  :host {
    display: block;
    min-width: 300px;
    max-width: 500px;

    border-radius: 8px;
    box-shadow: 0 4px 12px var(--u-shadow-color-normal);
    
    opacity: 0;
    transform: scale(0.8);
    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);    
  }
  :host([open]) {
    opacity: 1;
    transform: scale(1);
  }
  :host([type="error"]) {
    --icon-primary-color: var(--u-red-700);
    border-color: var(--u-red-300);
    background-color: var(--u-red-200);
  }
  :host([type="warning"]) {
    --icon-primary-color: var(--u-yellow-700);
    border-color: var(--u-yellow-300);
    background-color: var(--u-yellow-200);
  }
  :host([type="info"]) {
    --icon-primary-color: var(--u-blue-700);
    border-color: var(--u-blue-300);
    background-color: var(--u-blue-200);
  }
  :host([type="success"]) {
    --icon-primary-color: var(--u-green-700);
    border-color: var(--u-green-300);
    background-color: var(--u-green-200);
  }
  :host([type="notice"]) {
    --icon-primary-color: var(--u-neutral-700);
    border-color: var(--u-neutral-300);
    background-color: var(--u-neutral-200);
  }

  .container {
    display: flex;
    flex-direction: column;
    padding: 8px 12px;
    overflow: hidden;
  }

  .header {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
    font-size: 16px;
    user-select: none;
  }
  .header .icon {
    flex-shrink: 0;
    color: var(--icon-primary-color);
  }
  .header .title {
    flex-grow: 1;
    font-weight: 600;
    line-height: 2;
  }
  .header .close-btn {
    flex-shrink: 0;
    color: var(--u-icon-color);
    cursor: pointer;
  }
  .header .close-btn:hover {
    color: var(--u-icon-color-hover);
  }
  .header .close-btn:active {
    color: var(--u-icon-color-active);
    transform: scale(0.9);
  }

  .content {
    font-size: 14px;
    font-weight: 300;
    line-height: 1.5;
    min-height: calc(1.6em * var(--min-content-rows));
    max-height: calc(1.6em * var(--max-content-rows));
    overflow-y: auto;
  }

  .footer {
    display: inline-block;
  }
`;