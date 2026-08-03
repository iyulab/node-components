import { css } from "lit";

export const styles = css`
  :host {
    --slider-fill-color: var(--u-primary-color, #1976D2);
    --slider-track-color: var(--u-neutral-300, #E0E0E0);
    --slider-track-height: 6px;
    --slider-thumb-size: 18px;
    --slider-thumb-color: var(--slider-fill-color);
    --slider-thumb-border-color: var(--u-neutral-0, #FFFFFF);
    --slider-mark-size: 12px;
    --slider-mark-color: var(--u-neutral-0, #FFFFFF);
    --slider-mark-border-color: var(--u-neutral-400, #BDBDBD);
  }

  :host {
    display: block;
    width: 100%;
    color: var(--u-txt-color, #212121);
    font-size: inherit;
    font-family: var(--u-font-base);
  }

  /* 라이브러리가 **스스로 그리는 숫자**는 고정폭 자릿수로 낸다.
     둘 다 제자리에서 값이 바뀌는 자리라 비례폭이면 드래그 중 글자가 흔들린다.
     ★툴팁은 슬롯을 건너 상속으로 닿는다 — font-variant-numeric 은 상속 프로퍼티다. */
  [slot="label-aside"],
  u-tooltip[part="thumb-tooltip"] {
    font-variant-numeric: tabular-nums;
  }

  .container {
    position: relative;
    height: var(--slider-thumb-size);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
  }

  .track {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: var(--slider-track-height);
    border-radius: calc(var(--slider-track-height) / 2);
    background: var(--slider-track-color);
    overflow: visible;
  }

  .fill {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: inherit;
    background: var(--slider-fill-color);
  }

  .thumb {
    position: absolute;
    z-index: 1;
    top: 50%;
    transform: translate(-50%, -50%);
    outline: none;
  }

  .thumb-content {
    width: var(--slider-thumb-size);
    height: var(--slider-thumb-size);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--slider-thumb-border-color);
    border-radius: var(--u-radius-circle, 50%);
    background: var(--slider-thumb-color);
    box-shadow: var(--u-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.04));
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
  }
  .thumb:hover .thumb-content,
  .thumb:active .thumb-content {
    transform: scale(1.15);
    box-shadow: var(--u-shadow-md, 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05));
  }
  .thumb:focus-visible .thumb-content {
    box-shadow: 0 0 0 1px var(--slider-fill-color);
  }

  /* 슬롯에 커스텀 엘리먼트가 들어오면 기본 스타일 제거 */
  .thumb-content:has(::slotted(*)) {
    width: auto;
    height: auto;
    border: none;
    border-radius: var(--u-radius-none, 0);
    background: transparent;
    box-shadow: none;
  }

  .marks {
    position: absolute;
    z-index: 0;
    inset: 0;
    pointer-events: none;
  }

  .mark {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: var(--slider-mark-size);
    height: var(--slider-mark-size);
    border: 2px solid var(--slider-mark-border-color);
    border-radius: var(--u-radius-circle, 50%);
    background: var(--slider-mark-color);
  }

  .mark-labels {
    position: relative;
    margin-top: var(--u-space-md, 12px);
  }

  .mark-label {
    position: absolute;
    transform: translateX(-50%);
    font-size: 0.75em;
    color: var(--u-txt-color-weak, #757575);
    white-space: nowrap;
  }
`;
