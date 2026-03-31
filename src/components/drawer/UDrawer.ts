import { html, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../button/UButton.js';
import '../icon/UIcon.js';

import { UOverlayElement } from '../UOverlayElement.js';
import { styles } from './UDrawer.styles.js';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

/**
 * 화면 가장자리에서 슬라이드하여 표시되는 드로어 컴포넌트입니다.
 *
 * @slot - 본문 영역
 * @slot header - 헤더 콘텐츠 영역
 * @slot footer - 푸터 영역 (액션 버튼 등)
 * 
 * @csspart panel - 드로어 패널 전체
 * @csspart header - 헤더 영역
 * @csspart body - 본문 영역
 * @csspart close-btn - 닫기 버튼
 */
@customElement('u-drawer')
export class UDrawer extends UOverlayElement {
  static styles: CSSResultGroup = [super.styles, styles];

  /** 닫기 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) closable = false;
  /** 드로어가 열리는 위치 */
  @property({ type: String, reflect: true }) placement: DrawerPlacement = 'left';

  @state() private hasHeader = false;

  render() {
    return html`
      <div class="panel" part="panel">
        <div class="header" part="header"
          ?hidden=${!this.hasHeader && !this.closable}>
          <slot name="header" @slotchange=${this.handleHeaderSlotChange}></slot>
          <u-button class="close-btn" part="close-btn"
            variant="ghost"
            ?hidden=${!this.closable}
            @click=${() => this.requestClose('button')}>
            <u-icon lib="internal" name="x-lg"></u-icon>
          </u-button>
        </div>
        <div class="body" part="body">
          <slot></slot>
        </div>
        <slot name="footer"></slot>
      </div>
    `;
  }

  private handleHeaderSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this.hasHeader = slot.assignedNodes({ flatten: true }).length > 0;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-drawer': UDrawer;
  }
}
