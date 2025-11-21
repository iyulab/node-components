import { html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { computePosition, offset, shift, flip, autoPlacement } from '@floating-ui/dom';
import type { Placement } from "@floating-ui/dom";

import { findElementsBy, getParentElement } from "../../internals/node-helpers.js";
import { BaseElement } from "../BaseElement.js";
import { styles } from "./Tooltip.styles.js";

/**
 * Tooltip 컴포넌트는 대상 엘리먼트에 툴팁을 표시하는 기능을 제공합니다.
 */
export class Tooltip extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /** 슬롯이 비어있는지 여부를 나타냅니다. */
  private isSlotEmpty: boolean = true;

  /** 툴팁이 연결될 대상 엘리먼트입니다. 지정하지 않으면 부모 엘리먼트가 대상이 됩니다. */
  @property({ attribute: false }) triggers: HTMLElement[] = [];
  /** 트리거 셀렉터 문자열입니다. 이 속성을 사용하여 트리거 엘리먼트를 지정할 수 있습니다. */
  @property({ type: String, attribute: "trigger-selectors" }) triggerSelectors?: string;
  /** 'fixed' 위치에서 포지션을 계산할지 여부를 설정합니다. 기본값은 false입니다. */
  @property({ type: Boolean, reflect: true }) hoist: boolean = false;
  /** 툴팁이 나타날 위치를 설정합니다. */
  @property({ type: String }) placement?: Placement;
  /** 툴팁의 위치에서 대상 엘리먼트까지의 거리를 픽셀단위로 설정합니다. 기본값은 8입니다. */
  @property({ type: Number }) distance: number = 8;
  /** 툴팁의 표시 딜레이 시간을 밀리초 단위로 설정합니다. 기본값은 0입니다. */
  @property({ type: Number }) delay: number = 0;

  constructor() {
    super();
    this.setAttribute('tabindex', '0'); // 포커스 가능하도록 설정
  }
  
  connectedCallback(): void {
    super.connectedCallback();
    // 트리거가 지정되지 않은 경우, 부모 엘리먼트를 트리거로 설정합니다.
    if (this.triggers.length === 0) {
      const parent = getParentElement(this);
      if (parent) this.triggers = [ parent ];
    }
    this.addEventListener('mouseleave', this.hide);
    this.addEventListener('focusout', this.hide);
  }

  disconnectedCallback(): void {
    this.detachTriggers(this.triggers);
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    // triggerSelectors 프로퍼티가 변경된 경우, 셀렉터에 해당하는 엘리먼트를 찾아 트리거로 설정합니다.
    if (changedProperties.has('triggerSelectors') && this.triggerSelectors) {
      this.triggers = findElementsBy(this, this.triggerSelectors);
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // trigger 프로퍼티가 변경된 경우, 이전 트리거에서 새로운 트리거로 이벤트를 추가합니다.
    if (changedProperties.has('triggers')) {
      const oldTriggers = changedProperties.get('triggers');
      this.detachTriggers(oldTriggers);
      this.attachTriggers(this.triggers);
    }
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  /** 툴팁을 표시합니다. */
  public show = async (event: Event) => {
    // DOM 업데이트 후 위치 계산
    await this.updateComplete;

    // 트리거 엘리먼트 가져오기
    const trigger = event?.currentTarget;
    if (trigger instanceof HTMLElement === false) {
      return;
    }
    
    // 기본 위치 계산 옵션
    const middleware = [
      offset({ mainAxis: this.distance }),
      shift(),
      flip(),
    ]
    // 자동 배치가 필요한 경우
    if (!this.placement) {
      middleware.push(autoPlacement());
    }

    // 위치 계산
    const position = await computePosition(trigger, this, {
      strategy: this.hoist ? 'fixed' : 'absolute',
      placement: this.placement,
      middleware: middleware,
    });

    // 위치 적용
    Object.assign(this.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
      transformOrigin: this.getTransformOrigin(position.placement),
    });

    // 딜레이가 설정된 경우 대기
    if (this.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.delay));
    }

    // style 업데이트 후 Open
    requestAnimationFrame(() => {
      this.setAttribute('open', '');
    });
  }

  /** 툴팁을 숨깁니다. */
  public hide = async (event: Event) => {
    await this.updateComplete;

    // 이동이 트리거 내부로 이동한 경우 숨기지 않음
    if ('relatedTarget' in event) {
      const relatedTarget = event['relatedTarget'] as HTMLElement | null;
      if (this.contains(relatedTarget)) {
        return;
      }
    }

    this.removeAttribute('open');
  }

  /** 대상 엘리먼트에 툴팁 이벤트를 바인딩 합니다. */
  private attachTriggers(triggers: HTMLElement[]): void {
    if (!triggers) return;
    for (const trigger of triggers) {
      trigger.addEventListener('mouseenter', this.show);
      trigger.addEventListener('mouseleave', this.hide);
      trigger.addEventListener('focusin', this.show);
      trigger.addEventListener('focusout', this.hide);
    }
  }

  /** 대상 엘리먼트에 바인딩된 툴팁 이벤트를 제거합니다. */
  private detachTriggers(triggers: HTMLElement[]): void {
    if (!triggers) return;
    for (const trigger of triggers) {
      trigger.removeEventListener('mouseenter', this.show);
      trigger.removeEventListener('mouseleave', this.hide);
      trigger.removeEventListener('focusin', this.show);
      trigger.removeEventListener('focusout', this.hide);
    }
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

  /** 
   * slot에 콘텐츠가 존재하는지 확인합니다. 
   */
  private handleSlotChange = (e: Event) => {
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
}