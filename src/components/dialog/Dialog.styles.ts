import { css } from 'lit';

export const styles = css`
  :host {
    position: fixed;
    z-index: 9999;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    visibility: hidden;
    pointer-events: none;
  }
  :host([open]) {
    visibility: visible;
    pointer-events: auto;
  }
  :host([modal]) {
    background: var(--u-overlay-bg-color);
  }

  .dialog {
    position: relative;
    display: block;
    max-width: 90vw;
    max-height: 90vh;
    padding: 20px;
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: var(--u-panel-bg-color);
    overflow: auto;
  }
  .dialog.shake {
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

  /* 페이드 인 및 스케일 업 애니메이션 */
  @keyframes fadeout {
    0% {
      opacity: 0;
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
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