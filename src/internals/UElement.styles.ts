import { css } from "lit";

export const styles = css`
  :host {
    box-sizing: border-box;
    overflow-wrap: anywhere;
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
    scrollbar-color: var(--uc-scrollbar-color) transparent;
    scrollbar-gutter: stable both-edges;
  }
`;