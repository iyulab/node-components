import { html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../spinner/USpinner.js';

import { UElement } from "../UElement.js";
import { styles } from "./UButton.styles.js";

export type ButtonVariant = "solid" | "surface" | "filled" | "outlined" | "ghost" | "link";
export type ButtonType = "button" | "submit" | "reset";
export type ButtonColor =
  | "neutral" | "blue" | "green" | "red"
  | "orange" | "teal" | "cyan" | "purple" | "pink";
export type ButtonSize = "sm" | "md" | "lg";

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
 *
 * @cssprop --u-primary-color - color="neutral"일 때 버튼 기준색. 지정 시 hover/active/surface 톤이 color-mix()로 자동 파생.
 * @cssprop --btn-padding-block - 내부 버튼의 상하 여백 (기본: 0.5em)
 * @cssprop --btn-padding-inline - 내부 버튼의 좌우 여백 (기본: 0.5em, variant="link"는 0)
 * @cssprop --btn-border-color - 내부 버튼의 테두리 색. variant/hover/active 규칙이 이 값을 정한다
 *   (기본: transparent)
 * @cssprop --btn-color - 버튼의 기준색. 아래 파생 토큰이 전부 이 값에서 color-mix()로 계산된다 —
 *   보통 이것 하나만 덮으면 된다.
 * @cssprop --btn-color-hover - solid 배경 hover (기본: --btn-color 85% + black)
 * @cssprop --btn-color-active - solid 배경 active (기본: --btn-color 70% + black)
 * @cssprop --btn-color-surface - surface 배경 (기본: --btn-color 12% + 배경색)
 * @cssprop --btn-color-surface-hover - surface 배경 hover (기본: 22%)
 * @cssprop --btn-color-surface-active - surface 배경 active (기본: 32%)
 * @cssprop --btn-color-border - 테두리 (기본: --btn-color 45% + 배경색)
 * @cssprop --btn-color-border-hover - 테두리 hover (기본: 60%)
 * @cssprop --btn-color-border-active - 테두리 active (기본: 75%)
 * @cssprop --btn-color-outline-hover - outline 배경 hover (기본: 6%)
 * @cssprop --btn-color-outline-active - outline 배경 active (기본: 12%)
 */
@customElement('u-button')
export class UButton extends UElement {
  static styles = [ super.styles, styles ];
  static formAssociated = true;

  /** 버튼 스타일 변형 */
  @property({ type: String, reflect: true }) variant: ButtonVariant = "solid";
  /**
   * Semantic 색상. 기본값 `neutral`은 `--u-primary-color`(역할 토큰)로 렌더링된다 —
   * 즉 브랜드 색을 덮으면 기본 버튼이 함께 따라온다.
   * `link`는 neutral일 때 primary 계열 유지, 다른 색 지정 시 재정의. `ghost`는 영향받지 않음.
   */
  @property({ type: String, reflect: true }) color: ButtonColor = "neutral";
  /** 버튼 크기. `font-size`만 변경하며 나머지는 `em` 단위라 비례 조정됨. */
  @property({ type: String, reflect: true }) size: ButtonSize = "md";
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

  /** form data에 포함될 name */
  @property({ type: String, reflect: true }) name?: string;
  /** form data에 포함될 value */
  @property({ type: String, reflect: true }) value?: string;

  /** 폼 연동을 위한 ElementInternals. */
  public internals?: ElementInternals;

  set form(val: string) {
    if (val) {
      this.setAttribute('form', val);
    } else {
      this.removeAttribute('form');
    }
  }

  get form(): HTMLFormElement | null {
    return this.internals?.form ?? null;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if ('attachInternals' in this) {
      this.internals = this.attachInternals();
    }
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
      return;
    }

    if (this.type === 'submit') {
      this.form?.requestSubmit();
    } else if (this.type === 'reset') {
      this.form?.reset();
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
