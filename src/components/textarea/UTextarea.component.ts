import { html, PropertyValues } from "lit";
import { property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";

import { UElement } from "../UElement.js";
import type { AutoCapitalize, EnterKeyHint, InputModeOption } from "../input/UInput.component.js";
import { styles } from "./UTextarea.styles.js";

/** Textarea의 외형 변형 */
type TextareaVariant = 'outlined' | 'filled' | 'underlined' | 'borderless';
/** Textarea의 리사이즈 모드 */
type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both' | 'auto';

/**
 * Textarea 컴포넌트는 여러 줄의 텍스트 입력을 받는 필드입니다.
 * 라벨, 유효성 검사, 글자수 카운터 등의 기능을 제공합니다.
 */
export class UTextarea extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 읽기 전용 여부 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 유효성 검사 실패 상태 (외부 제어) */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 글자수 표시 여부 */
  @property({ type: Boolean, reflect: true }) counter: boolean = false;
  /** 외형 변형 */
  @property({ type: String, reflect: true }) variant: TextareaVariant = 'outlined';
  /** 리사이즈 모드 */
  @property({ type: String, reflect: true }) resize: TextareaResize = 'vertical';
  /** 입력 방향 정보 (dir 속성) */
  @property({ type: String }) dirname?: string;
  /** 모바일 가상 키보드 종류 */
  @property({ type: String }) inputmode?: InputModeOption;
  /** 모바일 엔터 키 라벨 */
  @property({ type: String }) enterkeyhint?: EnterKeyHint;
  /** 맞춤법 검사 여부 */
  @property({ type: Boolean }) spellcheck: boolean = false;
  /** 자동 포커스 여부 */
  @property({ type: Boolean }) autofocus: boolean = false;
  /** 자동 수정 기능 설정 (iOS) */
  @property({ type: Boolean }) autocorrect: boolean = false;
  /** 대문자 자동 변환 */
  @property({ type: String }) autocapitalize: AutoCapitalize = 'off';
  /** 자동 완성 기능 설정 */
  @property({ type: String }) autocomplete?: AutoFill;
  /** form 요소와의 연결 (form 속성) */
  @property({ type: String }) form?: string;
  /** 최소 길이 */
  @property({ type: Number }) minlength?: number;
  /** 최대 길이 */
  @property({ type: Number }) maxlength?: number;
  /** 최소 행 수 (resize: auto일 때 최소 높이로 사용) */
  @property({ type: Number }) minRows: number = 3;
  /** 최대 행 수 (resize: auto일 때 최대 높이로 사용) */
  @property({ type: Number }) maxRows?: number;
  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** placeholder 텍스트 */
  @property({ type: String }) placeholder?: string;
  /** 설명 텍스트 */
  @property({ type: String }) description?: string;
  /** 유효성 검사 실패 메시지 */
  @property({ type: String }) validationMessage?: string;
  /** name 속성 */
  @property({ type: String }) name?: string;
  /** 입력값 */
  @property({ type: String }) value: string = '';

  @query('textarea') textareaEl!: HTMLTextAreaElement;

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    if (this.resize === 'auto') {
      this.resizeHeight();
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('value') && this.textareaEl) {
      if (this.textareaEl.value !== this.value) {
        this.textareaEl.value = this.value;
      }
    }

    if (this.resize === 'auto' && (
      changedProperties.has('value') ||
      changedProperties.has('minRows') ||
      changedProperties.has('maxRows') ||
      changedProperties.has('resize')
    )) {
      this.resizeHeight();
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
        ?invalid=${this.invalid}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}>
        <textarea part="textarea"
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          rows=${this.minRows}
          minlength=${ifDefined(this.minlength)}
          maxlength=${ifDefined(this.maxlength)}
          dirname=${ifDefined(this.dirname)}
          spellcheck=${this.spellcheck}
          ?autofocus=${this.autofocus}
          ?autocorrect=${this.autocorrect}
          autocapitalize=${ifDefined(this.autocapitalize)}
          autocomplete=${ifDefined(this.autocomplete as any)}
          enterkeyhint=${ifDefined(this.enterkeyhint)}
          inputmode=${ifDefined(this.inputmode)}
          form=${ifDefined(this.form)}
          placeholder=${ifDefined(this.placeholder)}
          name=${ifDefined(this.name)}
          .value=${live(this.value)}
          @input=${this.handleTextareaInput}
          @change=${this.handleTextareaChange}
          @blur=${this.handleTextareaBlur}
        ></textarea>
      </div>

      <div class="footer">
        <div class="counter" ?hidden=${!this.counter}>
          ${this.value.length}${this.maxlength ? ` / ${this.maxlength}` : ''}
        </div>
        <div class="description" ?hidden=${!this.description}>
          ${this.description}
        </div>
        <div class="validation-message" ?hidden=${!this.invalid || !this.validationMessage}>
          ${this.validationMessage}
        </div>
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
    this.invalid = !this.textareaEl.validity.valid;
    if (this.invalid && !this.validationMessage) {
      this.validationMessage = this.textareaEl.validationMessage;
    }
    return !this.invalid;
  }

  /** resize: auto 모드에서 textarea 높이를 내용에 맞게 조절 */
  private resizeHeight(): void {
    const textarea = this.textareaEl;
    if (!textarea) return;

    const computed = getComputedStyle(textarea);
    const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5;
    const paddingY = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
    const borderY = parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
    const extra = paddingY + borderY;

    const minHeight = lineHeight * this.minRows + extra;
    const maxHeight = this.maxRows
      ? lineHeight * this.maxRows + extra
      : Infinity;

    // 높이를 초기화해서 scrollHeight를 정확하게 측정
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  private handleTextareaInput = (e: Event) => {
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.emit('u-input', { value: this.value });
  }

  private handleTextareaChange = (e: Event) => {
    const textarea = e.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.emit('u-change', { value: this.value });
  }

  private handleTextareaBlur = () => {
    this.validate();
  }
}
