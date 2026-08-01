import { css } from "lit";

export const styles = css`
  :host {
    --checkbox-fill-color: var(--u-primary-color);
    --checkbox-color: inherit;
    --checkbox-border-color: var(--u-input-border-color);
    --checkbox-background-color: var(--u-input-bg-color);
  }

  :host {
    display: inline-flex;
    flex-direction: column;
    color: var(--u-txt-color);
    font-size: inherit;
    font-family: var(--u-font-base);
    user-select: none;
    cursor: pointer;
  }

  /* === 상태 스타일 === */
  :host([disabled]) {
    opacity: 0.6;
    cursor: not-allowed;
  }
  :host([readonly]) {
    cursor: default;
  }
  :host([invalid]) {
    --checkbox-border-color: var(--u-danger-color);
  }
  :host([invalid]) .footer {
    color: var(--u-danger-color);
  }
  :host([checked]) .checkbox u-icon,
  :host([indeterminate]) .checkbox u-icon {
    transform: scale(1);
  }
  :host(:not([disabled]):not([readonly]):hover) {
    --checkbox-border-color: var(--u-input-border-color-hover);
  }

  /* === Variant: filled - 배경 채움 === */
  :host([variant="filled"][checked]),
  :host([variant="filled"][indeterminate]) {
    --checkbox-color: var(--u-neutral-100);
    --checkbox-border-color: var(--checkbox-fill-color);
    --checkbox-background-color: var(--checkbox-fill-color);
  }

  /* === Variant: outline - 테두리만 === */
  :host([variant="outline"][checked]),
  :host([variant="outline"][indeterminate]) {
    --checkbox-color: var(--checkbox-fill-color);
    --checkbox-border-color: var(--checkbox-fill-color);
    --checkbox-background-color: transparent;
  }

  /* ==========================================================================
     장식 축 — color= 는 채움색 훅 하나만 바꾼다. variant 규칙이 그것을 소비한다.
     기본값 blue 는 규칙이 없다 = 브랜드 훅(--u-primary-color)을 그대로 탄다.
     즉 blue 는 장식 축의 한 값이 아니라 "색을 지정하지 않음" 의 표기다.
     ========================================================================== */
  :host([color="green"]) {
    --checkbox-fill-color: var(--u-green-600);
  }
  :host([color="red"]) {
    --checkbox-fill-color: var(--u-red-600);
  }
  :host([color="orange"]) {
    --checkbox-fill-color: var(--u-orange-600);
  }
  :host([color="teal"]) {
    --checkbox-fill-color: var(--u-teal-600);
  }
  :host([color="cyan"]) {
    --checkbox-fill-color: var(--u-cyan-600);
  }
  :host([color="purple"]) {
    --checkbox-fill-color: var(--u-purple-600);
  }
  :host([color="pink"]) {
    --checkbox-fill-color: var(--u-pink-600);
  }
  :host([color="neutral"]) {
    --checkbox-fill-color: var(--u-neutral-600);
  }



  .wrapper {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.5em;
    cursor: inherit;
  }

  /* 네이티브 체크박스 */
  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  input:focus-visible ~ .checkbox {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }

  /* 체크박스 외형 */
  .checkbox {
    flex-shrink: 0;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.2em;
    height: 1.2em;
    color: var(--checkbox-color);
    border: 2px solid var(--checkbox-border-color);
    border-radius: 0.2em;
    background-color: var(--checkbox-background-color);
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  /* 체크박스 아이콘 */
  .checkbox u-icon {
    font-size: 0.85em;
    transform: scale(0);
    transition: transform 0.15s ease;
  }

  .label {
    font-size: 1em;
    line-height: 1.2;
  }

  .required {
    color: var(--u-danger-color);
    font-weight: 500;
  }

  .description {
    margin-top: 0.5em;
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    line-height: 1.2;
  }

  :host([invalid]) .description {
    color: var(--u-danger-color);
  }
`;
