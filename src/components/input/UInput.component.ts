import { html, PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";

import { UElement } from "../UElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { UOption } from "../option/UOption.component.js";
import { UPopover } from "../popover/UPopover.component.js";
import { styles } from "./UInput.styles.js";

/**
 * - Supported input types for Input component
 * - Excludes: checkbox, radio, range, color, file, hidden, image, reset, submit, button
 */
export type InputType = 'text' | 'password' | 'email' | 'tel' | 'url' | 'search' | 'number' | 'date' | 'time' | 'datetime-local' | 'month' | 'week';
export type InputModeOption = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
export type EnterKeyHint = 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
export type AutoCapitalize = 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';

export type InputVariant = 'outlined' | 'filled' | 'underlined' | 'borderless';

/**
 * Input 컴포넌트는 사용자 입력을 받는 텍스트 입력 필드입니다.
 * prefix, suffix 슬롯과 라벨, 도움말, 유효성 검사 등의 기능을 제공합니다.
 * 기본 슬롯에 u-option을 넣으면 combobox(자동완성) 모드로 동작합니다.
 *
 * @slot - 기본 슬롯 (u-option 아이템, combobox 모드)
 * @slot prefix - 입력 필드 앞에 표시되는 아이콘 등
 * @slot suffix - 입력 필드 뒤에 표시되는 추가 콘텐츠
 *
 * @event u-input - 입력값이 변경될 때 발생
 * @event u-change - 값이 확정될 때 발생
 * @event u-show - 드롭다운이 열릴 때 발생 (combobox)
 * @event u-hide - 드롭다운이 닫힐 때 발생 (combobox)
 */
export class UInput extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon,
    'u-option': UOption,
    'u-popover': UPopover,
  };

  /** 입력 필드의 스타일 변형 */
  @property({ type: String, reflect: true }) variant: InputVariant = 'outlined';
  /** input 요소의 type 속성 */
  @property({ type: String, reflect: true }) type: InputType = 'text';
  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 읽기 전용 여부 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 유효하지 않은 상태 여부 */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 클리어 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) clearable: boolean = false;
  /** 최소 길이 */
  @property({ type: Number }) minlength?: number;
  /** 최대 길이 */
  @property({ type: Number }) maxlength?: number;
  /** 최솟값 (number, date, time 등) */
  @property({ type: String }) min?: string;
  /** 최댓값 (number, date, time 등) */
  @property({ type: String }) max?: string;
  /** 증감 단위 (number, date, time 등) */
  @property({ type: Number }) step?: number;
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
  /** 입력 필드 표시 너비 (문자 수 기준) */
  @property({ type: Number }) size?: number;
  /** form 요소와의 연결 (form 속성) */
  @property({ type: String }) form?: string;
  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** placeholder 텍스트 */
  @property({ type: String }) placeholder?: string;
  /** 컴포넌트 하단 설명 텍스트 */
  @property({ type: String }) description?: string;
  /** 유효성 검사 패턴 (정규식) */
  @property({ type: String }) pattern?: string;
  /** 유효성 검사 실패 시 표시할 메시지 */
  @property({ type: String }) validationMessage?: string;
  /** input 요소의 name 속성 */
  @property({ type: String }) name?: string;
  /** 입력값 */
  @property({ type: String }) value: string = '';
  /** 옵션이 없을 때 표시할 메시지 (combobox) */
  @property({ type: String }) emptyMessage: string = '일치하는 항목이 없습니다';

  /** 현재 표시할 유효성 검사 메시지 */
  @state() currentValidationMessage: string = '';
  /** password type인 경우 비밀번호 표시/숨김 상태 */
  @state() showPassword: boolean = false;
  /** 드롭다운 열림 상태 (combobox) */
  @state() private dropdownOpen: boolean = false;

  @query('input') inputEl!: HTMLInputElement;
  @query('.container') containerEl!: HTMLElement;
  @query('u-popover') popoverEl?: UPopover;

  /** combobox 옵션 목록 */
  private options: UOption[] = [];
  /** combobox 모드 여부 */
  private get isCombobox(): boolean { return this.options.length > 0; }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('u-select', this.handleOptionSelect);
  }

  disconnectedCallback(): void {
    this.removeEventListener('u-select', this.handleOptionSelect);
    document.removeEventListener('keydown', this.handleDocumentKeydown);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // value가 프로그램적으로 변경된 경우 input 요소와 동기화
    if (changedProperties.has('value') && this.inputEl) {
      if (this.inputEl.value !== this.value) {
        this.inputEl.value = this.value;
      }
      // combobox 모드: 입력값에 따라 옵션 필터링
      if (this.isCombobox) {
        this.filterOptions();
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
        ?invalid=${this.invalid}
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
          form=${ifDefined(this.form)}
          pattern=${ifDefined(this.pattern)}
          placeholder=${ifDefined(this.placeholder)}
          .value=${live(this.value)}
          @input=${this.handleInput}
          @change=${this.handleInputChange}
          @focus=${this.handleInputFocus}
          @blur=${this.handleInputBlur}
        />

        <slot name="suffix"></slot>

        <u-icon class="suffix icon"
          ?hidden=${this.type !== 'password' || this.disabled || this.readonly}
          lib="internal"
          name=${this.showPassword ? 'eye-slash' : 'eye'}
          @click=${this.handlePasswordTogglerClick}
        ></u-icon>
        <u-icon class="suffix icon"
          ?hidden=${!this.clearable || this.disabled || this.readonly}
          lib="internal"
          name="x-lg"
          @click=${this.handleClearButtonClick}
        ></u-icon>
      </div>

      ${this.isCombobox ? html`
        <u-popover class="dropdown"
          trigger="manual"
          .dismiss=${['click', 'scroll', 'resize'] as any}
          placement="bottom-start"
          .offset=${4}
          role="listbox"
          @u-show=${this.handlePopoverShow}
          @u-hide=${this.handlePopoverHide}
        >
          <slot @slotchange=${this.handleSlotChange}></slot>
          <div class="empty-message"
            ?hidden=${this.getVisibleOptions().length > 0}
          >${this.emptyMessage}</div>
        </u-popover>
      ` : html`<slot @slotchange=${this.handleSlotChange} hidden></slot>`}

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
    this.invalid = false;
    this.currentValidationMessage = '';
    this.focus();
  }

  /** 유효성 검사를 수행합니다. */
  public validate(): boolean {
    if (!this.inputEl) return true;

    // 브라우저 내장 유효성 검사 사용
    const validity = this.inputEl.validity;
    this.invalid = !validity.valid;
    if (this.invalid) {
      this.currentValidationMessage = validity.patternMismatch
        ? this.validationMessage || this.inputEl.validationMessage
        : this.inputEl.validationMessage;
    } else {
      this.currentValidationMessage = '';
    }

    return validity.valid;
  }

  /** 드롭다운을 엽니다 (combobox). */
  public async showDropdown(): Promise<boolean> {
    if (this.dropdownOpen || this.disabled || this.readonly || !this.isCombobox) return false;
    if (!this.popoverEl) return false;
    if (!this.emit('u-show')) return false;

    this.dropdownOpen = true;
    await this.popoverEl.show(this.containerEl);

    document.addEventListener('keydown', this.handleDocumentKeydown);

    this.filterOptions();
    return true;
  }

  /** 드롭다운을 닫습니다 (combobox). */
  public async hideDropdown(): Promise<boolean> {
    if (!this.dropdownOpen) return true;
    if (!this.emit('u-hide')) return false;

    this.dropdownOpen = false;
    await this.popoverEl?.hide();

    document.removeEventListener('keydown', this.handleDocumentKeydown);

    return true;
  }

  /** 입력값에 따라 옵션을 필터링 */
  private filterOptions(): void {
    const query = this.value.toLowerCase().trim();
    for (const option of this.options) {
      if (!query) {
        option.hidden = false;
      } else {
        const label = option.getLabel().toLowerCase();
        const value = option.value.toLowerCase();
        option.hidden = !label.includes(query) && !value.includes(query);
      }
    }
  }

  /** 보이는 옵션 목록 반환 */
  private getVisibleOptions(): UOption[] {
    return this.options.filter(o => !o.hidden && !o.disabled);
  }

//#region Event Handlers

  /** popover의 u-show 이벤트 전파 차단 */
  private handlePopoverShow = (e: Event) => {
    e.stopPropagation();
  };

  /** popover가 외부 요인(클릭, 스크롤, 리사이즈)으로 닫힐 때 상태 동기화 */
  private handlePopoverHide = (e: Event) => {
    e.stopPropagation();
    if (!this.dropdownOpen) return;

    this.dropdownOpen = false;
    document.removeEventListener('keydown', this.handleDocumentKeydown);
    this.emit('u-hide');
  };

  /** 슬롯 변경 시 옵션 목록 갱신 */
  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.options = slot.assignedElements({ flatten: true }).filter(
      (el): el is UOption => el instanceof UOption
    );
    // combobox 모드 옵션 초기화
    for (const option of this.options) {
      option.mode = 'combobox';
    }
    this.requestUpdate();
  };

  /** 옵션 선택 이벤트 핸들러 (combobox) */
  private handleOptionSelect = (e: Event) => {
    e.stopPropagation();
    const option = e.target as UOption;
    if (!(option instanceof UOption)) return;

    this.value = option.getLabel();
    this.hideDropdown();
    this.emit('u-change');
    this.focus();
  };

  /** input 이벤트 핸들러 */
  private handleInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.emit('u-input');

    // combobox: 입력 시 드롭다운 열기
    if (this.isCombobox && !this.dropdownOpen) {
      this.showDropdown();
    }
  }

  /** change 이벤트 핸들러 */
  private handleInputChange = (e: InputEvent) => {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.emit('u-change');
  }

  /** focus 이벤트 핸들러 */
  private handleInputFocus = () => {
    if (this.isCombobox && !this.dropdownOpen) {
      this.showDropdown();
    }
  }

  /** blur 이벤트 핸들러 */
  private handleInputBlur = (_: FocusEvent) => {
    this.validate();
  }

  /** 문서 키보드 핸들러 (combobox) */
  private handleDocumentKeydown = (e: KeyboardEvent) => {
    if (!this.dropdownOpen) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.hideDropdown();
        this.focus();
        break;
      case 'ArrowDown': {
        e.preventDefault();
        this.focusNextOption();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        this.focusPrevOption();
        break;
      }
      case 'Enter': {
        e.preventDefault();
        const focused = this.options.find(o => o.matches(':focus'));
        if (focused && !focused.disabled) {
          focused.click();
        }
        break;
      }
    }
  };

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

//#endregion

  /** 다음 옵션에 포커스 */
  private focusNextOption(): void {
    const visible = this.getVisibleOptions();
    if (visible.length === 0) return;
    const currentIndex = visible.findIndex(o => o.matches(':focus'));
    const nextIndex = currentIndex < visible.length - 1 ? currentIndex + 1 : 0;
    visible[nextIndex].focus();
  }

  /** 이전 옵션에 포커스 */
  private focusPrevOption(): void {
    const visible = this.getVisibleOptions();
    if (visible.length === 0) return;
    const currentIndex = visible.findIndex(o => o.matches(':focus'));
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : visible.length - 1;
    visible[prevIndex].focus();
  }
}
