import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    flex-direction: column;
    gap: 0.5em;
    font-size: inherit;
    font-family: var(--u-font-base);
    color: var(--u-txt-color);
  }
  :host([disabled]) {
    opacity: 0.6;
    pointer-events: none;
  }
  :host([readonly]) {
    pointer-events: none;
  }

  /* 헤더 */
  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.25em;
    font-size: 0.8em;
    user-select: none;
  }
  .header .required {
    color: var(--u-red-600);
    margin-right: 0.25em;
  }
  .header .label {
    font-weight: 500;
    line-height: 1.25;
  }

  /* Invalid 상태 */
  :host([invalid]) .header .label {
    color: var(--u-red-600);
  }
  :host([invalid]:not([type="button"])) .options {
    border: 1px solid var(--u-red-600);
    border-radius: 0.375em;
    padding: 0.5em;
  }

  /* 옵션 컨테이너 레이아웃 */
  .options {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }
  :host([orientation="horizontal"]) .options {
    flex-direction: row;
    gap: 1em;
  }

  /* 설명 텍스트 */
  .description {
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    line-height: 1.3;
  }
  :host([invalid]) .description {
    color: var(--u-red-600);
  }

  /* ===== Default 타입: 라디오 원형 표시 ===== */

  ::slotted(u-option) {
    cursor: pointer;
    user-select: none;
  }

  /* === Outlined variant: 마커 CSS 변수 오버라이드 === */
  :host([variant="outlined"]) {
    --u-option-marker-active-bg-color: transparent;
    --u-option-marker-dot-color: var(--u-blue-600);
  }

  /* ===== Button 타입 ===== */

  :host([type="button"]) .options {
    gap: 0;
  }
  :host([type="button"][orientation="horizontal"]) .options {
    flex-direction: row;
    gap: 0;
  }

  /* 버튼 타입: 마커 숨기기, 버튼 스타일 적용 */
  :host([type="button"]) {
    --u-option-marker-display: none;
  }
  :host([type="button"]) ::slotted(u-option) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5em 1em;
    border: 1px solid var(--u-input-border-color);
    border-radius: 0;
    background-color: var(--u-input-bg-color);
    color: var(--u-txt-color);
    font-size: inherit;
    font-family: inherit;
    line-height: 1.5;
    transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
    user-select: none;
  }
  :host([type="button"]) ::slotted(u-option:not([disabled]):hover) {
    border-color: var(--u-input-border-color-hover);
    background-color: var(--u-neutral-100);
  }

  /* Button - Filled variant 선택 시 */
  :host([type="button"][variant="filled"]) ::slotted(u-option[selected]) {
    border-color: var(--u-blue-600);
    background-color: var(--u-blue-600);
    color: var(--u-neutral-0);
  }

  /* Button - Outlined variant 선택 시 */
  :host([type="button"][variant="outlined"]) ::slotted(u-option[selected]) {
    border-color: var(--u-blue-600);
    background-color: transparent;
    color: var(--u-blue-600);
  }

  /* Button 포커스 링 */
  :host([type="button"]) ::slotted(u-option:focus-visible) {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
    z-index: 1;
  }

  /* === Button - Horizontal 배치 === */
  :host([type="button"][orientation="horizontal"]) ::slotted(u-option:first-child) {
    border-radius: 0.375em 0 0 0.375em;
  }
  :host([type="button"][orientation="horizontal"]) ::slotted(u-option:last-child) {
    border-radius: 0 0.375em 0.375em 0;
  }
  :host([type="button"][orientation="horizontal"]) ::slotted(u-option:not(:first-child)) {
    margin-left: -1px;
  }
  :host([type="button"][orientation="horizontal"]) ::slotted(u-option:only-child) {
    border-radius: 0.375em;
    margin-left: 0;
  }

  /* === Button - Vertical 배치 === */
  :host([type="button"][orientation="vertical"]) ::slotted(u-option) {
    width: 100%;
    justify-content: center;
  }
  :host([type="button"][orientation="vertical"]) ::slotted(u-option:first-child) {
    border-radius: 0.375em 0.375em 0 0;
  }
  :host([type="button"][orientation="vertical"]) ::slotted(u-option:last-child) {
    border-radius: 0 0 0.375em 0.375em;
  }
  :host([type="button"][orientation="vertical"]) ::slotted(u-option:not(:first-child)) {
    margin-top: -1px;
  }
  :host([type="button"][orientation="vertical"]) ::slotted(u-option:only-child) {
    border-radius: 0.375em;
    margin-top: 0;
  }
`;
