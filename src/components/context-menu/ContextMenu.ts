import { html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { computePosition, offset, shift, flip, autoPlacement } from '@floating-ui/dom';
import type { Placement } from "@floating-ui/dom";

import { UElement } from "../../internals/UElement";
import { MenuItem } from "../menu-item/MenuItem.js";
import { styles } from "./ContextMenu.styles.js";

/**
 * ContextMenu 컴포넌트는 마우스 오른쪽 버튼 클릭으로 표시되는 컨텍스트 메뉴입니다.
 * MenuItem 컴포넌트를 자식으로 포함하여 메뉴를 구성합니다.
 */
export class ContextMenu extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-menu-item': MenuItem,
  };

  /** 컨텍스트 메뉴가 연결될 대상 엘리먼트입니다. 지정하지 않으면 부모 엘리먼트가 대상이 됩니다. */
  @property({ attribute: false }) trigger?: HTMLElement;
  /** 현재 메뉴가 열려있는지 여부입니다. */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** 'fixed' 위치에서 포지션을 계산할지 여부를 설정합니다. 기본값은 true입니다. */
  @property({ type: Boolean, reflect: true }) hoist: boolean = true;
  /** 메뉴가 나타날 위치를 설정합니다. */
  @property({ type: String }) placement?: Placement;
  /** 메뉴의 위치에서 마우스 포인터까지의 거리를 픽셀단위로 설정합니다. 기본값은 2입니다. */
  @property({ type: Number }) distance: number = 2;

  /** 마우스 클릭 위치 */
  private mouseX: number = 0;
  private mouseY: number = 0;

  connectedCallback(): void {
    super.connectedCallback();
    this.trigger ||= this.findParentElement();
    this.setAttribute('role', 'menu');
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
      <div class="container">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  /** 컨텍스트 메뉴를 표시합니다. */
  public show = async (x?: number, y?: number) => {
    if (x !== undefined) this.mouseX = x;
    if (y !== undefined) this.mouseY = y;

    // DOM 업데이트 후 위치 계산
    await this.updateComplete;

    // 가상 엘리먼트 생성 (마우스 클릭 위치)
    const virtualElement = {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: this.mouseX,
        y: this.mouseY,
        top: this.mouseY,
        left: this.mouseX,
        right: this.mouseX,
        bottom: this.mouseY,
      }),
    };

    const middleware = [
      offset({ mainAxis: this.distance }),
      shift({ padding: 8 }),
      flip(),
    ];

    // 자동 배치가 필요한 경우
    if (!this.placement) {
      middleware.push(autoPlacement({ allowedPlacements: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] }));
    }

    const position = await computePosition(virtualElement, this, {
      placement: this.placement || 'bottom-start',
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
      this.emit('u-show');
    });
  }

  /** 컨텍스트 메뉴를 숨깁니다. */
  public hide = async () => {
    await this.updateComplete;
    requestAnimationFrame(() => {
      this.open = false;
      this.emit('u-hide');
    });
  }

  /** 대상 엘리먼트에 컨텍스트 메뉴 이벤트를 바인딩 합니다. */
  private attachTrigger(trigger?: HTMLElement): void {
    if (!trigger) return;
    trigger.addEventListener('contextmenu', this.handleContextMenu);
    // 메뉴가 열려있을 때 다른 곳을 클릭하면 닫기
    document.addEventListener('click', this.handleDocumentClick);
    document.addEventListener('contextmenu', this.handleDocumentContextMenu);
  }

  /** 대상 엘리먼트에 바인딩된 컨텍스트 메뉴 이벤트를 제거합니다. */
  private detachTrigger(trigger?: HTMLElement): void {
    if (!trigger) return;
    trigger.removeEventListener('contextmenu', this.handleContextMenu);
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('contextmenu', this.handleDocumentContextMenu);
  }

  /** 컨텍스트 메뉴 이벤트를 처리합니다. */
  private handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.show(e.clientX, e.clientY);
  }

  /** 문서 클릭 이벤트를 처리합니다. */
  private handleDocumentClick = (e: MouseEvent) => {
    if (this.open && !this.contains(e.target as Node)) {
      this.hide();
    }
  }

  /** 문서 컨텍스트 메뉴 이벤트를 처리합니다. */
  private handleDocumentContextMenu = (e: MouseEvent) => {
    // 현재 컨텍스트 메뉴가 열려있고, 다른 곳에서 우클릭한 경우
    if (this.open && !this.trigger?.contains(e.target as Node)) {
      this.hide();
    }
  }

  /** 슬롯 변경 이벤트를 처리합니다. */
  private handleSlotChange = () => {
    // 메뉴 항목들에 클릭 이벤트 추가 (선택 시 메뉴 닫기)
    const slot = this.shadowRoot?.querySelector('slot');
    const items = slot?.assignedElements({ flatten: true }) as MenuItem[];
    items?.forEach(item => {
      item.addEventListener('u-select', () => {
        this.hide();
      });
    });
  }

  /**
   * 부모 엘리먼트에서 컨텍스트 메뉴 대상 엘리먼트를 찾습니다.
   * Shadow DOM을 지원하는 경우, Shadow DOM의 호스트 엘리먼트를 반환합니다.
   * 일반 DOM 엘리먼트인 경우, 해당 엘리먼트를 반환합니다.
   * 찾을 수 없는 경우 undefined을 반환합니다.
   */
  private findParentElement(): HTMLElement | undefined {
    if (this.parentElement) {
      return this.parentElement as HTMLElement;
    } else {
      const root = this.getRootNode({ composed: false });
      return root instanceof Document 
        ? root.documentElement as HTMLElement 
        : root instanceof ShadowRoot
        ? root.host as HTMLElement
        : root instanceof HTMLElement
        ? root
        : undefined;
    }
  }

  /**
   * 메뉴가 나타날 위치에 따라 transform-origin 값을 반환합니다.
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
        return 'top left';
    }
  }
}