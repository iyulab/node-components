import { html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { styles } from "./UOption.styles.js";

export type OptionMode = 'select' | 'radio' | 'combobox';

/**
 * Option 컴포넌트는 선택 가능한 항목을 나타냅니다.
 * Select, Radio, Input(combobox) 컴포넌트의 자식으로 사용됩니다.
 * mode 속성에 따라 렌더링이 분기됩니다.
 *
 * @slot - 기본 슬롯 (옵션 라벨 텍스트)
 * @slot prefix - 라벨 앞에 표시되는 아이콘 등 (select/combobox 모드)
 * @slot suffix - 라벨 뒤에 표시되는 추가 콘텐츠 (select/combobox 모드)
 */
export class UOption extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon,
  };

  /** 렌더링 모드 (부모 컨테이너가 주입) */
  @property({ type: String, reflect: true }) mode: OptionMode = 'select';
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 선택 여부 */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  /** 옵션 값 */
  @property({ type: String, reflect: true }) value: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'option');
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    this.addEventListener('click', this.handleClick);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick);
    super.disconnectedCallback();
  }

  render() {
    if (this.mode === 'radio') {
      return html`
        <span class="radio-marker"></span>
        <span class="radio-label"><slot></slot></span>
      `;
    }

    // select / combobox 모드
    return html`
      ${this.selected
        ? html`<u-icon lib="internal" name="check-lg"></u-icon>`
        : nothing}
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
    `;
  }

  /** 표시할 텍스트를 반환합니다. */
  public getLabel(): string {
    const selector = this.mode === 'radio'
      ? 'slot'
      : 'slot:not([name])';
    const slot = this.shadowRoot?.querySelector(selector) as HTMLSlotElement | null;
    if (!slot) return this.value;
    const nodes = slot.assignedNodes({ flatten: true });
    const text = nodes.map(n => n.textContent?.trim()).filter(Boolean).join('');
    return text || this.value;
  }

  private handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;
    this.emit('u-select');
  };
}
