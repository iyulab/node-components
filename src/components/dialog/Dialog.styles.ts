import { css } from 'lit';

export const styles = css`
  :host {
    --dialog-width: 500px;
    --dialog-max-width: 90vw;
    --dialog-max-height: 90vh;
    --dialog-padding: 1.5rem;
    --dialog-border-radius: 0.5rem;
    --dialog-header-gap: 1rem;
    --dialog-body-gap: 1rem;
    --dialog-footer-gap: 0.75rem;
  }

  dialog {
    width: var(--dialog-width);
    max-width: var(--dialog-max-width);
    max-height: var(--dialog-max-height);
    padding: 0;
    border: none;
    background: transparent;
    overflow: visible;
  }

  dialog::backdrop {
    background: var(--u-overlay-bg-color);
    animation: fadeIn 0.2s ease-out;
  }

  dialog[open] {
    animation: slideIn 0.3s ease-out;
  }

  .dialog__panel {
    display: flex;
    flex-direction: column;
    background: var(--u-panel-bg-color);
    border: 1px solid var(--u-border-color);
    border-radius: var(--dialog-border-radius);
    box-shadow: 0 20px 25px -5px var(--u-shadow-strong), 
                0 10px 10px -5px var(--u-shadow-medium);
    max-height: var(--dialog-max-height);
    overflow: hidden;
  }

  .dialog__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--dialog-header-gap);
    padding: var(--dialog-padding);
    border-bottom: 1px solid var(--u-border-color);
  }

  .dialog__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--u-text-color);
    flex: 1;
  }

  .dialog__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: none;
    border-radius: 0.375rem;
    background: transparent;
    color: var(--u-icon-color);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .dialog__close:hover {
    background: var(--u-bg-color-hover);
    color: var(--u-icon-color-hover);
  }

  .dialog__close:focus {
    outline: 2px solid var(--u-input-border-focus);
    outline-offset: 2px;
  }

  .dialog__body {
    flex: 1;
    padding: var(--dialog-padding);
    overflow-y: auto;
    color: var(--u-text-color);
  }

  .dialog__footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--dialog-footer-gap);
    padding: var(--dialog-padding);
    border-top: 1px solid var(--u-border-color);
  }

  .dialog__footer:empty {
    display: none;
  }

  /* 애니메이션 */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;