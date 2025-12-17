import { css } from 'lit';

export const styles = css`
  .panel {
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
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  :host([open]) .panel {
    opacity: 1;
    transform: scale(1);
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