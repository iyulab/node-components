import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  :host([orientation="horizontal"]) {
    flex-direction: row;
  }
  :host([orientation="vertical"]) {
    flex-direction: column;
  }
`;