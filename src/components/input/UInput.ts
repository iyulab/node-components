import { html, PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import '../field/UField.js';
import '../icon/UIcon.js';
import '../spinner/USpinner.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { Locale } from "../../utilities/Locale.js";
import { parseNumber } from "../../utilities/format.js";
import { CharsWidthController } from "../../utilities/chars.js";
import { UOption } from "../option/UOption.js";
// 부수효과 import — 이 모듈이 그리는 `<u-popover>` 을 등록한다(타입으로만 가져오면 빌드가 import 를 지운다 — 데코레이터 메타데이터가 우연히 붙잡고 있었다).
import "../popover/UPopover.js";
import type { UPopover } from "../popover/UPopover.js";
import { styles } from "./UInput.styles.js";
import { isImeComposing } from '../../utilities/keyboard.js';

export type InputType = 'text' | 'password' | 'email' | 'tel' | 'url' | 'search' | 'number' | 'date' | 'time' | 'datetime-local' | 'month' | 'week';
export type InputModeOption = 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
export type EnterKeyHint = 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
export type AutoCapitalize = 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
/** 외형 정도 — `outlined`(기본) · `soft` 중립 틴트 면 · `underlined` 밑줄만 · `plain` 외형 없음. */
export type FieldAppearance = 'outlined' | 'soft' | 'underlined' | 'plain';
/** 필드 크기 — 버튼의 `size` 와 같은 세 단. */
export type FieldSize = 'sm' | 'md' | 'lg';

/**
 * 사용자 입력을 받는 텍스트 입력 필드 컴포넌트입니다.
 * prefix, suffix 슬롯과 라벨, 설명, 유효성 검사 기능을 지원합니다.
 * 기본 슬롯에 u-option을 넣으면 combobox 모드로 동작합니다.
 *
 * `type="number"` reads what the user types in the page's locale — `1,5` on a German page and
 * `1.5` anywhere are both 1.5, `1.234,5` and `1,234.5` are both 1234.5 (rules: `parseNumber`).
 * The inner input is `type="text" inputmode="decimal"`, because a native number input drops or
 * rejects a decimal comma depending on the browser. `value` is always the canonical dot-decimal
 * string (`""` when the text is not a number — that text reports `badInput`), `valueAsNumber` the
 * number. On blur the text is shown with the locale's decimal separator. `min`/`max`/`step` are
 * checked on the parsed number with native semantics (no `step` = 1; `step="any"` = no step check);
 * the stepper buttons and ArrowUp/ArrowDown step the value.
 *
 * @slot - u-option 아이템 (combobox 모드)
 * @slot prefix - 입력 필드 앞에 표시하는 아이콘 등
 * @slot suffix - 입력 필드 뒤에 표시하는 추가 콘텐츠
 *
 * @csspart field - u-field 요소
 * @csspart container - input과 prefix/suffix를 감싸는 컨테이너
 * @csspart input - 네이티브 input 요소.
 *   text-align 등 표현 관련 속성을 지정하지 않으므로 소비앱이 ::part(input)으로 재정의한다.
 *   예: `u-input[type="number"]::part(input) { text-align: right; font-variant-numeric: tabular-nums; }`
 *   (숫자 우측정렬은 값이 열로 쌓여 자릿수를 비교할 때 유효하므로 라이브러리 기본값으로 두지 않는다.
 *    docs/theming.md 참고)
 * @csspart popover - 드롭다운 팝오버 요소
 * 
 * @cssprop --u-input-display - 호스트의 display (기본값: inline-block). 폼/그리드 셀에서
 *   컨테이너 폭을 채우려면 `block`으로 지정한다.
 * @cssprop --u-input-width - 호스트의 width (기본값: auto). flex 컨테이너처럼 block만으로는
 *   늘어나지 않는 맥락에서 `100%`로 지정한다.
 * @cssprop --input-min-text - 글자 영역의 최소 폭 (기본값: 4ch). 접미 아이콘(스테퍼·지우기·비밀번호 토글)이 폭을 나눠도 글자
 *   영역은 이 아래로 접히지 않는다 — 주어진 폭이 그보다 좁으면 칸이 호스트 밖으로 넘친다.
 * @cssprop --input-popover-width - 드롭다운 팝오버의 너비 (기본값: 앵커(트리거) 너비)
 * @cssprop --input-popover-min-height - 드롭다운 팝오버의 최소 높이 (기본값: 0px)
 * @cssprop --input-popover-max-height - 드롭다운 팝오버의 최대 높이 (기본값: 50vh)
 * 
 * @event input - 입력값이 변경될 때 발생
 * @event change - 값이 확정됐을 때 발생 — Enter 또는 blur 에서, 값이 바뀐 경우에만(네이티브 입력과 같다)
 */
@customElement('u-input')
export class UInput extends UFormControlElement<string> {
  static styles = [ super.styles, styles ];

  /** 외형 정도 */
  @property({ type: String, reflect: true }) appearance: FieldAppearance = 'outlined';
  /** 전체 지우기 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) clearable: boolean = false;
  /** input 요소의 type 속성. 외부 `u-input[type="..."]` 스타일 훅을 위해 reflect 한다 (URadio.type 과 동일). */
  @property({ type: String, reflect: true }) type: InputType = 'text';
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
  /**
   * 크기 — 버튼의 `size` 와 같은 세 단(`sm` 12px · `md` 기본 = `--u-density`(14px) · `lg` 16px).
   * 상자 높이는 글자 크기에서 파생된다(1.5em 줄 + 필드 상자 여백 × 2 + 테두리) — 같은 `size` 의 버튼과
   * 한 줄에 서도록. 테마는 필드 상자 토큰(`--u-field-padding-block`)으로 단마다 높이를 다듬는다.
   */
  @property({ type: String, reflect: true }) size: FieldSize = 'md';
  /** placeholder 텍스트 */
  /**
   * 칸이 담을 글자 수 — 지정하면 폭을 정하지 않은 칸(기본 `inline-block`)이 «N자 + 접미 아이콘 + 패딩» 폭으로 그려지고,
   * 그보다 좁게 주면 넘친다(글자 영역 하한이 N자가 된다). 네이티브 `<input size>`·CSS `field-sizing` 과 같은 축이다 —
   * `size` 는 이 컴포넌트에서 크기 단(sm·md·lg)이라 이름이 다르다. 폭을 준 칸(`width`·`block`)에서는 하한으로만 쓴다.
   */
  @property({ type: Number, reflect: true }) chars?: number;
  /** `chars` 의 폭 — 그려지는 N자를 잰다(`ch` 는 글꼴 기능·자간을 빼고 잰다). */
  private readonly charsWidth = new CharsWidthController(this, {
    chars: () => this.chars,
    text: () => this.renderRoot.querySelector<HTMLElement>("input"),
    box: () => this.renderRoot.querySelector<HTMLElement>('.container'),
  });
  @property({ type: String }) placeholder?: string;
  /** 유효성 검사 패턴 (정규식) */
  @property({ type: String }) pattern?: string;  

  @query('.container', true) containerEl?: HTMLDivElement;
  @query('input', true) inputEl?: HTMLInputElement;
  @query('u-popover', true) popoverEl?: UPopover;

  @state() showPassword: boolean = false;

  /** `type="number"` — the text in the field, which may differ from `value` (`1,5` shows while
   *  `value` is `1.5`; unparseable text shows while `value` is `""`). */
  @state() private numberText: string = '';
  /** Set while `value` is being written from what the user typed, so the field keeps their text
   *  instead of being re-rendered from `value` mid-edit. */
  private syncingFromText = false;

  /** The value as a number — `NaN` when empty or not a number (same as the native input). */
  get valueAsNumber(): number {
    if (this.type !== 'number' || !this.value) return NaN;
    return parseNumber(this.value, 'en') ?? NaN;
  }

  private options: UOption[] = [];

  disconnectedCallback(): void {
    this.cleanup(this.options);
    super.disconnectedCallback();
  }

  render() {
    const editable = !this.effectivelyDisabled && !this.readonly;
    const showToggle = this.type === 'password' && editable;
    const showClear = this.clearable && editable && !!this.value;
    const isNumber = this.type === 'number';
    const showStepper = isNumber && editable;

    return html`
      <u-field part="field"
        ?required=${this.required}
        ?disabled=${this.effectivelyDisabled}
        ?invalid=${this.invalid}
        .label=${this.label}
        .description=${this.description}
        .validationMessage=${this.validationMessage}
      >
        <div class="container" part="container"
          style=${`--_icons: ${(showStepper ? 2 : 0) + (showClear ? 1 : 0) + (showToggle ? 1 : 0)}${this.charsWidth.width ? `; --input-min-text: ${this.charsWidth.width}` : ''}`}>

          <slot name="prefix"></slot>

          <input part="input"
            style=${ifDefined(this.charsWidth.width ? `inline-size: ${this.charsWidth.width}` : undefined)}
            type=${isNumber || (this.type === 'password' && this.showPassword) ? 'text' : this.type}
            aria-label=${ifDefined(this.resolvedAriaLabel)}
            aria-description=${ifDefined(this.resolvedAriaDescription)}
            name=${ifDefined(this.name)}
            ?required=${this.required}
            ?disabled=${this.effectivelyDisabled}
            ?readonly=${this.readonly}
            minlength=${ifDefined(this.minlength)}
            maxlength=${ifDefined(this.maxlength)}
            min=${ifDefined(isNumber ? undefined : this.min)}
            max=${ifDefined(isNumber ? undefined : this.max)}
            step=${ifDefined(isNumber ? undefined : this.step)}
            dirname=${ifDefined(this.dirname)}
            spellcheck=${this.spellcheck}
            ?autofocus=${this.autofocus}
            ?autocorrect=${this.autocorrect}
            autocapitalize=${ifDefined(this.autocapitalize)}
            autocomplete=${ifDefined(this.autocomplete)}
            inputmode=${ifDefined(this.inputmode ?? (isNumber ? 'decimal' : undefined))}
            enterkeyhint=${ifDefined(this.enterkeyhint)}
            pattern=${ifDefined(this.pattern)}
            placeholder=${ifDefined(this.placeholder)}
            .value=${live(isNumber ? this.numberText : (this.value || ''))}
            @input=${this.handleInputInput}
            @change=${this.handleInputChange}
            @blur=${this.handleInputBlur}
            @keydown=${this.handleInputKeydown}
            @compositionstart=${this.handleCompositionStart}
            @compositionend=${this.handleCompositionEnd}
          />

          <slot name="suffix"></slot>

          <u-icon class="suffix-item"
            ?hidden=${!showToggle}
            role="button"
            tabindex="0"
            aria-label=${Locale.getValue(this.showPassword ? 'hidePassword' : 'showPassword')}
            lib="internal"
            name=${this.showPassword ? 'eye-off' : 'eye'}
            @click=${this.handlePasswordTogglerClick}
            @keydown=${this.handleSuffixIconKeydown(this.handlePasswordTogglerClick)}
          ></u-icon>
          <u-icon class="suffix-item"
            ?hidden=${!showClear}
            role="button"
            tabindex="0"
            aria-label=${Locale.getValue('clear')}
            lib="internal"
            name="x"
            @click=${this.handleClearButtonClick}
            @keydown=${this.handleSuffixIconKeydown(this.handleClearButtonClick)}
          ></u-icon>
          <u-icon class="suffix-item stepper-btn"
            ?hidden=${!showStepper}
            role="button"
            tabindex="0"
            aria-disabled=${!this.canDecrement}
            aria-label=${Locale.getValue('decrement')}
            lib="internal"
            name="minus"
            @click=${this.handleStepperClick(-1)}
            @keydown=${this.handleSuffixIconKeydown(this.handleStepperClick(-1))}
          ></u-icon>
          <u-icon class="suffix-item stepper-btn"
            ?hidden=${!showStepper}
            role="button"
            tabindex="0"
            aria-disabled=${!this.canIncrement}
            aria-label=${Locale.getValue('increment')}
            lib="internal"
            name="plus"
            @click=${this.handleStepperClick(1)}
            @keydown=${this.handleSuffixIconKeydown(this.handleStepperClick(1))}
          ></u-icon>
        </div>
      </u-field>

      <u-popover part="popover"
        role="listbox"
        scrollable
        for=".container"
        trigger="focus"
        strategy="fixed"
        placement="bottom-start"
        offset="1"
        @show=${this.handlePopoverShow}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </u-popover>
    `;
  }

  /** `value`가 바뀌는 모든 경로(초기 속성 설정 · 프로그램적 대입 · clear 버튼)에서
   *  폼 제출값을 동기화한다 — 종전에는 `handleInputBlur`에서만 수동으로 호출해,
   *  blur 전에 폼이 제출되면(다른 컨트롤의 Enter 등) `FormData`가 낡은 값을 돌려줬다.
   *  형제 `USelect`의 `updated()`+`onChangeValue()` 패턴과 같은 경계 — `T`가 이미
   *  `string`이라 `valueAsString` 같은 변환 없이 그대로 넘긴다. */
  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    // A value set from outside (attribute, code, reset, stepper) is shown in the locale's form;
    // a value derived from what the user is typing leaves their text alone.
    if (this.type === 'number' && (changedProperties.has('value') || changedProperties.has('type')) && !this.syncingFromText) {
      this.numberText = this.displayNumber(this.value ?? '');
    }
    this.syncingFromText = false;
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('value')) {
      this.internals?.setFormValue(this.value ?? '');
    }
  }


  /** The shown number uses the locale's decimal separator — re-show it in the new locale (unless the user is typing in it). */
  protected override localeChanged(): void {
    if (this.type === 'number' && this.shadowRoot?.activeElement !== this.inputEl) {
      this.numberText = this.displayNumber(this.value ?? '');
    }
    super.localeChanged();
  }

  /** Canonical `value` → the text shown: the locale's decimal separator, no grouping inserted. */
  private displayNumber(value: string): string {
    const n = value ? parseNumber(value, 'en') : null;
    if (n === null) return value;
    const decimal = new Intl.NumberFormat(Locale.get()).formatToParts(1.1).find(p => p.type === 'decimal')?.value ?? '.';
    return value.replace('.', decimal);
  }

  /** Writes what the user typed into `value` (canonical, or `""` when it is not a number). */
  private syncNumberFromText(text: string): void {
    this.numberText = text;
    const n = parseNumber(text);
    const next = text.trim() === '' || n === null ? '' : String(n);
    if (next !== this.value) {
      this.syncingFromText = true;
      this.value = next;
    }
  }

  /** `type="number"` 의 검증 — 네이티브 숫자 입력이 아니므로 파싱한 수로 직접 잰다(같은 플래그·같은 문구). */
  private numberValidity(): { flags: ValidityStateFlags; message: string } | undefined {
    const text = this.numberText.trim();
    if (!text) {
      return this.required ? { flags: { valueMissing: true }, message: Locale.getValue('valueMissing') } : undefined;
    }
    const n = parseNumber(text);
    if (n === null) return { flags: { badInput: true }, message: Locale.getValue('badInput') };
    const min = this.min !== undefined && this.min !== '' ? Number(this.min) : undefined;
    const max = this.max !== undefined && this.max !== '' ? Number(this.max) : undefined;
    if (min !== undefined && n < min) return { flags: { rangeUnderflow: true }, message: Locale.getValue('rangeUnderflow', { min: this.min ?? '' }) };
    if (max !== undefined && n > max) return { flags: { rangeOverflow: true }, message: Locale.getValue('rangeOverflow', { max: this.max ?? '' }) };
    const step = this.step ?? 1;
    if (Number.isFinite(step) && step > 0) {
      const k = (n - (min ?? 0)) / step;
      if (Math.abs(k - Math.round(k)) > 1e-9) {
        return { flags: { stepMismatch: true }, message: Locale.getValue('stepMismatch', { step }) };
      }
    }
    return undefined;
  }

  protected setValidity(): void {
    if (this.type === 'number') {
      const result = this.numberValidity();
      this.commit(result?.flags ?? {}, result?.message ?? '', this.containerEl ?? undefined);
      return;
    }
    const v = this.inputEl?.validity;
    let flags: ValidityStateFlags = {};
    let message = '';

    if (v?.valueMissing) {
      flags = { valueMissing: true };
      message = Locale.getValue('valueMissing');
    } else if (v?.badInput) {
      flags = { badInput: true };
      message = Locale.getValue('badInput');
    } else if (v?.typeMismatch) {
      flags = { typeMismatch: true };
      message = Locale.getValue('typeMismatch');
    } else if (v?.patternMismatch) {
      flags = { patternMismatch: true };
      message = Locale.getValue('patternMismatch', { pattern: this.pattern ?? '' });
    } else if (v?.tooShort) {
      flags = { tooShort: true };
      message = Locale.getValue('tooShort', { min: this.minlength ?? 0 });
    } else if (v?.tooLong) {
      flags = { tooLong: true };
      message = Locale.getValue('tooLong', { max: this.maxlength ?? 0 });
    } else if (v?.rangeUnderflow) {
      flags = { rangeUnderflow: true };
      message = Locale.getValue('rangeUnderflow', { min: this.min ?? '' });
    } else if (v?.rangeOverflow) {
      flags = { rangeOverflow: true };
      message = Locale.getValue('rangeOverflow', { max: this.max ?? '' });
    } else if (v?.stepMismatch) {
      flags = { stepMismatch: true };
      message = Locale.getValue('stepMismatch', { step: this.step ?? 1 });
    }

    this.commit(flags, message, this.containerEl ?? undefined);
  }

  public reset(): void {
    this.value = '';
    this.numberText = '';
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
    // 옵션이 도착했다고 목록을 여는 것은 **사용자가 이 입력에 있을 때**뿐이다 — 자동완성 결과가
    // 타이핑 중에 들어오는 경우. 정적 옵션(마크업에 적힌 것)으로 처음 그려질 때 열면 사용자가
    // 아무것도 하지 않았는데 목록이 페이지 위에 떠 있고, `trigger="focus"` 라 입력에 들렀다
    // 나가기 전까지 닫히지도 않는다. 옵션이 비면 언제든 닫는다.
    if (this.options.length === 0) {
      this.popoverEl?.hide();
    } else if (this.matches(':focus-within')) {
      this.popoverEl?.show(this.containerEl!);
    }
  };

  // IME(한글·일본어·중국어 등) 조합 상태. 조합 중에는 value 동기화를 보류한다.
  private composing = false;

  private handleCompositionStart = () => {
    this.composing = true;
  };

  private handleCompositionEnd = () => {
    this.composing = false;
    // 조합 완료 후 동기화·relay는 뒤따르는 native input 이벤트(handleInputInput)가 수행한다.
    // 일부 환경은 compositionend 후 input을 발생시키지 않으므로 input 요소에서 한 번 재발행해
    // 보강하되, native input이 뒤따르는 브라우저에서는 handleInputInput의 값 비교로 걸러져
    // 이중 발화하지 않는다. (여기서 host에 직접 input을 dispatch하면 후속 native input과 중복된다)
    this.inputEl?.dispatchEvent(new InputEvent('input', { bubbles: true }));
  };

  private handleInputInput = (e: InputEvent) => {
    // 조합 중(IME) value를 다시 쓰면 .value=live()가 조합을 취소시켜
    // 한글 입력·띄어쓰기가 깨진다. 조합 완료(compositionend) 시점에만 동기화한다.
    if (this.composing) return;
    if (this.type === 'number') {
      // 숫자는 보이는 글자와 값이 다르다(`1,5` ↔ `1.5`) — 글자가 바뀌었으면 값이 같아도 입력이다.
      const text = this.inputEl?.value ?? '';
      if (text === this.numberText) return;
      this.syncNumberFromText(text);
      this.relay(e);
      return;
    }
    const next = this.inputEl?.value;
    // compositionend 보강 dispatch와 후속 native input의 이중 relay를 값 비교로 차단한다.
    if (next === this.value) return;
    this.value = next;
    this.relay(e);
  }

  /**
   * 호스트의 `change` 는 **내부 네이티브 입력의 `change` 를 그대로 옮긴다** — 커밋 시점을 흉내 내지 않고 브라우저에 맡긴다.
   *
   * 네이티브 단일 행 입력은 값이 바뀐 채 **Enter 를 누르거나 포커스를 잃을 때** `change` 를 낸다. 종전에는 blur 에서만
   * 직접 디스패치해 ⑴Enter 로 암묵 제출할 때 `change` 가 **제출 뒤에야**(blur 시점) 나갔고 — `change` 로 값을 드는 폼이
   * 빈 값으로 제출됐다 — ⑵값을 바꾸지 않은 blur 에도 `change` 를 냈다. 암묵 제출은 한 틱 뒤에 판정하므로(아래) 네이티브
   * 순서(`change` → `submit`)가 그대로 선다.
   */
  private handleInputChange = (e: Event) => {
    e.stopPropagation();
    if (this.composing) return;
    if (this.type === 'number') this.syncNumberFromText(this.inputEl?.value ?? '');
    else this.value = this.inputEl?.value || '';
    if (!this.novalidate) {
      this.validate();
    }
    this.dispatchEvent(new Event('change', {
      bubbles: true,
      composed: true
    }));
  }

  private handleInputBlur = (_: FocusEvent) => {
    if (this.type === 'number') {
      this.syncNumberFromText(this.inputEl?.value ?? '');
      // 읽을 수 있는 수는 로케일 모양으로 다시 보인다(`1.234,5` → `1234,5`). 못 읽는 글자는 그대로 둔다 — 고칠 대상이다.
      if (parseNumber(this.numberText) !== null) this.numberText = this.displayNumber(this.value ?? '');
    } else {
      this.value = this.inputEl?.value || '';
    }

    if (!this.novalidate) {
      this.validate();
    }
  }

  private handleInputKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      this.handleImplicitSubmission(e);
      return;
    }
    // 숫자 입력의 화살표 증감 — 네이티브 숫자 입력이 하던 일이다. 제안 목록이 열려 있으면 목록이 키를 갖는다.
    if (this.type === 'number' && (e.key === 'ArrowUp' || e.key === 'ArrowDown') && !this.popoverEl?.open
        && !this.readonly && !this.effectivelyDisabled) {
      e.preventDefault();
      this.stepBy(e.key === 'ArrowUp' ? 1 : -1);
      return;
    }
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
        // 목록이 닫혀 있으면 이 키로 할 일이 없다 — 소비하지 않아야 바깥(오버레이·소비자)이 받는다.
        if (!this.popoverEl?.open) break;
        e.preventDefault();
        this.popoverEl.hide();
        break;
      }
    }
  };

  /**
   * 네이티브 단일 행 `<input>` 의 **암묵 제출**(HTML «implicit submission»)을 흉내 낸다 — 내부 `<input>` 은 섀도
   * 안에 있어 바깥 `<form>` 의 폼 소유자가 아니므로, 흉내 내지 않으면 Enter 가 아무것도 하지 않는다.
   *
   * - **한 틱(태스크) 뒤에 판정한다.** 이 리스너는 내부 입력에서 가장 먼저 돌므로, 소비자가 호스트나 폼에서
   *   `keydown` 을 취소했는지는 디스패치가 끝난 뒤에야 안다(마이크로태스크는 다음 리스너보다 먼저 돈다).
   *   취소됐으면 제출하지 않는다 — 네이티브와 같다.
   * - IME 조합을 확정하는 Enter 와 수정 키가 붙은 Enter 는 제출하지 않는다.
   * - 명세의 순서 그대로: 폼에 제출 버튼이 있으면 **첫 제출 버튼을 누른다**(비활성이면 버튼이 스스로 거른다 ·
   *   네이티브 버튼이면 `submitter` 도 그것이 된다). 없으면 암묵 제출을 막는 필드가 둘 이상일 때 제출하지 않고,
   *   아니면 `requestSubmit()` 한다(검증도 그 안에서 돈다).
   */
  private handleImplicitSubmission(e: KeyboardEvent): void {
    if (isImeComposing(e) || this.composing || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    setTimeout(() => {
      const form = this.form;
      if (e.defaultPrevented || !form || !this.isConnected) return;
      const elements = Array.from(form.elements);
      const submitter = elements.find(isSubmitButton) as HTMLElement | undefined;
      if (submitter) {
        submitter.click();
      } else if (elements.filter(blocksImplicitSubmission).length <= 1) {
        form.requestSubmit();
      }
    });
  }

  /** suffix `u-icon`은 순수 표시 요소(버튼 아님)라 네이티브 키보드 활성화가 없다 —
   *  `role="button"`+`tabindex="0"`로 포커스 가능하게 한 뒤, Enter/Space를 같은 클릭
   *  핸들러로 릴레이한다. `e.preventDefault()`는 Space가 페이지를 스크롤시키는 것을 막는다. */
  private handleSuffixIconKeydown = (action: (e: PointerEvent) => void) => (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    action(e as unknown as PointerEvent);
  };

  private handlePasswordTogglerClick = (e: PointerEvent) => {
    e.stopImmediatePropagation();
    this.showPassword = !this.showPassword;
    this.focus();
  }

  private handleClearButtonClick = (e: PointerEvent) => {
    e.stopImmediatePropagation();
    this.reset();
    // 타이핑 경로(handleInputInput)와 같은 "값이 바뀌었다" 신호를 여기서도 내야
    // input 이벤트 하나만 구독하는 소비자도 클리어를 감지한다 —
    // change는 그 위에 "상호작용이 끝났다"는 신호로 겸용 유지.
    this.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      composed: true
    }));
    this.dispatchEvent(new Event('change', {
      bubbles: true,
      composed: true
    }));
    this.focus();
  }

  /** 경계(min/max)에 걸리면 시각적으로 흐리고 마우스 클릭을 막는다(CSS `pointer-events:
   *  none`) — 네이티브 stepUp/stepDown 자체가 경계에서 조용히 no-op이라 값이 튀지는
   *  않지만, 헛클릭 피드백을 준다. 키보드 Enter/Space는 `pointer-events`의 영향을 받지
   *  않아 그대로 stepUp/stepDown까지 가지만 결과는 동일하게 no-op이다. */
  private get canIncrement(): boolean {
    if (this.max === undefined || this.max === '' || !this.value) return true;
    return Number(this.value) < Number(this.max);
  }

  private get canDecrement(): boolean {
    if (this.min === undefined || this.min === '' || !this.value) return true;
    return Number(this.value) > Number(this.min);
  }

  /** 증감 버튼 — 클릭이 곧 «값을 확정» 하는 동작이라 change 도 함께 낸다(네이티브 스핀 버튼과 같다). */
  private handleStepperClick = (delta: 1 | -1) => (e: PointerEvent) => {
    e.stopImmediatePropagation();
    this.stepBy(delta);
    this.focus();
  }

  /**
   * 한 step 만큼 올리거나 내린다 — 네이티브 `stepUp`/`stepDown` 의 규칙: 기준선(`min`, 없으면 0)에서 step 의
   * 정수배로 맞추고(어긋난 값은 그 방향의 다음 눈금으로), `min`/`max` 로 자른다. 빈 값은 0 에서 출발한다.
   * 이동이 없으면(경계) 아무 이벤트도 내지 않는다. 소수 step 의 부동소수 잡음(0.1+0.2)은 step·기준선의 자릿수로 반올림한다.
   */
  private stepBy(delta: 1 | -1): void {
    const step = this.step !== undefined && Number.isFinite(this.step) && this.step > 0 ? this.step : 1;
    const min = this.min !== undefined && this.min !== '' ? Number(this.min) : undefined;
    const max = this.max !== undefined && this.max !== '' ? Number(this.max) : undefined;
    const current = parseNumber(this.numberText) ?? 0;
    const base = min ?? 0;
    const k = (current - base) / step;
    const index = delta > 0 ? Math.floor(k + 1e-9) + 1 : Math.ceil(k - 1e-9) - 1;
    const places = Math.max(fractionDigits(step), fractionDigits(base));
    let next = Number((base + index * step).toFixed(places));
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    if (this.numberText.trim() !== '' && next === current) return;
    this.value = String(next);
    this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    if (!this.novalidate) this.validate();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
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

  /** 옵션이 없으면 열지 않는다. ⚠닫힘은 막지 않는다 — 종전에는 같은 조건으로 `hide` 도 취소해,
   *  열린 채 옵션이 모두 사라지면 **빈 팝오버가 닫히지 못하고** 페이지 위에 남았다. */
  private handlePopoverShow = (e: Event) => {
    if (this.options.length === 0) {
      e.preventDefault();
    }
  };
}

