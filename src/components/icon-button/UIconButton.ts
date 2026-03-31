import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import type { Placement, OffsetOptions } from "@floating-ui/dom";
import '../button/UButton.js';
import '../icon/UIcon.js';
import '../tooltip/UTooltip.js';

import { UElement } from "../UElement.js";
import { type ButtonVariant } from "../button/UButton.js";
import { type IconLibrary } from "../icon/UIcon.js";
import { styles } from "./UIconButton.styles.js";

/**
 * 아이콘만 표시하는 정사각형 버튼 컴포넌트입니다.
 * 내장 툴팁을 지원하여 접근성을 향상시킵니다.
 *
 * @slot - 툴팁에 표시할 콘텐츠
 *
 * @csspart button - 내부 버튼 요소
 * @csspart icon - 아이콘 요소
 * @csspart tooltip - 툴팁 요소
 */
@customElement('u-icon-button')
export class UIconButton extends UElement {
  static styles = [ super.styles, styles ];

  /** 버튼 스타일 변형 */
  @property({ type: String, reflect: true }) variant: ButtonVariant = "ghost";
  /** 원형 표시 여부 */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 로딩 상태 여부 */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** 링크 URL (설정 시 앵커 태그로 렌더링) */
  @property({ type: String }) href?: string;
  /** 링크 타겟 */
  @property({ type: String }) target?: string;
  /** rel 속성 */
  @property({ type: String }) rel?: string;
  /** 아이콘 SVG 소스를 직접 지정 */
  @property({ type: String }) src?: string;
  /** 아이콘 라이브러리 */
  @property({ type: String }) lib?: IconLibrary;
  /** 아이콘 이름 */
  @property({ type: String }) name?: string;
  /** 툴팁 위치 */
  @property({ type: String, attribute: 'tooltip-placement' }) tooltipPlacement: Placement = "top";
  /** 툴팁 거리 */
  @property({ type: Number, attribute: 'tooltip-offset' }) tooltipOffset: OffsetOptions = 4;

  render() {
    return html`
      <u-button part="button"
        .disabled=${this.disabled}
        .loading=${this.loading}
        .variant=${this.variant}
        .rounded=${this.rounded}
        .href=${this.href}
        .target=${this.target}
        .rel=${this.rel}
      >
        <u-icon part="icon"
          .lib=${this.lib}
          .name=${this.name}
          .src=${this.src}
        ></u-icon>
      </u-button>

      <u-tooltip part="tooltip"
        .placement=${this.tooltipPlacement}
        .offset=${this.tooltipOffset}
        @show=${this.handleStopTooltipEvent}
        @hide=${this.handleStopTooltipEvent}
      >
        <slot></slot>
      </u-tooltip>
    `;
  }

  private handleStopTooltipEvent(e: Event) {
    e.stopImmediatePropagation();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-icon-button': UIconButton;
  }
}
