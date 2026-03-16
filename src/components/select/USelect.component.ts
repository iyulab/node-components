import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { UOption } from "../option/UOption.component.js";
import { styles } from "./USelect.styles.js";

/**
 * Select 컴포넌트는 드롭다운에서 옵션을 선택하는 폼 컨트롤입니다.
 */
export class USelect extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon,
    'u-option': UOption,
  };

  /** 드롭다운 열림 상태 */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** 선택된 값 */
  @property({ type: String }) value: string = '';
  /** 레이블 */
  @property({ type: String }) label: string = '';
  /** 미선택 시 표시 텍스트 */
  @property({ type: String }) placeholder: string = '';
  /** 비활성화 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 필수 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 폼 이름 */
  @property({ type: String }) name: string = '';

  /** 현재 표시 텍스트 */
  @state() private displayLabel: string = '';
  /** 키보드 탐색 인덱스 (enabledOptions 기준) */
  @state() private focusedIndex: number = -1;

  private options: UOption[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeydown);
    window.addEventListener('pointerdown', this.handleWindowPointerDown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('pointerdown', this.handleWindowPointerDown);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('value')) {
      this.syncSelectionFromValue();
    }
    if (changedProperties.has('open')) {
      if (this.open) this.emit('u-show');
      else this.emit('u-hide');
    }
  }

  render() {
    return html`
      <div class="header" ?hidden=${!this.label}>
        <span class="required" ?hidden=${!this.required}>*</span>
        <label class="label-text">${this.label}</label>
      </div>

      <div class="trigger" part="trigger"
        tabindex=${this.disabled ? -1 : 0}
        role="combobox"
        aria-expanded=${this.open}
        aria-haspopup="listbox"
        ?disabled=${this.disabled}>
        <span class="display-value" part="display-value">
          ${this.displayLabel || html`<span class="placeholder">${this.placeholder}</span>`}
        </span>
        <u-icon class="chevron" lib="internal" name="chevron-down"></u-icon>
      </div>

      <div class="listbox" part="listbox" role="listbox">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  /** 옵션 목록 갱신 */
  private handleSlotChange = () => {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return;
    this.options = slot.assignedElements({ flatten: true })
      .filter((el): el is UOption => el instanceof UOption);
    this.syncSelectionFromValue();
  }

  /** value에 맞게 선택 상태 동기화 */
  private syncSelectionFromValue() {
    let matched = false;
    for (const option of this.options) {
      const isMatch = option.value === this.value;
      option.selected = isMatch;
      if (isMatch) {
        this.displayLabel = option.getDisplayLabel();
        matched = true;
      }
    }
    if (!matched) {
      this.displayLabel = '';
    }
  }

  /** 클릭 핸들러 — host에서 리스닝하여 UOption 클릭과 트리거 클릭 모두 처리 */
  private handleClick = (e: MouseEvent) => {
    if (this.disabled) return;

    // UOption 클릭 처리
    const target = e.target;
    if (target instanceof UOption && !target.disabled) {
      this.selectOption(target);
      return;
    }

    // 트리거 영역 클릭 → 토글
    const trigger = this.shadowRoot?.querySelector('.trigger');
    if (trigger && e.composedPath().includes(trigger)) {
      this.toggleOpen();
    }
  }

  /** 드롭다운 토글 */
  private toggleOpen() {
    if (this.open) {
      this.open = false;
    } else {
      this.open = true;
      const enabledOptions = this.options.filter(o => !o.disabled);
      this.focusedIndex = enabledOptions.findIndex(o => o.selected);
      if (this.focusedIndex < 0) this.focusedIndex = 0;
      this.updateFocusedOption();
    }
  }

  /** 키보드 탐색 */
  private handleKeydown = (e: KeyboardEvent) => {
    if (this.disabled) return;

    if (!this.open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        this.toggleOpen();
      }
      return;
    }

    const enabledOptions = this.options.filter(o => !o.disabled);
    if (enabledOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusedIndex = Math.min(this.focusedIndex + 1, enabledOptions.length - 1);
        this.updateFocusedOption();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
        this.updateFocusedOption();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (this.focusedIndex >= 0 && this.focusedIndex < enabledOptions.length) {
          this.selectOption(enabledOptions[this.focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.open = false;
        this.shadowRoot?.querySelector<HTMLElement>('.trigger')?.focus();
        break;
    }
  }

  /** 외부 클릭 시 닫기 */
  private handleWindowPointerDown = (e: PointerEvent) => {
    if (!this.open) return;
    const path = e.composedPath();
    if (!path.includes(this)) {
      this.open = false;
    }
  }

  /** 옵션 선택 */
  private selectOption(option: UOption) {
    if (option.disabled) return;
    this.value = option.value;
    this.syncSelectionFromValue();
    this.emit('u-change', { value: this.value });
    this.open = false;
    this.shadowRoot?.querySelector<HTMLElement>('.trigger')?.focus();
  }

  /** 포커스 표시 업데이트 (enabledOptions 인덱스 기준) */
  private updateFocusedOption() {
    const enabledOptions = this.options.filter(o => !o.disabled);
    enabledOptions.forEach((option, i) => {
      option.setAttribute('aria-current', i === this.focusedIndex ? 'true' : 'false');
    });
  }
}
