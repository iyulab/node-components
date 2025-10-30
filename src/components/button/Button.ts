import { html } from "lit";
import { property } from "lit/decorators.js";

import type { Placement } from "@floating-ui/dom";

import { UElement } from "../../internals/UElement.js";
import { Tooltip } from "../tooltip/Tooltip.js";
import { styles } from "./Button.styles.js";

/**
 * Button 컴포넌트는 클릭 가능한 버튼을 나타내며, 로딩 상태와 툴팁 기능을 지원합니다.
 * @slot - 버튼 내부에 표시할 콘텐츠를 삽입합니다.
 */
export class Button extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'uc-tooltip': Tooltip 
  };

  /** 버튼이 비활성화 상태인지 여부를 설정합니다. 비활성화된 버튼은 클릭할 수 없습니다. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 버튼이 로딩 상태인지 여부를 설정합니다. 로딩 중에는 버튼이 비활성화되고 스피너가 표시됩니다. */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** 툴팁의 내용을 설정합니다. 툴팁은 버튼 위에 마우스를 올리거나 포커스할 때 표시됩니다. */
  @property({ type: String }) tooltip?: string;
  /** 툴팁의 위치를 설정합니다. 기본값은 'top'입니다. */
  @property({ type: String }) tooltipPosition?: Placement;

  connectedCallback(): void {
    this.setAttribute('tabindex', '0');
    super.connectedCallback();
  }

  render() {
    return html`
      <slot></slot>
      <div class="overlay" ?visible=${this.loading}>
        <uc-bar-rotate-loader></uc-bar-rotate-loader>
      </div>
      <uc-tooltip .trigger=${this as any} placement=${this.tooltipPosition || 'top'}>
        ${this.tooltip}
      </uc-tooltip>
    `;
  }
}