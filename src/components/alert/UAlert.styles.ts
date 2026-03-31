import { css } from "lit";

export const styles = css`
  /* === Status Colors === */
  :host {
    --alert-icon-color: var(--u-neutral-700);
    --alert-border-color: var(--u-neutral-300);
    --alert-background-color: var(--u-neutral-200);
  }
  :host([status="error"]) {
    --alert-icon-color: var(--u-red-700);
    --alert-border-color: var(--u-red-300);
    --alert-background-color: var(--u-red-200);
  }
  :host([status="warning"]) {
    --alert-icon-color: var(--u-yellow-700);
    --alert-border-color: var(--u-yellow-300);
    --alert-background-color: var(--u-yellow-200);
  }
  :host([status="info"]) {
    --alert-icon-color: var(--u-blue-700);
    --alert-border-color: var(--u-blue-300);
    --alert-background-color: var(--u-blue-200);
  }
  :host([status="success"]) {
    --alert-icon-color: var(--u-green-700);
    --alert-border-color: var(--u-green-300);
    --alert-background-color: var(--u-green-200);
  }
  :host([status="notice"]) {
    --alert-icon-color: var(--u-neutral-700);
    --alert-border-color: var(--u-neutral-300);
    --alert-background-color: var(--u-neutral-200);
  }

  :host {
    display: block;
    width: fit-content;
    min-width: 200px;
    max-width: 100%;
    max-height: 50vh;
    padding: 8px 12px;
    border-radius: 8px;
    box-shadow: 0 4px 12px var(--u-shadow-color-normal);
    
    opacity: 0;
    transform: scale(0.8);
    visibility: hidden;
    pointer-events: none;
    transition: 
      visibility 0s 0.2s,
      opacity 0.2s ease,
      transform 0.2s ease-out;
  }
  :host([open]) {
    opacity: 1;
    transform: scale(1);
    visibility: visible;
    pointer-events: auto;
    transition-delay: 0s;
  }

  /* === Variant Styles === */
  :host([variant="solid"]) {
    border: 1px solid var(--alert-border-color);
    background-color: var(--alert-background-color);
  }
  :host([variant="filled"]) {
    border: 1px solid transparent;
    background-color: var(--alert-background-color);
  }
  :host([variant="outlined"]) {
    border: 1px solid var(--alert-border-color);
    background-color: transparent;
  }
  /* From https://css.glass */
  :host([variant="glass"]) {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .container {
    display: flex;
    flex-direction: column;
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
    color: var(--alert-icon-color);
  }
  .header .title {
    flex-grow: 1;
    font-weight: 600;
    line-height: 2;
  }
  .header .close-btn {
    flex-shrink: 0;
    padding: 4px;
    font-size: inherit;
    border-radius: 4px;
  }

  .content {
    font-size: 14px;
    font-weight: 300;
    line-height: 1.5;
    overflow-y: auto;
  }

  .footer {
    display: inline-block;
  }
`;