/** 수의 소수 자릿수(`0.25` → 2, `1e-7` → 7) — step 연산의 반올림 자리. */
function fractionDigits(n: number): number {
  const [mantissa, exponent] = String(n).split('e');
  const digits = (mantissa.split('.')[1] ?? '').length;
  return Math.max(0, digits - Number(exponent ?? 0));
}

/** HTML 명세의 «암묵 제출을 막는 필드» — 네이티브 단일 행 입력의 이 type 들. `u-input` 의 type 은 전부 여기에 든다. */
const BLOCKING_TYPES = new Set([
  'text', 'search', 'email', 'url', 'tel', 'password', 'date', 'month', 'week', 'time', 'datetime-local', 'number',
]);

/** 제출 버튼 — 네이티브 `<button>`(기본 type 이 submit)·`<input type=submit|image>`, 그리고 `type` 이 submit 인 폼 연동 커스텀 버튼. */
function isSubmitButton(el: Element): boolean {
  const type = (el as { type?: unknown }).type;
  return type === 'submit' || (el instanceof HTMLInputElement && type === 'image');
}

function blocksImplicitSubmission(el: Element): boolean {
  return (el instanceof HTMLInputElement || el instanceof UInput) && BLOCKING_TYPES.has(el.type);
}

declare global {
  interface HTMLElementTagNameMap {
    'u-input': UInput;
  }
}
