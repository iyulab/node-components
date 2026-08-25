import { html, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { arrayAttrConverter } from "../../utilities/converters.js";
import { isCoarsePointer } from "../../utilities/elements.js";
import { UFloatingElement } from "../UFloatingElement.js";
import { styles } from "./UPopover.styles.js";

export type PopoverTrigger = 'click' | 'contextmenu' | 'hover' | 'focus' | 'manual';
export type PopoverDismiss = 'click' | 'escape' | 'scroll' | 'resize';

/**
 * 앵커 요소에 연결된 플로팅 팝오버 컴포넌트입니다.
 * trigger와 dismiss 속성으로 드롭다운 메뉴, 컨텍스트 메뉴 등을 구현할 수 있습니다.
 *
 * @slot - 팝오버 내부 콘텐츠
 *
 * @event show - 팝오버가 표시되기 직전 발생 (취소 가능)
 * @event hide - 팝오버가 닫히기 직전 발생 (취소 가능)
 */
@customElement('u-popover')
export class UPopover extends UFloatingElement {
  static styles = [ super.styles, styles ];

  private static readonly SAFE_TIMER_DELAY = 200;

  /** 열릴 때 내부의 첫 번째 포커스 가능한 요소에 자동 포커스 */
  @property({ type: Boolean, reflect: true }) autofocus: boolean = false;

  /**
   * 팝오버를 여는 트리거 방식
   * - `click`: 클릭으로 열기
   * - `contextmenu`: 우클릭으로 열기
   * - `hover`: 마우스 오버 시 열기
   * - `focus`: 포커스 시 열기
   * - `manual`: 프로그래밍 방식으로만 열기
   */
  @property({ type: String, reflect: true }) trigger: PopoverTrigger = 'click';

  /**
   * 팝오버를 닫는 조건 (쉼표 구분하여 복수 지정 가능)
   * - `click`: 외부 클릭 시 닫기
   * - `escape`: Escape 키 시 닫기
   * - `scroll` / `resize`: 뷰포트 기하 변화로 **앵커가 의미를 잃을 때** 닫기 — 즉
   *   `contextmenu` 처럼 좌표 기반 가상 앵커에 붙은 경우에만 닫는다. 실제 엘리먼트에 앵커된
   *   팝오버는 `autoUpdate` 가 스크롤·리사이즈를 따라 재배치하므로 닫지 않는다
   *   (`isCoordinateAnchored` 참조).
   */
  @property({
    type: Array,
    reflect: true,
    converter: arrayAttrConverter<PopoverDismiss>(),
  })
  dismiss: PopoverDismiss[] = ['click', 'escape', 'scroll', 'resize'];

  /** 닫기 조건에 포함시킬 이벤트 목록 (쉼표 구분) */
  @property({
    type: Array,
    reflect: true,
    attribute: 'dismiss-event',
    converter: arrayAttrConverter<string>(),
  })
  dismissEvent: string[] = [];

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

    const dismissEventList = new Set(this.dismissEvent);
    for (const eventName of dismissEventList) {
      this.addEventListener(eventName, this.handlePopoverEvent);
    }
  }

  private unbind(anchors: HTMLElement[]): void {
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

    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleDocumentKeydown);
    document.removeEventListener('scroll', this.handleDocumentScroll, true);
    window.removeEventListener('resize', this.handleWindowResize);

    for (const eventName of this.dismissEvent) {
      this.removeEventListener(eventName, this.handlePopoverEvent);
    }
  }

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
    if (isCoarsePointer(e)) {
      // 터치/펜은 지속되는 hover 상태가 없다 — pointerenter 직후 pointerleave가
      // 뒤따르므로(§UFloatingElement.isCoarsePointer 참조) hover 타이머 대신
      // 클릭처럼 토글한다(Floating UI/Radix 계열의 관행).
      if (this.open) {
        this.hide();
      } else {
        this.show(e.currentTarget as HTMLElement);
      }
      return;
    }
    this.show(e.currentTarget as HTMLElement);
  };

  private handleAnchorPointerLeave = (e: PointerEvent) => {
    if (isCoarsePointer(e)) return; // 닫기는 토글(위) 또는 문서 클릭 dismiss가 담당
    this.startSafeTimer();
  };

  private handlePopoverPointerEnter = (e: PointerEvent) => {
    if (isCoarsePointer(e)) return;
    this.cancelSafeTimer();
  };

  private handlePopoverPointerLeave = (e: PointerEvent) => {
    if (isCoarsePointer(e)) return;
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

  private handleDocumentClick = (e: PointerEvent) => {
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

  /**
   * 현재 표시 중이며 앵커가 **좌표 기반 가상 엘리먼트**인지 여부.
   *
   * 뷰포트 기하 변화(스크롤·리사이즈)는 그 자체로 닫기 사유가 아니다. `UFloatingElement.show()`
   * 가 모든 플로팅 엘리먼트에 `autoUpdate` 를 설치하고, `autoUpdate` 는 조상 스크롤과 리사이즈를
   * 모두 구독해 재배치한다 — 여기서 hide 하면 재배치 로직과 정면으로 모순된다. 실제로 그 모순이
   * 열린 listbox(u-select·u-input combobox)를 페이지 스크롤 한 번에 닫아버렸다.
   * 앵커가 클리핑 영역 밖으로 나가는 경우는 `hide` middleware 가 별도로 처리한다(닫지 않고 숨김).
   *
   * 닫아야 하는 경우는 **앵커가 좌표라서 기하 변화에 의미를 잃는 경우**뿐이다 —
   * `trigger="contextmenu"` 의 가상 앵커는 이벤트 발생 시점의 clientX/clientY 에 고정돼 있어
   * 콘텐츠가 스크롤·리플로우되면 가리키던 대상과 어긋난다.
   *
   * `targetEl` 이 없으면 표시 중이 아니므로 닫을 것도 없다 — 이 가드가 없으면 닫힌 팝오버가
   * 스크롤 이벤트마다 `hide()`(→ `await updateComplete`) 를 돌려 인스턴스 수만큼 churn 이 된다.
   * 단 `show()` 는 showDelay 타이머보다 **먼저** `targetEl` 을 세우므로, 가상 앵커의 대기 중
   * show 취소는 이 가드를 통과해 그대로 보존된다.
   */
  private get isCoordinateAnchored(): boolean {
    return !!this.targetEl && !(this.targetEl instanceof Element);
  }

  private handleDocumentScroll = () => {
    if (!this.isCoordinateAnchored) return;
    this.hide();
  };

  /**
   * 리사이즈도 스크롤과 같은 뷰포트 기하 변화다 — `autoUpdate` 가 `ancestorResize` 로 window
   * 리사이즈를 구독해 재배치하므로 실앵커 팝오버를 닫을 이유가 없다. 닫으면 모바일에서
   * `u-select searchable` 의 검색 입력을 탭하는 순간 가상 키보드가 레이아웃 뷰포트를 줄이며
   * 리사이즈를 발생시켜 드롭다운이 닫혀버린다.
   */
  private handleWindowResize = () => {
    if (!this.isCoordinateAnchored) return;
    this.hide();
  };

  private handlePopoverEvent = () => {
    this.hide();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-popover': UPopover;
  }
}
