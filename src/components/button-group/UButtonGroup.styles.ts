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

  /* font-size 상속 */
  ::slotted(u-button),
  ::slotted(u-icon-button) {
    font-size: inherit;
  }

  /* === 가로 방향 === */
  :host(:not([vertical])) ::slotted(u-button) {
    border-radius: 0;
  }
  :host(:not([vertical])) ::slotted(u-button:first-child) {
    border-radius: 6px 0 0 6px;
  }
  :host(:not([vertical])) ::slotted(u-button:last-child) {
    border-radius: 0 6px 6px 0;
  }
  :host(:not([vertical])) ::slotted(u-button:only-child) {
    border-radius: 6px;
  }

  /* === 세로 방향 === */
  :host([vertical]) ::slotted(u-button) {
    border-radius: 0;
  }
  :host([vertical]) ::slotted(u-button:first-child) {
    border-radius: 6px 6px 0 0;
  }
  :host([vertical]) ::slotted(u-button:last-child) {
    border-radius: 0 0 6px 6px;
  }
  :host([vertical]) ::slotted(u-button:only-child) {
    border-radius: 6px;
  }

  /* === outlined/surface: border 겹침 방지 + hover z-index === */
  :host([variant="outlined"]:not([vertical])) ::slotted(u-button + u-button),
  :host([variant="outlined"]:not([vertical])) ::slotted(u-icon-button + u-icon-button),
  :host([variant="outlined"]:not([vertical])) ::slotted(u-button + u-icon-button),
  :host([variant="outlined"]:not([vertical])) ::slotted(u-icon-button + u-button),
  :host([variant="surface"]:not([vertical])) ::slotted(u-button + u-button),
  :host([variant="surface"]:not([vertical])) ::slotted(u-icon-button + u-icon-button),
  :host([variant="surface"]:not([vertical])) ::slotted(u-button + u-icon-button),
  :host([variant="surface"]:not([vertical])) ::slotted(u-icon-button + u-button) {
    margin-left: -1px;
  }
  :host([variant="outlined"][vertical]) ::slotted(u-button + u-button),
  :host([variant="outlined"][vertical]) ::slotted(u-icon-button + u-icon-button),
  :host([variant="outlined"][vertical]) ::slotted(u-button + u-icon-button),
  :host([variant="outlined"][vertical]) ::slotted(u-icon-button + u-button),
  :host([variant="surface"][vertical]) ::slotted(u-button + u-button),
  :host([variant="surface"][vertical]) ::slotted(u-icon-button + u-icon-button),
  :host([variant="surface"][vertical]) ::slotted(u-button + u-icon-button),
  :host([variant="surface"][vertical]) ::slotted(u-icon-button + u-button) {
    margin-top: -1px;
  }
  :host([variant="outlined"]) ::slotted(u-button:hover),
  :host([variant="outlined"]) ::slotted(u-button:focus-within),
  :host([variant="outlined"]) ::slotted(u-icon-button:hover),
  :host([variant="outlined"]) ::slotted(u-icon-button:focus-within),
  :host([variant="surface"]) ::slotted(u-button:hover),
  :host([variant="surface"]) ::slotted(u-button:focus-within),
  :host([variant="surface"]) ::slotted(u-icon-button:hover),
  :host([variant="surface"]) ::slotted(u-icon-button:focus-within) {
    z-index: 1;
  }

  /* === solid/filled: u-button은 border 제거, u-icon-button은 margin으로 겹침 === */
  :host([variant="solid"]:not([vertical])) ::slotted(u-button),
  :host([variant="filled"]:not([vertical])) ::slotted(u-button) {
    border-right-width: 0;
  }
  :host([variant="solid"]:not([vertical])) ::slotted(u-button:last-child),
  :host([variant="filled"]:not([vertical])) ::slotted(u-button:last-child) {
    border-right-width: 1px;
  }
  :host([variant="solid"][vertical]) ::slotted(u-button),
  :host([variant="filled"][vertical]) ::slotted(u-button) {
    border-bottom-width: 0;
  }
  :host([variant="solid"][vertical]) ::slotted(u-button:last-child),
  :host([variant="filled"][vertical]) ::slotted(u-button:last-child) {
    border-bottom-width: 1px;
  }

  :host([variant="solid"]:not([vertical])) ::slotted(u-icon-button + u-icon-button),
  :host([variant="solid"]:not([vertical])) ::slotted(u-button + u-icon-button),
  :host([variant="solid"]:not([vertical])) ::slotted(u-icon-button + u-button),
  :host([variant="filled"]:not([vertical])) ::slotted(u-icon-button + u-icon-button),
  :host([variant="filled"]:not([vertical])) ::slotted(u-button + u-icon-button),
  :host([variant="filled"]:not([vertical])) ::slotted(u-icon-button + u-button) {
    margin-left: -1px;
  }
  :host([variant="solid"][vertical]) ::slotted(u-icon-button + u-icon-button),
  :host([variant="solid"][vertical]) ::slotted(u-button + u-icon-button),
  :host([variant="solid"][vertical]) ::slotted(u-icon-button + u-button),
  :host([variant="filled"][vertical]) ::slotted(u-icon-button + u-icon-button),
  :host([variant="filled"][vertical]) ::slotted(u-button + u-icon-button),
  :host([variant="filled"][vertical]) ::slotted(u-icon-button + u-button) {
    margin-top: -1px;
  }
  :host([variant="solid"]) ::slotted(u-icon-button:hover),
  :host([variant="solid"]) ::slotted(u-icon-button:focus-within),
  :host([variant="filled"]) ::slotted(u-icon-button:hover),
  :host([variant="filled"]) ::slotted(u-icon-button:focus-within) {
    z-index: 1;
  }

  /* === ghost/link: border가 transparent이므로 gap으로 분리 === */
  :host([variant="ghost"]),
  :host([variant="link"]) {
    gap: 2px;
  }
`;
