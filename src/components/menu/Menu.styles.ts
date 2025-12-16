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

  /* manual 모드: 일반 메뉴 (항상 표시, 문서 흐름에 포함) */
  :host([trigger="none"]) {
    position: relative;
    z-index: inherit;
    top: unset;
    left: unset;
    opacity: 1;
    pointer-events: auto;
  }

  /* click/contextmenu 모드: 플로팅 메뉴 */
  :host([trigger="hover"]),
  :host([trigger="click"]),
  :host([trigger="contextmenu"]) {
    transform: scale(0.95);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
  :host([trigger="hover"][visible]),
  :host([trigger="click"][visible]),
  :host([trigger="contextmenu"][visible]) {
    transform: scale(1);
  }
`;
