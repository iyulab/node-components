import { css } from "lit";

export const styles = css`
  :host {
    opacity: 0;
    transform: scale(0.98);
    transition: opacity 0.12s ease, transform 0.12s ease;
  }
  :host([visible]) {
    opacity: 1;        /* FloatingElement의 0.8을 덮어씀 */
    transform: scale(1);
  }
`;