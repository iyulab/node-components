import { html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../button/UButton.js';
import '../icon/UIcon.js';

import { UElement } from "../UElement.js";
import { styles } from "./UTab.styles.js";
import { type RemoveEventDetail } from "../../events/RemoveEvent.js";
import { Locale } from '../../utilities/Locale.js';
import { formatNumber } from '../../utilities/format.js';

/** `u-tab` 개수의 모양 — `badge` 는 알약 면(눈을 끈다), `plain` 은 면 없는 보조 숫자(정보). */
export type TabCountAppearance = 'badge' | 'plain';

/**
 * 탭 아이템 — `u-tab-panel` 안에서는 패널을 고르는 탭(`role="tab"`), `href` 를 주면 `u-tab-nav` 안의
 * 이동 링크(저장된 보기 = URL)다. 링크 탭은 탭 역할을 갖지 않는다 — 다른 쪽으로 이동하는 것은 탭이 아니라
 * 링크이고, 현재 쪽은 `aria-current="page"` 로 알린다(WAI-ARIA APG 는 탭 패턴을 «같은 쪽의 패널 전환» 에만 쓴다).
 *
 * @slot - 탭 레이블 콘텐츠
 * @slot prefix - 탭 레이블 앞에 표시되는 콘텐츠
 * @slot suffix - 탭 레이블 뒤에 표시되는 콘텐츠
 *
 * @csspart base - 탭 바깥 상자(`href` 를 주면 이 상자가 링크 `<a>` 다)
 * @csspart count - 개수 (`count` 를 줄 때만 렌더된다)
 * @csspart remove-btn - 탭 닫기 버튼
 * 
 * @event remove - 탭이 닫힐 때 발생. 이벤트 리스너에서 preventDefault()를 호출하면 탭이 닫히지 않습니다.
 * @cssprop --tab-padding-block - 세로 여백
 * @cssprop --tab-padding-inline - 가로 여백
 */
@customElement('u-tab')
export class UTab extends UElement {
  static styles = [super.styles, styles];

  /** 탭 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 탭 닫기 가능 여부 */
  @property({ type: Boolean, reflect: true }) removable = false;
  /** 탭 고유값 (패널 매칭에 사용) */
  @property({ type: String, reflect: true }) value = "";
  /** 탭 드래그 여부 */
  @property({ type: Boolean, reflect: true }) draggable = false;
  /**
   * 선택된 탭 — 담는 쪽(`u-tab-panel` · `u-tab-nav` 의 `value`)이 정한다. `u-tab-nav` 에 `value` 가 없으면
   * 작성자가 현재 보기의 링크 탭에 직접 둔다.
   */
  @property({ type: Boolean, reflect: true }) active = false;
  /** 이동할 URL — 주면 탭이 링크가 된다(`u-tab-nav` 안에 둔다). 링크 탭은 닫기 버튼을 그리지 않는다. */
  @property({ type: String, reflect: true }) href?: string;
  /** 링크 타겟 (`href` 와 함께) */
  @property({ type: String }) target?: string;
  /** 링크 관계 (`href` 와 함께) */
  @property({ type: String }) rel?: string;
  /** 레이블 뒤의 조용한 개수(그 보기의 항목 수) — 현재 로캘의 숫자 표기로 그린다. 없으면 그리지 않는다. */
  @property({ type: Number }) count?: number;
  /**
   * 개수의 모양 — `badge`(알약 면, 기본) · `plain`(면 없는 보조 숫자 — 탭이 많아 배지가 레이블보다 먼저 읽힐 때).
   * 비우면 앱 전역 기본값(`UTab.countAppearance`).
   */
  @property({ type: String, attribute: 'count-appearance' }) countAppearance?: TabCountAppearance;

  /**
   * 앱 전역 기본값 — 앱 시작 때 한 번 정한다(예: `UTab.countAppearance = 'plain'`). 이미 그려진 탭은 다음 렌더부터 따른다.
   * @default 'badge'
   */
  static countAppearance: TabCountAppearance = 'badge';

  connectedCallback(): void {
    super.connectedCallback();
    this.applyRole();
    if (!this.hasAttribute('slot')) {
      this.setAttribute('slot', 'tab');
    }
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    if (changedProperties.has('href')) this.applyRole();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    // 역할이 호스트에 있으므로 비활성도 호스트가 알린다 — 보조기술·자동화 도구가 읽는 것은 이 속성이다.
    // 링크 탭은 역할이 안쪽 <a> 에 있으므로 거기서 알린다(render).
    if (changedProperties.has('disabled') || changedProperties.has('href')) {
      if (this.disabled && !this.href) this.setAttribute('aria-disabled', 'true');
      else this.removeAttribute('aria-disabled');
    }
  }

  /** 탭이면 호스트가 `role="tab"` 이고 포커스를 받는다 · 링크면 둘 다 안쪽 `<a>` 의 것이다. */
  private applyRole() {
    if (this.href) {
      if (this.getAttribute('role') === 'tab') this.removeAttribute('role');
      this.removeAttribute('tabindex');
      this.removeAttribute('aria-selected');
      return;
    }
    this.setAttribute('role', 'tab');
    // 탭 패널 안에서는 패널이 로빙 tabindex 를 정한다 — 다시 붙을 때 그것을 덮지 않는다.
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
  }

  render() {
    if (this.href) {
      return html`
        <a class="base" part="base"
          href=${ifDefined(this.disabled ? undefined : this.href)}
          aria-current=${this.active ? 'page' : nothing}
          aria-disabled=${this.disabled ? 'true' : nothing}
          target=${ifDefined(this.target)}
          rel=${ifDefined(this.rel)}
        >${this.renderLabel()}</a>
      `;
    }
    return html`
      <div class="base" part="base">
        ${this.renderLabel()}

        <u-button class="remove-btn" part="remove-btn"
        ?hidden=${!this.removable}
        appearance="plain"
        aria-label=${Locale.getValue('closeTab')}
        @click=${this.handleRemoveClick}
      >
        <u-icon lib="internal" name="x"></u-icon>
      </u-button>
      </div>
    `;
  }

  private renderLabel(): TemplateResult {
    return html`
      <slot name="prefix"></slot>
      <slot></slot>
      ${this.count == null || Number.isNaN(this.count)
        ? nothing
        : html`<span class="count ${(this.countAppearance ?? UTab.countAppearance) === 'plain' ? 'plain' : 'badge'}"
            part="count">${formatNumber(this.count)}</span>`}
      <slot name="suffix"></slot>
    `;
  }

  private handleRemoveClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;

    if(this.fire<RemoveEventDetail>('remove', { bubbles: false, composed: false })) {
      this.remove();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-tab': UTab;
  }
}
