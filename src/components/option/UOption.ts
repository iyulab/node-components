import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import '../icon/UIcon.js';

import { UElement } from "../UElement.js";
import { styles } from "./UOption.styles.js";

export type OptionMarker = 'radio' | 'check';

/**
 * 선택 가능한 항목을 나타내는 컴포넌트입니다.
 * USelect, URadio, UInput(combobox)의 자식으로 사용됩니다.
 *
 * @slot - 옵션 라벨 텍스트
 * @slot prefix - 라벨 앞에 표시되는 아이콘 등
 * @slot suffix - 라벨 뒤에 표시되는 추가 콘텐츠
 *
 * @csspart content - 콘텐츠 영역
 * 
 * @cssprop --option-color-interactive - 호버/포커스 시 텍스트 색상
 * @cssprop --option-border-color-interactive - 호버/포커스 시 테두리 색상
 * @cssprop --option-background-color-interactive - 호버/포커스 시 배경 색상
 * @cssprop --option-color-active - 선택된 상태의 텍스트 색상
 * @cssprop --option-border-color-active - 선택된 상태의 테두리 색상
 * @cssprop --option-background-color-active - 선택된 상태의 배경 색상
 * @cssprop --option-color-active-interactive - 선택된 상태에서 호버/포커스 시 텍스트 색상
 * @cssprop --option-border-color-active-interactive - 선택된 상태에서 호버/포커스 시 테두리 색상
 * @cssprop --option-background-color-active-interactive - 선택된 상태에서 호버/포커스 시 배경 색상
 */
@customElement('u-option')
export class UOption extends UElement {
  static styles = [ super.styles, styles ];

  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 선택 여부 */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  /** 옵션 마커 유형. 'radio'는 원형, 'check'는 체크 모양의 마커를 표시합니다. */
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

  public getText(): string {
    const slot = this.renderRoot.querySelector('slot:not([name])') as HTMLSlotElement | null;
    const text = slot?.assignedNodes({ flatten: true })
      .map(n => n.textContent?.trim()).filter(Boolean).join('');
    return text || this.value;
  }

  private renderMarker() {
    if (this.marker === 'radio') {
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

declare global {
  interface HTMLElementTagNameMap {
    'u-option': UOption;
  }
}
