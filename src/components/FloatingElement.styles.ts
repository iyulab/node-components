import { css } from "lit";

export const styles = css`
  :host {
    position: absolute;
    z-index: 1000;
    top: 0;
    left: 0;
    width: max-content;

    opacity: 0;
    pointer-events: none;
  }
  :host([visible]) {
    opacity: 1;
    pointer-events: auto;
  }

  :host([strategy="absolute"]) {
    position: absolute;
  }
  :host([strategy="fixed"]) {
    position: fixed;
  }
`;