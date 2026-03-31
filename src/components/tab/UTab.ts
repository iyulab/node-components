import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import '../button/UButton.js';
import '../icon/UIcon.js';

import { UElement } from "../UElement.js";
import { styles } from "./UTab.styles.js";
import { type RemoveEventDetail } from "../../events/RemoveEvent.js";

/**
 * 탭 패널에서 사용하는 탭 아이템(탭 버튼) 컴포넌트입니다.
 *
 * @slot - 탭 레이블 콘텐츠
 * @slot prefix - 탭 레이블 앞에 표시되는 콘텐츠
 * @slot suffix - 탭 레이블 뒤에 표시되는 콘텐츠
 *
 * @csspart remove-btn - 탭 닫기 버튼
 * 
 * @event remove - 탭이 닫힐 때 발생. 이벤트 리스너에서 preventDefault()를 호출하면 탭이 닫히지 않습니다.
 */
@customElement('u-tab')
export class UTab extends UElement {
  static styles = [super.styles, styles];

  /** 탭 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 탭 닫기 가능 여부 */
  @property({ type: Boolean, reflect: true }) removable = false;
  /** 탭 고유값 (패널 매칭에 사용) */
  @property({ type: String, reflect: true }) value = "";
  /** 탭 드래그 여부 */
  @property({ type: Boolean, reflect: true }) draggable = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tab');
    this.setAttribute('tabindex', '0');
    if (!this.hasAttribute('slot')) {
      this.setAttribute('slot', 'tab');
    }
  }

  render() {
    return html`
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
      
      <u-button class="remove-btn" part="remove-btn"
        ?hidden=${!this.removable}
        variant="ghost"
        tabindex="-1"
        aria-label="Close tab"
        @click=${this.handleRemoveClick}
      >
        <u-icon lib="internal" name="x-lg"></u-icon>
      </u-button>
    `;
  }

  private handleRemoveClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;

    if(this.fire<RemoveEventDetail>('remove')) {
      this.remove();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-tab': UTab;
  }
}
