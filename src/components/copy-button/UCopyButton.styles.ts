import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    font-size: 18px;
  }

  u-icon-button {
    font-size: inherit;
  }
  u-icon-button::part(button) {
    padding: 0.2em;
  }

  :host([copied]) u-icon-button {
    color: var(--u-green-500);
  }

  /* 라벨 형태(아이콘+텍스트): 복사 완료 시 아이콘/텍스트를 성공색으로 강조 */
  :host([copied]) u-button {
    color: var(--u-green-500);
  }
`;
