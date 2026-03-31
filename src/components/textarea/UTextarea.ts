import { html, PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import '../field/UField.js';

import { UFormControlElement } from "../UFormControlElement.js";
import type { AutoCapitalize, EnterKeyHint, InputModeOption } from "../input/UInput.js";
import { styles } from "./UTextarea.styles.js";

type TextareaVariant = 'outlined' | 'filled' | 'underlined' | 'borderless';
type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both' | 'auto';

/**
 * 여러 줄의 텍스트 입력을 지원하는 텍스트에어리어 컴포넌트입니다.
 *
 * @csspart field - u-field 요소
 * @csspart container - 텍스트에어리어를 감싸는 요소
 * @csspart textarea - 실제 텍스트에어리어 요소
 * @csspart counter - 글자 수 표시 영역
 * 
 * @event input - 입력값이 변경될 때 발생
 * @event change - 값이 확정됐을 때 발생
 */
@customElement('u-textarea')
export class UTextarea extends UFormControlElement<string> {
  static styles = [ super.styles, styles ];

  /** 스타일 변형 */
  @property({ type: String, reflect: true }) variant: TextareaVariant = 'outlined';
  /** 리사이즈 모드 */
  @property({ type: String, reflect: true }) resize: TextareaResize = 'auto';
  /** 최소 행 수 */
  @property({ type: Number, attribute: 'min-rows' }) minRows?: number;
  /** 최대 행 수 */
  @property({ type: Number, attribute: 'max-rows' }) maxRows?: number;
  /** 글자수 표시 여부 */
  @property({ type: Boolean, reflect: true }) counter: boolean = false;
  /** 최소 길이 */
  @property({ type: Number }) minlength?: number;
  /** 최대 길이 */
  @property({ type: Number }) maxlength?: number;
  /** 입력 방향 정보 */
  @property({ type: String }) dirname?: string;
  /** 모바일 가상 키보드 유형 */
  @property({ type: String }) inputmode?: InputModeOption;
  /** 모바일 엔터 키 레이블 */
  @property({ type: String }) enterkeyhint?: EnterKeyHint;
  /** 맞춤법 검사 여부 */
  @property({ type: Boolean }) spellcheck: boolean = false;
  /** 자동 포커스 여부 */
  @property({ type: Boolean }) autofocus: boolean = false;
  /** 자동 교정 기능 설정 (iOS) */
  @property({ type: Boolean }) autocorrect: boolean = false;
  /** 대문자 자동 변환 */
  @property({ type: String }) autocapitalize: AutoCapitalize = 'off';
  /** 자동 완성 기능 설정 */
  @property({ type: String }) autocomplete?: AutoFill;
  /** placeholder 텍스트 */
  @property({ type: String }) placeholder?: string;

  @query('textarea', true) textareaEl?: HTMLTextAreaElement;

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (this.resize === 'auto' && (['value','minRows','maxRows','resize']
      .some(k => changedProperties.has(k))
    )) {
      this.resizeTextarea();
    }
  }

  render() {
    return html`
      <u-field part="field"
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?invalid=${this.invalid}
        .label=${this.label}
        .description=${this.description}
        .validationMessage=${this.validationMessage}
      >
        <div class="container" part="container">
          <textarea part="textarea"
            scrollable
            ?required=${this.required}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            rows=${this.minRows || 1}
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
            placeholder=${ifDefined(this.placeholder)}
            name=${ifDefined(this.name)}
            .value=${live(this.value || '')}
            @input=${this.handleTextareaInput}
            @change=${this.handleTextareaChange}
          ></textarea>
        </div>

        <div class="counter" part="counter" ?hidden=${!this.counter}>
          ${this.value?.length}${this.maxlength ? ` / ${this.maxlength}` : ''}
        </div>
      </u-field>
    `;
  }

  public validate(): boolean {
    if (this.internals) {
      this.invalid = !this.internals.checkValidity();
    } else {
      this.invalid = !this.textareaEl?.checkValidity();
    }
    return !this.invalid;
  }

  public reset(): void {
    this.value = undefined;
    this.invalid = false;
  }

  private resizeTextarea(): void {
    const textarea = this.textareaEl;
    if (!textarea) return;

    const computed = getComputedStyle(textarea);
    const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5;
    const paddingY = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
    const borderY = parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
    const extra = paddingY + borderY;

    const minHeight = this.minRows
      ? lineHeight * this.minRows + extra
      : lineHeight + extra;
    const maxHeight = this.maxRows
      ? lineHeight * this.maxRows + extra
      : Infinity;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  private handleTextareaInput = (e: InputEvent) => {
    this.value = this.textareaEl?.value;
    this.relay(e);
  }

  private handleTextareaChange = (e: Event) => {
    this.value = this.textareaEl?.value;
    this.internals?.setFormValue(this.value || '');
    this.internals?.setValidity(
      this.textareaEl?.validity,
      this.textareaEl?.validationMessage,
      this.textareaEl
    )

    if (!this.novalidate) {
      this.validate();
    }
    this.relay(e);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-textarea': UTextarea;
  }
}
