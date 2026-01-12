import { html } from 'lit';
import { property } from 'lit/decorators.js'

import { BaseElement } from '../BaseElement.js';
import { ModalElement } from '../ModalElement.js';
import { UIcon } from '../icon/UIcon.component.js';
import { UButton } from '../button/UButton.component.js';
import { styles } from './UDrawer.styles.js';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

/**
 * Drawer 컴포넌트는 화면 가장자리에서 슬라이드하여 나타나는 패널을 제공합니다.
 * 네비게이션, 설정 패널, 상세 정보 표시 등에 사용됩니다.
 */
export class UDrawer extends ModalElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-icon': UIcon,
    'u-button': UButton
  };

  /** 드로어가 나타나는 위치 */
  @property({ type: String, reflect: true }) placement: DrawerPlacement = 'left';
  /** 헤드리스 모드 여부 */
  @property({ type: Boolean, reflect: true }) headless = false;
  /** 타이틀 텍스트 */
  @property({ type: String }) heading: string = '';

  render() {
    return html`
      <div class="drawer" part="base" ?open=${this.open} placement=${this.placement}>
        <div class="header" part="header" ?hidden=${this.headless}>
          <span class="title" part="title">
            ${this.heading}
          </span>
          <u-button class="close-btn" part="close-btn"
            variant="link"
            @click=${() => this.hide()}>
            <u-icon lib="internal" name="x-lg"></u-icon>
          </u-button>
        </div>

        <div class="content" part="content" scrollable>
          <slot></slot>
        </div>
      </div>
    `;
  }
}
