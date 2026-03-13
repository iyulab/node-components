import { html } from "lit";
import { property } from "lit/decorators.js";

import type { Placement } from "@floating-ui/dom";

import { UElement } from "../UElement.js";
import { UButton, type ButtonVariant } from "../button/UButton.component.js";
import { UIcon, type IconLibrary } from "../icon/UIcon.component.js";
import { UTooltip } from "../tooltip/UTooltip.component.js";
import { styles } from "./UIconButton.styles.js";

/**
 * 아이콘 버튼 컴포넌트는 아이콘만 표시하는 정사각형 버튼입니다.
 * 내부적으로 u-button을 사용하며, 내장 툴팁을 지원하여 접근성을 향상시킵니다.
 *
 * @slot - 툴팁에 표시할 콘텐츠를 삽입합니다.
 */
export class UIconButton extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-button': UButton,
    'u-icon': UIcon,
    'u-tooltip': UTooltip,
  };

  /** 버튼의 스타일 변형을 설정합니다. */
  @property({ type: String, reflect: true }) variant: ButtonVariant = "ghost";
  /** 버튼을 원형으로 표시합니다. */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 버튼이 비활성화 상태인지 여부를 설정합니다. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 버튼이 로딩 상태인지 여부를 설정합니다. */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** 링크 URL. 설정 시 앵커 태그로 렌더링됩니다. */
  @property({ type: String }) href?: string;
  /** 링크 타겟. href와 함께 사용합니다. */
  @property({ type: String }) target?: string;
  /** rel 속성. href와 함께 사용합니다. */
  @property({ type: String }) rel?: string;
  /** 아이콘 SVG 소스를 직접 지정합니다. */
  @property({ type: String }) src?: string;
  /** 아이콘 라이브러리를 지정합니다. */
  @property({ type: String }) lib?: IconLibrary;
  /** 아이콘 이름을 지정합니다. */
  @property({ type: String }) name?: string;
  /** 툴팁의 위치를 설정합니다. */
  @property({ type: String, attribute: 'tooltip-placement' }) tooltipPlacement: Placement = "top";
  /** 툴팁의 위치를 설정합니다. */
  @property({ type: Number, attribute: 'tooltip-distance' }) tooltipDistance = 4;

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
        .distance=${this.tooltipDistance}
        @u-show=${this.handleStopTooltipEvent}
        @u-hide=${this.handleStopTooltipEvent}
      >
        <slot></slot>
      </u-tooltip>
    `;
  }

  /** 툴팁의 이벤트 전파를 중지하여 이벤트 충돌을 방지합니다. */
  private handleStopTooltipEvent(e: Event) {
    e.stopPropagation();
  }
}
