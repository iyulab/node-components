import { css } from "lit";

export const styles = css`
  :host {
    --tree-indent-size: 12px;
    --tree-indent-guide-width: 1px;
    --tree-indent-guide-color: var(--u-border-color-weak);
    --tree-indent-guide-style: solid;
    --tree-indent-guide-offset: 0px;
  }

  :host {
    display: block;
    font-size: 0.875rem;
    color: var(--u-txt-color, #1f2937);
  }

  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }
`;
