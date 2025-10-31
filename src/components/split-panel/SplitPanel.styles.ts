import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .container {
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;
  }

  :host([direction="vertical"]) .container {
    flex-direction: column;
  }

  .panel {
    overflow: auto;
    position: relative;
  }

  .panel.start {
    flex: 0 0 var(--split-position);
  }

  .panel.end {
    flex: 1 1 auto;
  }

  /* Divider - 넓은 히트 영역을 가진 구조 */
  .divider {
    flex: 0 0 auto;
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Horizontal divider (좌우 분할) - 히트 영역 */
  :host([direction="horizontal"]) .divider {
    width: 10px;
    cursor: col-resize;
    margin: 0 -5px; /* 패널 간격을 없애기 위한 음수 마진 */
  }

  /* Vertical divider (상하 분할) - 히트 영역 */
  :host([direction="vertical"]) .divider {
    height: 10px;
    cursor: row-resize;
    margin: -5px 0; /* 패널 간격을 없애기 위한 음수 마진 */
  }

  /* 실제 보이는 divider 선 */
  .divider::before {
    content: '';
    position: absolute;
    background-color: var(--u-border-color);
    transition: all 0.15s ease;
  }

  :host([direction="horizontal"]) .divider::before {
    width: 1px;
    height: 100%;
    left: 50%;
    transform: translateX(-50%);
  }

  :host([direction="vertical"]) .divider::before {
    height: 1px;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }

  /* Divider hover/dragging 상태 - 선이 굵어짐 */
  .divider:hover::before,
  .divider.dragging::before {
    background-color: var(--u-border-color-strong);
  }

  :host([direction="horizontal"]) .divider:hover::before,
  :host([direction="horizontal"]) .divider.dragging::before {
    width: 3px;
  }

  :host([direction="vertical"]) .divider:hover::before,
  :host([direction="vertical"]) .divider.dragging::before {
    height: 3px;
  }

  /* Divider handle (중앙 표시) */
  .divider-handle {
    position: relative;
    background-color: var(--u-border-color-strong);
    border-radius: 2px;
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
    z-index: 1;
  }

  :host([direction="horizontal"]) .divider-handle {
    width: 4px;
    height: 32px;
  }

  :host([direction="vertical"]) .divider-handle {
    width: 32px;
    height: 4px;
  }

  .divider:hover .divider-handle,
  .divider.dragging .divider-handle {
    opacity: 1;
  }

  /* Disabled 상태 */
  :host([disabled]) .divider {
    cursor: default;
  }

  :host([disabled]) .divider::before {
    background-color: var(--u-border-color);
  }

  :host([disabled]) .divider:hover::before {
    background-color: var(--u-border-color);
  }

  :host([disabled][direction="horizontal"]) .divider:hover::before {
    width: 1px;
  }

  :host([disabled][direction="vertical"]) .divider:hover::before {
    height: 1px;
  }

  :host([disabled]) .divider-handle {
    display: none;
  }

  /* Dragging 상태에서 선택 방지 */
  .divider.dragging {
    user-select: none;
  }

  /* 스크롤바 스타일링 */
  .panel::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .panel::-webkit-scrollbar-track {
    background: var(--u-scrollbar-track-color);
  }

  .panel::-webkit-scrollbar-thumb {
    background: var(--u-scrollbar-color);
    border-radius: 4px;
  }

  .panel::-webkit-scrollbar-thumb:hover {
    background: var(--u-scrollbar-color-hover);
  }
`