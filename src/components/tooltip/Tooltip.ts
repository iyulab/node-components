import { html, PropertyValues } from "lit";

import { BaseElement } from "../BaseElement.js";
import { FloatingElement } from "../FloatingElement.js";
import { styles } from "./Tooltip.styles.js";

/**
 * Tooltip 컴포넌트는 대상 엘리먼트에 툴팁을 표시하는 기능을 제공합니다.
 */
export class Tooltip extends FloatingElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  disconnectedCallback(): void {
    this.detachAnchor(this.anchor);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('anchor')) {
      this.detachAnchor(changedProperties.get('anchor'));
      this.attachAnchor(this.anchor);
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  /** 바인딩 이벤트 핸들러 */ 
  private _show = () => this.show();
  private _hide = () => this.hide();

  /** 대상 엘리먼트에 트리거 이벤트를 바인딩합니다. */
  private attachAnchor(target?: HTMLElement): void {
    if (!target) return;

    target.addEventListener('pointerenter', this._show);
    target.addEventListener('pointerleave', this._hide);
    target.addEventListener('focusin', this._show);
    target.addEventListener('focusout', this._hide);
  }

  /** 바인딩된 트리거 이벤트를 제거합니다. */
  private detachAnchor(target?: HTMLElement): void {
    if (!target) return;

    target.removeEventListener('pointerenter', this._show);
    target.removeEventListener('pointerleave', this._hide);
    target.removeEventListener('focusin', this._show);
    target.removeEventListener('focusout', this._hide);
  }
}