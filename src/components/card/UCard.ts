import { html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { UElement } from "../UElement.js";
import { styles } from "./UCard.styles.js";

export type CardOrientation = 'vertical' | 'horizontal';
export type CardAppearance = 'outlined' | 'plain';
/** 카드의 강조 톤. */
export type CardTone = 'primary' | 'info' | 'success' | 'warning' | 'danger';

/**
 * 콘텐츠를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * `tone` 은 카드가 이웃보다 먼저 읽혀야 할 때다 — `warning`·`danger`·`success`·`info` 는 그 상태의 옅은 면과 테두리
 * («확인할 것», «막힌 것»), `primary` 는 면은 그대로 두고 주 색 테두리(«다음 할 일» — 화면의 한 곳). 색만으로 전하지
 * 않도록 카드의 제목이 그 뜻을 말해야 한다. 톤은 안쪽 상자에 칠하므로 바깥에서 건 `--card-border-color`(하우스 시트 등)가
 * 덮지 않는다.
 *
 * @slot - 카드의 본문 콘텐츠
 * @slot header - 카드 상단 헤더 영역
 * @slot footer - 카드 하단 푸터 영역
 * @slot media - 카드의 미디어 영역 (이미지, 동영상 등)
 * 
 * @csspart base - 카드 바깥 상자(`href` 를 주면 이 상자가 링크 `<a>` 다)
 * @csspart media - 미디어 영역 컨테이너
 * @csspart content - 콘텐츠 영역 컨테이너
 * @csspart header - 헤더 영역 컨테이너
 * @csspart body - 본문 영역 컨테이너
 * @csspart footer - 푸터 영역 컨테이너
 * @cssprop --card-border-width - 테두리 두께 (`appearance="plain"` 은 0)
 * @cssprop --card-border-color - 테두리 색
 */
@customElement('u-card')
export class UCard extends UElement {
  static styles = [ super.styles, styles ];

  /** 카드 레이아웃 방향 */
  @property({ type: String, reflect: true }) orientation: CardOrientation = 'vertical';
  /** 그림자 제거 여부 */
  @property({ type: Boolean, reflect: true }) shadowless = false;
  /** 외형 정도 — `outlined`(기본: 테두리 + 높이 그림자) · `plain`(테두리·그림자 없음 — 배치만) */
  @property({ type: String, reflect: true }) appearance: CardAppearance = 'outlined';
  /** 마우스 오버 효과 적용 여부 */
  @property({ type: Boolean, reflect: true }) hoverable = false;
  /** 강조 — 상태의 면과 테두리(`warning`·`danger`·`success`·`info`) 또는 주 색 테두리(`primary`). 없으면 보통 카드 */
  @property({ type: String, reflect: true }) tone?: CardTone;
  /**
   * 카드 전체가 이동하는 링크 URL. 주면 바깥 상자가 `<a>` 로 그려진다 — 테두리가 hover 를 싣고 들어 올리지 않는다.
   * 링크 안에는 다른 대화형 요소(버튼·링크)를 두지 않는다(HTML 의 `<a>` 내용 모델).
   */
  @property({ type: String, reflect: true }) href?: string;
  /** 링크 타겟 (`href` 와 함께) */
  @property({ type: String }) target?: string;
  /** 링크 관계 (`href` 와 함께) */
  @property({ type: String }) rel?: string;
  /** 다운로드 파일명 (`href` 와 함께) */
  @property({ type: String }) download?: string;

  render() {
    if (this.href) {
      // 링크의 이름은 기본으로 카드의 글 전부다 — 짧게 하려면 호스트의 `aria-label` 을 링크로 옮긴다.
      const ariaLabel = this.getAttribute('aria-label') ?? undefined;
      return html`
        <a class="base" part="base"
          href=${this.href}
          aria-label=${ifDefined(ariaLabel)}
          target=${ifDefined(this.target)}
          rel=${ifDefined(this.rel)}
          download=${ifDefined(this.download)}
        >${this.renderSections()}</a>
      `;
    }
    return html`<div class="base" part="base">${this.renderSections()}</div>`;
  }

  private renderSections(): TemplateResult {
    return html`
      <div class="media" part="media">
        <slot name="media" @slotchange=${this.handleSlotChange}></slot>
      </div>
      <div class="content" part="content">
        <header class="header" part="header">
          <slot name="header" @slotchange=${this.handleSlotChange}></slot>
        </header>
        <div class="body" part="body">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
        <footer class="footer" part="footer">
          <slot name="footer" @slotchange=${this.handleSlotChange}></slot>
        </footer>
      </div>
    `;
  }

  private handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const container = slot.parentElement as HTMLElement;
    const hasContent = slot.assignedNodes({ flatten: true }).length > 0;

    if (container) {
      container.classList.toggle('has-content', hasContent);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-card': UCard;
  }
}

