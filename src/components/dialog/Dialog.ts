import { html, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js'

import { UElement } from '../../internals/UElement.js';
import { Icon } from '../icon/Icon.js';
import { styles } from './Dialog.styles.js';

/**
 * Dialog 컴포넌트는 모달 대화상자를 제공합니다.
 * 오버레이와 함께 화면 중앙에 표시되며, 헤더, 본문, 푸터 영역을 슬롯으로 제공합니다.
 */
export class Dialog extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': Icon
  };

  @query('dialog') dialogElement!: HTMLDialogElement;
  
  /** 다이얼로그가 열려있는지 여부 */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** 헤더를 표시하지 않을지 여부 */
  @property({ type: Boolean }) noHeader: boolean = false;
  /** 다이얼로그의 제목 */
  @property({ type: String }) label?: string;
  /** 오버레이 클릭 시 닫기 활성화 여부 */
  @property({ type: Boolean }) closeOnOverlayClick: boolean = true;
  /** ESC 키로 닫기 활성화 여부 */
  @property({ type: Boolean }) closeOnEscape: boolean = true;

  /** 다이얼로그의 너비 */
  @property({ type: String }) width?: string;

  /** 다이얼로그의 최대 너비 */
  @property({ type: String }) maxWidth?: string;

  connectedCallback(): void {
    super.connectedCallback();
    // ESC 키 이벤트 핸들러 등록
    this.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('keydown', this.handleKeyDown);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    
    if (changedProperties.has('open')) {
      if (this.open) {
        this.showDialog();
      } else {
        this.closeDialog();
      }
    }
  }

  render() {
    return html`
      <dialog
        part="base"
        @click=${this.handleOverlayClick}
        style=${this.getDialogStyle()}>
        <div part="panel" class="dialog__panel">
          ${!this.noHeader ? html`
            <header part="header" class="dialog__header">
              <slot name="header">
                ${this.label ? html`<span class="dialog__title">${this.label}</span>` : ''}
              </slot>
                <button
                  part="close-button"
                  class="dialog__close"
                  type="button"
                  @click=${this.hide}
                  aria-label="Close"
                >
                  <u-icon name="x-lg"></u-icon>
                </button>
            </header>
          ` : ''}
          
          <div part="body" class="dialog__body">
            <slot></slot>
          </div>
          
          <footer part="footer" class="dialog__footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </dialog>
    `;
  }
  
  /** 다이얼로그를 표시합니다 */
  public show = async () => {
    if (this.open) return;
    
    this.open = true;
    await this.updateComplete;
    
    // 다이얼로그 표시 이벤트 발생
    this.emit('u-show');
  }

  /** 다이얼로그를 숨깁니다 */
  public hide = async () => {
    if (!this.open) return;
    
    // 닫기 전 이벤트 발생 (취소 가능)
    const closeEvent = this.emit('u-before-close', null, { cancelable: true });
    
    if (closeEvent) {
      this.open = false;
      await this.updateComplete;
      
      // 다이얼로그 숨김 이벤트 발생
      this.emit('u-hide');
    }
  }

  /** HTML dialog 엘리먼트를 실제로 표시 */
  private showDialog(): void {
    if (this.dialogElement && !this.dialogElement.open) {
      this.dialogElement.showModal();
      document.body.style.overflow = 'hidden';
    }
  }

  /** HTML dialog 엘리먼트를 실제로 닫기 */
  private closeDialog(): void {
    if (this.dialogElement && this.dialogElement.open) {
      this.dialogElement.close();
      document.body.style.overflow = '';
    }
  }

  /** 오버레이 클릭 핸들러 */
  private handleOverlayClick = (e: MouseEvent) => {
    if (this.closeOnOverlayClick && e.target === this.dialogElement) {
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

  /** 다이얼로그 스타일 생성 */
  private getDialogStyle(): string {
    const styles: string[] = [];
    
    if (this.width) {
      styles.push(`--dialog-width: ${this.width}`);
    }
    if (this.maxWidth) {
      styles.push(`--dialog-max-width: ${this.maxWidth}`);
    }
    
    return styles.join('; ');
  }
}