import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UDivider.styles.js";

/** 디바이더 선 스타일 */
export type DividerVariant = 'solid' | 'dashed' | 'dotted';
/** 슬롯 콘텐츠 정렬 위치 */
export type DividerAlign = 'start' | 'center' | 'end';

/**
 * Divider 컴포넌트는 엘리먼트 사이에 구분선을 제공합니다.
 *
 * @slot - 디바이더 위에 오버레이되는 콘텐츠 (텍스트, 아이콘 등)
 *
 * @cssproperty --divider-size - 선 두께 (기본값: 1px)
 * @cssproperty --divider-color - 선 색상 (기본값: var(--u-neutral-200, #e5e7eb))
 * @cssproperty --divider-spacing - 상하/좌우 간격 (기본값: 8px)
 */
export class UDivider extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 수직 방향 여부를 설정합니다. (기본값: 수평) */
  @property({ type: Boolean, reflect: true }) vertical = false;
  /** 선 스타일을 설정합니다. */
  @property({ type: String, reflect: true }) variant: DividerVariant = 'solid';
  /** 슬롯 콘텐츠의 정렬 위치를 설정합니다. */
  @property({ type: String, reflect: true }) align: DividerAlign = 'center';

  protected render() {
    return html`
      <span class="line"></span>
      <span class="label">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </span>
      <span class="line"></span>
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
