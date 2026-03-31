import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isFocusable } from "tabbable";

import { UElement } from "../UElement.js";
import { styles } from "./UField.styles.js";

/**
 * 폼 컨트롤의 공통 레이아웃을 제공하는 필드 컴포넌트입니다.
 * 라벨, 필수 표시, 설명 텍스트, 유효성 검사 메시지를 포함합니다.
 *
 * @slot - 폼 컨트롤 (input, select, textarea 등)
 * @slot label-aside - 라벨 오른쪽 슬롯 영역 (숫자 표시, 알림 등)
 */
@customElement('u-field')
export class UField extends UElement {
  static styles = [super.styles, styles];

  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 유효성 검사 실패 상태 */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** 하단 설명 텍스트 */
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

  private handleLabelClick = () => {
    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
    const nodes = slot?.assignedElements({ flatten: true }) || [];
    for (const node of nodes) {
      if (isFocusable(node)) {
        (node as HTMLElement).focus();
        return;
      }
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-field': UField;
  }
}

