import { html, PropertyValues } from "lit";
import { property, query } from "lit/decorators.js";

import { UFormControlElement } from "../UFormControlElement.js";
import { UElement } from "../UElement.js";
import { UChip } from "../chip/UChip.component.js";
import { UField } from "../field/UField.component.js";
import { UIcon } from "../icon/UIcon.component.js";
import { UOption } from "../option/UOption.component.js";
import { UPopover } from "../popover/UPopover.component.js";
import { USpinner } from "../spinner/USpinner.component.js";
import { styles } from "./USelect.styles.js";

export type SelectVariant = 'outlined' | 'filled' | 'underlined' | 'borderless';

/**
 * Select 컴포넌트는 드롭다운 목록에서 값을 선택하는 폼 컨트롤입니다.
 * 단일 선택 및 다중 선택, 검색 기능을 지원합니다.
 *
 * @slot - 기본 슬롯 (u-option 아이템)
 *
 * @event u-change - 선택 값이 변경될 때 발생
 * @event u-show - 드롭다운이 열릴 때 발생
 * @event u-hide - 드롭다운이 닫힐 때 발생
 */
export class USelect extends UFormControlElement<string | string[]> {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-chip': UChip,
    'u-field': UField,
    'u-icon': UIcon,
    'u-option': UOption,
    'u-popover': UPopover,
    'u-spinner': USpinner,
  };

  /** 트리거 영역의 스타일 변형 */
  @property({ type: String, reflect: true }) variant: SelectVariant = 'outlined';
  /** 다중 선택 여부 */
  @property({ type: Boolean, reflect: true }) multiple: boolean = false;
  /** 검색 가능 여부 */
  @property({ type: Boolean, reflect: true }) searchable: boolean = false;
  /** 클리어 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) clearable: boolean = false;
  /** 로딩 상태 표시 여부 */
  @property({ type: Boolean, reflect: true }) loading: boolean = false;
  /** 최소 선택 개수 (다중 선택 시) */
  @property({ type: Number, attribute: 'min-count' }) minCount?: number;
  /** 최대 선택 개수 (다중 선택 시) */
  @property({ type: Number, attribute: 'max-count' }) maxCount?: number;
  /** placeholder 텍스트 */
  @property({ type: String }) placeholder?: string;

  @query('.container', true) containerEl?: HTMLElement;
  @query('u-popover', true) popoverEl?: UPopover;

  private options: UOption[] = [];

  private get valueAsString(): string {
    return Array.isArray(this.value) ? this.value.join(',') : this.value ?? '';
  }

  private get valueAsArray(): string[] {
    return Array.isArray(this.value) ? this.value : this.value ? [this.value] : [];
  }

  private get hasValue(): boolean {
    return this.multiple ? this.valueAsArray.length > 0 : !!this.value;
  }

  disconnectedCallback(): void {
    this.cleanup(this.options);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('value')) {
      this.onChangeValue();
    }
  }

  render() {
    return html`
      <u-field
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?invalid=${this.invalid}
        .label=${this.label}
        .description=${this.description}
        .validationMessage=${this.validationMessage}
      >
        <span slot="label-aside" class="count" ?hidden=${!this.multiple || !this.maxCount}>
          ${this.valueAsArray.length} / ${this.maxCount}
        </span>

        <div class="container" tabindex=${this.disabled ? '-1' : '0'}>
          <slot name="prefix"></slot>
          ${this.renderContent()}
          <slot name="suffix"></slot>

          <u-icon class="suffix-item"
            ?hidden=${!this.clearable || !this.hasValue || this.disabled || this.readonly}
            lib="internal"
            name="x-lg"
            @click=${this.handleClearClick}
          ></u-icon>
          <u-icon class="suffix-item"
            ?hidden=${this.loading}
            lib="internal"
            name="chevron-down"
          ></u-icon>
          <u-spinner class="suffix-item"
            ?hidden=${!this.loading}
          ></u-spinner>
        </div>
      </u-field>

      <u-popover part="popover"
        role="listbox"
        scrollable
        autofocus
        for=".container"
        trigger="click"
        placement="bottom-start"
        offset="1"
      >
        <div class="search-input" ?hidden=${!this.searchable}>
          <u-icon lib="internal" name="search"></u-icon>
          <input
            type="text"
            @input=${this.handleSearchInput}
            @keydown=${this.handleSearchKeydown}
          />
        </div>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </u-popover>
    `;
  }

  private renderContent() {
    if (this.multiple) {
      const values = this.valueAsArray;
      if (values.length === 0) {
        return html`<span class="text-content placeholder">${this.placeholder ?? ''}</span>`;
      }
      
      return html`
        <div class="chips-content">
          ${values.map(v => html`
              <u-chip 
                removable
                data-value=${v} 
                @u-remove=${this.handleChipRemove}
              >
                ${this.options.find(o => o.value === v)?.getText() ?? v}
              </u-chip>`
            )}
        </div>
      `;
    } else {
      const text = this.options.find(o => o.value === this.value)?.getText();
      if (!text) {
        return html`
          <span class="text-content placeholder">${this.placeholder ?? ''}</span>`;
      }
      
      return html`<span class="text-content">${text}</span>`;
    }
  }

  public validate(): boolean {
    if (this.internals) {
      this.invalid = !this.internals.checkValidity();
    } else {
      const { flags } = this.getValidity(this.valueAsArray);
      this.invalid = Object.keys(flags).length > 0;
    }
    return !this.invalid;
  }

  public reset(): void {
    this.value = this.multiple ? [] : '';
    this.invalid = false;
  }

  private setup(options: UOption[]) {
    for (const option of options) {
      option.removeEventListener('click', this.handleOptionClick);
      option.removeEventListener('keydown', this.handleOptionKeydown);
      option.addEventListener('click', this.handleOptionClick);
      option.addEventListener('keydown', this.handleOptionKeydown);
      option.marker = this.multiple ? 'check' : undefined;
      option.disabled = this.disabled;
      option.selected = this.multiple 
        ? this.valueAsArray.includes(option.value) 
        : option.value === this.value;
    }
  }

  private cleanup(options: UOption[]) {
    for (const option of options) {
      option.removeEventListener('click', this.handleOptionClick);
      option.removeEventListener('keydown', this.handleOptionKeydown);
    }
  }

  private onChangeValue(): void {
    const values = this.valueAsArray;
    for (const option of this.options) {
      if (this.multiple) {
        option.selected = values.includes(option.value);
      } else {
        option.selected = option.value === this.value;
      }
    }
    this.internals?.setFormValue(this.valueAsString);
    const { flags, message } = this.getValidity(values);
    this.internals?.setValidity(
      flags, 
      this.validationMessage || message, 
      this.containerEl || undefined
    );

    if (!this.novalidate) {
      this.validate();
    }
    this.emit('u-change');
  }

  private getValidity(values: string[]): { flags: ValidityStateFlags; message: string } {
    if (this.required && !values.length) {
      return { flags: { valueMissing: true }, message:  'This field is required' };
    }
    if (this.multiple && this.minCount != null && values.length > 0 && values.length < this.minCount) {
      return { flags: { rangeUnderflow: true }, message: `Please select at least ${this.minCount} items` };
    }
    if (this.multiple && this.maxCount != null && values.length > this.maxCount) {
      return { flags: { rangeOverflow: true }, message: `Please select no more than ${this.maxCount} items` };
    }
    return { flags: {}, message: '' };
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
    const option = e.currentTarget as UOption;
    if (option.disabled) return;

    if (this.multiple) {
      const values = this.valueAsArray;
      if (values.includes(option.value)) {
        this.value = values.filter(v => v !== option.value);
      } else {
        if (this.maxCount != null && values.length >= this.maxCount) return;
        this.value = [...values, option.value];
      }
    } else {
      this.value = option.value;
      this.popoverEl?.hide();
    }
  };

  private handleOptionKeydown = (e: KeyboardEvent) => {
    const options = this.options.filter(o => !o.hidden && !o.disabled);
    const currentOption = e.currentTarget as UOption;
    const currentIndex = options.indexOf(currentOption);
    if (currentIndex === -1) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        currentOption.click();
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % options.length;
        options[nextIndex].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        options[prevIndex].focus();
        break;
      case 'Home':
        e.preventDefault();
        options[0].focus();
        break;
      case 'End':
        e.preventDefault();
        options[options.length - 1].focus();
        break;
      case 'Escape':
        e.preventDefault();
        this.popoverEl?.hide();
        break;
    }
  };

  private handleSearchInput = (e: InputEvent) => {
    const input = e.target as HTMLInputElement;
    const query = input.value.toLowerCase().trim();
    for (const option of this.options) {
      if (!query) {
        option.hidden = false;
      } else {
        const label = option.getText().toLowerCase();
        const value = option.value.toLowerCase();
        option.hidden = !label.includes(query) && !value.includes(query);
      }
    }
  };

  private handleSearchKeydown = (e: KeyboardEvent) => {
    const options = this.options.filter(o => !o.hidden && !o.disabled);
    if (options.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        options[0].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        options[options.length - 1].focus();
        break;
      case 'Escape':
        e.preventDefault();
        this.popoverEl?.hide();
        break;
    }
  };

  private handleClearClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.reset();
    this.containerEl?.click();
  };

  private handleChipRemove = (e: Event) => {
    e.stopImmediatePropagation();
    const chip = e.currentTarget as UChip;
    const value = chip.dataset.value;
    if (!value) return;
    this.value = this.valueAsArray.filter(v => v !== value);
  };
}
