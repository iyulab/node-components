import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UCard.styles.js";

export type CardOrientation = 'vertical' | 'horizontal';

/**
 * 콘텐츠를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * @slot - 카드의 본문 콘텐츠
 * @slot header - 카드 상단 헤더 영역
 * @slot footer - 카드 하단 푸터 영역
 * @slot media - 카드의 미디어 영역 (이미지, 동영상 등)
 * 
 * @csspart media - 미디어 영역 컨테이너
 * @csspart content - 콘텐츠 영역 컨테이너
 * @csspart header - 헤더 영역 컨테이너
 * @csspart body - 본문 영역 컨테이너
 * @csspart footer - 푸터 영역 컨테이너
 */
@customElement('u-card')
export class UCard extends UElement {
  static styles = [ super.styles, styles ];

  /** 카드 레이아웃 방향 */
  @property({ type: String, reflect: true }) orientation: CardOrientation = 'vertical';
  /** 그림자 제거 여부 */
  @property({ type: Boolean, reflect: true }) shadowless = false;
  /** 테두리 제거 여부 */
  @property({ type: Boolean, reflect: true }) borderless = false;
  /** 마우스 오버 효과 적용 여부 */
  @property({ type: Boolean, reflect: true }) hoverable = false;

  render() {
    return html`
      <div class="media" part="media">
        <slot name="media" @slotchange=${this.handleSlotChange}></slot>
      </div>
      <div class="content" part="content">
        <header class="header" part="header">
          <slot name="header" @slotchange=${this.handleSlotChange}></slot>
        </header>
        <div class="body" part="body">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
        <footer class="footer" part="footer">
          <slot name="footer" @slotchange=${this.handleSlotChange}></slot>
        </footer>
      </div>
    `;
  }

  private handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const container = slot.parentElement as HTMLElement;
    const hasContent = slot.assignedNodes({ flatten: true }).length > 0;

    if (container) {
      container.classList.toggle('has-content', hasContent);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-card': UCard;
  }
}

