import { html, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js'

import { UElement } from '../../internals/UElement.js';
import { styles } from './Dialog.styles.js';

/**
 * Dialog 컴포넌트는 모달 대화상자를 제공합니다.
 * 오버레이와 함께 화면 중앙에 표시되며, 헤더, 본문, 푸터 영역을 슬롯으로 제공합니다.
 */
export class Dialog extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  @query('.overlay') overlayEl!: HTMLDivElement;
  
  /** 다이얼로그가 열려있는지 여부 */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** 오버레이 클릭 시 닫기 활성화 여부 */
  @property({ type: Boolean }) closeOnOverlayClick: boolean = true;
  /** ESC 키로 닫기 활성화 여부 */
  @property({ type: Boolean }) closeOnEscape: boolean = true;

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    
    if (changedProperties.has('open')) {
      this.updateOpenState(this.open);
    }
  }

  render() {
    return html`
      <div class="overlay" part="overlay"
        ?hidden=${!this.open}
        @click=${this.handleOverlayClick}>
        <div class="panel" part="panel">
          <slot></slot>
        </div>
      </div>
    `;
  }
  
  /** 다이얼로그를 표시합니다 */
  public show = async () => {
    this.open = true;
    await this.updateComplete;
  }

  /** 다이얼로그를 숨깁니다 */
  public hide = async () => {
    await this.updateComplete;
    this.open = false;
  }

  /** 오버레이 클릭 핸들러 */
  private handleOverlayClick = (e: MouseEvent) => {
    if (this.closeOnOverlayClick && e.target === this.overlayEl) {
      this.hide();
    }
  }

  /** 키보드 이벤트 핸들러 */
  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.closeOnEscape && e.key === 'Escape' && this.open) {
      e.preventDefault();
      this.hide();
    }
  }

  private updateOpenState(open: boolean) {
    if (open) {
      document.body.style.overflow = 'hidden';
      this.emit('u-show');
    } else {
      document.body.style.overflow = '';
      this.emit('u-hide');
    }
  }
}