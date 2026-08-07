import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    flex-direction: row;
    align-items: stretch;
    /* ★밀도 스위치 진입점 — ::slotted 자식이 font-size: inherit 로 이 값을 따라온다. */
    font-size: var(--u-density, 14px);
  }

  :host([vertical]) {
    flex-direction: column;
  }

  ::slotted(u-button),
  ::slotted(u-icon-button) {
    font-size: inherit;
  }

  /* hover/focus 시 border 겹침 위로 올리기 */
  ::slotted(u-button:hover),
  ::slotted(u-button:focus-within),
  ::slotted(u-icon-button:hover),
  ::slotted(u-icon-button:focus-within) {
    z-index: 1;
  }

  :host([variant="ghost"]),
  :host([variant="link"]) {
    gap: var(--u-space-3xs, 2px);
  }
`;
