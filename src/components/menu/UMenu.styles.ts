import { css } from "lit";

export const styles = css`
  :host {
    --menu-indent-size: 20px;
  }

  :host {
    display: flex;
    flex-direction: column;
    min-width: 160px;
    border-radius: 6px;
    background-color: var(--u-panel-bg-color);

    --menu-padding: 4px;
    --menu-border-width: 1px;
    --menu-border-color: var(--u-border-color);
  }

  /* 여백/테두리는 내부 요소가 진다 — :host 에 두면 소비 앱 CSS 리셋에 지워진다. */
  .base {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: var(--menu-padding);
    border: var(--menu-border-width) solid var(--menu-border-color);
    border-radius: inherit;
  }
  :host([borderless]) {
    --menu-padding: 0;
    --menu-border-width: 0;
    border-radius: 0;
    background-color: transparent;
  }
`;
