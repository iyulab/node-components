import { html } from 'lit';
import { property } from 'lit/decorators.js'

import { BaseElement } from '../BaseElement.js';
import { ModalElement } from '../ModalElement.js';
import { UIconButton } from '../icon-button/UIconButton.component.js';
import { styles } from './UDialog.styles.js';

/**
 * Dialog 컴포넌트는 모달 대화상자를 제공합니다.
 * 오버레이와 함께 화면 중앙에 표시되며, 헤더, 본문, 푸터 영역을 슬롯으로 제공합니다.
 */
export class UDialog extends ModalElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-icon-button': UIconButton
  };

  /** 타이틀 텍스트 */
  @property({ type: String }) heading: string = '';

  render() {
    return html`
      <div class="dialog" part="base" ?open=${this.open}>
        <div class="header" part="header" ?hidden=${!this.heading}>
          <span class="title" part="title">
            ${this.heading}
          </span>
          <u-icon-button class="close-btn" part="close-btn"
            borderless  
            lib="internal"
            name="x-lg"
            @click=${() => this.hide()}
          ></u-icon-button>
        </div>

        <div class="content" part="content" scrollable>
          <slot></slot>
        </div>
      </div>
    `;
  }

  /** block시 진동 효과를 적용합니다. */
  protected async block(): Promise<void> {
    await super.block();
    
    const dialogEl = this.renderRoot.querySelector('.dialog');
    if(!dialogEl) return;
    dialogEl.setAttribute('shake', '');
    setTimeout(() => {
      dialogEl.removeAttribute('shake');
    }, 500);
  }
}