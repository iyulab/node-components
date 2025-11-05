import { html, nothing, PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";

import { UElement } from "../../internals/UElement.js";
import { Icon } from "../icon/Icon.js";
import { Tooltip } from "../tooltip/Tooltip.js";

import { styles } from "./Input.styles.js";

/**
 * Input 컴포넌트는 사용자 입력을 받는 텍스트 입력 필드입니다.
 * prefix, suffix 슬롯과 라벨, 도움말, 유효성 검사 등의 기능을 제공합니다.
 */
export class Input extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': Icon,
    'u-tooltip': Tooltip,
  };

  @query('input') input!: HTMLInputElement;

  /** password type인 경우 비밀번호 표시/숨김 상태 */
  @state() showPassword: boolean = false;
  /** 유효성 검사 실패 여부 */
  @state() isInvalid: boolean = false;
  /** 현재 표시할 유효성 검사 메시지 */
  @state() currentValidationMessage: string = '';

  /** input 요소의 type 속성 */
  @property({ type: String, reflect: true }) type: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' = 'text';
  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 클리어 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) clearable: boolean = false;
  /** 읽기 전용 여부 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** input 요소의 name 속성 */
  @property({ type: String }) name?: string;
  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** 라벨 도움말 (툴팁) */
  @property({ type: String }) labelhelp?: string;
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
    if (changedProperties.has('value') && this.input) {
      if (this.input.value !== this.value) {
        this.input.value = this.value;
      }
    }
  }

  render() {
    return html`
      ${this.renderHeader()}
      
      <div class="container"
        ?invalid=${this.isInvalid}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}>
        <slot name="prefix" class="prefix"></slot>
        
        <input part="input"
          type=${this.type === 'password' && this.showPassword ? 'text' : this.type}
          name=${ifDefined(this.name)}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          placeholder=${ifDefined(this.placeholder)}
          minlength=${ifDefined(this.minlength)}
          maxlength=${ifDefined(this.maxlength)}
          spellcheck=${this.spellcheck}
          autocomplete=${ifDefined(this.autocomplete as any)}
          pattern=${ifDefined(this.pattern)}
          .value=${live(this.value)}
          @input=${this.handleInput}
          @change=${this.handleChange}
          @blur=${this.handleBlur}
        />
        
        <slot name="suffix" class="suffix"></slot>
        
        <div class="tools">
          <u-icon class="tool" name=${this.showPassword ? 'eye-slash' : 'eye'}
            ?hidden=${this.type !== 'password' || this.disabled || this.readonly}
            @click=${this.handlePasswordToggle}
          ></u-icon>
          <u-icon class="tool" name="x-lg"
            ?hidden=${!this.clearable || !this.value || this.disabled || this.readonly}
            @click=${this.handleClear}
          ></u-icon>
        </div>
      </div>

      <div class="validation-error" role="alert" ?hidden=${!this.currentValidationMessage}>
        ${this.currentValidationMessage}
      </div>

      <div class="description" ?hidden=${!this.description}>
        ${this.description}
      </div>
    `;
  }

  /** 라벨 영역을 렌더링합니다. */
  private renderHeader() {
    if (!this.label) return nothing;

    return html`
      <div class="header">
        <label class="label" @click=${this.focus}>
          ${this.label}
          ${this.required ? html`<span class="required-mark">*</span>` : ''}
        </label>
        
        ${this.labelhelp ? html`
          <u-icon class="help-icon" name="info-circle-fill"></u-icon>
          <u-tooltip trigger-selectors=".help-icon" placement="right-end">${this.labelhelp}</u-tooltip>
        ` : nothing}
      </div>
    `;
  }

  /** 유효성 검사를 수행합니다. */
  public validate(): boolean {
    if (!this.input) return true;

    // 브라우저 내장 유효성 검사 사용
    const isValid = this.input.checkValidity();
    this.isInvalid = !isValid;
    if (!isValid) {
      this.currentValidationMessage = this.validationMessage || this.input.validationMessage;
    } else {
      this.currentValidationMessage = '';
    }

    return isValid;
  }

  /** 입력값을 초기화합니다. */
  public clear(): void {
    this.value = '';
    this.isInvalid = false;
    this.currentValidationMessage = '';
    this.focus();
    this.emit('u-clear');
  }

  /** 입력 필드에 포커스를 설정합니다. */
  public focus(): void {
    this.input?.focus();
  }

  /** 입력 필드의 포커스를 해제합니다. */
  public blur(): void {
    this.input?.blur();
  }

  /** input 이벤트 핸들러 */
  private handleInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    
    // 입력 중에는 유효성 검사 에러를 임시로 제거
    if (this.isInvalid) {
      this.isInvalid = false;
      this.currentValidationMessage = '';
    }

    this.emit('u-input', { value: this.value });
  }

  /** change 이벤트 핸들러 */
  private handleChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.emit('u-change', { value: this.value });
  }

  /** blur 이벤트 핸들러 */
  private handleBlur = () => {
    this.validate();
  }

  /** 클리어 버튼 클릭 핸들러 */
  private handleClear = (e: MouseEvent) => {
    e.stopPropagation();
    this.clear();
  }

  /** 비밀번호 표시/숨김 토글 핸들러 */
  private handlePasswordToggle = (e: MouseEvent) => {
    e.stopPropagation();
    this.showPassword = !this.showPassword;
    this.focus();
  } 
}