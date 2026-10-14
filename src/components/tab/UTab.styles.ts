import { css } from "lit";

export const styles = css`
  :host {
    flex-shrink: 0;
    position: relative;
    display: inline-flex;
    font-size: 0.9em;
    font-weight: 500;
    color: var(--u-txt-color-weak, #616161);
    white-space: nowrap;
    user-select: none;
    cursor: pointer;

    --tab-padding-block: 0.5em;
    --tab-padding-inline: 0.75em;
  }

  /* 여백은 내부 요소가 진다 — :host 에 두면 소비 앱 CSS 리셋에 지워진다. */
  .base {
    box-sizing: border-box;
    width: 100%;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    padding: var(--tab-padding-block) var(--tab-padding-inline);
    /* 호스트 하한(--u-target-size, 미설정 = 0). */
    min-height: var(--u-target-size, 0px);
    border-radius: inherit;
  }

  :host(:hover:not([disabled])) {
    color: var(--u-txt-color, #212121);
  }
  :host([disabled]) {
    color: var(--u-txt-color-disabled, #BDBDBD);
    cursor: not-allowed;
  }

  ::slotted([slot="prefix"]) {
    margin-right: 0.2em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.2em;
  }

  /* 링크 탭 — 탭처럼 보이고(글자 상속 · 밑줄 없음) 포커스 링은 안쪽에 그린다: 담는 띠가 가로로 스크롤하며 넘침을 자른다. */
  a.base {
    color: inherit;
    text-decoration: none;
    cursor: inherit;
  }
  a.base:focus-visible {
    outline-offset: -2px;
  }
  a.base:not([href]) {
    cursor: not-allowed;
  }

  /* 조용한 개수 — 레이블보다 작고 약한 표 숫자. 알약 면은 띠 위에서 개수를 레이블과 가른다. */
  .count {
    flex-shrink: 0;
    margin-left: 0.45em;
    min-width: 1.8em;
    padding: 0 0.5em;
    box-sizing: border-box;
    border-radius: var(--u-radius-pill, 9999px);
    background-color: var(--u-bg-color-raised, #FAFAFA);
    color: var(--u-txt-color-weak, #616161);
    font-size: var(--u-text-overline-size, 11px);
    line-height: calc(var(--u-text-overline-leading, 1.45) * 1em);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    text-align: center;
  }

  .remove-btn {
    flex-shrink: 0;
    margin-left: 0.2em;
    font-size: 0.75em;
    color: inherit;
    opacity: 0.5;
    transition: opacity var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .remove-btn:hover {
    opacity: 1;
  }
`;
