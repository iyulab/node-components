import { CSSResultGroup, PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';

import { BaseElement } from './BaseElement.js';
import { styles } from './ModalElement.styles.js';

/**
 * ModalElement는 다이얼로그, 드로어 등 화면에 오버레이로 표시되는 엘리먼트를 구현하기 위한 기본 클래스입니다.
 * 이 클래스를 상속하여 커스텀 모달 컴포넌트를 만들 수 있습니다.
 * 
 * 1. open 속성을 통해 엘리먼트의 표시 여부를 제어할 수 있습니다.
 * 2. modal 속성을 통해 배경 차단 및 포커스 트랩을 활성화할 수 있습니다.
 * 3. closable 속성을 통해 이벤트에 의한 닫기 허용 여부를 설정할 수 있습니다.
 * 4. show() 및 hide() 메서드를 통해 프로그래밍적으로 표시하거나 숨길 수 있습니다.
 */
export abstract class ModalElement extends BaseElement {
  /** 기본 스타일을 정의합니다. */
  static styles: CSSResultGroup = [ super.styles, styles ];
  /** 종속된 컴포넌트를 정의합니다. */
  static dependencies: Record<string, typeof BaseElement> = {};

  // 애니메이션 프레임 아이디
  private rafId: number | null = null;

  /** 패널 엘리먼트 - 하위 클래스에서 query로 설정해야 합니다 */
  @query('.panel') panelEl!: HTMLElement;

  /** 모달 모드 활성화 (배경 차단 및 포커스 트랩) */
  @property({ type: Boolean, reflect: true }) modal: boolean = true;
  /** 모달이 열려있는지 여부 */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** 이벤트에 의한 모달 닫기 허용 여부 */
  @property({ type: Boolean }) closable: boolean = true;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.handleBackdropClick);
  }
  
  disconnectedCallback(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
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

  /** 모달을 표시합니다 */
  public async show() {
    await this.updateComplete;
    this.scheduleOpen(true);
  }

  /** 모달을 숨깁니다 */
  public async hide() {
    await this.updateComplete;
    this.scheduleOpen(false);
  }

  /** 패널을 흔드는 애니메이션을 재생합니다 */
  protected shake() {
    if (!this.panelEl) return;
    this.panelEl.classList.add('shake');
    setTimeout(() => {
      this.panelEl.classList.remove('shake');
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
    
    // 모달 내부의 요소가 아니면 포커스 막기
    const target = e.target as HTMLElement;
    if (!this.contains(target)) {
      e.preventDefault();
      this.panelEl?.focus();
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

  /** 애니메이션 프레임을 사용하여 열림 상태를 스케줄링합니다. */
  private scheduleOpen(open: boolean) {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.rafId = requestAnimationFrame(() => {
      this.open = open;
      this.rafId = null;
    });
  }
}
