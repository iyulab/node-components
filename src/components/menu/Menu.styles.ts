import { css } from "lit";

export const styles = css`
  /* 공통 스타일 */
  :host {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    padding: 8px 0px;
    border: 1px solid var(--u-border-color);
    border-radius: 4px;
    background: var(--u-panel-bg-color);
  }

  /* default 타입: 일반 메뉴 (항상 표시, 문서 흐름에 포함) */
  :host([type="default"]) {
    position: relative;
    z-index: inherit;
    top: unset;
    left: unset;
    opacity: 1;
    pointer-events: auto;
  }

  /* dropdown/contextmenu/submenu 타입: 플로팅 메뉴 */
  :host([type="dropdown"]),
  :host([type="contextmenu"]),
  :host([type="submenu"]) {
    transform: scale(0.9);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  :host([type="dropdown"][visible]),
  :host([type="contextmenu"][visible]),
  :host([type="submenu"][visible]) {
    transform: scale(1);
  }
`;
