import { CSSResultGroup, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { createFocusTrap, type FocusTrap } from 'focus-trap';

import { OverlayManager } from '../utilities/OverlayManager.js';
import { arrayAttrConverter } from '../utilities/converters.js';
import { UElement } from './UElement.js';
import { styles } from './UOverlayElement.styles.js';

/** closeOn에 지정할 수 있는 닫기 트리거 */
export type CloseOnPolicy = 'escape' | 'backdrop' | 'button';
/** 오버레이 모드 */
export type OverlayMode = 'modal' | 'non-modal';

/**
 * UOverlayElement는 다이얼로그, 드로어 등 화면에 오버레이로 표시되는 엘리먼트의 기본 클래스입니다.
 */
export abstract class UOverlayElement extends UElement {
  static styles: CSSResultGroup = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {};

  /** 
   * 열림/닫힘 상태 
   * 
   * @default false
   */
  @property({ type: Boolean, reflect: true }) open: boolean = false;

  /**
   * contained 모드 여부
   * - true이면 position: absolute로 부모 기준 오버레이
   * - modal이어도 body scroll lock을 적용하지 않음
   * 
   * @default false
   */
  @property({ type: Boolean, reflect: true }) contained: boolean = false;
  
  /**
   * 오버레이 모드
   * - `modal` — focus trap, scroll lock, 백드롭 차단 (기본값)
   * - `non-modal` — 주변 UI와 자유 상호작용, 배경 투명, scroll lock 없음
   * 
   * @default 'modal'
   */
  @property({ type: String, reflect: true }) mode: OverlayMode = 'modal';

  /**
   * 사용자 상호작용에 의한 닫기 트리거 목록, 어트리뷰트는 쉼표로 구분된 배열 형태입니다.
   * 
   * @default 
   * ['escape', 'backdrop', 'button']
   */
  @property({
    type: Array,
    reflect: true,
    attribute: 'close-on',
    converter: arrayAttrConverter<CloseOnPolicy>(),
  })
  closeOn: CloseOnPolicy[] = ['escape', 'backdrop', 'button'];

  /** focus trap 인스턴스 (modal일 때만 사용) */
  private focusTrap?: FocusTrap;
  
  /** modal이고 contained가 아닌 경우에만 body scroll lock */
  private get shouldLockBody(): boolean {
    return this.mode === 'modal' && !this.contained;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('tabindex', '-1');
  }

  disconnectedCallback(): void {
    this.cleanup();
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('open')) {
      this.open ? this.setup() : this.cleanup();
    }
  }

  /** 
   * 오버레이를 표시합니다. u-show 이벤트가 취소되면 열리지 않습니다. 
   */
  public show(): boolean {
    if (this.open) return true;
    
    if (this.emit('u-show')) {
      this.open = true;
      return true;
    }
    return false;
  }

  /** 
   * 오버레이를 숨깁니다. u-hide 이벤트가 취소되면 닫히지 않습니다. 
   */
  public hide(): boolean {
    if (!this.open) return true;
    
    if (this.emit('u-hide')) {
      this.open = false;
      return true;
    }
    return false;
  }

  /** closeOn 정책에 따라 닫기를 시도합니다. */
  public requestClose(source: string): void {
    if (this.closeOn.includes(source as CloseOnPolicy)) {
      this.hide();
    }
  }

  /** 오버레이가 열릴 때 설정을 적용합니다. */
  private setup(): void {
    OverlayManager.add(this, this.shouldLockBody);
    window.addEventListener('keydown', this.handleWindowKeydown);
    this.addEventListener('pointerdown', this.handlePointerdown);

    if (this.mode === 'modal') {
      if (!this.focusTrap) {
        this.focusTrap = createFocusTrap(this, {
          escapeDeactivates: false,
          clickOutsideDeactivates: false,
          allowOutsideClick: true,
          fallbackFocus: this,
          trapStack: OverlayManager.trapStack,
          tabbableOptions: { getShadowRoot: true },
        });
      }
      this.focusTrap.activate();
    }
  }

  /** 오버레이가 닫힐 때 설정을 해제합니다. */
  private cleanup(): void {
    this.focusTrap?.deactivate();
    window.removeEventListener('keydown', this.handleWindowKeydown);
    this.removeEventListener('pointerdown', this.handlePointerdown);
    OverlayManager.remove(this, this.shouldLockBody);
  }

  /** host 자체를 클릭한 경우(백드롭)만 닫기 요청 */
  private handlePointerdown = (e: PointerEvent) => {
    if (e.composedPath()[0] === this) {
      this.requestClose('backdrop');
    }
  }

  /** ESC 키 입력 시 닫기 요청 (최상위 오버레이에 대해서만) */
  private handleWindowKeydown = (e: KeyboardEvent) => {
    if (!this.open || e.key !== 'Escape') return;
    if (!OverlayManager.isTopmost(this)) return;
    e.preventDefault();
    this.requestClose('escape');
  }
}
