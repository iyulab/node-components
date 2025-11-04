import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: block;
    flex-shrink: 0;
    z-index: 1;
    /* negative margin을 사용하여 패널 크기에 영향을 주지 않음 */
  }

  :host([orientation="horizontal"]) {
    width: var(--divider-size, 2px);
    height: 100%;
    cursor: col-resize;
    /* 좌우로 hitbox를 확장 */
    margin-left: calc(var(--divider-hitbox-padding, 4px) * -1);
    margin-right: calc(var(--divider-hitbox-padding, 4px) * -1);
    padding-left: var(--divider-hitbox-padding, 4px);
    padding-right: var(--divider-hitbox-padding, 4px);
  }

  :host([orientation="vertical"]) {
    width: 100%;
    height: var(--divider-size, 2px);
    cursor: row-resize;
    /* 상하로 hitbox를 확장 */
    margin-top: calc(var(--divider-hitbox-padding, 4px) * -1);
    margin-bottom: calc(var(--divider-hitbox-padding, 4px) * -1);
    padding-top: var(--divider-hitbox-padding, 4px);
    padding-bottom: var(--divider-hitbox-padding, 4px);
  }

  .divider-line {
    width: 100%;
    height: 100%;
    background-color: var(--divider-color, var(--u-neutral-200, #e0e0e0));
    transition: background-color 0.2s ease;
  }

  :host([dragging]) .divider-line {
    background-color: var(--divider-active-color, var(--u-blue-500, #3b82f6));
  }

  :host(:hover) .divider-line {
    background-color: var(--divider-hover-color, var(--u-neutral-300, #d4d4d4));
  }

  :host([dragging]:hover) .divider-line {
    background-color: var(--divider-active-color, var(--u-blue-500, #3b82f6));
  }
`;
