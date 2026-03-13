import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    font-size: inherit;
    font-family: var(--u-font-base);
    color: var(--u-txt-color);
  }

  /* 탭 네비게이션 */
  .tab-nav {
    display: flex;
    flex-direction: row;
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .tab-nav::-webkit-scrollbar {
    display: none;
  }

  /* 탭 버튼 공통 */
  .tab-btn {
    all: unset;
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    padding: 0.6em 1em;
    font-size: 0.9em;
    font-weight: 500;
    color: var(--u-txt-color-weak);
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
    user-select: none;
  }
  .tab-btn:hover:not([disabled]) {
    color: var(--u-txt-color);
  }
  .tab-btn:focus-visible {
    outline: 2px solid var(--u-blue-500);
    outline-offset: -2px;
  }
  .tab-btn[disabled] {
    color: var(--u-txt-color-disabled);
    cursor: not-allowed;
  }

  /* ===== underline (기본) ===== */
  :host([variant="underline"]) .tab-nav,
  :host(:not([variant])) .tab-nav {
    border-bottom: 2px solid var(--u-border-color-weak);
  }
  :host([variant="underline"]) .tab-btn[active],
  :host(:not([variant])) .tab-btn[active] {
    color: var(--u-blue-600);
  }
  :host([variant="underline"]) .tab-btn::after,
  :host(:not([variant])) .tab-btn::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: transparent;
    transition: background-color 0.2s ease;
  }
  :host([variant="underline"]) .tab-btn[active]::after,
  :host(:not([variant])) .tab-btn[active]::after {
    background-color: var(--u-blue-600);
  }

  /* ===== pills ===== */
  :host([variant="pills"]) .tab-nav {
    gap: 0.4em;
  }
  :host([variant="pills"]) .tab-btn {
    border-radius: 2em;
  }
  :host([variant="pills"]) .tab-btn:hover:not([disabled]):not([active]) {
    background-color: var(--u-bg-color-hover);
  }
  :host([variant="pills"]) .tab-btn[active] {
    color: #fff;
    background-color: var(--u-blue-600);
  }

  /* ===== outline ===== */
  :host([variant="outline"]) .tab-nav {
    gap: 0.4em;
  }
  :host([variant="outline"]) .tab-btn {
    border: 1px solid transparent;
    border-radius: 0.4em;
  }
  :host([variant="outline"]) .tab-btn:hover:not([disabled]):not([active]) {
    border-color: var(--u-border-color-weak);
  }
  :host([variant="outline"]) .tab-btn[active] {
    color: var(--u-blue-600);
    border-color: var(--u-blue-600);
  }

  /* ===== segment ===== */
  :host([variant="segment"]) .tab-nav {
    background-color: var(--u-bg-color-secondary);
    border-radius: 0.5em;
    padding: 0.25em;
    gap: 0;
  }
  :host([variant="segment"]) .tab-btn {
    border-radius: 0.35em;
    flex: 1;
    justify-content: center;
  }
  :host([variant="segment"]) .tab-btn:hover:not([disabled]):not([active]) {
    color: var(--u-txt-color);
  }
  :host([variant="segment"]) .tab-btn[active] {
    color: var(--u-txt-color);
    background-color: var(--u-bg-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* ===== vertical orientation ===== */
  :host([orientation="vertical"]) {
    display: flex;
    flex-direction: row;
  }
  :host([orientation="vertical"]) .tab-nav {
    flex-direction: column;
    overflow-x: visible;
    overflow-y: auto;
    border-bottom: none;
    flex-shrink: 0;
  }
  :host([orientation="vertical"]) .tab-content {
    flex: 1;
    min-width: 0;
  }

  /* vertical + underline */
  :host([orientation="vertical"][variant="underline"]) .tab-nav,
  :host([orientation="vertical"]:not([variant])) .tab-nav {
    border-bottom: none;
    border-right: 2px solid var(--u-border-color-weak);
  }
  :host([orientation="vertical"][variant="underline"]) .tab-btn::after,
  :host([orientation="vertical"]:not([variant])) .tab-btn::after {
    bottom: 0;
    left: auto;
    right: -2px;
    top: 0;
    width: 2px;
    height: auto;
  }

  /* vertical + outline */
  :host([orientation="vertical"][variant="outline"]) .tab-nav {
    gap: 0.25em;
  }

  /* vertical + pills */
  :host([orientation="vertical"][variant="pills"]) .tab-nav {
    gap: 0.25em;
  }

  /* vertical + segment */
  :host([orientation="vertical"][variant="segment"]) .tab-nav {
    flex-direction: column;
  }
  :host([orientation="vertical"][variant="segment"]) .tab-btn {
    flex: none;
  }

  /* vertical 콘텐츠 패딩 */
  :host([orientation="vertical"]) .tab-content {
    padding: 0 0 0 1em;
  }

  /* 탭 콘텐츠 영역 */
  .tab-content {
    padding: 1em 0;
  }
`;
