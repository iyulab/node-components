import { html, PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";

import { BaseElement } from "../BaseElement.js";
import { Icon } from "../icon/Icon.js";
import { Tooltip } from "../tooltip/Tooltip.js";

import { styles } from "./Input.styles.js";

/** 
 * Supported input types for Input component
 * 
 * - Excludes: checkbox, radio, range, color, file, hidden, image, reset, submit, button
 */
type InputType = ('text' | 'password' | 'email' | 'tel' | 'url' | 'search' |
  'number' | 'date' | 'time' | 'datetime-local' | 'month' | 'week');

/**
 * Input 컴포넌트는 사용자 입력을 받는 텍스트 입력 필드입니다.
 * prefix, suffix 슬롯과 라벨, 도움말, 유효성 검사 등의 기능을 제공합니다.
 */
export class Input extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-icon': Icon,
    'u-tooltip': Tooltip,
  };

  @query('input') inputEl!: HTMLInputElement;

  /** 유효성 여부 */
  @state() isValid: boolean = true;
  /** 현재 표시할 유효성 검사 메시지 */
  @state() currentValidationMessage: string = '';
  /** password type인 경우 비밀번호 표시/숨김 상태 */
  @state() showPassword: boolean = false;

  /** input 요소의 type 속성 */
  @property({ type: String, reflect: true }) type: InputType = 'text';
  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 읽기 전용 여부 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 클리어 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) clearable: boolean = false;
  /** input 요소의 name 속성 */
  @property({ type: String }) name?: string;
  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** 라벨 도움말 (툴팁) */
  @property({ type: String }) help?: string;
  /** placeholder 텍스트 */
  @property({ type: String }) placeholder?: string;
  /** 컴포넌트 하단 설명 텍스트 */
  @property({ type: String }) description?: string;
  /** 최소 길이 */
  @property({ type: Number }) minlength?: number;
  /** 최대 길이 */
  @property({ type: Number }) maxlength?: number;
  /** 맞춤법 검사 여부 */
  @property({ type: Boolean }) spellcheck: boolean = false;
  /** autocomplete 속성 */
  @property({ type: String }) autocomplete?: string;
  /** 입력값 */
  @property({ type: String }) value: string = '';
  /** 유효성 검사 패턴 (정규식) */
  @property({ type: String }) pattern?: string;
  /** 유효성 검사 실패 시 표시할 메시지 */
  @property({ type: String }) validationMessage?: string;

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // value가 프로그램적으로 변경된 경우 input 요소와 동기화
    if (changedProperties.has('value') && this.inputEl) {
      if (this.inputEl.value !== this.value) {
        this.inputEl.value = this.value;
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
        
        <div class="helper" ?hidden=${!this.help}>
          <u-icon lib="internal" name="info-circle-fill"></u-icon>
          <u-tooltip distance="6" placement="right-end">
            ${this.help}
          </u-tooltip>
        </div>
      </div>
      
      <div class="container"
        ?invalid=${!this.isValid}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}>

        <slot name="prefix"></slot>
        
        <input part="input"
          type=${this.type === 'password' && this.showPassword ? 'text' : this.type}
          name=${ifDefined(this.name)}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          minlength=${ifDefined(this.minlength)}
          maxlength=${ifDefined(this.maxlength)}
          spellcheck=${this.spellcheck}
          autocomplete=${ifDefined(this.autocomplete as any)}
          placeholder=${ifDefined(this.placeholder)}
          pattern=${ifDefined(this.pattern)}
          .value=${live(this.value)}
          @input=${this.handleInput}
          @change=${this.handleInputChange}
          @blur=${this.handleInputBlur}
        />
        
        <slot name="suffix"></slot>
        
        <u-icon class="suffix icon" tabindex="0"
          ?hidden=${this.type !== 'password' || this.disabled || this.readonly}  
          lib="internal"
          name=${this.showPassword ? 'eye-slash' : 'eye'}
          @click=${this.handlePasswordTogglerClick}
        ></u-icon>
        <u-icon class="suffix icon" tabindex="0"
          ?hidden=${!this.clearable || this.disabled || this.readonly}
          lib="internal"
          name="x-lg"
          @click=${this.handleClearButtonClick}
        ></u-icon>
      </div>

      <div class="validation-message" ?hidden=${!this.currentValidationMessage}>
        ${this.currentValidationMessage}
      </div>

      <div class="description" ?hidden=${!this.description}>
        ${this.description}
      </div>
    `;
  }

  /** 입력 필드에 포커스를 설정합니다. */
  public focus(): void {
    this.inputEl?.focus();
  }

  /** 입력 필드의 포커스를 해제합니다. */
  public blur(): void {
    this.inputEl?.blur();
  }

  /** 입력값을 초기화합니다. */
  public clear(): void {
    this.value = '';
    this.isValid = true;
    this.currentValidationMessage = '';
    this.focus();
  }

  /** 유효성 검사를 수행합니다. */
  public validate(): boolean {
    if (!this.inputEl) return true;

    // 브라우저 내장 유효성 검사 사용
    const validity = this.inputEl.validity;
    this.isValid = validity.valid;
    if (this.isValid) {
      this.currentValidationMessage = '';
    } else {
      this.currentValidationMessage = validity.patternMismatch
        ? (this.validationMessage || this.inputEl.validationMessage)
        : this.inputEl.validationMessage;
    }

    return this.isValid;
  }

  /** input 이벤트 핸들러 */
  private handleInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.emit('u-input', { value: this.value });
  }

  /** change 이벤트 핸들러 */
  private handleInputChange = (e: InputEvent) => {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.emit('u-change', { value: this.value });
  }

  /** blur 이벤트 핸들러 */
  private handleInputBlur = (_: FocusEvent) => {
    this.validate();
  }

  /** 비밀번호 표시/숨김 토글 핸들러 */
  private handlePasswordTogglerClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.showPassword = !this.showPassword;
    this.focus();
  }

  /** 클리어 버튼 클릭 핸들러 */
  private handleClearButtonClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.clear();
  }
}