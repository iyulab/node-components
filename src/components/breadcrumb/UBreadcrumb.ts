import { html } from "lit";
import { customElement } from "lit/decorators.js";
import '../icon/UIcon.js';

import { UElement } from "../UElement.js";
import { styles } from "./UBreadcrumb.styles.js";

/**
 * 현재 페이지 위치를 계층 구조로 표시하는 브레드크럼 컴포넌트입니다.
 * 하위 u-breadcrumb-item을 조합하여 사용합니다.
 *
 * @slot - u-breadcrumb-item 요소들
 * @slot separator - 구분자 커스텀 콘텐츠 (기본값: chevron-right 아이콘)
 *
 * @csspart nav - 내비게이션 요소
 */
@customElement('u-breadcrumb')
export class UBreadcrumb extends UElement {
  static styles = [ super.styles, styles ];

  private separator?: Node;

  render() {
    return html`
      <nav aria-label="breadcrumb" part="nav">
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

    nav.querySelectorAll('.separator').forEach(el => el.remove());
    items.forEach(item => item.removeAttribute('data-last'));

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

declare global {
  interface HTMLElementTagNameMap {
    'u-breadcrumb': UBreadcrumb;
  }
}

