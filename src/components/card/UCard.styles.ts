import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    border-radius: var(--u-radius-xl);
    background-color: var(--u-panel-bg-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    --card-border-width: 1px;
    --card-border-color: var(--u-border-color);
  }

  /* 테두리는 내부 요소가 진다 — :host 에 두면 소비 앱 CSS 리셋에 지워진다. */
  .base {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: inherit;
    border: var(--card-border-width) solid var(--card-border-color);
    border-radius: inherit;
    overflow: hidden;
  }

  :host([orientation="vertical"]) {
    flex-direction: column;
  }
  :host([orientation="horizontal"]) {
    flex-direction: row;
  }
  :host([borderless]) {
    --card-border-width: 0;
  }
  :host([shadowless]) {
    box-shadow: none;
  }
  :host([hoverable]) {
    cursor: pointer;
    transition: all 0.2s ease;
  }
  :host([hoverable]:hover) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .media {
    display: none;
    flex-shrink: 0;
    overflow: hidden;
  }
  .media.has-content {
    display: block;
  }

  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .header {
    display: none;
    padding: 16px;
    border-bottom: 1px solid var(--u-border-color);
  }
  .header.has-content {
    display: block;
  }

  .body {
    display: none;
    flex: 1;
    padding: 16px;
  }
  .body.has-content {
    display: block;
  }

  .footer {
    display: none;
    padding: 16px;
    border-top: 1px solid var(--u-border-color);
  }
  .footer.has-content {
    display: block;
  }
`;
