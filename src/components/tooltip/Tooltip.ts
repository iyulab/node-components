import { html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { computePosition, offset, shift, flip, autoPlacement } from '@floating-ui/dom';
import type { Placement } from "@floating-ui/dom";

import { UElement } from "../../internals/UElement.js";
import { styles } from "./Tooltip.styles.js";

/**
 * Tooltip 컴포넌트는 대상 엘리먼트에 툴팁을 표시하는 기능을 제공합니다.
 */
export class Tooltip extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 슬롯이 비어있는지 여부를 나타냅니다. */
  private isSlotEmpty: boolean = true;

  /** 툴팁이 연결될 대상 엘리먼트입니다. 지정하지 않으면 부모 엘리먼트가 대상이 됩니다. */
  @property({ attribute: false }) trigger?: HTMLElement;
  /** 현재 툴팁이 열려있는지 여부를 나타냅니다. */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** 'fixed' 위치에서 포지션을 계산할지 여부를 설정합니다. 기본값은 false입니다. */
  @property({ type: Boolean, reflect: true }) hoist: boolean = false;
  /** 툴팁이 나타날 위치를 설정합니다. */
  @property({ type: String }) placement?: Placement;
  /** 툴팁의 위치에서 대상 엘리먼트까지의 거리를 픽셀단위로 설정합니다. 기본값은 8입니다. */
  @property({ type: Number }) distance: number = 8;
  
  connectedCallback(): void {
    super.connectedCallback();
    this.trigger ||= this.findParentElement();
  }

  disconnectedCallback(): void {
    this.detachTrigger(this.trigger);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // trigger 프로퍼티가 변경된 경우, 이전 트리거에서 새로운 트리거로 이벤트를 추가합니다.
    if (changedProperties.has('trigger') && this.trigger) {
      const oldTrigger = changedProperties.get('trigger');
      this.detachTrigger(oldTrigger);
      this.attachTrigger(this.trigger);
    }
  }

  render() {
    return html`
      <slot @slotchange=${this.checkEmptySlot}></slot>
    `;
  }

  /** 툴팁을 표시합니다. */
  public show = async () => {
    // DOM 업데이트 후 위치 계산
    await this.updateComplete;
    if (!this.trigger || this.isSlotEmpty) return;
    
    const middleware = [
      offset({ mainAxis: this.distance }),
      shift(),
      flip(),
    ]
    // 자동 배치가 필요한 경우
    if (!this.placement)
      middleware.push(autoPlacement());

    const position = await computePosition(this.trigger, this, {
      placement: this.placement,
      middleware: middleware,
      strategy: this.hoist ? 'fixed' : 'absolute',
    });

    Object.assign(this.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
      transformOrigin: this.getTransformOrigin(position.placement),
    });

    // style 업데이트 후 Open
    await this.updateComplete;
    requestAnimationFrame(() => {
      this.open = true;
    });
  }

  /** 툴팁을 숨깁니다. */
  public hide = async () => {
    await this.updateComplete;
    requestAnimationFrame(() => {
      this.open = false;
    });
  }

  /** 대상 엘리먼트에 툴팁 이벤트를 바인딩 합니다. */
  private attachTrigger(trigger?: HTMLElement): void {
    if (!trigger) return;
    trigger.addEventListener('mouseenter', this.show);
    trigger.addEventListener('mouseleave', this.hide);
    trigger.addEventListener('focusin', this.show);
    trigger.addEventListener('focusout', this.hide);
  }

  /** 대상 엘리먼트에 바인딩된 툴팁 이벤트를 제거합니다. */
  private detachTrigger(trigger?: HTMLElement): void {
    if (!trigger) return;
    trigger.removeEventListener('mouseenter', this.show);
    trigger.removeEventListener('mouseleave', this.hide);
    trigger.removeEventListener('focusin', this.show);
    trigger.removeEventListener('focusout', this.hide);
  }

  /**
   * 부모 엘리먼트에서 툴팁 대상 엘리먼트를 찾습니다.
   * Shadow DOM을 지원하는 경우, Shadow DOM의 호스트 엘리먼트를 반환합니다.
   * 일반 DOM 엘리먼트인 경우, 해당 엘리먼트를 반환합니다.
   * 찾을 수 없는 경우 undefined을 반환합니다.
   */
  private findParentElement(): HTMLElement | undefined {
    if (this.parentElement) {
      return this.parentElement as HTMLElement;  // 일반 DOM 엘리먼트
    } else {
      const root = this.getRootNode({ composed: false });
      return root instanceof Document 
        ? root.documentElement as HTMLElement 
        : root instanceof ShadowRoot
        ? root.host as HTMLElement  // Shadow DOM 호스트 엘리먼트
        : root instanceof HTMLElement
        ? root  // 일반 DOM 엘리먼트
        : undefined;  // 찾을 수 없는 경우
    }
  }

  /** 
   * slot에 콘텐츠가 존재하는지 확인합니다. 
   */
  private checkEmptySlot = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true }) ?? [];
    this.isSlotEmpty = !nodes.some(node => {
      // 요소 노드인 경우, 항상 true
      if (node.nodeType === Node.ELEMENT_NODE) return true;
      // 텍스트 노드의 경우, 공백이 아닌 내용이 있는 경우 true
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) return true;
      // 그 외 모두 false
      return false;
    });
  }

  /**
   * 툴팁이 나타날 위치에 따라 transform-origin 값을 반환합니다.
   */
  private getTransformOrigin(placement: Placement): string {
    switch (placement) {
      case 'top':
      case 'top-start':
      case 'top-end':
        return 'center bottom';
      case 'bottom':
      case 'bottom-start':
      case 'bottom-end':
        return 'center top';
      case 'left':
      case 'left-start':
      case 'left-end':
        return 'right center';
      case 'right':
      case 'right-start':
      case 'right-end':
        return 'left center';
      default:
        return 'center';
    }
  }
}