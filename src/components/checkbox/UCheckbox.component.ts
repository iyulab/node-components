import { html } from "lit";
import { property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

import { UFormControlElement } from "../UFormControlElement.js";
import { UElement } from "../UElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { styles } from "./UCheckbox.styles.js";

export type CheckboxVariant = "filled" | "outline";
export type CheckboxColor = "blue" | "green" | "red" | "orange" | "teal" | "cyan" | "purple" | "pink" | "neutral";

/**
 * Checkbox 컴포넌트는 체크/해제 상태를 토글할 수 있는 입력 요소입니다.
 * indeterminate 상태도 지원하며, variant와 color로 스타일을 변경할 수 있습니다.
 *
 * @slot - 체크박스 옆에 표시할 라벨 텍스트를 넣을 수 있습니다.
 */
export class UCheckbox extends UFormControlElement<string> {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon,
  };

  /** 스타일 변형 */
  @property({ type: String, reflect: true }) variant: CheckboxVariant = "filled";
  /** 체크박스 안쪽 컬러 */
  @property({ type: String, reflect: true }) color: CheckboxColor = "blue";
  /** 불확정 상태 */
  @property({ type: Boolean, reflect: true }) indeterminate: boolean = false;
  /** 체크 여부 */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;

  render() {
    return html`
      <label class="wrapper">
        <input
          type="checkbox"
          ?disabled=${this.disabled || this.readonly}
          ?required=${this.required}
          .checked=${live(this.checked)}
          @change=${this.handleInputChange}
        />
        <span class="checkbox">
          <u-icon
            lib="internal"
            name=${this.indeterminate ? 'dash-lg' : 'check-lg'}
          ></u-icon>
        </span>
        <span class="label">
          <slot></slot>
          <span class="required" ?hidden=${!this.required}>*</span>
        </span>
      </label>
      
      <div class="description" ?hidden=${!this.description}>
        ${this.description}
      </div>
    `;
  }

  public validate(): boolean {
    if (this.internals) {
      this.invalid = !this.internals.reportValidity();
    } else {
      this.invalid = this.required && !this.checked;
    }
    return !this.invalid;
  }

  public reset(): void {
    this.checked = false;
    this.indeterminate = false;
    this.invalid = false;
  }

  /** 기존 이벤트 대체 */
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
    this.internals?.setValidity(
      input.validity,
      this.validationMessage || input.validationMessage,
      this.shadowRoot?.querySelector('.checkbox') || undefined
    );

    if (!this.novalidate) {
      this.validate();
    }
    this.dispatchEvent(new Event('change', { 
      bubbles: true,
      composed: true,
    }));
  }
}
