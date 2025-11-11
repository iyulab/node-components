import { css } from "lit";

export const styles = css`
  :host {
    box-sizing: border-box;
    overflow-wrap: anywhere;
    color: var(--u-text-color, inherit);
    font-family: var(--u-font-base, inherit);
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
    overflow-wrap: inherit;
  }

  [hidden] {
    display: none !important;
  }

  .scrollable {
    scrollbar-width: thin;
    scrollbar-color: var(--u-scrollbar-color) var(--u-scrollbar-track-color);
    scrollbar-gutter: stable;
  }
`;