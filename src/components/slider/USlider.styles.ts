import { css } from "lit";

export const styles = css`
  :host {
    --slider-color: var(--u-blue-600);
    --slider-track-color: var(--u-border-color-weak);
    --slider-thumb-color: var(--u-blue-600);
    --slider-thumb-border-color: #fff;
    --slider-thumb-size: 18px;
    --slider-track-height: 6px;
  }

  :host {
    display: block;
    font-size: inherit;
    font-family: var(--u-font-base);
    color: var(--u-txt-color);
  }

  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }
  :host([readonly]) .slider-container {
    pointer-events: none;
  }

  /* ── Header ── */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4em;
  }

  .label {
    font-size: 0.9em;
    font-weight: 500;
    color: var(--u-txt-color);
  }

  .required {
    color: var(--u-red-500);
    margin-left: 2px;
  }

  .value-display {
    font-size: 0.85em;
    color: var(--u-txt-color-weak);
    font-variant-numeric: tabular-nums;
  }

  .description {
    font-size: 0.8em;
    color: var(--u-txt-color-weak);
    margin-top: 0.6em;
  }

  /* ── Invalid 상태 ── */
  :host([invalid]) .label {
    color: var(--u-red-500);
  }
  :host([invalid]) .fill {
    background: var(--u-red-500);
  }
  :host([invalid]) .thumb {
    background: var(--u-red-500);
  }

  /* ── Slider Container ── */
  .slider-container {
    position: relative;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
  }

  :host([disabled]) .slider-container,
  :host([readonly]) .slider-container {
    cursor: default;
  }

  .slider-container[dragging] {
    cursor: grabbing;
  }

  :host([orientation="horizontal"]) .slider-container {
    height: var(--slider-thumb-size);
  }

  :host([orientation="vertical"]) .slider-container {
    width: var(--slider-thumb-size);
    height: 200px;
  }

  /* ── Track ── */
  .track {
    position: absolute;
    border-radius: calc(var(--slider-track-height) / 2);
    background: var(--slider-track-color);
    overflow: visible;
  }

  :host([orientation="horizontal"]) .track {
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: var(--slider-track-height);
  }

  :host([orientation="vertical"]) .track {
    bottom: 0;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: var(--slider-track-height);
  }

  /* ── Fill ── */
  .fill {
    position: absolute;
    border-radius: inherit;
    background: var(--slider-color);
  }

  :host([orientation="horizontal"]) .fill {
    top: 0;
    bottom: 0;
  }

  :host([orientation="vertical"]) .fill {
    left: 0;
    right: 0;
  }

  /* ── Thumb Container ── */
  .thumb-container {
    position: absolute;
    z-index: 1;
    outline: none;
  }

  :host([orientation="horizontal"]) .thumb-container {
    top: 50%;
    transform: translate(-50%, -50%);
  }

  :host([orientation="vertical"]) .thumb-container {
    left: 50%;
    transform: translate(-50%, 50%);
  }

  /* ── Thumb ── */
  .thumb {
    width: var(--slider-thumb-size);
    height: var(--slider-thumb-size);
    border-radius: 50%;
    background: var(--slider-thumb-color);
    border: 2px solid var(--slider-thumb-border-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host([disabled]) .thumb,
  :host([readonly]) .thumb {
    cursor: default;
  }

  .thumb-container[hover] .thumb,
  .thumb-container[active] .thumb {
    transform: scale(1.15);
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
  }

  .thumb-container:focus-visible .thumb {
    box-shadow:
      0 0 0 1px var(--slider-color),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }

  /* thumb 슬롯에 커스텀 엘리먼트가 들어오면 기본 스타일 제거 */
  .thumb:has(::slotted(*)) {
    background: transparent;
    border: none;
    box-shadow: none;
    border-radius: 0;
    width: auto;
    height: auto;
  }

  /* ── Marks ── */
  .marks {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .mark {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--u-bg-color, #fff);
    border: 2px solid var(--slider-track-color);
    box-sizing: border-box;
  }

  :host([orientation="horizontal"]) .mark {
    top: 50%;
    transform: translate(-50%, -50%);
  }

  :host([orientation="vertical"]) .mark {
    left: 50%;
    transform: translate(-50%, 50%);
  }

  .mark[in-range] {
    background: var(--slider-color);
    border-color: var(--slider-color);
  }

  /* ── Mark Labels ── */
  .mark-labels {
    position: relative;
    margin-top: 12px;
  }

  :host([orientation="vertical"]) .mark-labels {
    position: absolute;
    left: calc(var(--slider-thumb-size) + 8px);
    top: 0;
    bottom: 0;
    margin-top: 0;
  }

  .mark-label {
    position: absolute;
    font-size: 0.75em;
    color: var(--u-txt-color-weak);
    white-space: nowrap;
  }

  :host([orientation="horizontal"]) .mark-label {
    transform: translateX(-50%);
  }

  :host([orientation="vertical"]) .mark-label {
    transform: translateY(50%);
  }
`;
