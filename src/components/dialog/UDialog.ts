import { html, CSSResultGroup, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../button/UButton.js';
import '../icon/UIcon.js';

import { UOverlayElement } from '../UOverlayElement.js';
import { styles } from './UDialog.styles.js';

export type DialogPlacement =
  | 'top-start' | 'top' | 'top-end'
  | 'start' | 'center' | 'end'
  | 'bottom-start' | 'bottom' | 'bottom-end';

/**
 * 오버레이 위에 모달 창을 제공하는 다이얼로그 컴포넌트입니다.
 *
 * @slot - 본문 영역
 * @slot header - 헤더 콘텐츠 영역
 * @slot footer - 푸터 영역 (액션 버튼 등)
 * 
 * @csspart container - 다이얼로그의 컨테이너 요소
 * @csspart panel - 다이얼로그의 패널 요소
 * @csspart header - 다이얼로그의 헤더 요소
 * @csspart body - 다이얼로그의 본문 요소
 * @csspart close-btn - 닫기 버튼 요소
 */
@customElement('u-dialog')
export class UDialog extends UOverlayElement {
  static styles: CSSResultGroup = [super.styles, styles];

  /** 닫기 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) closable = false;
  /** 다이얼로그 배치 위치 */
  @property({ type: String, reflect: true }) placement: DialogPlacement = 'center';
  /** 가장자리로부터의 간격 (px) */
  @property({ type: Number, reflect: true }) offset = 0;

  @state() private hasHeader = false;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('offset')) {
      this.style.setProperty('--container-offset', `${this.offset}px`);
    }
  }

  render() {
    return html`
      <div class="container" part="container">
        <div class="panel" part="panel">
          <div class="header" part="header"
            ?hidden=${!this.hasHeader && !this.closable}>
            <slot name="header" @slotchange=${this.handleHeaderSlotChange}></slot>
            <div style="flex: 1;"></div>
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
    'u-dialog': UDialog;
  }
}