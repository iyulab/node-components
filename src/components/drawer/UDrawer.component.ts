import { html, CSSResultGroup } from 'lit';
import { property, state } from 'lit/decorators.js'

import { UElement } from '../UElement.js';
import { UOverlayElement } from '../UOverlayElement.js';
import { UButton } from '../button/UButton.component.js';
import { UIcon } from '../icon/UIcon.component.js';
import { styles } from './UDrawer.styles.js';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

/**
 * Drawer 컴포넌트는 화면 가장자리에서 슬라이드하여 나타나는 패널을 제공합니다.
 *
 * @slot header - 헤더 타이틀 영역
 * @slot default - 본문 영역
 * @slot footer - 푸터 영역 (액션 버튼 등)
 */
export class UDrawer extends UOverlayElement {
  static styles: CSSResultGroup = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {
    'u-button': UButton,
    'u-icon': UIcon,
  };

  /** 닫기 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) closable = false;
  /** 드로어가 나타나는 위치 */
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
