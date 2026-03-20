import { html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UFloatingElement } from "../UFloatingElement.js";
import { styles } from "./UTooltip.styles.js";

/**
 * Tooltip 컴포넌트는 대상 엘리먼트에 툴팁을 표시하는 기능을 제공합니다.
 */
export class UTooltip extends UFloatingElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 툴팁 내부로 마우스를 이동해도 툴팁이 유지되는지 여부입니다. */
  @property({ type: Boolean, reflect: true }) interactive: boolean = false;
  /** 호버 시 마우스 커서 위치를 따라가는지 여부입니다. */
  @property({ type: Boolean, reflect: true }) tracking: boolean = false;

  // 컨텐츠 존재 여부
  private isEmpty: boolean = true;

  disconnectedCallback(): void {
    if (this.anchors) this.unbind(this.anchors);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // anchors 변경 시 바인딩 갱신 및 위치 자동 업데이트 설정
    if (changedProperties.has('anchors')) {
      const oldAnchors = changedProperties.get('anchors') as HTMLElement[] | undefined;
      const newAnchors = this.anchors as HTMLElement[] | undefined;

      if (oldAnchors) this.unbind(oldAnchors);
      if (newAnchors) this.bind(newAnchors);
    }

    // offset 변경 시 interactive모드를 위한 히트 영역 사이즈를 조정
    if (changedProperties.has('offset') || changedProperties.has('interactive')) {
      if (this.interactive) {
        let size = 0;
        if (typeof this.offset === 'number') {
          size = this.offset;
        }
        if (typeof this.offset === 'object') {
          const { mainAxis = 0, crossAxis = 0 } = this.offset;
          size = Math.max(mainAxis, crossAxis);
        }
        this.style.setProperty('--tooltip-bridge-area', `${size}px`);
      } else {
        this.style.removeProperty('--tooltip-bridge-area');
      }
    }
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  /** 툴팁 이벤트를 트리거하는 앵커 요소에 이벤트를 바인딩하는 메서드 */
  private bind(anchors: HTMLElement[]): void {
    for (const anchor of anchors) {
      anchor.addEventListener('pointerenter', this.handleAnchorTrigger);
      anchor.addEventListener('pointerleave', this.handleAnchorDismiss);
      anchor.addEventListener('pointermove', this.handleAnchorPointerMove);
      anchor.addEventListener('focusin', this.handleAnchorTrigger);
      anchor.addEventListener('focusout', this.handleAnchorDismiss);
    }

    this.addEventListener('pointerleave', this.handleAnchorDismiss);
    this.addEventListener('focusout', this.handleAnchorDismiss);
  }

  /** 툴팁 이벤트를 트리거하는 앵커 요소에 이벤트를 언바인딩하는 메서드 */
  private unbind(anchors: HTMLElement[]): void {
    for (const anchor of anchors) {
      anchor.removeEventListener('pointerenter', this.handleAnchorTrigger);
      anchor.removeEventListener('pointerleave', this.handleAnchorDismiss);
      anchor.removeEventListener('pointermove', this.handleAnchorPointerMove);
      anchor.removeEventListener('focusin', this.handleAnchorTrigger);
      anchor.removeEventListener('focusout', this.handleAnchorDismiss);
    }

    this.removeEventListener('pointerleave', this.handleAnchorDismiss);
    this.removeEventListener('focusout', this.handleAnchorDismiss);
  }

  private handleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.isEmpty = slot.assignedNodes({ flatten: true }).every(node => {
      return (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === '' )
        || node.nodeType === Node.COMMENT_NODE;
    });
  };

  private handleAnchorTrigger = (event: PointerEvent | FocusEvent) => {
    if (this.isEmpty) return;
    let target = event.currentTarget as any;
    if (!target) return;

    // tracking이 켜진 경우, 포인터 이벤트의 위치를 타겟으로 변경
    if (this.tracking && event instanceof PointerEvent) {
      target = this.createVirtualTarget(event);
    }

    this.show(target);
  };

  private handleAnchorDismiss = (event: PointerEvent | FocusEvent) => {
    // interactive 모드에서 tooltip또는 anchor 내부로 이동할 경우 숨기지 않음
    if (this.interactive) {
      const related = event.relatedTarget;
      if (related instanceof Node) {
        if (this.contains(related)) return;
        if (this.targetEl instanceof Element && this.targetEl.contains(related)) return;
      }
    }

    this.hide();
  };

  private handleAnchorPointerMove = (event: PointerEvent) => {
    if (!this.tracking || !this.open) return;

    const virtualEl = this.createVirtualTarget(event);
    this.reposition(virtualEl);
  };
}