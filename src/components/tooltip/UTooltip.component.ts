import { html, PropertyValues } from "lit";

import { BaseElement } from "../BaseElement.js";
import { FloatingElement } from "../FloatingElement.js";
import { styles } from "./UTooltip.styles.js";

/**
 * Tooltip 컴포넌트는 대상 엘리먼트에 툴팁을 표시하는 기능을 제공합니다.
 */
export class UTooltip extends FloatingElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    
    // anchor 변경 시 바인딩 갱신 및 위치 자동 업데이트 설정
    if (changedProperties.has('anchor')) {
      const oldAnchor = changedProperties.get('anchor') as HTMLElement | null;
      const newAnchor = this.anchor as HTMLElement | null;
      
      if (oldAnchor) this.unbind(oldAnchor);
      if (newAnchor) this.bind(newAnchor);
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  /** this 바인딩 이벤트 핸들러 */ 
  private _show = () => this.show();
  private _hide = () => this.hide();
  
  /** 바인딩 이벤트 핸들러 */
  private bind(target: HTMLElement): void {
    target.addEventListener('pointerenter', this._show);
    target.addEventListener('pointerleave', this._hide);
    target.addEventListener('focusin', this._show);
    target.addEventListener('focusout', this._hide);
  }

  /** 바인딩 해제 이벤트 핸들러 */
  private unbind(target: HTMLElement): void {
    target.removeEventListener('pointerenter', this._show);
    target.removeEventListener('pointerleave', this._hide);
    target.removeEventListener('focusin', this._show);
    target.removeEventListener('focusout', this._hide);
  }
}