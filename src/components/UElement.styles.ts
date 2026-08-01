import { css } from "lit";

export const styles = css`
  :host {
    color: var(--u-txt-color, inherit);
    font-family: var(--u-font-base, inherit);
    box-sizing: border-box;
    overflow-wrap: anywhere;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
    overflow-wrap: inherit;
  }

  /* Focus Styles */
  :host(:focus-visible) {
    outline: 2px solid var(--u-primary-color-weak, #2196F3);
    outline-offset: 2px;
  }
  :focus-visible {
    outline: 2px solid var(--u-primary-color-weak, #2196F3);
    outline-offset: 2px;
  }

  /* Hidden Attribute */
  :host([hidden]) {
    display: none !important;
  }
  [hidden] {
    display: none !important;
  }

  /* Scrollbar Styles */
  :host([scrollable]) {
    scrollbar-width: thin;
    scrollbar-color: var(--u-scrollbar-color, #BDBDBD) var(--u-scrollbar-track-color, transparent);
  }
  :host([scrollable])::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  :host([scrollable])::-webkit-scrollbar-thumb {
    background: var(--u-scrollbar-color, #BDBDBD);
  }
  :host([scrollable])::-webkit-scrollbar-track {
    background: var(--u-scrollbar-track-color, transparent);
  }
  [scrollable] {
    scrollbar-width: thin;
    scrollbar-color: var(--u-scrollbar-color, #BDBDBD) var(--u-scrollbar-track-color, transparent);
  }
  [scrollable]::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  [scrollable]::-webkit-scrollbar-thumb {
    background: var(--u-scrollbar-color, #BDBDBD);
  }
  [scrollable]::-webkit-scrollbar-track {
    background: var(--u-scrollbar-track-color, transparent);
  }
`;