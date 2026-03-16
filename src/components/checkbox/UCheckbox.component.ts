import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UCheckbox.styles.js";

/**
 * Checkbox 컴포넌트는 boolean 옵션을 선택하는데 사용됩니다.
 */
export class UCheckbox extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 체크 상태 */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;
  /** 부분 선택 상태 */
  @property({ type: Boolean, reflect: true }) indeterminate: boolean = false;
  /** 레이블 텍스트 */
  @property({ type: String }) label: string = '';
  /** 폼 값 */
  @property({ type: String }) value: string = '';
  /** 비활성화 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 필수 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 폼 이름 */
  @property({ type: String }) name: string = '';

  render() {
    return html`
      <label class="container" part="base">
        <input type="checkbox"
          .checked=${this.checked}
          .indeterminate=${this.indeterminate}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @change=${this.handleChange}
        />
        <span class="checkmark" part="checkmark">
          <svg class="icon check" viewBox="0 0 16 16" fill="none">
            <path d="M3.5 8L6.5 11L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg class="icon dash" viewBox="0 0 16 16" fill="none">
            <path d="M4 8H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="label" part="label" ?hidden=${!this.label}>${this.label}</span>
      </label>
    `;
  }

  private handleChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.checked = input.checked;
    this.indeterminate = false;
    this.emit('u-change', { checked: this.checked, value: this.value });
  }
}
