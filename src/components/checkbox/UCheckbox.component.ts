import { html } from "lit";
import { property } from "lit/decorators.js";

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
export class UCheckbox extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon,
  };

  /** 필수 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 읽기 전용 여부 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** 유효하지 않음 표시 */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 스타일 변형 */
  @property({ type: String, reflect: true }) variant: CheckboxVariant = "filled";
  /** 체크박스 안쪽 컬러 */
  @property({ type: String, reflect: true }) color: CheckboxColor = "blue";
  /** 불확정 상태 */
  @property({ type: Boolean, reflect: true }) indeterminate: boolean = false;
  /** 체크 여부 */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;
  /** 컴포넌트 하단 설명 텍스트 */
  @property({ type: String }) description?: string;
  
  /** 폼 제출 시 전송 이름 */
  @property({ type: String }) name?: string;
  /** 폼 제출 시 전송 값 */
  @property({ type: String }) value?: string;

  render() {
    return html`
      <label class="wrapper">
        <input 
          type="checkbox"
          ?checked=${this.checked}
          ?indeterminate=${this.indeterminate}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
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

  /** 유효성 검사 */
  protected validate(): boolean {
    if (this.required && !this.checked) {
      this.invalid = true;
      return false;
    }
    this.invalid = false;
    return true;
  }

  /** 기존 이벤트를 대체하여 change 이벤트 발생 */
  private handleInputChange = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.readonly || this.disabled) {
      return;
    }

    const input = e.target as HTMLInputElement;
    this.indeterminate = false;
    this.checked = input.checked;
    this.validate();
    this.emit('u-change');
  }
}
