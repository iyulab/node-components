import { css } from 'lit';

export const styles = css`
  :host {
    align-items: stretch;
    justify-content: flex-start;
  }
  :host([placement="end"]) {
    justify-content: flex-end;
  }
  :host([placement="top"]) {
    flex-direction: column;
  }
  :host([placement="bottom"]) {
    flex-direction: column;
    justify-content: flex-end;
  }

  .panel {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 100vw;
    max-height: 100vh;
    padding: 20px;
    background: var(--u-panel-bg-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: auto;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  :host([placement="start"]) .panel {
    border-right: 1px solid var(--u-border-color);
    transform: translateX(-100%);
  }
  :host([placement="end"]) .panel {
    border-left: 1px solid var(--u-border-color);
    transform: translateX(100%);
  }
  :host([placement="top"]) .panel {
    width: 100%;
    border-bottom: 1px solid var(--u-border-color);
    transform: translateY(-100%);
  }
  :host([placement="bottom"]) .panel {
    width: 100%;
    border-top: 1px solid var(--u-border-color);
    transform: translateY(100%);
  }

  :host([open][placement="start"]) .panel,
  :host([open][placement="end"]) .panel {
    transform: translateX(0);
  }
  :host([open][placement="top"]) .panel,
  :host([open][placement="bottom"]) .panel {
    transform: translateY(0);
  }

  .panel.shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
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

  /* 진동 애니메이션 */
  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-8px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(8px);
    }
  }
`;
