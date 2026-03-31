import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { UElement } from "../UElement.js";
import { styles } from "./UBreadcrumbItem.styles.js";
import { NavigateEventDetail } from '../../events/NavigateEvent.js';

/**
 * 브레드크럼의 개별 항목을 나타내는 컴포넌트입니다.
 *
 * @slot prefix - 텍스트 앞에 표시할 컨텐츠 (아이콘 등)
 * @slot - 아이콘과 텍스트
 * @slot suffix - 텍스트 뒤에 표시할 컨텐츠
 *
 * @csspart link - 링크 요소
 *
 * @event navigate - 링크 클릭 시 발생 (취소 가능)
 */
@customElement('u-breadcrumb-item')
export class UBreadcrumbItem extends UElement {
  static styles = [ super.styles, styles ];

  /** 비활성화 상태 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 링크 URL */
  @property({ type: String }) href?: string;
  /** 링크 target 속성 */
  @property({ type: String }) target?: string;
  /** 링크 rel 속성 */
  @property({ type: String }) rel?: string;

  render() {
    if (this.href) {
      return html`
        <a part="link"
          href=${this.href}
          target=${ifDefined(this.target)}
          rel=${ifDefined(this.rel)}
          @click=${this.handleAnchorClick}
        >
          <slot name="prefix"></slot>
          <slot></slot>
          <slot name="suffix"></slot>
        </a>`;
    }

    return html`
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
    `;
  }

  private handleAnchorClick = (e: Event) => {
    if (this.disabled) {
      e.preventDefault();
      return;
    }
    if (!this.fire<NavigateEventDetail>('navigate')) {
      e.preventDefault();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-breadcrumb-item': UBreadcrumbItem;
  }
}

