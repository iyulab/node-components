import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UDivider.styles.js";

export type DividerVariant = 'solid' | 'dashed' | 'dotted';
export type DividerAlign = 'start' | 'center' | 'end';

/**
 * 요소 사이에 구분선을 제공하는 컴포넌트입니다.
 *
 * @slot - 구분선 위에 오버레이하는 콘텐츠 (텍스트, 아이콘)
 *
 * @csspart line-start - 구분선의 시작 부분
 * @csspart label - 슬롯 콘텐츠 부분
 * @csspart line-end - 구분선의 끝 부분
 * 
 * @cssprop --divider-size - 선의 두께 (기본: 1px)
 * @cssprop --divider-color - 선의 색상
 * @cssprop --divider-spacing - 상하/좌우 간격 (기본: 8px)
 */
@customElement('u-divider')
export class UDivider extends UElement {
  static styles = [ super.styles, styles ];

  /** 수직 방향 여부 (기본값 수평) */
  @property({ type: Boolean, reflect: true }) vertical = false;
  /** 선의 색상 */
  @property({ type: String, reflect: true }) variant: DividerVariant = 'solid';
  /** 슬롯 콘텐츠 정렬 위치 */
  @property({ type: String, reflect: true }) align: DividerAlign = 'center';

  protected render() {
    return html`
      <span class="line" part="line-start"></span>
      <span class="label" part="label">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </span>
      <span class="line" part="line-end"></span>
    `;
  }

  private handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    const hasContent = nodes.some(n =>
      n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent?.trim())
    );
    this.toggleAttribute('has-label', hasContent);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-divider': UDivider;
  }
}