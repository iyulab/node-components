import { html, PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../field/UField.js';
import '../icon/UIcon.js';
import '../spinner/USpinner.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { Locale } from "../../utilities/Locale.js";
import { UChip } from "../chip/UChip.js";
import { UOption } from "../option/UOption.js";
import { UPopover } from "../popover/UPopover.js";
import { styles } from "./USelect.styles.js";

export type SelectVariant = 'outlined' | 'filled' | 'underlined' | 'borderless';

/**
 * 드롭다운 목록에서 값을 선택하는 폼 컨트롤 컴포넌트입니다.
 * 단일 선택 및 다중 선택, 검색 기능을 지원합니다.
 *
 * @slot - u-option 아이템
 * @slot display - 트리거에 표시할 콘텐츠를 직접 지정. 비워두면 선택값 텍스트를 자동 생성해 보여준다.
 *   (u-option을 그대로 옮겨 꽂을 수는 없다 — 하나의 노드는 slot에 동시에 두 곳 렌더링될 수 없어서
 *   팝오버 목록에서 사라지기 때문. 리치 콘텐츠가 필요하면 이 slot에 별도 마크업을 할당하고
 *   `change` 이벤트에서 직접 갱신한다.)
 *
 * @csspart field - u-field 요소
 * @csspart container - 트리거 영역을 감싸는 요소
 * @csspart popover - 옵션 목록이 표시되는 팝오버 요소
 * @csspart search-input - 검색 입력 영역
 * 
 * @cssprop --select-popover-width - 팝오버의 너비 (기본값: 앵커(트리거) 너비, strategy와 무관하게 동일).
 *   옵션 텍스트가 길어도 이 값을 넘겨 넓어지지 않으며, 넘치는 텍스트는 UOption에서 ellipsis 처리된다.
 * @cssprop --select-popover-min-height - 팝오버의 최소 높이 (기본값: 0px)
 * @cssprop --select-popover-max-height - 팝오버의 최대 높이 (기본값: 50vh)
 * 
 * @event change - 사용자 상호작용(옵션 클릭·칩 제거·지우기)으로 선택 값이 변경될 때 발생.
 *   네이티브 select와 동일하게 프로그램적 value 세팅·옵션 등록으로는 발화하지 않는다.
 */
@customElement('u-select')
export class USelect extends UFormControlElement<string | string[]> {
  static styles = [ super.styles, styles ];

  /** 트리거 영역의 스타일 변형 */
  @property({ type: String, reflect: true }) variant: SelectVariant = 'outlined';
  /** 다중 선택 여부 */
  @property({ type: Boolean, reflect: true }) multiple: boolean = false;
  /** 검색 가능 여부 */
  @property({ type: Boolean, reflect: true }) searchable: boolean = false;
  /** 지우기 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) clearable: boolean = false;
  /** 로딩 상태 표시 여부 */
  @property({ type: Boolean, reflect: true }) loading: boolean = false;
  /** 최소 선택 개수 (다중 선택 시) */
  @property({ type: Number, attribute: 'min-count' }) minCount?: number;
  /** 최대 선택 개수 (다중 선택 시) */
  @property({ type: Number, attribute: 'max-count' }) maxCount?: number;
  /** placeholder 텍스트 */
  @property({ type: String }) placeholder?: string;

  /** 폼 제출 시 사용되는 값. attribute로는 단일 값 문자열 또는 JSON 배열(`value='["a","b"]'`)을 지원한다. */
  @property({
    converter: {
      fromAttribute: (value: string | null): string | string[] | undefined => {
        if (value == null) return undefined;
        if (value.trim().startsWith('[')) {
          try { return JSON.parse(value); } catch { return value; }
        }
        return value;
      },
    },
  }) value?: string | string[];

  @query('.container', true) containerEl?: HTMLElement;
  @query('u-popover', true) popoverEl?: UPopover;

  @state() private options: UOption[] = [];
  /** aria-expanded 배선용 팝오버 열림 상태 */
  @state() private open: boolean = false;
  /** combobox → listbox 연결용 고유 id (aria-controls) */
  private readonly listboxId = `u-select-listbox-${Math.random().toString(36).slice(2, 8)}`;

  protected shouldValidate(changed: PropertyValues): boolean {
    return super.shouldValidate(changed)
      || ['minCount', 'maxCount', 'multiple'].some(k => changed.has(k));
  }

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

    if (['value','options'].some(k => changedProperties.has(k))) {
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
        <span slot="label-aside" class="count" ?hidden=${!this.multiple || !this.maxCount}>
          ${this.valueAsArray.length} / ${this.maxCount}
        </span>

        <div class="container" part="container" tabindex=${this.disabled ? "-1" : "0"}
          role="combobox"
          aria-label=${ifDefined(this.label)}
          aria-description=${ifDefined(this.description)}
          aria-haspopup="listbox"
          aria-expanded=${this.open}
          aria-controls=${this.listboxId}>
          <slot name="prefix"></slot>
          <slot name="display">${this.renderContent()}</slot>
          <slot name="suffix"></slot>

          <u-icon class="suffix-item"
            ?hidden=${!this.clearable || !this.hasValue || this.disabled || this.readonly}
            lib="internal"
            name="x"
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
        id=${this.listboxId}
        role="listbox"
        scrollable
        autofocus
        for=".container"
        trigger="click"
        @show=${() => (this.open = true)}
        @hide=${() => (this.open = false)}
        strategy="fixed"
        placement="bottom-start"
        offset="1"
      >
        <div class="search-input" part="search-input" 
          ?hidden=${!this.searchable}>
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
                @remove=${this.handleChipRemove}
              >
                ${this.options.find(o => o.value === v)?.getText() ?? v}
              </u-chip>`
            )}
        </div>
      `;
    } else {
      const option = this.options.find(o => o.value === this.value);
      if (!option) {
        return html`
          <span class="text-content placeholder">${this.placeholder ?? ''}</span>`;
      }

      return html`<span class="text-content">${option.getContent()}</span>`;
    }
  }

  protected setValidity(): void {
    const values = this.valueAsArray;
    let flags: ValidityStateFlags = {};
    let message = '';

    if (this.required && !values.length) {
      flags = { valueMissing: true };
      message = Locale.getValue('valueMissing');
    } else if (this.multiple && this.minCount != null && values.length > 0 && values.length < this.minCount) {
      flags = { tooShort: true };
      message = Locale.getValue('tooShort', { min: this.minCount });
    } else if (this.multiple && this.maxCount != null && values.length > this.maxCount) {
      flags = { tooLong: true };
      message = Locale.getValue('tooLong', { max: this.maxCount });
    }

    this.commit(flags, message, this.containerEl ?? undefined);
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
  }

  /** 사용자 상호작용으로 값이 바뀐 경로에서만 호출한다 — 프로그램적 value 세팅은
   *  네이티브 폼 컨트롤과 동일하게 change를 발화하지 않는다.
   *  UI 재렌더를 동반한 validate()도 이 경로에서만 수행한다(v1.5.1 검증 아키텍처 —
   *  updated() 경로는 base의 silent setValidity()만 수행해 Lit 중복 업데이트를 피한다). */
  private emitChange(): void {
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
      this.emitChange();
    } else {
      // 동일 옵션 재선택은 네이티브 select와 동일하게 change를 발화하지 않는다.
      const changed = option.value !== this.value;
      this.value = option.value;
      if (changed) this.emitChange();
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
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % options.length;
        options[nextIndex].focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        options[prevIndex].focus();
        break;
      }
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
    this.emitChange();
    this.containerEl?.click();
  };

  private handleChipRemove = (e: Event) => {
    const chip = e.currentTarget as UChip;
    const value = chip.dataset.value;
    if (!value) return;
    this.value = this.valueAsArray.filter(v => v !== value);
    this.emitChange();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-select': USelect;
  }
}
