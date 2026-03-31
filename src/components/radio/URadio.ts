import { html, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import '../field/UField.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { UOption } from "../option/UOption.js";
import { styles } from "./URadio.styles.js";

export type RadioType = "default" | "button";
export type RadioVariant = "filled" | "outlined";
export type RadioOrientation = "vertical" | "horizontal";

/**
 * 여러 라디오 버튼 중 하나를 선택하는 라디오 그룹 컴포넌트입니다.
 *
 * @slot - u-option 아이템
 * 
 * @csspart field - u-field 요소
 * @csspart container - 옵션들을 감싸는 컨테이너
 * 
 * @event change - 선택 값이 변경될 때 발생
 */
@customElement('u-radio')
export class URadio extends UFormControlElement<string> {
  static styles = [ super.styles, styles ];

  /** 라디오 유형 */
  @property({ type: String, reflect: true }) type: RadioType = "default";
  /** 스타일 변형 */
  @property({ type: String, reflect: true }) variant: RadioVariant = "filled";
  /** 배치 방향 */
  @property({ type: String, reflect: true }) orientation: RadioOrientation = "vertical";

  private options: UOption[] = [];

  disconnectedCallback(): void {
    this.cleanup(this.options);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (['type','disabled','readonly'].some(k => changedProperties.has(k))) {
      this.options.forEach(option => {
        option.marker = this.type === 'button' ? undefined : 'radio';
        if (this.disabled) option.disabled = true;
        if (this.readonly) option.disabled = true;
      });
    }
    if (changedProperties.has('value')) {
      this.onChangeValue();
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
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </u-field>
    `;
  }

  public validate(): boolean {
    if (this.internals) {
      this.invalid = !this.internals.checkValidity();
    } else {
      this.invalid = this.required && !this.value;
    }
    return !this.invalid;
  }

  public reset(): void {
    this.value = undefined;
    this.invalid = false;
  }

  private setup(options: UOption[]) {
    for (const option of options) {
      option.removeEventListener('click', this.handleOptionClick);
      option.removeEventListener('keydown', this.handleOptionKeyDown);
      option.addEventListener('click', this.handleOptionClick);
      option.addEventListener('keydown', this.handleOptionKeyDown);
      option.selected = option.value === this.value;
      option.marker = this.type === 'button' ? undefined : 'radio';
      if (this.disabled) option.disabled = true;
      if (this.readonly) option.disabled = true;
    }
  }

  private cleanup(options: UOption[]) {
    for (const option of options) {
      option.removeEventListener('click', this.handleOptionClick);
      option.removeEventListener('keydown', this.handleOptionKeyDown);
    }
  }

  private onChangeValue() {
    this.options.forEach(option => {
      option.selected = option.value === this.value;
    });

    this.internals?.setFormValue(this.value || '');
    this.internals?.setValidity(
      this.required && !this.value ? { valueMissing: true } : {},
      this.validationMessage || '',
      this
    );

    if (!this.novalidate) {
      this.validate();
    }
    this.dispatchEvent(new Event('change', { 
      bubbles: true, 
      composed: true 
    }));
  }

  private handleSlotChange = (e: Event) => {
    this.cleanup(this.options);
    const slot = e.target as HTMLSlotElement;
    this.options = slot.assignedElements({ flatten: true }).filter(
      (el): el is UOption => el instanceof UOption
    );
    this.setup(this.options);
  };

  private handleOptionClick = (e: PointerEvent) => {
    if (this.readonly || this.disabled) return;

    const option = e.currentTarget as UOption;
    if (option.disabled) return;

    this.value = option.value;
  };

  private handleOptionKeyDown = (e: KeyboardEvent) => {
    if (this.readonly || this.disabled) return;

    const options = this.options.filter(o => !o.disabled);
    const currentOption = e.currentTarget as UOption;
    const currentIndex = options.indexOf(currentOption);
    if (currentIndex === -1) return;

    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        currentOption.click();
        break;
      case 'ArrowDown':
      case 'ArrowRight': {
        e.preventDefault();
        const next = options[(currentIndex + 1) % options.length];
        next.focus();
        break;
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault();
        const prev = options[(currentIndex - 1 + options.length) % options.length];
        prev.focus();
        break;
      }
      case 'Home': {
        e.preventDefault();
        options[0].focus();
        break;
      }
      case 'End': {
        e.preventDefault();
        options[options.length - 1].focus();
        break;
      }
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-radio': URadio;
  }
}
