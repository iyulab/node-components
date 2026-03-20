import { html } from "lit";

import { UElement } from "../UElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { styles } from "./UBreadcrumb.styles.js";

/**
 * Breadcrumb 컴포넌트는 현재 페이지의 위치를 계층 구조로 표시합니다.
 * 내부에 u-breadcrumb-item을 배치하여 사용합니다.
 *
 * @slot u-breadcrumb-item 요소들
 * @slot separator - 구분자 커스터마이징 슬롯 (기본: chevron-right 아이콘)
 */
export class UBreadcrumb extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon
  };

  // 사용자 정의 구분자 노드 (separator 슬롯에서 할당)
  private separator?: Node;

  render() {
    return html`
      <nav aria-label="breadcrumb">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </nav>
      <div hidden aria-hidden="true">
        <slot name="separator" @slotchange=${this.handleSeparatorSlotChange}></slot>
      </div>
    `;
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const items = slot.assignedElements({ flatten: true })
      .filter((el): el is HTMLElement => el instanceof HTMLElement);
    this.appendSeparator(items);
  }

  private handleSeparatorSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.separator = slot.assignedNodes({ flatten: true }).at(0);

    const nodes = this.shadowRoot?.querySelectorAll('nav > *:not(.separator)') ?? [];
    const items = Array.from(nodes).filter((el): el is HTMLElement => el instanceof HTMLElement);
    this.appendSeparator(items);
  }

  private appendSeparator(items: HTMLElement[]) {
    const nav = this.shadowRoot?.querySelector('nav');
    if (!nav) return;

    // 기존 separator 제거
    nav.querySelectorAll('.separator').forEach(el => el.remove());
    // 이전 last 속성 제거
    items.forEach(item => item.removeAttribute('data-last'));

    // 아이템에 order 부여, separator 삽입, 마지막 아이템 표시
    items.forEach((item, i) => {
      item.style.order = String(i * 2);

      if (i < items.length - 1) {
        const sep = this.createSeparator(i);
        nav.appendChild(sep);
      } else {
        item.setAttribute('data-last', '');
      }
    });
  }

  private createSeparator(index: number) {
    const sep = document.createElement('span');
    sep.setAttribute('class', 'separator');
    sep.setAttribute('part', 'separator');
    sep.style.order = String(index * 2 + 1);
    
    if (this.separator) {
      sep.appendChild(this.separator.cloneNode(true));
    } else {
      const icon = document.createElement('u-icon');
      icon.setAttribute('lib', 'internal');
      icon.setAttribute('name', 'chevron-right');
      sep.appendChild(icon);
    }
    
    return sep;
  }
}
