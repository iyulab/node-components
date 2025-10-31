import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    min-width: 300px;
    max-width: 500px;
    
    background-color: var(--alert-bg-color);
    border: 1px solid var(--alert-border-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px var(--u-shadow-medium), 0 2px 4px var(--u-shadow-weak);
    
    opacity: 0;
    transform: scale(0.8);
    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;

    --min-content-rows: 1;
    --max-content-rows: 3;
    
    --alert-icon-color: var(--u-neutral-700);
    --alert-bg-color: var(--u-neutral-100);
    --alert-border-color: var(--u-neutral-300);
  }
  :host([open]) {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }
  
  :host([type="error"]) {
    --alert-icon-color: var(--u-red-700);
    --alert-bg-color: var(--u-red-0);
    --alert-border-color: var(--u-red-100);
  }
  :host([type="warning"]) {
    --alert-icon-color: var(--u-yellow-700);
    --alert-bg-color: var(--u-yellow-0);
    --alert-border-color: var(--u-yellow-100);
  }
  :host([type="info"]) {
    --alert-icon-color: var(--u-blue-700);
    --alert-bg-color: var(--u-blue-0);
    --alert-border-color: var(--u-blue-100);
  }
  :host([type="success"]) {
    --alert-icon-color: var(--u-green-700);
    --alert-bg-color: var(--u-green-0);
    --alert-border-color: var(--u-green-100);
  }
  :host([type="notice"]) {
    --alert-icon-color: var(--u-neutral-700);
    --alert-bg-color: var(--u-neutral-100);
    --alert-border-color: var(--u-neutral-300);
  }

  .container {
    display: flex;
    flex-direction: column;
    padding: 8px 12px 8px 12px;
    overflow: hidden;
  }

  .header {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    margin-bottom: 4px;
    user-select: none;
  }
  .header .icon {
    flex-shrink: 0;
    font-size: 20px;
    color: var(--alert-icon-color);
    filter: drop-shadow(0 1px 2px var(--u-shadow-weak));
  }
  .header .title {
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
  }
  .header .close-btn {
    flex-shrink: 0;
    font-size: 18px;
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
    font-weight: 400;
    color: var(--u-soft-text-color);
    line-height: 1.6;
    min-height: calc(1.6em * var(--min-content-rows));
    max-height: calc(1.6em * var(--max-content-rows));
    overflow-y: auto;
  }

  .footer {
    display: none;
  }
`;