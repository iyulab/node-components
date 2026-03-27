import { html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { arrayAttrConverter } from "../../utilities/converters.js";
import { UElement } from "../UElement.js";
import { UFloatingElement } from "../UFloatingElement.js";
import { styles } from "./UPopover.styles.js";

export type PopoverTrigger = 'click' | 'contextmenu' | 'hover' | 'focus' | 'manual';
export type PopoverDismiss = 'click' | 'escape' | 'scroll' | 'resize';

/**
 * Popover 컴포넌트는 앵커 요소에 연결되어 다양한 트리거/해제 방식으로 열리는 플로팅 컨테이너입니다.
 * trigger와 dismiss 속성으로 드롭다운 메뉴, 컨텍스트 메뉴 등 다양한 패턴을 구현할 수 있습니다.
 *
 * @slot - 팝오버 내부에 표시할 콘텐츠
 */
export class UPopover extends UFloatingElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  private static readonly SAFE_TIMER_DELAY = 200;

  /**
   * 팝오버가 열릴 때 내부의 첫 번째 포커스 가능한 요소에 자동으로 포커스합니다.
   */
  @property({ type: Boolean, reflect: true }) autofocus: boolean = false;

  /**
   * 팝오버를 여는 트리거 방식입니다.
   * - `click`: 앵커 클릭으로 열기
   * - `contextmenu`: 앵커 우클릭으로 열기
   * - `hover`: 앵커에 마우스를 올리면 열기
   * - `focus`: 앵커에 포커스하면 열기
   * - `manual`: 프로그래밍 방식으로만 열기
   */
  @property({ type: String, reflect: true }) trigger: PopoverTrigger = 'click';

  /**
   * 팝오버를 닫는 조건입니다. 쉼표로 구분하여 복수 지정 가능합니다.
   * - `click`: 외부 클릭 시 닫기
   * - `escape`: Escape 키 시 닫기
   * - `scroll`: 스크롤 시 닫기
   * - `resize`: 윈도우 리사이즈 시 닫기
   */
  @property({
    type: Array,
    reflect: true,
    converter: arrayAttrConverter<PopoverDismiss>(),
  })
  dismiss: PopoverDismiss[] = ['click', 'escape', 'scroll', 'resize'];

  /**
   * 팝오버에 전달되는 이벤트 중 닫기 조건에 포함시킬 이벤트 목록입니다.
   * 쉼표로 구분하여 복수 지정 가능합니다.
   */
  @property({
    type: Array,
    reflect: true,
    attribute: 'dismiss-event',
    converter: arrayAttrConverter<string>(),
  })
  dismissEvent: string[] = [];

  /** hover/focus 트리거의 anchor ↔ popover 전환 지연 타이머 */
  private safeTimer?: number;

  connectedCallback(): void {
    super.connectedCallback();
    this.placement ??= 'bottom-start';
  }

  disconnectedCallback(): void {
    clearTimeout(this.safeTimer);
    if (this.anchors) this.unbind(this.anchors);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('open') && this.open && this.autofocus) {
      this.focusTo(0);
    }

    if (['anchors', 'trigger', 'dismiss'].some(k => changedProperties.has(k))) {
      const oldAnchors = changedProperties.get('anchors') as HTMLElement[] | undefined;
      const newAnchors = this.anchors as HTMLElement[] | undefined;

      // trigger나 dismiss가 변경된 경우 기존 앵커 재바인딩
      if (['trigger', 'dismiss'].some(k => changedProperties.has(k))) {
        this.unbind(newAnchors || []);
      } else if (oldAnchors) {
        this.unbind(oldAnchors);
      }

      if (newAnchors) this.bind(newAnchors);
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  /**
   * 팝오버 내부의 focusable 요소 중 index에 해당하는 요소에 포커스합니다. 
   * index가 유효하지 않으면 첫 번째 요소에 포커스합니다.
   * 
   * @param index 포커스할 요소의 인덱스
   */
  public focusTo(index: number): void {
    const slot = this.renderRoot.querySelector('slot') as HTMLSlotElement | null;
    const focusables = slot?.assignedElements({ flatten: true }).filter(el => {
      if (!(el instanceof HTMLElement)) return false;
      if (el.hasAttribute('disabled') || el.hasAttribute('hidden')) return false;
      return el.matches('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    }) as HTMLElement[] | undefined;

    if (!focusables || focusables.length === 0) {
      this.focus();
      return;
    }

    const target = focusables[index];
    if (target) {
      target.focus();
    } else {
      focusables[0].focus();
    }
  }

  private bind(anchors: HTMLElement[]): void {
    // trigger 리스너
    switch (this.trigger) {
      case 'click':
        for (const anchor of anchors) {
          anchor.addEventListener('click', this.handleAnchorClick);
          anchor.addEventListener('keydown', this.handleAnchorKeydown);
        }
        break;
      case 'contextmenu':
        document.addEventListener('contextmenu', this.handleDocumentContextMenu);
        break;
      case 'hover':
        for (const anchor of anchors) {
          anchor.addEventListener('pointerenter', this.handleAnchorPointerEnter);
          anchor.addEventListener('pointerleave', this.handleAnchorPointerLeave);
        }
        this.addEventListener('pointerenter', this.handlePopoverPointerEnter);
        this.addEventListener('pointerleave', this.handlePopoverPointerLeave);
        break;
      case 'focus':
        for (const anchor of anchors) {
          anchor.addEventListener('focusin', this.handleAnchorFocusIn);
          anchor.addEventListener('focusout', this.handleAnchorFocusOut);
        }
        this.addEventListener('focusin', this.handlePopoverFocusIn);
        this.addEventListener('focusout', this.handlePopoverFocusOut);
        break;
    }

    // dismiss 리스너
    const dismissList = new Set(this.dismiss);
    if (dismissList.has('click')) {
      document.addEventListener('click', this.handleDocumentClick);
    }
    if (dismissList.has('escape')) {
      document.addEventListener('keydown', this.handleDocumentKeydown);
    }
    if (dismissList.has('scroll')) {
      document.addEventListener('scroll', this.handleDocumentScroll, true);
    }
    if (dismissList.has('resize')) {
      window.addEventListener('resize', this.handleWindowResize);
    }
    
    // dismissEvent 리스너
    const dismissEventList = new Set(this.dismissEvent);
    for (const eventName of dismissEventList) {
      this.addEventListener(eventName, this.handlePopoverEvent);
    }
  }

  private unbind(anchors: HTMLElement[]): void {
    // trigger 리스너
    for (const anchor of anchors) {
      anchor.removeEventListener('click', this.handleAnchorClick);
      anchor.removeEventListener('keydown', this.handleAnchorKeydown);
      anchor.removeEventListener('pointerenter', this.handleAnchorPointerEnter);
      anchor.removeEventListener('pointerleave', this.handleAnchorPointerLeave);
      anchor.removeEventListener('focusin', this.handleAnchorFocusIn);
      anchor.removeEventListener('focusout', this.handleAnchorFocusOut);
    }
    document.removeEventListener('contextmenu', this.handleDocumentContextMenu);
    this.removeEventListener('pointerenter', this.handlePopoverPointerEnter);
    this.removeEventListener('pointerleave', this.handlePopoverPointerLeave);
    this.removeEventListener('focusin', this.handlePopoverFocusIn);
    this.removeEventListener('focusout', this.handlePopoverFocusOut);

    // dismiss 리스너
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleDocumentKeydown);
    document.removeEventListener('scroll', this.handleDocumentScroll, true);
    window.removeEventListener('resize', this.handleWindowResize);
  
    // dismissEvent 리스너
    for (const eventName of this.dismissEvent) {
      this.removeEventListener(eventName, this.handlePopoverEvent);
    }
  }

//#region Trigger Handlers

  private handleAnchorClick = (e: Event) => {
    if (this.open) {
      this.hide();
    } else {
      this.show(e.currentTarget as HTMLElement);
    }
  };

  private handleAnchorKeydown = (e: KeyboardEvent) => {
    if (!['ArrowDown', 'Enter', ' '].includes(e.key)) return;
    e.preventDefault();
    if (this.open) {
      this.hide();
    } else {
      this.show(e.currentTarget as HTMLElement);
    }
  };

  private handleDocumentContextMenu = async (e: PointerEvent) => {
    if (this.open) {
      await this.hide();
    }

    const path = e.composedPath();
    if (!this.anchors?.some(a => path.includes(a))) return;
    e.preventDefault();
    e.stopPropagation();

    const virtualEl = this.createVirtualTarget(e);
    this.show(virtualEl);
  };

  private handleAnchorPointerEnter = (e: PointerEvent) => {
    this.cancelSafeTimer();
    this.show(e.currentTarget as HTMLElement);
  };

  private handleAnchorPointerLeave = () => {
    this.startSafeTimer();
  };

  private handlePopoverPointerEnter = () => {
    this.cancelSafeTimer();
  };

  private handlePopoverPointerLeave = () => {
    this.startSafeTimer();
  };

  private handleAnchorFocusIn = (e: FocusEvent) => {
    this.cancelSafeTimer();
    this.show(e.currentTarget as HTMLElement);
  };

  private handleAnchorFocusOut = () => {
    this.startSafeTimer();
  };

  private handlePopoverFocusIn = () => {
    this.cancelSafeTimer();
  };

  private handlePopoverFocusOut = () => {
    this.startSafeTimer();
  };

  private startSafeTimer(): void {
    clearTimeout(this.safeTimer);
    this.safeTimer = window.setTimeout(() => {
      this.safeTimer = undefined;
      this.hide();
    }, UPopover.SAFE_TIMER_DELAY);
  }

  private cancelSafeTimer(): void {
    clearTimeout(this.safeTimer);
    this.safeTimer = undefined;
  }

//#endregion

//#region Dismiss Handlers

  private handleDocumentClick = (e: PointerEvent) => {
    // contextmenu 트리거인 경우 무조건 닫기
    if (this.trigger === 'contextmenu') {
      this.hide();
      return;
    }

    const path = e.composedPath();
    if (path.includes(this)) return;
    if (this.anchors?.some(a => path.includes(a))) return;
    this.hide();
  };

  private handleDocumentKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    this.hide();
  };

  private handleDocumentScroll = () => {
    this.hide();
  };

  private handleWindowResize = () => {
    this.hide();
  };

  private handlePopoverEvent = () => {
    this.hide();
  };

//#endregion
}
