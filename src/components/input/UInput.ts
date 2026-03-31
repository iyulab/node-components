import { html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import '../field/UField.js';
import '../icon/UIcon.js';
import '../spinner/USpinner.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { UOption } from "../option/UOption.js";
import { UPopover } from "../popover/UPopover.js";
import { styles } from "./UInput.styles.js";

export type InputType = 'text' | 'password' | 'email' | 'tel' | 'url' | 'search' | 'number' | 'date' | 'time' | 'datetime-local' | 'month' | 'week';
export type InputModeOption = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
export type EnterKeyHint = 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
export type AutoCapitalize = 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
export type InputVariant = 'outlined' | 'filled' | 'underlined' | 'borderless';

/**
 * 사용자 입력을 받는 텍스트 입력 필드 컴포넌트입니다.
 * prefix, suffix 슬롯과 라벨, 설명, 유효성 검사 기능을 지원합니다.
 * 기본 슬롯에 u-option을 넣으면 combobox 모드로 동작합니다.
 *
 * @slot - u-option 아이템 (combobox 모드)
 * @slot prefix - 입력 필드 앞에 표시하는 아이콘 등
 * @slot suffix - 입력 필드 뒤에 표시하는 추가 콘텐츠
 *
 * @csspart field - u-field 요소
 * @csspart container - input과 prefix/suffix를 감싸는 컨테이너
 * @csspart input - 네이티브 input 요소
 * @csspart popover - 드롭다운 팝오버 요소
 * 
 * @cssprop --input-popover-min-width - 드롭다운 팝오버의 최소 너비 (기본값: 100%)
 * @cssprop --input-popover-max-width - 드롭다운 팝오버의 최대 너비 (기본값: 80vw)
 * @cssprop --input-popover-min-height - 드롭다운 팝오버의 최소 높이 (기본값: 0px)
 * @cssprop --input-popover-max-height - 드롭다운 팝오버의 최대 높이 (기본값: 50vh)
 * 
 * @event input - 입력값이 변경될 때 발생
 * @event change - 값이 확정됐을 때 발생
 */
@customElement('u-input')
export class UInput extends UFormControlElement<string> {
  static styles = [ super.styles, styles ];

  /** 입력 필드 표시 열수 (문자 수 기준) */
  @property({ type: String, reflect: true }) variant: InputVariant = 'outlined';
  /** 전체 지우기 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) clearable: boolean = false;
  /** input 요소의 type 속성 */
  @property({ type: String }) type: InputType = 'text';
  /** 최소 글자 수 */
  @property({ type: Number }) minlength?: number;
  /** 최대 글자 수 */
  @property({ type: Number }) maxlength?: number;
  /** 최솟값 (number, date, time 등) */
  @property({ type: String }) min?: string;
  /** 최댓값 (number, date, time 등) */
  @property({ type: String }) max?: string;
  /** 증감 단위 (number, date, time 등) */
  @property({ type: Number }) step?: number;
  /** 입력 방향 정보 (dir 속성) */
  @property({ type: String }) dirname?: string;
  /** 모바일 키보드 타입 제한 */
  @property({ type: String }) inputmode?: InputModeOption;
  /** 모바일 엔터 키 라벨 */
  @property({ type: String }) enterkeyhint?: EnterKeyHint;
  /** 맞춤법 검사 여부 */
  @property({ type: Boolean }) spellcheck: boolean = false;
  /** 자동 포커스 여부 */
  @property({ type: Boolean }) autofocus: boolean = false;
  /** 자동 수정 기능 설정 (iOS) */
  @property({ type: Boolean }) autocorrect: boolean = false;
  /** 문자 자동 대문자 변환 */
  @property({ type: String }) autocapitalize: AutoCapitalize = 'off';
  /** 자동 완성 기능 설정 */
  @property({ type: String }) autocomplete?: AutoFill;
  /** 입력 필드 표시 열수 (문자 수 기준) */
  @property({ type: Number }) size?: number;
  /** placeholder 텍스트 */
  @property({ type: String }) placeholder?: string;
  /** 유효성 검사 패턴 (정규식) */
  @property({ type: String }) pattern?: string;  

  @query('.container', true) containerEl?: HTMLDivElement;
  @query('input', true) inputEl?: HTMLInputElement;
  @query('u-popover', true) popoverEl?: UPopover;

  @state() showPassword: boolean = false;

  private options: UOption[] = [];

  disconnectedCallback(): void {
    this.cleanup(this.options);
    super.disconnectedCallback();
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

          <slot name="prefix"></slot>

          <input part="input"
            type=${this.type === 'password' && this.showPassword ? 'text' : this.type}
            name=${ifDefined(this.name)}
            ?required=${this.required}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            minlength=${ifDefined(this.minlength)}
            maxlength=${ifDefined(this.maxlength)}
            min=${ifDefined(this.min)}
            max=${ifDefined(this.max)}
            step=${ifDefined(this.step)}
            dirname=${ifDefined(this.dirname)}
            spellcheck=${this.spellcheck}
            ?autofocus=${this.autofocus}
            ?autocorrect=${this.autocorrect}
            autocapitalize=${ifDefined(this.autocapitalize)}
            autocomplete=${ifDefined(this.autocomplete as any)}
            inputmode=${ifDefined(this.inputmode)}
            enterkeyhint=${ifDefined(this.enterkeyhint)}
            size=${ifDefined(this.size)}
            pattern=${ifDefined(this.pattern)}
            placeholder=${ifDefined(this.placeholder)}
            .value=${live(this.value || '')}
            @input=${this.handleInputInput}
            @change=${this.handleInputChange}
            @blur=${this.handleInputBlur}
            @keydown=${this.handleInputKeydown}
          />

          <slot name="suffix"></slot>

          <u-icon class="suffix-item"
            ?hidden=${this.type !== 'password' || this.disabled || this.readonly}
            lib="internal"
            name=${this.showPassword ? 'eye-slash' : 'eye'}
            @click=${this.handlePasswordTogglerClick}
          ></u-icon>
          <u-icon class="suffix-item"
            ?hidden=${!this.clearable || this.disabled || this.readonly || !this.value}
            lib="internal"
            name="x-lg"
            @click=${this.handleClearButtonClick}
          ></u-icon>
        </div>
      </u-field>

      <u-popover part="popover"
        role="listbox"
        scrollable
        for=".container"
        trigger="focus"
        placement="bottom-start"
        offset="1"
        @show=${this.handlePopoverShow}
        @hide=${this.handlePopoverHide}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </u-popover>
    `;
  }

  public validate(): boolean {
    if (this.internals) {
      this.invalid = !this.internals.checkValidity();
    } else {
      this.invalid = !this.inputEl?.checkValidity();
    }
    return !this.invalid;
  }

  public reset(): void {
    this.value = '';
    this.invalid = false;
  }

  public focus(options?: FocusOptions): void {
    this.inputEl?.focus(options);
  }

  public blur(): void {
    this.inputEl?.blur();
  }

  private setup(options: UOption[]) {
    for (const option of options) {
      option.removeEventListener('click', this.handleOptionClick);
      option.removeEventListener('keydown', this.handleOptionKeydown);
      option.addEventListener('click', this.handleOptionClick);
      option.addEventListener('keydown', this.handleOptionKeydown);
    }
  }

  private cleanup(options: UOption[]) {
    for (const option of options) {
      option.removeEventListener('click', this.handleOptionClick);
      option.removeEventListener('keydown', this.handleOptionKeydown);
    }
  }

  private handleSlotChange = (e: Event) => {
    this.cleanup(this.options);
    const slot = e.target as HTMLSlotElement;
    this.options = slot.assignedElements({ flatten: true }).filter(
      (el): el is UOption => el instanceof UOption
    );
    this.setup(this.options);
    if (this.options.length > 0) {
      this.popoverEl?.show(this.containerEl!);
    } else {
      this.popoverEl?.hide();
    }
  };

  private handleInputInput = (e: InputEvent) => {
    this.value = this.inputEl?.value;
    this.relay(e);
  }

  private handleInputChange = (e: Event) => {
    e.stopPropagation();
  }

  private handleInputBlur = (_: FocusEvent) => {
    this.value = this.inputEl?.value || '';
    this.internals?.setFormValue(this.value);
    this.internals?.setValidity(
      this.inputEl?.validity,
      this.validationMessage || this.inputEl?.validationMessage,
      this.containerEl
    );

    if (!this.novalidate) {
      this.validate();
    }
    this.dispatchEvent(new Event('change', { 
      bubbles: true, 
      composed: true 
    }));
  }

  private handleInputKeydown = (e: KeyboardEvent) => {
    if (this.options.length === 0) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        this.popoverEl?.show(this.containerEl!);
        const first = this.options.find(o => !o.hidden && !o.disabled);
        first?.focus();
        break;
      }
      case 'Escape': {
        e.preventDefault();
        this.popoverEl?.hide();
        break;
      }
    }
  };

  private handlePasswordTogglerClick = (e: PointerEvent) => {
    e.stopImmediatePropagation();
    this.showPassword = !this.showPassword;
    this.focus();
  }

  private handleClearButtonClick = (e: PointerEvent) => {
    e.stopImmediatePropagation();
    this.reset();
    this.focus();
  }

  private handleOptionClick = (e: PointerEvent) => {
    const option = e.currentTarget as UOption;
    if (option.disabled) return;

    this.value = option.value || option.getText();
    this.popoverEl?.hide();
    this.focus();
  };

  private handleOptionKeydown = (e: KeyboardEvent) => {
    const options = this.options.filter(o => !o.hidden && !o.disabled);
    if (options.length === 0) return;
    const currentOption = e.currentTarget as UOption;
    const currentIndex = options.indexOf(currentOption);
    if (currentIndex === -1) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        options[nextIndex].focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        options[prevIndex].focus();
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        currentOption.click();
        break;
      }
      case 'Escape': {
        e.preventDefault();
        this.popoverEl?.hide();
        this.focus();
        break;
      }
    }
  };

  private handlePopoverShow = (e: Event) => {
    e.stopPropagation();
    if (this.options.length === 0) {
      e.preventDefault();
    }
  };

  private handlePopoverHide = (e: Event) => {
    e.stopPropagation();
    if (this.options.length === 0) {
      e.preventDefault();
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-input': UInput;
  }
}
