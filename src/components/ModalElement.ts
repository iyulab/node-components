import { CSSResultGroup, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

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

  /** 
   * 현재 엘리먼트의 열림/닫힘 상태입니다.
   * 
   * @default false
   */
  @property({ type: Boolean, reflect: true }) open: boolean = false

  /**
   * 엘리먼트의 위치 결정 전략입니다.
   * - `absolute`: 엘리먼트가 문서 흐름에 따라 배치됩니다.
   * - `fixed`: 엘리먼트가 뷰포트에 고정되어 스크롤과 무관하게 위치합니다. 
   * 
   * @default 'fixed'
   */
  @property({ type: String, reflect: true }) strategy: 'absolute' | 'fixed' = 'fixed';
  
  /** 
   * 모달 모드 여부, true인 경우 배경이 차단되고 포커스 트랩이 활성화됩니다.
   * false인 경우 배경이 차단되지 않고 포커스 트랩도 비활성화됩니다.
   * 
   * @default true
   */
  @property({ type: Boolean, reflect: true }) modal: boolean = true;

  /** 
   * 이벤트에 의한 모달 닫기 허용 여부, 예: 오버레이 클릭, ESC 키 등
   * 닫기를 시도해야할 경우, hide() 메서드를 호출합니다.
   * 
   * @default true
   */
  @property({ type: Boolean, reflect: true }) closable: boolean = true;

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('tabindex', '-1');
    this.addEventListener('pointerdown', this.handlePointerdown);
  }
  
  disconnectedCallback(): void {
    window.removeEventListener('keydown', this.handleWindowKeydown);
    window.removeEventListener('focusin', this.handleWindowFocusin);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('open')) {
      this.toggleAttribute('aria-hidden', !this.open);
      this.toggleAttribute('inert', !this.open);
      this.updateOpenState(this.open);
    }
    if (changedProperties.has('modal')) {
      this.updateModalState(this.modal);
    }
  }

  /** 
   * 모달을 표시합니다 
   */
  public async show() {
    await this.updateComplete;
    requestAnimationFrame(() => {
      this.open = true;
    });
  }

  /** 
   * 모달을 숨깁니다 
   */
  public async hide() {
    await this.updateComplete;
    requestAnimationFrame(() => {
      this.open = false;
    });
  }

  /** 
   * 모달이 차단 상태일 때 호출 됩니다 
   */
  protected async block() {
    await this.updateComplete;
  }

  /** 엘리먼트의 열림/닫힘 상태를 업데이트합니다 */
  private updateOpenState(open: boolean) {
    if (open) {
      this.emit('u-show');
      document.body.style.overflow = this.modal ? 'hidden' : '';
    } else {
      this.emit('u-hide');
      document.body.style.overflow = '';
    }
  }

  /** 모달 모드 상태를 업데이트합니다 */
  private updateModalState(modal: boolean) {
    if (modal) {
      window.addEventListener('keydown', this.handleWindowKeydown);
      window.addEventListener('focusin', this.handleWindowFocusin);
      document.body.style.overflow = this.open ? 'hidden' : '';
    } else {
      window.removeEventListener('keydown', this.handleWindowKeydown);
      window.removeEventListener('focusin', this.handleWindowFocusin);
      document.body.style.overflow = '';
    }
  }

  /** 백드롭 클릭 핸들러 */
  private handlePointerdown = (e: MouseEvent) => {
    if (!this.modal || !this.open) return;

    const origin = e.composedPath()[0]; // 실제 클릭 시작점(리타겟팅 전)

    // 호스트 자신일 때만 백드롭 클릭으로 간주
    if (origin === this) {
      if (this.closable) {
        this.hide();
      } else {
        this.block();
      }
    }
  }

  /** 키보드 이벤트 핸들러 */
  private handleWindowKeydown = (e: KeyboardEvent) => {
    if (!this.modal || !this.open) return;

    if (e.key === 'Escape' && this.open) {
      e.preventDefault();
      if (this.closable) {
        this.hide();
      } else {
        this.block();
      }
    }
  }

  /** 포커스 트랩 핸들러 */
  private handleWindowFocusin = (e: FocusEvent) => {
    if (!this.modal || !this.open) return;
    
    // 모달 내부의 요소가 아니면 포커스를 강제로 모달로 이동
    const target = e.target as HTMLElement;
    if (!this.contains(target)) {
      e.preventDefault();
      this.focus();
    }
  }
}
