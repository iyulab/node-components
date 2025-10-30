import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    
    padding: 8px 16px;
    font-family: var(--u-font-base);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    color: var(--u-text-color);
    
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    background-color: var(--u-bg-color);
    
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    
    box-shadow: 0 1px 2px var(--u-shadow-weak);
  }
  
  :host(:hover) {
    background-color: var(--u-bg-color-hover);
    border-color: var(--u-border-color-strong);
    box-shadow: 0 2px 4px var(--u-shadow-normal);
  }
  
  :host(:active) {
    background-color: var(--u-bg-color-active);
    box-shadow: 0 1px 2px var(--u-shadow-weak);
    transform: translateY(1px);
  }
  
  :host(:focus-visible) {
    outline: 2px solid var(--u-input-border-focus);
    outline-offset: 2px;
  }
  
  :host([disabled]) {
    background-color: var(--u-bg-color-disabled);
    color: var(--u-text-color-disabled);
    border-color: var(--u-border-color-weak);
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.6;
    box-shadow: none;
  }
  
  :host([loading]) {
    cursor: wait;
    pointer-events: none;
    opacity: 0.8;
  }

  .overlay {
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    display: none;
    align-items: center;
    justify-content: center;

    padding: inherit;
    font-size: inherit;
    border-radius: inherit;
    background-color: inherit;
  }
  
  .overlay[visible] {
    display: flex;
  }
  
  .overlay > * {
    font-size: inherit;
  }
`;