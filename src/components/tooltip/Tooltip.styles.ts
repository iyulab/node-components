import { css } from "lit";

export const styles = css`
  :host {
    position: absolute;
    z-index: 1000;
    top: 0;
    left: 0;
    
    display: block;
    width: max-content;
    padding: 6px;
    color: #fff;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    border: none;
    border-radius: 4px;
    background-color: var(--uc-background-color-1000);
    
    opacity: 0;
    pointer-events: none;
    transform: scale(0);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
  :host([visible]) {
    opacity: 0.95;
    pointer-events: auto;
    transform: scale(1);
  }
  :host([hoist]) {
    position: fixed;
  }
`;