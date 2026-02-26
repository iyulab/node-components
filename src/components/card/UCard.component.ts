import { html } from "lit";
import { property } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { styles } from "./UCard.styles.js";

/**
 * Card 컴포넌트는 콘텐츠를 카드 형태로 표시합니다.
 * @slot - 카드의 메인 콘텐츠를 삽입합니다.
 * @slot header - 카드 상단의 헤더 영역에 표시할 콘텐츠를 삽입합니다.
 * @slot footer - 카드 하단의 푸터 영역에 표시할 콘텐츠를 삽입합니다.
 * @slot media - 카드의 미디어 영역에 표시할 이미지, 비디오 등을 삽입합니다.
 */
export class UCard extends BaseElement {
  static styles = [ super.styles, styles ];

  /** 카드의 그림자 효과를 제거할지 여부를 설정합니다. */
  @property({ type: Boolean, reflect: true }) shadowless = false;
  /** 카드의 경계선을 제거할지 여부를 설정합니다. */
  @property({ type: Boolean, reflect: true }) borderless = false;
  /** 카드에 호버 효과를 적용할지 여부를 설정합니다. */
  @property({ type: Boolean, reflect: true }) hoverable = false;
  /** 카드의 레이아웃 방향을 설정합니다. 'vertical'(세로) 또는 'horizontal'(가로) */
  @property({ type: String, reflect: true }) orientation: 'vertical' | 'horizontal' = 'vertical';

  render() {
    return html`
      <div part="media" class="media">
        <slot name="media" @slotchange=${this.handleSlotChange}></slot>
      </div>
      <div class="content">
        <header part="header" class="header">
          <slot name="header" @slotchange=${this.handleSlotChange}></slot>
        </header>
        <div part="body" class="body">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
        <footer part="footer" class="footer">
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
