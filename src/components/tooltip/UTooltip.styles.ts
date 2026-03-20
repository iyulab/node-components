import { css } from "lit";

export const styles = css`
  :host {
    --tooltip-bridge-area: 0px;
  }

  :host {
    padding: 6px 8px;
    color: var(--u-tooltip-txt-color);
    font-family: var(--u-font-display, inherit);
    font-size: 12px;
    line-height: 1.25;
    border: none;
    border-radius: 4px;
    background-color: var(--u-tooltip-bg-color);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
    transform: scale(0.9);
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0s 0.2s;
  }
  :host([open]) {
    transform: scale(1);
  }

  /* 툴팁을 offset만큼 감싸는 보이지 않는 영역 */
  :host([interactive])::before {
    content: '';
    position: absolute;
    inset: calc(var(--tooltip-bridge-area) * -1);
    background: transparent;
    pointer-events: auto;
    z-index: -1;
  }
`;
