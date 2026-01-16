import { html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { FloatingElement } from "../FloatingElement.js";
import { styles } from "./UTooltip.styles.js";

/**
 * Tooltip 컴포넌트는 대상 엘리먼트에 툴팁을 표시하는 기능을 제공합니다.
 */
export class UTooltip extends FloatingElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /**
   * 툴팁 내부로 마우스를 이동해도 툴팁이 유지되는지 여부입니다.
   * true일 경우 툴팁 위에 마우스를 올려놓을 수 있습니다.
   * 
   * @default false
   */
  @property({ type: Boolean, reflect: true }) interactive: boolean = false;

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    
    // anchors 변경 시 바인딩 갱신 및 위치 자동 업데이트 설정
    if (changedProperties.has('anchors')) {
      const oldAnchors = changedProperties.get('anchors') as HTMLElement[] | undefined;
      const newAnchors = this.anchors as HTMLElement[] | undefined;
      
      if (oldAnchors) this.unbind(oldAnchors);
      if (newAnchors) this.bind(newAnchors);
    }

    // distance 변경 시 interactive모드를 위한 히트 영역 사이즈를 조정
    if (changedProperties.has('distance')) {
      if (this.distance > 0) {
        this.style.setProperty('--interactive-area', `${this.distance}px`);
      } else {
        this.style.removeProperty('--interactive-area');
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  /** this 바인딩 이벤트 핸들러 */ 
  private _show = (event: Event) => {
    const target = event.currentTarget as Element | null;
    if (!target) return;
    this.show(target);
  };
  
  /** this 바인딩 이벤트 핸들러 */
  private _hide = (event: Event) => {
    // interactive 모드에서는 anchor또는 tooltip 내부로 포커스/포인터가 이동할 경우 숨기지 않음
    if (this.interactive) {
      const target = this.target as Element | undefined;
      const related = (event as any).relatedTarget as Element | null;
      if (!target || !related) return;
      if (this.contains(related) || target.contains(related)) return;
    }
    this.hide();
  };
  
  /** 바인딩 이벤트 핸들러 */
  private bind(anchors: HTMLElement[]): void {
    for (const anchor of anchors) {
      anchor.addEventListener('pointerenter', this._show);
      anchor.addEventListener('pointerleave', this._hide);
      anchor.addEventListener('focusin', this._show);
      anchor.addEventListener('focusout', this._hide);
    }

    this.addEventListener('pointerleave', this._hide);
    this.addEventListener('focusout', this._hide);
  }

  /** 바인딩 해제 이벤트 핸들러 */
  private unbind(anchors: HTMLElement[]): void {
    for (const anchor of anchors) {
      anchor.removeEventListener('pointerenter', this._show);
      anchor.removeEventListener('pointerleave', this._hide);
      anchor.removeEventListener('focusin', this._show);
      anchor.removeEventListener('focusout', this._hide);
    }

    this.addEventListener('pointerleave', this._hide);
    this.addEventListener('focusout', this._hide);
  }
}