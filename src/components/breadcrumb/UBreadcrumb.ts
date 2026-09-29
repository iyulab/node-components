import { html } from "lit";
import { customElement } from "lit/decorators.js";
import '../icon/UIcon.js';

import { UElement } from "../UElement.js";
import { styles } from "./UBreadcrumb.styles.js";
import { Locale } from '../../utilities/Locale.js';

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
      <nav aria-label=${Locale.getValue('breadcrumb')} part="nav">
        <slot @slotchange=${this.layout}></slot>
      </nav>
      <div hidden aria-hidden="true">
        <slot name="separator" @slotchange=${this.handleSeparatorSlotChange}></slot>
      </div>
    `;
  }

  private handleSeparatorSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.separator = slot.assignedNodes({ flatten: true }).at(0);
    this.layout();
  }

  /**
   * 항목 사이에 구분자를 놓는다. 항목은 **언제나 기본 슬롯의 배정 결과**에서 구한다 —
   * 항목은 슬롯된 라이트 DOM 이라 섀도의 `nav` 자식을 훑으면 `<slot>` 하나만 나온다.
   */
  private layout = () => {
    const nav = this.shadowRoot?.querySelector('nav');
    const slot = nav?.querySelector<HTMLSlotElement>('slot:not([name])');
    if (!nav || !slot) return;
    const items = slot.assignedElements({ flatten: true })
      .filter((el): el is HTMLElement => el instanceof HTMLElement);

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
    // 장식이다 — 사용자 지정 텍스트 구분자('/')를 스크린리더가 항목 사이마다 읽지 않게 한다.
    sep.setAttribute('aria-hidden', 'true');
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

