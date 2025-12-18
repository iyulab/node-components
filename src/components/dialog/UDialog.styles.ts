import { css } from 'lit';

export const styles = css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog {
    position: relative;
    display: block;
    max-width: 90vw;
    max-height: 90vh;
    padding: 20px;
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    background: var(--u-panel-bg-color);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .dialog[open] {
    opacity: 1;
    transform: scale(1);
  }
  .dialog[shake] {
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

  .content {
    display: block;
    max-width: calc(90vw - 40px);
    max-height: calc(90vh - 100px);
    overflow: auto;
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