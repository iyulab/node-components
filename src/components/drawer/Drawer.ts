import { html, nothing } from 'lit';
import { property, query } from 'lit/decorators.js'

import { BaseElement } from '../BaseElement.js';
import { ModalElement } from '../ModalElement.js';
import { IconButton } from '../icon-button/IconButton.js';
import { styles } from './Drawer.styles.js';

export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom';

/**
 * Drawer 컴포넌트는 화면 가장자리에서 슬라이드하여 나타나는 패널을 제공합니다.
 * 네비게이션, 설정 패널, 상세 정보 표시 등에 사용됩니다.
 */
export class Drawer extends ModalElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-icon-button': IconButton
  };

  @query('.panel') override panelEl!: HTMLDivElement;

  /** 드로어가 나타나는 위치 */
  @property({ type: String, reflect: true }) placement: DrawerPlacement = 'start';

  /** 타이틀 텍스트 */
  @property({ type: String }) heading: string = '';

  render() {
    return html`
      <div class="panel scrollable" part="base" tabindex="-1">
        
        ${this.heading 
          ? html`
            <div class="header" part="header">
              <span class="title" part="title">
                ${this.heading}
              </span>
              <u-icon-button class="close-btn" part="close-btn"
                lib="internal" 
                name="x-lg"
                borderless
                @click=${() => this.hide()}
              ></u-icon-button>
            </div>` 
          : nothing}

        <slot></slot>
      
      </div>
    `;
  }
}
