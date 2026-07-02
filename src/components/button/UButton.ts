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
 */
@customElement('u-button')
export class UButton extends UElement {
  static styles = [ super.styles, styles ];
  static formAssociated = true;

  /** 버튼 스타일 변형 */
  @property({ type: String, reflect: true }) variant: ButtonVariant = "solid";
  /**
   * Semantic 색상. 기본값 `"neutral"`은 기존(v1.1.x 이전) 렌더링과 동일 — 하위 호환.
   * `variant`가 사용하는 색상 스케일을 이 값으로 교체한다(예: `color="red"` + `variant="solid"` → 파괴적 액션 버튼).
   * `variant="link"`는 `color="neutral"`(기본값)일 때 기존 동작(파랑)을 유지하고, 다른 색을 명시하면 그 색으로 재정의된다.
   * `variant="ghost"`는 hover/active 배경이 중립 팔레트에 묶여 있지 않아 이 속성의 영향을 받지 않는다.
   */
  @property({ type: String, reflect: true }) color: ButtonColor = "neutral";
  /**
   * 버튼 크기. 기본값 `"md"`는 기존(v1.2.0 이전) 렌더링과 동일 — 하위 호환.
   * `font-size`만 변경하며, padding/spinner/prefix·suffix 여백은 이미 `em` 단위라 함께 비례 축소·확대된다.
   */
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

  /**
   * ElementInternals는 폼과의 연동, 유효성 검사 상태 관리 등을 지원하는 네이티브 API입니다. 
   */
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
