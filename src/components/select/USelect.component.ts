import { html, PropertyValues, nothing } from "lit";
import { property, query, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { UOption } from "../option/UOption.component.js";
import { UPopover } from "../popover/UPopover.component.js";
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
export class USelect extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon,
    'u-option': UOption,
    'u-popover': UPopover,
  };

  /** 트리거 영역의 스타일 변형 */
  @property({ type: String, reflect: true }) variant: SelectVariant = 'outlined';
  /** 드롭다운 열림 상태 */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 읽기 전용 여부 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 유효성 검사 실패 여부 */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 다중 선택 여부 */
  @property({ type: Boolean, reflect: true }) multiple: boolean = false;
  /** 검색 가능 여부 */
  @property({ type: Boolean, reflect: true }) searchable: boolean = false;
  /** 클리어 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) clearable: boolean = false;
  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** placeholder 텍스트 */
  @property({ type: String }) placeholder?: string;
  /** 컴포넌트 하단 설명 텍스트 */
  @property({ type: String }) description?: string;
  /** 유효성 검사 실패 시 표시할 메시지 */
  @property({ type: String }) validationMessage?: string;
  /** 옵션이 없을 때 표시할 메시지 */
  @property({ type: String }) emptyMessage: string = '선택할 수 있는 항목이 없습니다';
  /** input 요소의 name 속성 */
  @property({ type: String }) name?: string;
  /** 현재 선택된 값 (단일 선택 시) */
  @property({ type: String }) value: string = '';
  /** 현재 선택된 값 배열 (다중 선택 시) */
  @property({ type: Array }) values: string[] = [];

  /** 옵션 목록 */
  @state() private options: UOption[] = [];
  /** 검색어 */
  @state() private searchText: string = '';

  /** 현재 표시할 유효성 검사 메시지 */
  @state() currentValidationMessage: string = '';

  @query('.trigger') triggerEl!: HTMLElement;
  @query('u-popover') popoverEl!: UPopover;
  @query('.search-input') searchInputEl?: HTMLInputElement;

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

    if (changedProperties.has('value') || changedProperties.has('values')) {
      this.syncOptions();
    }
  }

  render() {
    const hasValue = this.multiple
      ? this.values.length > 0
      : this.value !== '';

    return html`
      <div class="header" ?hidden=${!this.label}>
        <span class="required" ?hidden=${!this.required}>*</span>
        <label class="label" @click=${this.handleTriggerClick}>
          ${this.label}
        </label>
      </div>

      <div class="trigger"
        tabindex=${this.disabled ? '-1' : '0'}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        ?invalid=${this.invalid}
        @click=${this.handleTriggerClick}
        @keydown=${this.handleTriggerKeydown}
      >
        ${this.multiple ? this.renderMultipleDisplay() : this.renderSingleDisplay()}

        <u-icon class="icon" tabindex="-1"
          ?hidden=${!this.clearable || !hasValue || this.disabled || this.readonly}
          lib="internal"
          name="x-lg"
          @click=${this.handleClear}
        ></u-icon>
        <u-icon class="icon chevron" tabindex="-1"
          ?hidden=${this.disabled}
          lib="internal"
          name="chevron-down"
        ></u-icon>
      </div>

      <u-popover class="dropdown"
        trigger="manual"
        .dismiss=${['click', 'scroll', 'resize'] as any}
        placement="bottom-start"
        .offset=${4}
        role="listbox"
        @u-show=${this.handlePopoverShow}
        @u-hide=${this.handlePopoverHide}
      >
        ${this.searchable ? html`
          <div style="padding: 4px 4px 6px;">
            <input class="search-input"
              type="text"
              placeholder="검색..."
              .value=${this.searchText}
              @input=${this.handleSearchInput}
              @click=${(e: Event) => e.stopPropagation()}
            />
          </div>
        ` : nothing}
        <slot @slotchange=${this.handleSlotChange}></slot>
        <div class="empty-message"
          ?hidden=${this.getVisibleOptions().length > 0}
        >${this.emptyMessage}</div>
      </u-popover>

      <div class="validation-message" ?hidden=${!this.currentValidationMessage}>
        ${this.currentValidationMessage}
      </div>

      <div class="description" ?hidden=${!this.description}>
        ${this.description}
      </div>
    `;
  }

  /** 단일 선택 모드의 표시 영역 */
  private renderSingleDisplay() {
    const selectedOption = this.options.find(o => o.value === this.value);
    const displayText = selectedOption?.getLabel() ?? '';

    if (!displayText) {
      return html`<span class="display-text placeholder">${this.placeholder ?? ''}</span>`;
    }
    return html`<span class="display-text">${displayText}</span>`;
  }

  /** 다중 선택 모드의 표시 영역 */
  private renderMultipleDisplay() {
    if (this.values.length === 0) {
      return html`<span class="display-text placeholder">${this.placeholder ?? ''}</span>`;
    }

    return html`
      <div class="tags">
        ${this.values.map(v => {
          const option = this.options.find(o => o.value === v);
          const label = option?.getLabel() ?? v;
          return html`
            <span class="tag">
              ${label}
              <button class="tag-remove"
                tabindex="-1"
                @click=${(e: MouseEvent) => this.handleTagRemove(e, v)}
              >&times;</button>
            </span>
          `;
        })}
      </div>
    `;
  }

  /** 드롭다운을 엽니다. */
  public async show(): Promise<boolean> {
    if (this.open || this.disabled || this.readonly) return false;
    if (!this.emit('u-show')) return false;

    this.open = true;
    await this.popoverEl.show(this.triggerEl);

    document.addEventListener('keydown', this.handleDocumentKeydown);

    if (this.searchable) {
      this.searchText = '';
      this.filterOptions();
      await this.updateComplete;
      this.searchInputEl?.focus();
    }

    return true;
  }

  /** 드롭다운을 닫습니다. */
  public async hide(): Promise<boolean> {
    if (!this.open) return true;
    if (!this.emit('u-hide')) return false;

    this.open = false;
    this.searchText = '';
    this.filterOptions();
    await this.popoverEl.hide();

    document.removeEventListener('keydown', this.handleDocumentKeydown);

    return true;
  }

  /** 선택값을 초기화합니다. */
  public clear(): void {
    if (this.multiple) {
      this.values = [];
    } else {
      this.value = '';
    }
    this.syncOptions();
    this.emit('u-change');
  }

  /** 유효성 검사를 수행합니다. */
  public validate(): boolean {
    if (!this.required) {
      this.invalid = false;
      this.currentValidationMessage = '';
      return true;
    }

    const hasValue = this.multiple ? this.values.length > 0 : this.value !== '';
    this.invalid = !hasValue;
    this.currentValidationMessage = this.invalid
      ? (this.validationMessage || '필수 항목입니다')
      : '';

    return !this.invalid;
  }

  /** 옵션의 selected 상태를 현재 value와 동기화 */
  private syncOptions(): void {
    for (const option of this.options) {
      if (this.multiple) {
        option.selected = this.values.includes(option.value);
      } else {
        option.selected = option.value === this.value;
      }
    }
  }

  /** 검색 필터에 따라 옵션을 표시/숨김 */
  private filterOptions(): void {
    const query = this.searchText.toLowerCase().trim();
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
    if (!this.open) return;

    this.open = false;
    this.searchText = '';
    this.filterOptions();
    document.removeEventListener('keydown', this.handleDocumentKeydown);
    this.emit('u-hide');
  };

  /** 슬롯 변경 시 옵션 목록 갱신 */
  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.options = slot.assignedElements({ flatten: true }).filter(
      (el): el is UOption => el instanceof UOption
    );
    this.syncOptions();
  };

  /** 옵션 선택 이벤트 핸들러 */
  private handleOptionSelect = (e: Event) => {
    e.stopPropagation();
    const option = e.target as UOption;
    if (!(option instanceof UOption)) return;

    if (this.multiple) {
      const index = this.values.indexOf(option.value);
      if (index >= 0) {
        this.values = this.values.filter(v => v !== option.value);
      } else {
        this.values = [...this.values, option.value];
      }
      this.syncOptions();
    } else {
      this.value = option.value;
      this.syncOptions();
      this.hide();
    }

    this.emit('u-change');
  };

  /** 트리거 클릭 핸들러 */
  private handleTriggerClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled || this.readonly) return;

    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
  };

  /** 트리거 키보드 핸들러 */
  private handleTriggerKeydown = (e: KeyboardEvent) => {
    if (this.disabled || this.readonly) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        if (!this.open) {
          this.show();
        } else {
          this.focusFirstOption();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!this.open) {
          this.show();
        } else {
          this.focusLastOption();
        }
        break;
      case 'Escape':
        if (this.open) {
          e.preventDefault();
          this.hide();
        }
        break;
    }
  };

  /** 문서 키보드 핸들러 */
  private handleDocumentKeydown = (e: KeyboardEvent) => {
    if (!this.open) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.hide();
        this.triggerEl?.focus();
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
      case 'Enter':
      case ' ': {
        if (this.searchable && e.key === ' ') break;
        e.preventDefault();
        const focused = this.options.find(o => o.matches(':focus'));
        if (focused && !focused.disabled) {
          focused.click();
        }
        break;
      }
    }
  };

  /** 검색 입력 핸들러 */
  private handleSearchInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.searchText = input.value;
    this.filterOptions();
  };

  /** 클리어 버튼 핸들러 */
  private handleClear = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.clear();
  };

  /** 태그 제거 핸들러 (다중 선택 모드) */
  private handleTagRemove = (e: MouseEvent, value: string) => {
    e.preventDefault();
    e.stopPropagation();
    this.values = this.values.filter(v => v !== value);
    this.syncOptions();
    this.emit('u-change');
  };

//#endregion

  /** 첫 번째 옵션에 포커스 */
  private focusFirstOption(): void {
    const visible = this.getVisibleOptions();
    if (visible.length > 0) visible[0].focus();
  }

  /** 마지막 옵션에 포커스 */
  private focusLastOption(): void {
    const visible = this.getVisibleOptions();
    if (visible.length > 0) visible[visible.length - 1].focus();
  }

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
