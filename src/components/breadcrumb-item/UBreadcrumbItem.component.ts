import { html } from "lit";
import { property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { UElement } from "../UElement.js";
import { styles } from "./UBreadcrumbItem.styles.js";

/**
 * BreadcrumbItem 컴포넌트는 Breadcrumb의 개별 항목을 나타냅니다.
 *
 * @slot - 기본 슬롯: 아이템 텍스트
 * @slot prefix - 텍스트 앞에 표시할 콘텐츠 (아이콘 등)
 * @slot suffix - 텍스트 뒤에 표시할 콘텐츠
 */
export class UBreadcrumbItem extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 비활성 상태 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 링크 URL */
  @property({ type: String }) href?: string;
  /** 링크 target 속성 */
  @property({ type: String }) target?: string;
  /** 링크 rel 속성 */
  @property({ type: String }) rel?: string;

  render() {
    return html`
      <a part="link"
        href=${ifDefined(this.href)}
        target=${ifDefined(this.target)}
        rel=${ifDefined(this.rel)}
        @click=${this.handleAnchorClick}
      >
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </a>`;
  }

  /** 링크 클릭 시 호출되어 네비게이션을 처리합니다. */
  private handleAnchorClick = (e: Event) => {
    if (this.disabled) {
      e.preventDefault();
      return;
    }
    if (!this.emit('u-navigate')) {
      e.preventDefault();
    }
  }
}
