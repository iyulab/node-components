import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;

    --divider-width: 1px;
    --divider-color: var(--u-neutral-300, #e0e0e0);
    --divider-active-width: 6px;
    --divider-active-color: var(--u-blue-600, #1976d2);
  }
  /* 방향에 따른 컨테이너 레이아웃 */
  :host([orientation="horizontal"]) {
    flex-direction: row;
  }
  :host([orientation="vertical"]) {
    flex-direction: column;
  }
  /* Horizontal divider - 오른쪽에 표시 */
  :host([orientation="horizontal"]) ::slotted(u-panel:not(:last-child))::after {
    top: 0;
    right: calc(var(--divider-width, 1px) / -2);
    width: var(--divider-width, 1px);
    height: 100%;
    cursor: col-resize;
  }
  /* Vertical divider - 하단에 표시 */
  :host([orientation="vertical"]) ::slotted(u-panel:not(:last-child))::after {
    left: 0;
    bottom: calc(var(--divider-width, 1px) / -2);
    height: var(--divider-width, 1px);
    width: 100%;
    cursor: row-resize;
  }
  /* Horizontal divider dragging 상태 */
  :host([orientation="horizontal"]) ::slotted(u-panel:not(:last-child):hover)::after {
    right: calc(var(--divider-active-width, 1px) / -2);
    width: var(--divider-active-width, 6px);
    background-color: var(--divider-active-color, #1976d2);
  }
  /* Vertical divider dragging 상태 */
  :host([orientation="vertical"]) ::slotted(u-panel:not(:last-child):hover)::after {
    bottom: calc(var(--divider-active-width, 1px) / -2);
    height: var(--divider-active-width, 6px);
    background-color: var(--divider-active-color, #1976d2);
  }
  /* Disabled 상태 */
  :host([disabled]) ::slotted(u-panel:not(:last-child))::after {
    cursor: default;
    pointer-events: none;
  }

  /* u-panel 스타일링 */
  ::slotted(u-panel) {
    position: relative;
  }
  /* 마지막 패널이 아닌 경우 divider 영역 (::after) */
  ::slotted(u-panel:not(:last-child))::after {
    content: '';
    position: absolute;
    z-index: 100;
    background: var(--divider-color, transparent);
    transition: background-color 0.15s ease;
  }
`;