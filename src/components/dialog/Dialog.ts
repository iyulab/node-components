import { html, nothing, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js'

import { BaseElement } from '../BaseElement.js';
import { IconButton } from '../icon-button/IconButton.js';
import { styles } from './Dialog.styles.js';

/**
 * Dialog 컴포넌트는 모달 대화상자를 제공합니다.
 * 오버레이와 함께 화면 중앙에 표시되며, 헤더, 본문, 푸터 영역을 슬롯으로 제공합니다.
 */
export class Dialog extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-icon-button': IconButton
  };

  @query('.dialog') dialogEl!: HTMLDivElement;

  /** 모달 모드 활성화 (배경 차단 및 포커스 트랩) */
  @property({ type: Boolean, reflect: true }) modal: boolean = true;
  /** 다이얼로그가 열려있는지 여부 */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** 이벤트에 의한 다이얼로그 닫기 허용 여부 */
  @property({ type: Boolean }) closable: boolean = true;
  /** 타이틀 텍스트 */
  @property({ type: String }) heading: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.handleBackdropClick);
  }
  
  disconnectedCallback(): void {
    window.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('focusin', this.handleFocusin);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('open')) {
      this.updateOpenState(this.open);
    }
    if (changedProperties.has('modal')) {
      this.updateModalState(this.modal);
    }
  }

  render() {
    return html`
      <div class="dialog scrollable" part="base" tabindex="-1">
        
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
  
  /** 다이얼로그를 표시합니다 */
  public show = async () => {
    await this.updateComplete;
    requestAnimationFrame(() => {
      this.open = true;
    });
  }

  /** 다이얼로그를 숨깁니다 */
  public hide = async () => {
    await this.updateComplete;
    requestAnimationFrame(() => {
      this.open = false;
    });
  }

  /** 패널을 흔드는 애니메이션을 재생합니다 */
  private shake() {
    this.dialogEl.classList.add('shake');
    setTimeout(() => {
      this.dialogEl.classList.remove('shake');
    }, 500);
  }

  /** 오버레이 클릭 핸들러 */
  private handleBackdropClick = (e: MouseEvent) => {
    if (e.target === this) {
      if (this.closable) {
        this.hide();
      } else {
        this.shake();
      }
    }
  }

  /** 키보드 이벤트 핸들러 */
  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) {
      e.preventDefault();
      if (this.closable) {
        this.hide();
      } else {
        this.shake();
      }
    }
  }

  /** 포커스 트랩 핸들러 */
  private handleFocusin = (e: FocusEvent) => {
    if (!this.modal || !this.open) return;
    
    // 다이얼로그 내부의 요소가 아니면 포커스 막기
    const target = e.target as HTMLElement;
    if (!this.contains(target)) {
      e.preventDefault();
      this.dialogEl.focus();
    }
  }

  private updateOpenState(open: boolean) {
    if (open) {
      this.emit('u-show');
      document.body.style.overflow = this.modal ? 'hidden' : '';
    } else {
      this.emit('u-hide');
      document.body.style.overflow = '';
    }
  }

  private updateModalState(modal: boolean) {
    if (modal) {
      window.addEventListener('keydown', this.handleKeydown);
      window.addEventListener('focusin', this.handleFocusin);
      document.body.style.overflow = this.open ? 'hidden' : '';
    } else {
      window.removeEventListener('keydown', this.handleKeydown);
      window.removeEventListener('focusin', this.handleFocusin);
      document.body.style.overflow = '';
    }
  }
}