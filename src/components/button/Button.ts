import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../../internals/UElement.js";
import { Spinner } from "../spinner/Spinner.js";
import { styles } from "./Button.styles.js";

/**
 * Button 컴포넌트는 클릭 가능한 버튼을 나타내며, 로딩 상태와 툴팁 기능을 지원합니다.
 * @slot - 버튼 내부에 표시할 콘텐츠를 삽입합니다.
 * @slot prefix - 버튼의 접두사로 표시할 콘텐츠를 삽입합니다.
 * @slot suffix - 버튼의 접미사로 표시할 콘텐츠를 삽입합니다.
 */
export class Button extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-spinner': Spinner
  };

  /** 버튼이 비활성화 상태인지 여부를 설정합니다. 비활성화된 버튼은 클릭할 수 없습니다. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 버튼이 로딩 상태인지 여부를 설정합니다. 로딩 중에는 버튼이 비활성화되고 스피너가 표시됩니다. */
  @property({ type: Boolean, reflect: true }) loading = false;

  render() {
    return html`
      <button part="base" ?disabled=${this.disabled || this.loading}>
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </button>
      
      <div class="overlay" ?hidden=${!this.loading}>
        <u-spinner></u-spinner>
      </div>
    `;
  }
}