import { css } from "lit";

export const styles = css`
  /* === Status Colors === */
  :host {
    --alert-icon-color: var(--u-neutral-700, #616161);
    --alert-border-color: var(--u-neutral-300, #E0E0E0);
    --alert-background-color: var(--u-neutral-200, #EEEEEE);
  }
  :host([status="error"]) {
    --alert-icon-color: var(--u-danger-color-strong, #D32F2F);
    --alert-border-color: var(--u-danger-color-weaker, #E57373);
    --alert-background-color: var(--u-danger-color-weakest, #EF9A9A);
  }
  :host([status="warning"]) {
    --alert-icon-color: var(--u-warning-color-strong, #FBC02D);
    --alert-border-color: var(--u-warning-color-weaker, #FFF176);
    --alert-background-color: var(--u-warning-color-weakest, #FFF59D);
  }
  :host([status="info"]) {
    --alert-icon-color: var(--u-info-color-strong, #1976D2);
    --alert-border-color: var(--u-info-color-weaker, #64B5F6);
    --alert-background-color: var(--u-info-color-weakest, #90CAF9);
  }
  :host([status="success"]) {
    --alert-icon-color: var(--u-success-color-strong, #388E3C);
    --alert-border-color: var(--u-success-color-weaker, #81C784);
    --alert-background-color: var(--u-success-color-weakest, #A5D6A7);
  }
  :host([status="notice"]) {
    --alert-icon-color: var(--u-neutral-700, #616161);
    --alert-border-color: var(--u-neutral-300, #E0E0E0);
    --alert-background-color: var(--u-neutral-200, #EEEEEE);
  }

  :host {
    display: block;
    width: fit-content;
    min-width: 200px;
    max-width: 100%;
    max-height: 50vh;
    border-radius: var(--u-radius-xl, 8px);
    box-shadow: 0 4px 12px var(--u-shadow-color-normal, rgba(0, 0, 0, 0.12));
    
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
    --alert-border-width: 1px;
    background-color: var(--alert-background-color);
  }
  :host([variant="filled"]) {
    --alert-border-width: 1px;
    background-color: var(--alert-background-color);
  }
  /* filled 의 테두리는 레이아웃 정합용이라 항상 투명하다 — 색 훅이 도달하면 안 된다. */
  :host([variant="filled"]) .container {
    border-color: transparent;
  }
  :host([variant="outlined"]) {
    --alert-border-width: 1px;
    background-color: transparent;
  }
  /* From https://css.glass */
  :host([variant="glass"]) {
    --alert-border-width: 1px;
    --alert-border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  /* 여백/테두리는 내부 요소가 진다 — :host 에 두면 소비 앱 CSS 리셋에 지워진다. */
  .container {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: var(--alert-padding-block, var(--u-space-md, 12px)) var(--alert-padding-inline, var(--u-space-lg, 16px));
    border: var(--alert-border-width, 0) solid var(--alert-border-color);
    border-radius: inherit;
  }

  .header {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--u-space-md, 12px);
    margin-bottom: var(--u-space-2xs, 4px);
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
    padding: var(--u-space-2xs, 4px);
    font-size: inherit;
    border-radius: var(--u-radius-md, 4px);
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