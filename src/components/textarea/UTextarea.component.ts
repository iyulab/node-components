import { html, PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";

import { UElement } from "../UElement.js";
import { styles } from "./UTextarea.styles.js";

/**
 * Textarea 컴포넌트는 여러 줄의 텍스트 입력을 받는 필드입니다.
 * 라벨, 유효성 검사, 글자수 카운터 등의 기능을 제공합니다.
 */
export class UTextarea extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  @query('textarea') textareaEl!: HTMLTextAreaElement;

  @state() isValid: boolean = true;
  @state() currentValidationMessage: string = '';

  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** name 속성 */
  @property({ type: String }) name?: string;
  /** placeholder 텍스트 */
  @property({ type: String }) placeholder?: string;
  /** 설명 텍스트 */
  @property({ type: String }) description?: string;
  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 읽기 전용 여부 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 입력값 */
  @property({ type: String }) value: string = '';
  /** 최소 길이 */
  @property({ type: Number }) minlength?: number;
  /** 최대 길이 */
  @property({ type: Number }) maxlength?: number;
  /** 행 수 */
  @property({ type: Number }) rows: number = 3;
  /** 맞춤법 검사 여부 */
  @property({ type: Boolean }) spellcheck: boolean = false;
  /** 글자수 표시 여부 */
  @property({ type: Boolean, reflect: true }) counter: boolean = false;
  /** 유효성 검사 실패 메시지 */
  @property({ type: String }) validationMessage?: string;

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('value') && this.textareaEl) {
      if (this.textareaEl.value !== this.value) {
        this.textareaEl.value = this.value;
      }
    }
  }

  render() {
    return html`
      <div class="header" ?hidden=${!this.label}>
        <span class="required" ?hidden=${!this.required}>*</span>
        <label class="label" @click=${this.focus}>
          ${this.label}
        </label>
      </div>

      <div class="container"
        ?invalid=${!this.isValid}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}>
        <textarea part="textarea"
          name=${ifDefined(this.name)}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          rows=${this.rows}
          minlength=${ifDefined(this.minlength)}
          maxlength=${ifDefined(this.maxlength)}
          spellcheck=${this.spellcheck}
          placeholder=${ifDefined(this.placeholder)}
          .value=${live(this.value)}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @blur=${this.handleBlur}
        ></textarea>
      </div>

      <div class="validation-message" ?hidden=${!this.currentValidationMessage}>
        ${this.currentValidationMessage}
      </div>

      <div class="description" ?hidden=${!this.description}>
        ${this.description}
      </div>

      <div class="counter" ?hidden=${!this.counter}>
        ${this.value.length}${this.maxlength ? ` / ${this.maxlength}` : ''}
      </div>
    `;
  }

  public focus(): void {
    this.textareaEl?.focus();
  }

  public blur(): void {
    this.textareaEl?.blur();
  }

  public validate(): boolean {
    if (!this.textareaEl) return true;
    const validity = this.textareaEl.validity;
    this.isValid = validity.valid;
    this.currentValidationMessage = this.isValid
      ? ''
      : (this.validationMessage || this.textareaEl.validationMessage);
    return this.isValid;
  }

  private handleInput = (e: Event) => {
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.emit('u-input', { value: this.value });
  }

  private handleChange = (e: Event) => {
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.emit('u-change', { value: this.value });
  }

  private handleBlur = () => {
    this.validate();
  }
}
