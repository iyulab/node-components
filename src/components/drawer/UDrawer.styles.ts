import { css } from 'lit';

export const styles = css`
  :host {
    display: flex;
    align-items: stretch;
  }
  :host([placement="left"]) {
    flex-direction: row;
    justify-content: flex-start;
  }
  :host([placement="right"]) {
    flex-direction: row;
    justify-content: flex-end;
  }
  :host([placement="top"]) {
    flex-direction: column;
    justify-content: flex-start;
  }
  :host([placement="bottom"]) {
    flex-direction: column;
    justify-content: flex-end;
  }

  .drawer {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 100vw;
    max-height: 100vh;
    padding: 20px;
    background: var(--u-panel-bg-color);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transition: transform 0.3s ease;
  }
  .drawer[placement="left"] {
    border-right: 1px solid var(--u-border-color);
    transform: translateX(-100%);
  }
  .drawer[placement="right"] {
    border-left: 1px solid var(--u-border-color);
    transform: translateX(100%);
  }
  .drawer[placement="top"] {
    border-bottom: 1px solid var(--u-border-color);
    transform: translateY(-100%);
  }
  .drawer[placement="bottom"] {
    border-top: 1px solid var(--u-border-color);
    transform: translateY(100%);
  }
  .drawer[open][placement="left"],
  .drawer[open][placement="right"] {
    transform: translateX(0);
  }
  .drawer[open][placement="top"],
  .drawer[open][placement="bottom"] {
    transform: translateY(0);
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
    margin-bottom: 20px;
  }
  .header .title {
    line-height: 1.2;
    font-weight: 600;
  }

  .content {
    display: block;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 100px);
    overflow: auto;
  }
`;
