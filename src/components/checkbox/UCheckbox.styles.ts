import { css } from "lit";

export const styles = css`
  :host {
    --checkbox-fill-color: var(--u-primary-color, #1976D2);
    --checkbox-color: inherit;
    --checkbox-border-color: var(--u-input-border-color, #E0E0E0);
    --checkbox-background-color: var(--u-input-bg-color, #FFFFFF);
  }

  :host {
    display: inline-flex;
    flex-direction: column;
    color: var(--u-txt-color, #212121);
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
    --checkbox-border-color: var(--u-danger-color, #D32F2F);
  }
  :host([invalid]) .footer {
    color: var(--u-danger-color-strong, #C62828);
  }
  :host([checked]) .checkbox u-icon,
  :host([indeterminate]) .checkbox u-icon {
    transform: scale(1);
  }
  :host(:not([disabled]):not([readonly]):hover) {
    --checkbox-border-color: var(--u-input-border-color-hover, #BDBDBD);
  }

  /* === Variant: filled - 배경 채움 === */
  :host([variant="filled"][checked]),
  :host([variant="filled"][indeterminate]) {
    --checkbox-color: var(--u-neutral-100, #F5F5F5);
    --checkbox-border-color: var(--checkbox-hue, var(--checkbox-fill-color));
    --checkbox-background-color: var(--checkbox-hue, var(--checkbox-fill-color));
  }

  /* === Variant: outline - 테두리만 === */
  :host([variant="outline"][checked]),
  :host([variant="outline"][indeterminate]) {
    --checkbox-color: var(--checkbox-hue, var(--checkbox-fill-color));
    --checkbox-border-color: var(--checkbox-hue, var(--checkbox-fill-color));
    --checkbox-background-color: transparent;
  }

  /* ==========================================================================
     장식 축 — color= 는 hue 슬롯만 채운다. variant 규칙이 폴백과 함께 읽는다.
     기본값 blue 는 규칙이 없다 = 슬롯이 비어 브랜드 훅(--checkbox-fill-color)을 탄다.
     u-tag 와 같은 방식이다 — 슬롯이 채워지면 color= 가 최종 권한을 갖는다.
     즉 blue 는 장식 축의 한 값이 아니라 "색을 지정하지 않음" 의 표기다.
     ========================================================================== */
  :host([color="green"]) {
    --checkbox-hue: var(--u-green-600, #43A047);
  }
  :host([color="red"]) {
    --checkbox-hue: var(--u-red-600, #E53935);
  }
  :host([color="orange"]) {
    --checkbox-hue: var(--u-orange-600, #FB8C00);
  }
  :host([color="teal"]) {
    --checkbox-hue: var(--u-teal-600, #00897B);
  }
  :host([color="cyan"]) {
    --checkbox-hue: var(--u-cyan-600, #00ACC1);
  }
  :host([color="purple"]) {
    --checkbox-hue: var(--u-purple-600, #8E24AA);
  }
  :host([color="pink"]) {
    --checkbox-hue: var(--u-pink-600, #D81B60);
  }
  :host([color="neutral"]) {
    --checkbox-hue: var(--u-neutral-600, #757575);
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
      0 0 0 1px var(--u-input-border-color-focus, #1976D2),
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
    color: var(--u-danger-color-strong, #C62828);
    font-weight: 500;
  }

  .description {
    margin-top: 0.5em;
    color: var(--u-txt-color-weak, #757575);
    font-size: 0.75em;
    line-height: 1.2;
  }

  :host([invalid]) .description {
    color: var(--u-danger-color-strong, #C62828);
  }
`;
