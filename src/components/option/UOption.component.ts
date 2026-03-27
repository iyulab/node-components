import { html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { styles } from "./UOption.styles.js";

export type OptionMarker = 'radio' | 'check';

/**
 * Option 컴포넌트는 선택 가능한 항목을 나타냅니다.
 * Select, Radio, Input(combobox) 컴포넌트의 자식으로 사용됩니다.
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

  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 선택 여부 */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  /** 렌더링 모드 */
  @property({ type: String, reflect: true }) marker?: OptionMarker;
  /** 옵션 고유값 */
  @property({ type: String }) value: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'option');
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
  }

  render() {
    return html`
      ${this.renderMarker()}
      <slot name="prefix"></slot>
      <div class="content" part="content">
        <slot></slot>
      </div>
      <slot name="suffix"></slot>
    `;
  }

  /** 표시할 텍스트를 반환합니다. */
  public getText(): string {
    const slot = this.renderRoot.querySelector('slot:not([name])') as HTMLSlotElement | null;
    const text = slot?.assignedNodes({ flatten: true })
      .map(n => n.textContent?.trim()).filter(Boolean).join('');
    return text || this.value;
  }

  private renderMarker() {
    if(this.marker === 'radio') {
      return html`<span class="radio-marker" part="radio-marker"></span>`;
    }

    if (this.marker === 'check') {
      return html`
        <u-icon class="check-marker" part="check-marker"
          ?hidden=${!this.selected}
          lib="internal"
          name="check-lg"
        ></u-icon>
      `;
    }

    return nothing;
  }
}
