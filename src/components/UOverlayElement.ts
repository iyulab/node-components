import { CSSResultGroup, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { createFocusTrap, type FocusTrap } from 'focus-trap';

import { OverlayManager } from '../utilities/OverlayManager.js';
import { arrayAttrConverter } from '../utilities/converters.js';
import { UElement } from './UElement.js';
import { styles } from './UOverlayElement.styles.js';
import { ShowEventDetail } from '../events/ShowEvent.js';
import { HideEventDetail } from '../events/HideEvent.js';

/** closeOn에 지정할 수 있는 닫기 트리거 */
export type CloseOnPolicy = 'escape' | 'backdrop' | 'button';
/** 오버레이 모드 */
export type OverlayMode = 'modal' | 'non-modal';

/**
 * UOverlayElement는 다이얼로그, 드로어 등 화면에 오버레이로 표시되는 엘리먼트의 기본 클래스입니다.
 *
 * @event show - 오버레이가 표시되기 직전 발생합니다. 핸들러에서 취소하면 표시되지 않습니다.
 * @event hide - 오버레이가 숨겨지기 직전 발생합니다. 핸들러에서 취소하면 닫히지 않습니다.
 */
export abstract class UOverlayElement extends UElement {
  static styles: CSSResultGroup = [super.styles, styles];

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
      if (this.open) this.setup();
      else this.cleanup();
    }
  }

  /**
   * 오버레이를 표시합니다. u-show 이벤트가 취소되면 열리지 않습니다.
   */
  public show(): boolean {
    if (this.open) return true;

    if (this.fire<ShowEventDetail>('show', { bubbles: false, composed: false })) {
      this.open = true;
      return true;
    }
    return false;
  }

  /**
   * 오버레이를 숨깁니다. `hide` 이벤트가 취소되면 닫히지 않습니다.
   * (이벤트 이름은 `hide`, prefix 없음 — `addEventListener('hide', ...)`로 수신)
   *
   * bubbles:false — 중첩된 다이얼로그/드로어/팝오버 조합에서 자식의 hide가
   * 조상 오버레이까지 버블링되어 조상이 자신의 hide로 오인해 닫히는 사고를 방지한다.
   * 이 이벤트는 항상 자기 자신(target)에 리스너를 붙이는 패턴으로만 소비된다.
   */
  public hide(): boolean {
    if (!this.open) return true;

    if (this.fire<HideEventDetail>('hide', { bubbles: false, composed: false })) {
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
          initialFocus: () => this.resolveInitialFocus(),
          trapStack: OverlayManager.trapStack,
          tabbableOptions: { getShadowRoot: true },
        });
      }
      this.focusTrap.activate();
    }
  }

  /**
   * 열릴 때 포커스를 받을 요소를 정한다 — **입력을 먼저 본다.**
   *
   * 순서: `[autofocus]` → 첫 입력 컨트롤 → (없으면) focus-trap 기본값(첫 tabbable).
   *
   * 🔴**두 분기가 «각각» 무엇을 하는지 되돌려 재서 갈랐다** — 이 함수는 그 기록이다.
   *
   *   `[autofocus]`  → `u-drawer` 에서 갈린다. `focus-trap` 은 그 속성을 존중하지 않는다
   *                    (v7 `getInitialFocusNode` 는 «첫 tabbable» 로 폴백한다).
   *   첫 입력 우선   → `u-dialog` 에서 갈린다. 버튼이 DOM 순서상 앞이면 기본값은 **버튼**을
   *                    잡는다(실측: 제거하면 `button#b1`, 복원하면 `input`).
   *
   * ⚠**`u-drawer` 만으로는 두 번째 분기를 판별할 수 없었다** — 슬롯 배치 때문에 기본값도
   * 우연히 첫 입력에 떨어진다. *"되돌려도 통과한다"* 를 *"이 코드는 아무것도 안 한다"* 로
   * 읽을 뻔했고, **판별하는 입력을 찾은 뒤에야** 갈렸다.
   * (`tests/browser/overlay-initial-focus.browser.test.ts` 가 둘 다 감시한다.)
   */
  private resolveInitialFocus(): HTMLElement | false | undefined {
    const explicit = this.querySelector<HTMLElement>('[autofocus]');
    if (explicit) return explicit;

    const control = this.querySelector<HTMLElement>(
      'input, select, textarea, u-input, u-textarea, u-select, u-checkbox, u-radio, u-switch, u-slider',
    );
    if (control) return control;

    return undefined; // focus-trap 기본값(첫 tabbable)에 맡긴다
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
