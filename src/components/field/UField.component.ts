import { html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UField.styles.js";

/**
 * Field 컴포넌트는 폼 컨트롤의 공통 레이아웃을 제공합니다.
 * 라벨, 필수 표시, 설명 텍스트, 유효성 검사 메시지 등을 감싸는 래퍼입니다.
 *
 * @slot - 기본 슬롯 (폼 컨트롤: input, select, textarea 등)
 * @slot aside - 헤더 우측 보조 영역 (값 표시, 카운터 등)
 */
export class UField extends UElement {
  static shadowRootOptions: ShadowRootInit = { ...UElement.shadowRootOptions, delegatesFocus: true };
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {};

  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 유효성 검사 실패 상태 */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** 컴포넌트 하단 설명 텍스트 */
  @property({ type: String }) description?: string;
  /** 유효성 검사 실패 시 표시할 메시지 */
  @property({ type: String }) validationMessage?: string;

  render() {
    return html`
      <div class="header" ?hidden=${!this.label}>
        <label class="label" @click=${this.handleLabelClick}>
          <span class="required" ?hidden=${!this.required}>*</span>
          ${this.label}
        </label>
        <slot name="label-aside"></slot>
      </div>

      <slot></slot>

      ${this.renderFooter()}
    `;
  }

  private renderFooter() {
    const message = this.invalid && this.validationMessage
      ? this.validationMessage
      : this.description;
    if (!message) return nothing;
    return html`<div class="footer">${message}</div>`;
  }

  /** 라벨 클릭 시 포커스 이동, 간단한 방법론을 사용합니다. */
  private handleLabelClick = () => {
    const target = this.querySelector<HTMLElement>(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
    );
    target?.focus();
  };
}
