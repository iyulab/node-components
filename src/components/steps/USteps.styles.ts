import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    /* 위치 지정 — 안의 숨김 문구(절대 위치 · 1px)의 포함 블록이 이 요소가 된다. 없으면 포함 블록이 문서 전체라 호스트의
       overflow 감싸개를 건너뛰고 그 정적 위치에서 문서를 늘렸다(위치 지정되지 않은 스크롤 상자 안에서). */
    position: relative;
    font-size: var(--u-text-label-size, 13px);
    line-height: var(--u-text-label-leading, 1.5);
    color: var(--u-txt-color-weaker, #757575);
  }

  .base {
    display: flex;
    align-items: center;
    gap: var(--u-space-md, 12px);
  }

  .label {
    flex: none;
    width: var(--steps-label-width, 56px);
    font-weight: var(--u-text-label-weight, 600);
    color: var(--u-txt-color-weak, #616161);
  }

  .list {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .step {
    display: flex;
    align-items: center;
    gap: var(--u-space-xs, 6px);
    white-space: nowrap;
  }

  .marker {
    flex: none;
    display: inline-grid;
    place-items: center;
    box-sizing: border-box;
    width: var(--steps-marker-size, 18px);
    height: var(--steps-marker-size, 18px);
    border: 1.5px solid var(--u-border-color-strong, #BDBDBD);
    border-radius: var(--u-radius-circle, 50%);
    background: var(--u-bg-color, #FFFFFF);
  }

  .description {
    color: var(--u-txt-color-weaker, #757575);
  }

  /* 완료 — 지나온 색의 채운 체크, 이름은 한 단 물러선다 */
  .step[data-status="complete"] {
    color: var(--u-txt-color-weak, #616161);
  }
  .step[data-status="complete"] .marker {
    border-color: var(--steps-connector-done-color, var(--u-txt-color-weak, #616161));
    background: var(--steps-connector-done-color, var(--u-txt-color-weak, #616161));
    color: var(--u-bg-color, #FFFFFF);
  }

  /* 지금 — 굵은 고리, 이름은 본문 잉크 */
  .step[data-status="current"] {
    color: var(--u-txt-color, #212121);
    font-weight: var(--u-text-subtitle-weight, 600);
  }
  .step[data-status="current"] .marker {
    border: calc(var(--steps-marker-size, 18px) * 0.28) solid var(--u-txt-color, #212121);
  }

  /* 보류 — 경고 면이라 막힌 단계가 이웃보다 먼저 읽힌다 */
  .step[data-status="hold"] {
    color: var(--u-warning-color-strong, #8A4A00);
    font-weight: var(--u-text-subtitle-weight, 600);
  }
  .step[data-status="hold"] .marker {
    border-color: var(--u-warning-color-strong, #8A4A00);
    background: var(--u-warning-bg-color, #FFF59D);
  }

  .connector {
    flex: 1;
    min-width: 16px;
    height: 1.5px;
    margin: 0 var(--u-space-sm, 8px);
    background: var(--steps-connector-color, var(--u-border-color, #E0E0E0));
  }
  .connector.travelled {
    background: var(--steps-connector-done-color, var(--u-txt-color-weak, #616161));
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
`;
