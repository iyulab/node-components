import { css } from "lit";

export const styles = css`
  :host {
    --divider-size: 1px;
    --divider-color: var(--u-neutral-300, #E0E0E0);
    --divider-spacing: 8px;
  }

  /*
   * 간격은 **내부 요소의 padding** 이 진다 — :host 에 margin 으로 두면 소비 앱의
   * CSS 리셋(전역 셀렉터로 margin 을 0 으로 두는 관행)에 에러 없이 지워진다.
   *
   * ★ 여기만 다른 8개 컴포넌트와 방식이 갈린다. 구분선의 간격은 *형제를 밀어내는* 것이라
   *   내부 요소의 margin 으로 옮기면 호스트 박스 안에서 상쇄되어 아무것도 밀지 못한다.
   *   그러나 **padding** 은 호스트 박스 자체를 키우므로 형제는 종전대로 밀려나고,
   *   padding 은 섀도 내부에 있어 문서 리셋이 닿지 못한다.
   */
  :host {
    display: block;
  }

  .base {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding: var(--divider-spacing) 0;
  }

  /* variant */
  :host([variant="dashed"]) .line {
    border-top-style: dashed;
  }
  :host([variant="dotted"]) .line {
    border-top-style: dotted;
  }

  /* align */
  :host([align="start"]) .line:first-child {
    flex: 0 0 24px;
  }
  :host([align="end"]) .line:last-child {
    flex: 0 0 24px;
  }

  :host([has-label]) .label {
    display: inline-flex;
    align-items: center;
  }

  /* 구분 선 */
  .line {
    flex: 1;
    border-top: var(--divider-size) solid var(--divider-color);
  }

  /* 슬롯 콘텐츠 */
  .label {
    display: none;
    padding: 0 var(--u-space-md, 12px);
    color: var(--u-txt-color-weak, #9E9E9E);
    font-size: 0.85em;
    white-space: nowrap;
    user-select: none;
  }

  /* vertical */
  :host([vertical]) {
    display: inline-block;
    height: auto;
    min-height: 1em;
    align-self: stretch;
  }

  :host([vertical]) .base {
    flex-direction: column;
    padding: 0 var(--divider-spacing);
    height: 100%;
  }

  :host([vertical]) .line {
    flex: 1;
    min-height: 8px;
    border-top: none;
    border-left: var(--divider-size) solid var(--divider-color);
  }

  :host([vertical][variant="dashed"]) .line {
    border-left-style: dashed;
  }
  :host([vertical][variant="dotted"]) .line {
    border-left-style: dotted;
  }

  :host([vertical][align="start"]) .line:first-child {
    flex: 0 0 12px;
  }
  :host([vertical][align="start"]) .line:last-child {
    flex: 1;
  }
  :host([vertical][align="end"]) .line:first-child {
    flex: 1;
  }
  :host([vertical][align="end"]) .line:last-child {
    flex: 0 0 12px;
  }

  :host([vertical]) .label {
    padding: var(--u-space-md, 12px) 0;
  }
`;
