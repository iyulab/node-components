import { html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../spinner/USpinner.js';

import { UElement } from "../UElement.js";
import { styles } from "./UButton.styles.js";

export type ButtonVariant = "solid" | "surface" | "filled" | "outlined" | "ghost" | "link";
export type ButtonType = "button" | "submit" | "reset";

/**
 * 클릭 가능한 버튼 컴포넌트입니다. href가 설정되면 앵커 태그로 렌더링됩니다.
 *
 * @slot - 버튼 내부 콘텐츠
 * @slot prefix - 버튼 앞에 표시할 콘텐츠
 * @slot suffix - 버튼 뒤에 표시할 콘텐츠
 * @slot spinner - 로딩 시 표시할 커스텀 스피너
 *
 * @csspart link - 내부 앵커 요소 (href 설정 시)
 * @csspart button - 내부 버튼 요소
 * @csspart content - 콘텐츠 영역
 * @csspart mask - 로딩 마스크 영역
 */
@customElement('u-button')
export class UButton extends UElement {
  static styles = [ super.styles, styles ];

  /** 버튼 스타일 변형 */
  @property({ type: String, reflect: true }) variant: ButtonVariant = "solid";
  /** 경계선 둥글게 여부 */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 로딩 상태 여부 */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** 버튼 타입 */
  @property({ type: String }) type: ButtonType = "button";
  /** 링크 URL (설정 시 앵커 태그로 렌더링) */
  @property({ type: String }) href?: string;
  /** 링크 타겟 */
  @property({ type: String }) target?: string;
  /** 링크 관계 */
  @property({ type: String }) rel?: string;
  /** 다운로드 파일명 */
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
        <a part="link"
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

  private renderContent(): TemplateResult {
    return html`
      <slot name="prefix"></slot>
      <div class="content" part="content">
        <slot></slot>
      </div>
      <slot name="suffix"></slot>
    `;
  }

  private renderMask(): TemplateResult {
    return html`
      <div class="mask" part="mask" ?hidden=${!this.loading}>
        <u-spinner></u-spinner>
        <slot name="spinner" @slotchange=${this.handleSpinnerSlotChange}></slot>
      </div>
    `;
  }

  private handleClick = (e: MouseEvent) => {
    if (this.disabled || this.loading) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }

  private handleSpinnerSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const hasSpinner = slot.assignedNodes().length > 0;
    this.toggleAttribute('has-spinner', hasSpinner);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-button': UButton;
  }
}
