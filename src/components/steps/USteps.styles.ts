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

  /* 세로로 접힘(line 이 자기 폭에 들어가지 않을 때) — 단계마다 한 줄, 연결선은 표식 가운데 아래로 */
  .list.folded {
    flex-direction: column;
    align-items: flex-start;
  }
  .list.folded .step {
    white-space: normal;
  }
  .list.folded .connector {
    flex: none;
    min-width: 0;
    width: 1.5px;
    height: var(--u-space-sm, 8px);
    margin: 2px 0 2px calc(var(--steps-marker-size, 18px) / 2 - 0.75px);
  }

  /* 건너뜀 — 지나갔지만 한 일이 없다: 점선 고리, 이름은 물러선다 */
  .step[data-status="skipped"] {
    color: var(--u-txt-color-weaker, #757575);
  }
  .step[data-status="skipped"] .marker {
    border-style: dashed;
  }

  /* ── 막대(appearance="bars") — 단계마다 칸을 고르게, 막대 아래 이름과 보조 문구 ── */
  :host([appearance="bars"]) .base {
    align-items: flex-start;
  }
  :host([appearance="bars"]) .list {
    display: grid;
    align-items: start;
    gap: var(--u-space-sm, 8px);
  }
  :host([appearance="bars"]) .step {
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    min-width: 0;
    white-space: normal;
  }
  :host([appearance="bars"]) .marker {
    width: auto;
    height: var(--steps-bar-height, 6px);
    margin-bottom: var(--u-space-xs, 6px);
    border: 0;
    border-radius: var(--u-radius-pill, 9999px);
    background: var(--u-border-color, #E0E0E0);
  }
  :host([appearance="bars"]) .step[data-status="complete"] .marker,
  :host([appearance="bars"]) .step[data-status="current"] .marker {
    border: 0;
    background: var(--steps-bar-color, var(--u-primary-color, #1976D2));
  }
  :host([appearance="bars"]) .step[data-status="hold"] .marker {
    border: 0;
    background: var(--u-warning-color, #FDD835);
  }
  :host([appearance="bars"]) .step[data-status="skipped"] .marker {
    border: 0;
    background: var(--u-border-color, #E0E0E0);
  }
  :host([appearance="bars"]) .title {
    font-size: var(--u-text-body-size, 14px);
    color: var(--u-txt-color, #212121);
  }
  :host([appearance="bars"]) .step[data-status="upcoming"] .title,
  :host([appearance="bars"]) .step[data-status="skipped"] .title {
    color: var(--u-txt-color-weak, #616161);
  }
  :host([appearance="bars"]) .description {
    font-variant-numeric: tabular-nums;
  }

  /* ── 압축(appearance="compact") — 단계마다 작은 칸, 옆에 지금 단계 이름 하나 ── */
  :host([appearance="compact"]) .base {
    gap: var(--u-space-sm, 8px);
  }
  :host([appearance="compact"]) .list {
    flex: none;
    gap: var(--u-space-3xs, 2px);
  }
  :host([appearance="compact"]) .step {
    position: relative;
  }
  :host([appearance="compact"]) .label,
  :host([appearance="compact"]) .title,
  :host([appearance="compact"]) .description {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  :host([appearance="compact"]) .marker {
    width: var(--steps-segment-width, 0.875rem);
    height: var(--steps-bar-height, 6px);
    border: 0;
    border-radius: var(--u-radius-sm, 3px);
    background: var(--u-border-color, #E0E0E0);
  }
  :host([appearance="compact"]) .step[data-status="complete"] .marker {
    border: 0;
    background: var(--steps-connector-done-color, var(--u-txt-color, #212121));
  }
  :host([appearance="compact"]) .step[data-status="current"] .marker {
    border: 0;
    background: var(--steps-current-color, var(--steps-bar-color, var(--u-primary-color, #1976D2)));
  }
  :host([appearance="compact"]) .step[data-status="hold"] .marker {
    border: 0;
    background: var(--u-warning-color, #FDD835);
  }
  :host([appearance="compact"]) .step[data-status="skipped"] .marker {
    border: 0;
    background: repeating-linear-gradient(90deg, var(--u-border-color, #E0E0E0) 0 0.125rem, transparent 0.125rem 0.25rem);
  }
  .summary {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--u-txt-color-weak, #616161);
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
