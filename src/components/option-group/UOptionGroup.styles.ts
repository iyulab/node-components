import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  /* 보이는 선택지가 없으면(검색이 다 걸렀거나 비었으면) 제목째 숨는다. */
  :host(:state(empty)) {
    display: none;
  }

  /* 제목은 선택지가 아니다 — 누를 수 없고 고를 수 없다. 글자는 오버라인 단, 가로 여백은 선택지(u-option)와 같다. */
  .label {
    padding: 0.5em 0.5em 0.25em;
    font-size: var(--u-text-overline-size, 11px);
    font-weight: var(--u-text-overline-weight, 700);
    line-height: var(--u-text-overline-leading, 1.45);
    letter-spacing: var(--u-text-overline-tracking, 0.06em);
    color: var(--u-txt-color-weak, #616161);
    cursor: default;
    user-select: none;
  }
  .label:empty {
    display: none;
  }

  .options {
    display: contents;
  }
`;
