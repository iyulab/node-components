import { html, nothing, PropertyValues } from "lit";
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

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    // 사용 맥락(marker)에 따라 접근성 역할·상태 ARIA 를 맞춘다:
    // radiogroup(marker='radio') 안에서는 role=radio + aria-checked,
    // 그 외 listbox(u-select/u-input combobox) 에서는 role=option + aria-selected.
    // (부모 컨테이너의 role=radiogroup/listbox 와 자식 role 이 짝을 이뤄야 스크린리더가
    //  이름만 있고 비어 보이는 위젯으로 읽지 않는다.)
    const isRadio = this.marker === 'radio';
    this.setAttribute('role', isRadio ? 'radio' : 'option');
    this.removeAttribute(isRadio ? 'aria-selected' : 'aria-checked');
    this.setAttribute(isRadio ? 'aria-checked' : 'aria-selected', String(this.selected));
    this.setAttribute('aria-disabled', String(this.disabled));
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

  private renderMarker() {
    if (this.marker === 'radio') {
      return html`<span class="radio-marker" part="radio-marker"></span>`;
    }

    if (this.marker === 'check') {
      return html`
        <u-icon class="check-marker" part="check-marker"
          ?hidden=${!this.selected}
          lib="internal"
          name="check"
        ></u-icon>
      `;
    }

    return nothing;
  }

  /** 라벨(기본 slot)의 텍스트 노드만 추출한다 — 엘리먼트 자식(예: 설명용 `<p>`)은 제외. */
  public getText(): string {
    const slot = this.renderRoot.querySelector('slot:not([name])') as HTMLSlotElement | null;
    const text = slot?.assignedNodes({ flatten: true })
      .filter(n => n.nodeType === Node.TEXT_NODE)
      .map(n => n.textContent ?? '')
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
    return text || this.value;
  }

  /** 라벨(기본 slot) 노드를 clone해서 반환한다 — 원본은 옵션 목록에 계속 slot돼 있어야 하므로. */
  public getContent(): Node[] {
    const slot = this.renderRoot.querySelector('slot:not([name])') as HTMLSlotElement | null;
    const nodes = slot?.assignedNodes({ flatten: true }).map(n => n.cloneNode(true)) ?? [];
    return nodes.length > 0 ? nodes : [document.createTextNode(this.value)];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-option': UOption;
  }
}
