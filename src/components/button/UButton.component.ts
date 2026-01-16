import { html } from "lit";
import { property } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { USpinner } from "../spinner/USpinner.component.js";
import { styles } from "./UButton.styles.js";

export type ButtonVariant = "default" | "borderless" | "link";

/**
 * Button 컴포넌트는 클릭 가능한 버튼을 나타내며, 로딩 상태와 툴팁 기능을 지원합니다.
 * @slot - 버튼 내부에 표시할 콘텐츠를 삽입합니다.
 * @slot prefix - 버튼의 접두사로 표시할 콘텐츠를 삽입합니다.
 * @slot suffix - 버튼의 접미사로 표시할 콘텐츠를 삽입합니다.
 */
export class UButton extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-spinner': USpinner
  };

  /** 버튼의 스타일 변형을 설정합니다. */
  @property({ type: String, reflect: true }) variant: ButtonVariant = "default";
  /** 버튼이 비활성화 상태인지 여부를 설정합니다. 비활성화된 버튼은 클릭할 수 없습니다. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 버튼이 로딩 상태인지 여부를 설정합니다. 로딩 중에는 버튼이 비활성화되고 스피너가 표시됩니다. */
  @property({ type: Boolean, reflect: true }) loading = false;
  
  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick);
    super.disconnectedCallback();
  }

  render() {
    return html`
      <button part="base" 
        ?disabled=${this.disabled || this.loading}>
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </button>
      
      <div class="mask" part="mask"
        ?hidden=${!this.loading}>
        <u-spinner></u-spinner>
      </div>
    `;
  }

  /** 클릭 이벤트 컨트롤 */
  private handleClick = (e: MouseEvent) => {
    if (this.disabled || this.loading) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }
}