import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { UElement } from "../UElement.js";
import { styles } from "./UBreadcrumbItem.styles.js";
import { NavigateEventDetail } from '../../events/NavigateEvent.js';

import { SlotPresence } from "../../utilities/slotPresence.js";
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
  /** 접두 · 접미 슬롯이 찼는가 — 그 옆 간격은 섀도 안 상자가 갖는다(`::slotted` 여백은 문서의 전역 리셋에 진다). */
  private readonly affixes = new SlotPresence(this, ['prefix', 'suffix']);
  /** 호스트의 `.focus()` 를 안쪽 컨트롤로 위임한다 — `UButton` 과 같은 계약(호스트는 포커스 가능하지 않다). */
  static shadowRootOptions: ShadowRootInit = { ...UElement.shadowRootOptions, delegatesFocus: true };

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
          aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
          target=${ifDefined(this.target)}
          rel=${ifDefined(this.rel)}
          @click=${this.handleAnchorClick}
        >
          <span class="affix affix-prefix" ?hidden=${!this.affixes.has('prefix')}><slot name="prefix"></slot></span>
          <slot></slot>
          <span class="affix affix-suffix" ?hidden=${!this.affixes.has('suffix')}><slot name="suffix"></slot></span>
        </a>`;
    }

    return html`
      <span class="affix affix-prefix" ?hidden=${!this.affixes.has('prefix')}><slot name="prefix"></slot></span>
      <slot></slot>
      <span class="affix affix-suffix" ?hidden=${!this.affixes.has('suffix')}><slot name="suffix"></slot></span>
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

