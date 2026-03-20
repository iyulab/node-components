import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    flex-direction: row;
    align-items: stretch;
    font-size: 14px;
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
    gap: 2px;
  }
`;
