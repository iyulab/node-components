import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    /* 글리프는 밀도 단에 비례한다(기본 밀도 14px 에서 18px). */
    font-size: calc(var(--u-density, 14px) * 9 / 7);
  }

  u-icon-button {
    font-size: inherit;
  }
  u-icon-button::part(button) {
    padding: 0.2em;
  }

  :host([copied]) u-icon-button {
    color: var(--u-success-color-strong, #1B5E20);
  }

  /* 라벨 형태(아이콘+텍스트): 복사 완료 시 아이콘/텍스트를 성공색으로 강조 */
  :host([copied]) u-button {
    color: var(--u-success-color-strong, #1B5E20);
  }
`;
