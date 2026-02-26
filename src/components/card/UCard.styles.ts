import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    flex-direction: column;
    background-color: var(--u-panel-bg-color);
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--u-border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  :host([borderless]) {
    border: none;
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
  :host([orientation="horizontal"]) {
    flex-direction: row;
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
