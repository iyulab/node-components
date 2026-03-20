import { css } from 'lit';

export const styles = css`
  .error-container {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--u-red-200);
    border-radius: 10px;
    background: var(--u-red-0);
    color: var(--u-red-700);
    overflow: hidden;
    font-size: 0.875em;
    line-height: 1.5;
  }

  .error-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
    padding: 0.55em 0.9em;
    background: var(--u-red-50);
    border-bottom: 1px solid var(--u-red-200);
  }

  .error-icon {
    font-size: 0.95em;
    color: var(--u-red-500);
    flex-shrink: 0;
  }

  .error-title {
    font-weight: 700;
    letter-spacing: 0.01em;
    flex: 1;
  }

  .error-tag {
    font-family: var(--u-font-mono);
    font-size: 0.85em;
    padding: 0.1em 0.45em;
    color: var(--u-red-600);
    border: 1px solid var(--u-red-200);
    border-radius: 4px;
    background: var(--u-red-100);
  }

  .error-body {
    display: flex;
    flex-direction: column;
    padding: 0.6em 0.9em;
    gap: 0.45em;
  }

  .error-row {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 0.6em;
    min-height: 1.6em;
  }

  .error-label {
    flex-shrink: 0;
    width: 5em;
    font-size: 0.78em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 0.55;
    padding-top: 0.15em;
  }

  .error-type {
    font-family: var(--u-font-mono);
    font-size: 0.85em;
    padding: 0.1em 0.4em;
    color: var(--u-red-700);
    background: var(--u-red-100);
    border-radius: 4px;
  }

  .error-message {
    margin: 0;
    flex: 1;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: var(--u-font-mono);
    font-size: 0.9em;
    opacity: 0.85;
    line-height: 1.55;
  }
`;
