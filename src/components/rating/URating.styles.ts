import { css } from "lit";

export const styles = css`
  :host {
    --symbol-color: var(--u-yellow-500);
  }

  :host {
    display: inline-flex;
    flex-direction: column;
    gap: 0.35em;
    font-size: inherit;
    font-family: var(--u-font-base);
    user-select: none;
  }
  :host([disabled]) {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  :host([readonly]) {
    cursor: default;
  }

  .label {
    display: inline-flex;
    align-items: center;
    gap: 0.25em;
    font-size: 0.85em;
    font-weight: 500;
    color: var(--u-txt-color);
  }
  .required {
    color: var(--u-red-500);
  }

  .symbols {
    display: inline-flex;
    align-items: center;
    gap: 0.15em;
    cursor: pointer;
  }
  :host([disabled]) .symbols {
    cursor: not-allowed;
  }
  :host([readonly]) .symbols {
    cursor: default;
  }

  .symbol {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    color: var(--u-border-color);
    transition: color 0.15s ease, transform 0.15s ease;
    outline: none;
    border-radius: 0.15em;
  }
  .symbol:focus-visible {
    outline: 2px solid var(--u-blue-500, #3b82f6);
    outline-offset: 2px;
  }
  .symbol[filled] {
    color: var(--symbol-color);
  }
  :host(:not([disabled]):not([readonly])) .symbol:hover {
    transform: scale(1.2);
  }

  /* 쪼개기 모드: 배경(unfilled) + 전경(filled, 클립) */
  .symbol-bg {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--u-border-color);
  }
  .symbol-fg {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    display: inline-flex;
    align-items: center;
    overflow: hidden;
    color: var(--symbol-color);
    pointer-events: none;
  }
`;
