import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  /* Disabled 상태 */
  :host([disabled]) .divider {
    pointer-events: none;
    cursor: default;
  }
  /* 방향에 따른 컨테이너 레이아웃 */
  :host([direction="vertical"]) .container {
    flex-direction: column;
  }
  /* Horizontal divider (좌우 분할) */
  :host([direction="horizontal"]) .divider {
    width: 10px;
    height: 100%;
    cursor: col-resize;
    transform: translateX(-50%);
  }
  /* Vertical divider (상하 분할) */
  :host([direction="vertical"]) .divider {
    height: 10px;
    width: 100%;
    cursor: row-resize;
    transform: translateY(-50%);
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
  :host([direction="horizontal"]) .divider:hover::before,
  :host([direction="horizontal"]) .divider.dragging::before {
    width: 6px;
  }
  :host([direction="vertical"]) .divider:hover::before,
  :host([direction="vertical"]) .divider.dragging::before {
    height: 6px;
  }

  .container {
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;
  }

  /* 슬롯으로 전달된 자식 요소들 (패널) */
  ::slotted(*) {
    flex-shrink: 0;
    overflow: auto;
    box-sizing: border-box;
  }

  /* Divider - 절대 위치로 배치 */
  .divider {
    position: absolute;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  /* 실제 보이는 divider 선 */
  .divider::before {
    content: '';
    position: absolute;
    background-color: var(--u-border-color);
    transition: all 0.15s ease;
  }
  /* Divider hover/dragging 상태 - 선이 굵어짐 */
  .divider:hover::before,
  .divider.dragging::before {
    background-color: var(--u-border-color-strong);
  }

  /* Dragging 상태에서 선택 방지 */
  .divider.dragging {
    user-select: none;
  }
`;