import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    min-width: 300px;
    max-width: 500px;
    
    font-family: var(--u-font-base);
    color: var(--u-text-color);
    
    border: 1px solid var(--u-border-color);
    border-left-width: 4px;
    border-radius: 8px;
    background-color: var(--u-bg-color);
    
    box-shadow: 0 4px 12px var(--u-shadow-medium), 0 2px 4px var(--u-shadow-weak);
    
    opacity: 0;
    pointer-events: none;
    transform: translateY(-16px) scale(0.95);
    transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

    --min-rows: 3;
    --max-rows: 10;
    --alert-icon-color: var(--u-info-color);
    --alert-border-color: var(--u-info-color);
    --alert-bg-tint: var(--u-blue-0);
  }
  
  :host([open]) {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
  
  :host([type="info"]) {
    --alert-icon-color: var(--u-info-color);
    --alert-border-color: var(--u-info-color);
    --alert-bg-tint: var(--u-blue-0);
  }
  
  :host([type="success"]) {
    --alert-icon-color: var(--u-success-color);
    --alert-border-color: var(--u-success-color);
    --alert-bg-tint: var(--u-green-0);
  }
  
  :host([type="warning"]) {
    --alert-icon-color: var(--u-warning-color);
    --alert-border-color: var(--u-warning-color);
    --alert-bg-tint: var(--u-yellow-0);
  }
  
  :host([type="danger"]) {
    --alert-icon-color: var(--u-error-color);
    --alert-border-color: var(--u-error-color);
    --alert-bg-tint: var(--u-red-0);
  }

  .container {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: linear-gradient(to right, var(--alert-bg-tint) 0%, transparent 100%);
  }

  .header {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 12px 16px 8px 16px;
    user-select: none;
  }
  
  .header u-icon:first-child {
    flex-shrink: 0;
    font-size: 20px;
    color: var(--alert-icon-color);
    filter: drop-shadow(0 1px 2px var(--u-shadow-weak));
  }
  
  .header .title {
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;
    color: var(--u-text-color);
    letter-spacing: -0.01em;
  }
  
  .header .flex {
    flex: 1;
  }
  
  .header .close-btn {
    flex-shrink: 0;
    font-size: 18px;
    color: var(--u-icon-color);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .header .close-btn:hover {
    color: var(--u-icon-color-hover);
    background-color: var(--u-bg-color-hover);
  }
  
  .header .close-btn:active {
    transform: scale(0.95);
  }

  .content {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.6;
    color: var(--u-text-color);
    
    padding: 4px 16px 12px 48px;
    overflow-y: auto;
    
    max-height: calc(1.6em * var(--max-rows) + 16px);
    transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    scrollbar-width: thin;
    scrollbar-color: var(--u-scrollbar-color) var(--u-scrollbar-track-color);
  }
  
  .content::-webkit-scrollbar {
    width: 6px;
  }
  
  .content::-webkit-scrollbar-track {
    background: var(--u-scrollbar-track-color);
  }
  
  .content::-webkit-scrollbar-thumb {
    background: var(--u-scrollbar-color);
    border-radius: 3px;
  }
  
  .content::-webkit-scrollbar-thumb:hover {
    background: var(--u-scrollbar-color-hover);
  }
  
  .content[collapsed] {
    overflow: hidden;
    max-height: calc(1.6em * var(--min-rows) + 16px);
  }

  .footer {
    display: block;
  }
  
  .footer .more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 8px;
    
    color: var(--u-icon-color);
    background-color: transparent;
    border-top: 1px solid var(--u-border-color-weak);
    
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
  }
  
  .footer .more-btn[hidden] {
    display: none;
  }
  
  .footer .more-btn:hover {
    color: var(--u-icon-color-hover);
    background-color: var(--u-bg-color-hover);
  }
  
  .footer .more-btn:active {
    background-color: var(--u-bg-color-active);
  }
  
  .footer .more-btn u-icon {
    font-size: 16px;
    transition: transform 0.2s ease;
  }
`;