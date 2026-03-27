import { css } from "lit";

export const styles = css`
  :host {
    --tree-indent-size: 14px;
    --tree-indent-guide-offset: 8px;
    --tree-indent-guide-width: 1px;
    --tree-indent-guide-style: solid;
    --tree-indent-guide-color: var(--u-border-color-weak);
  }

  :host {
    display: block;
    font-size: 0.875rem;
    color: var(--u-txt-color);
  }
`;
