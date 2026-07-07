import { html, PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import '../icon/UIcon.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { Locale } from "../../utilities/Locale.js";
import { styles } from "./UCheckbox.styles.js";

export type CheckboxVariant = "filled" | "outline";
export type CheckboxColor = "blue" | "green" | "red" | "orange" | "teal" | "cyan" | "purple" | "pink" | "neutral";

/**
 * 선택/해제 상태를 토글하는 체크박스 컴포넌트입니다.
 * indeterminate 상태도 지원합니다.
 *
 * @slot - 체크박스 옆에 표시할 라벨 텍스트 (`label` attribute가 slot fallback으로 사용됨)
 * 
 * @csspart wrapper - 체크박스 전체 래퍼
 * @csspart input - 실제 체크박스 input 요소
 * @csspart checkbox - 체크박스 시각 요소
 * @csspart label - 라벨 텍스트 요소
 * @csspart description - 설명 텍스트 요소
 * 
 * @cssprop --checkbox-color - 체크 표시 색상 (outline variant)
 * @cssprop --checkbox-border-color - 체크박스 테두리 색상
 * @cssprop --checkbox-background-color - 체크박스 배경색 (filled variant)
 *
 * @event change - 체크 상태 변경 시 발생
 */
@customElement('u-checkbox')
export class UCheckbox extends UFormControlElement<string> {
  static styles = [ super.styles, styles ];

  /** 스타일 변형 */
  @property({ type: String, reflect: true }) variant: CheckboxVariant = "filled";
  /** 체크박스 강조 색상 */
  @property({ type: String, reflect: true }) color: CheckboxColor = "blue";
  /** 중간 상태 */
  @property({ type: Boolean, reflect: true }) indeterminate: boolean = false;
  /** 체크 여부 */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;

  @query('input', true) inputEl?: HTMLInputElement;

  protected shouldValidate(changed: PropertyValues): boolean {
    return super.shouldValidate(changed) || changed.has('checked');
  }

  render() {
    return html`
      <label class="wrapper" part="wrapper">
        <input part="input"
          type="checkbox"
          ?disabled=${this.disabled || this.readonly}
          ?required=${this.required}
          .checked=${live(this.checked)}
          @change=${this.handleInputChange}
        />
        <span class="checkbox" part="checkbox">
          <u-icon
            lib="internal"
            name=${this.indeterminate ? 'minus' : 'check'}
          ></u-icon>
        </span>
        <span class="label" part="label">
          <slot>${this.label}</slot>
          <span class="required" ?hidden=${!this.required}>*</span>
        </span>
      </label>

      <div class="description" part="description" ?hidden=${!(this.invalid && this.validationMessage) && !this.description}>
        ${this.invalid && this.validationMessage ? this.validationMessage : this.description}
      </div>
    `;
  }

  protected setValidity(): void {
    const missing = !!this.inputEl?.validity.valueMissing;
    this.commit(
      missing ? { valueMissing: true } : {},
      missing ? Locale.getValue('valueMissing') : '',
      this.shadowRoot?.querySelector('.checkbox') as HTMLElement ?? undefined,
    );
  }

  public reset(): void {
    this.checked = false;
    this.indeterminate = false;
    this.invalid = false;
  }

  private handleInputChange = (e: Event) => {
    e.stopImmediatePropagation();

    if (this.readonly || this.disabled) {
      return;
    }

    const input = e.target as HTMLInputElement;
    this.indeterminate = false;
    this.checked = input.checked;
    this.internals?.setFormValue(
      this.checked
      ? this.value || String(this.checked)
      : String(this.checked));

    if (!this.novalidate) {
      this.validate();
    }
    this.relay(e);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-checkbox': UCheckbox;
  }
}

