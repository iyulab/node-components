import { css } from "lit";

export const styles = css`
  :host {
    --rating-symbol-color: var(--u-yellow-500);
    --rating-symbol-off-color: var(--u-neutral-300);
  }

  :host {
    display: block;
    font-size: inherit;
    font-family: var(--u-font-base);
    user-select: none;
  }

  .symbols {
    display: flex;
    align-items: center;
    gap: 0.2em;
    cursor: pointer;
  }

  .symbol {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    outline: none;
    border-radius: 0.15em;
    color: var(--rating-symbol-off-color);
    transition: color 0.15s ease, transform 0.15s ease;
  }
  .symbol:focus-visible {
    outline: 2px solid var(--u-blue-500);
    outline-offset: 2px;
  }
  :host(:not([disabled]):not([readonly])) .symbol:hover {
    transform: scale(1.2);
  }

  .symbol-fg {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    display: flex;
    align-items: center;
    color: var(--rating-symbol-color);
    pointer-events: none;
    overflow: hidden;
  }
`;
