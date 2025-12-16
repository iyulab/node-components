import { html } from "lit";

import { BaseElement } from "../BaseElement.js";
import { FloatingElement } from "../FloatingElement.js";
import { styles } from "./Tooltip.styles.js";

/**
 * Tooltip 컴포넌트는 대상 엘리먼트에 툴팁을 표시하는 기능을 제공합니다.
 */
export class Tooltip extends FloatingElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  render() {
    return html`<slot></slot>`;
  }

  /** 바인딩 이벤트 핸들러 */ 
  private _show = () => this.show();
  private _hide = () => this.hide();
  
  /** 바인딩 이벤트 핸들러 */
  bind(target: HTMLElement): void {
    target.addEventListener('pointerenter', this._show);
    target.addEventListener('pointerleave', this._hide);
    target.addEventListener('focusin', this._show);
    target.addEventListener('focusout', this._hide);
  }

  /** 바인딩 해제 이벤트 핸들러 */
  unbind(target: HTMLElement): void {
    target.removeEventListener('pointerenter', this._show);
    target.removeEventListener('pointerleave', this._hide);
    target.removeEventListener('focusin', this._show);
    target.removeEventListener('focusout', this._hide);
  }
}