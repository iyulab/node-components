import { css } from "lit";

export const styles = css`
  :host {
    --interactive-area: 0px;
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
    transform: scale(0.8);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  :host([visible]) {
    opacity: 0.8;
    transform: scale(1);
  }

  /* 툴팁을 distance만큼 감싸는 보이지 않는 영역 */
  :host([interactive])::before {
    content: '';
    position: absolute;
    /* 툴팁을 distance만큼 모든 방향으로 확장 */
    inset: calc(var(--interactive-area) * -1);
    background: transparent;
    pointer-events: auto;
    z-index: -1;
  }
`;