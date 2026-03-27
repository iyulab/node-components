import { html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { UElement } from "../UElement.js";
import { USpinner } from "../spinner/USpinner.component.js";
import { styles } from "./UButton.styles.js";

export type ButtonVariant = "solid" | "surface" | "filled" | "outlined" | "ghost" | "link";
export type ButtonType = "button" | "submit" | "reset";

/**
 * Button 컴포넌트는 클릭 가능한 버튼을 나타내며, 다양한 스타일 변형과 로딩 상태를 지원합니다.
 * href가 설정되면 앵커 태그로 렌더링됩니다.
 * 
 * @slot - 버튼 내부에 표시할 콘텐츠를 삽입합니다.
 * @slot prefix - 버튼의 접두사로 표시할 콘텐츠를 삽입합니다.
 * @slot suffix - 버튼의 접미사로 표시할 콘텐츠를 삽입합니다.
 * @slot spinner - 로딩 시 표시할 커스텀 스피너를 주입합니다. slotchange로 감지하여 기본 스피너를 교체합니다.
 */
export class UButton extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-spinner': USpinner
  };

  /** 버튼의 스타일 변형을 설정합니다. */
  @property({ type: String, reflect: true }) variant: ButtonVariant = "solid";
  /** 버튼의 경계선을 둥글게 설정합니다. */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 버튼이 비활성화 상태인지 여부를 설정합니다. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 버튼이 로딩 상태인지 여부를 설정합니다. */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** 버튼의 타입을 설정합니다. (button, submit, reset) */
  @property({ type: String }) type: ButtonType = "button";
  /** 링크 URL. 설정 시 앵커 태그로 렌더링됩니다. */
  @property({ type: String }) href?: string;
  /** 링크 타겟. href와 함께 사용합니다. */
  @property({ type: String }) target?: string;
  /** 링크 관계. href와 함께 사용합니다. */
  @property({ type: String }) rel?: string;
  /** 다운로드 파일명. href와 함께 사용합니다. */
  @property({ type: String }) download?: string;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick);
    super.disconnectedCallback();
  }

  render() {
    if (this.href) {
      return html`
        <a part="button"
          ?disabled=${this.disabled || this.loading}
          tabindex=${this.disabled || this.loading ? -1 : 0}
          href=${ifDefined(this.disabled || this.loading ? undefined : this.href)}
          download=${ifDefined(this.download)}
          target=${ifDefined(this.target)}
          rel=${ifDefined(this.rel)}
        >
          ${this.renderContent()}
        </a>
        ${this.renderMask()}
      `;
    }

    return html`
      <button part="button"
        type=${this.type}
        ?disabled=${this.disabled || this.loading}
      >
        ${this.renderContent()}
      </button>
      ${this.renderMask()}
    `;
  }

  /** 버튼 내부 콘텐츠 */
  private renderContent(): TemplateResult {
    return html`
      <slot name="prefix"></slot>
      <div class="content" part="content">
        <slot></slot>
      </div>
      <slot name="suffix"></slot>
    `;
  }

  /** 로딩 마스크 (커스텀 스피너 또는 기본 u-spinner) */
  private renderMask(): TemplateResult {
    return html`
      <div class="mask" part="mask" ?hidden=${!this.loading}>
        <u-spinner></u-spinner>
        <slot name="spinner" @slotchange=${this.handleSpinnerSlotChange}></slot>
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

  /** spinner 슬롯 변경 감지 */
  private handleSpinnerSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const hasSpinner = slot.assignedNodes().length > 0;
    this.toggleAttribute('has-spinner', hasSpinner);
  }
}
