import { html, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UFloatingElement } from "../UFloatingElement.js";
import { styles } from "./UTooltip.styles.js";

/**
 * 특정 요소에 툴팁을 표시하는 컴포넌트입니다.
 * 호버 또는 포커스 시 자동으로 표시합니다.
 *
 * @slot - 툴팁 콘텐츠
 *
 * @event show - 툴팁을 표시하기 직전 발생 (취소 가능)
 * @event hide - 툴팁을 숨기기 직전 발생 (취소 가능)
 */
@customElement('u-tooltip')
export class UTooltip extends UFloatingElement {
  static styles = [ super.styles, styles ];

  /** 마우스가 툴팁 위에 이동해도 유지하는지 여부 */
  @property({ type: Boolean, reflect: true }) interactive: boolean = false;
  /** 호버 시 마우스 커서 위치를 따라가는지 여부 */
  @property({ type: Boolean, reflect: true }) tracking: boolean = false;

  private isEmpty: boolean = true;

  disconnectedCallback(): void {
    if (this.anchors) this.unbind(this.anchors);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('anchors')) {
      const oldAnchors = changedProperties.get('anchors') as HTMLElement[] | undefined;
      const newAnchors = this.anchors as HTMLElement[] | undefined;

      if (oldAnchors) this.unbind(oldAnchors);
      if (newAnchors) this.bind(newAnchors);
    }

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
      return (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === '')
        || node.nodeType === Node.COMMENT_NODE;
    });
  };

  private handleAnchorTrigger = (event: PointerEvent | FocusEvent) => {
    if (this.isEmpty) return;
    let target = event.currentTarget as any;
    if (!target) return;

    if (this.tracking && event instanceof PointerEvent) {
      target = this.createVirtualTarget(event);
    }

    this.show(target);
  };

  private handleAnchorDismiss = (event: PointerEvent | FocusEvent) => {
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

declare global {
  interface HTMLElementTagNameMap {
    'u-tooltip': UTooltip;
  }
}