import { css } from "lit";

export const styles = css`
  :host {
    --menu-indent-size: 20px;
  }

  :host {
    display: flex;
    flex-direction: column;
    padding: 4px;
    min-width: 160px;
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    background-color: var(--u-panel-bg-color);
  }
  :host([borderless]) {
    padding: 0;
    border: none;
    border-radius: 0;
    background-color: transparent;
  }
`;
