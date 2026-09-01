import { html, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../spinner/USpinner.js';

import { UElement } from "../UElement.js";
import { styles } from "./UButton.styles.js";

export type ButtonVariant = "solid" | "surface" | "filled" | "outlined" | "ghost" | "link";
export type ButtonType = "button" | "submit" | "reset";
/**
 * 두 축이 한 속성에 병존한다.
 *
 * - **역할 축**(`primary`·`info`·`success`·`warning`·`danger`) — *의미*를 말한다.
 *   색은 소비자의 역할 토큰이 정하므로 **리브랜딩을 따라오고**, 대비 계약을 물려받는다.
 * - **장식 축**(`blue`·`purple` …) — *색 자체*를 말한다. 소비자가 고른 색이므로
 *   리브랜딩에 **의도적으로 면역**이다.
 *
 * ★브랜드가 빨강인 제품에서 `color="red"` 는 브랜드와 위험을 같은 이름으로 만든다 —
 * 그래서 위험은 `color="danger"` 로 쓴다.
 */
export type ButtonColor =
  | "neutral"
  | "primary" | "info" | "success" | "warning" | "danger"
  | "blue" | "green" | "red"
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
 * @cssprop --btn-padding-inline - 내부 버튼의 좌우 여백 (기본: 1em, variant="link"는 0).
 *   ⚠1.20.0 에서 0.5em → 1em. 세로와 같은 값이라 글자가 테두리에 붙어 있었다.
 *   최소높이는 상하 여백에서 파생되므로(`1.5em + 상하×2 + 2px`) 이 값을 덮어도 높이는 안 변한다.
 * @cssprop --btn-border-color - 내부 버튼의 테두리 색. variant/hover/active 규칙이 이 값을 정한다
 *   (기본: transparent)
 * @cssprop --btn-color - 버튼의 **면** 색. 아래 파생 토큰이 전부 이 값에서 color-mix()로 계산된다 —
 *   보통 이것 하나만 덮으면 된다.
 * @cssprop --btn-txt-color - 그 **면 위**의 글자색 — variant="solid" 가 읽는다
 *   (기본: #fff · 역할 값 지정 시 --u-{role}-txt-color)
 * @cssprop --btn-color-strong - **바탕 위**의 글자색 — variant="link" 가 읽는다.
 *   면과 요구가 반대라 슬롯이 따로 있다 (기본: --btn-color 와 동일 · 역할 값 지정 시 --u-{role}-color-strong)
 * @cssprop --btn-color-strong-hover - 바탕 위 글자 hover (기본: 85% + black · 역할 값은 움직이지 않고 밑줄로 강조)
 * @cssprop --btn-color-strong-active - 바탕 위 글자 active (기본: 70% + black · 역할 값은 고정)
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
    if (!this.internals && 'attachInternals' in this) {
      this.internals = this.attachInternals();
    }
    this.addEventListener('click', this.handleClick);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick);
    super.disconnectedCallback();
  }

  /**
   * 호스트에 세팅된 `aria-label`은 실제 접근 가능한(포커스 대상) 엘리먼트가 아니라 —
   * 그 안쪽 shadow DOM 의 네이티브 `<a>`/`<button>`이다. 섀도우 경계를 넘지 않으므로
   * 접근성 트리에 자동 반영되지 않는다(docket #75 실측 — 속성은 붙어 있는데
   * 접근성 이름이 비어 있음). `render()`가 이 값을 읽어 내부 엘리먼트에 직접 옮긴다.
   *
   * `aria-label`은 Lit 리액티브 프로퍼티로 선언돼 있지 않아 `observedAttributes`에
   * 없다 — 그 목록에 없는 속성은 `attributeChangedCallback` 자체가 호출되지 않는다
   * (커스텀 엘리먼트 표준 동작). 초기 렌더는 되지만 연결 후 동적 변경은 반영되지
   * 않았다 — 목록에 명시적으로 추가해야 한다.
   */
  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, 'aria-label'];
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if (name === 'aria-label') this.requestUpdate();
  }

  render() {
    const ariaLabel = this.getAttribute('aria-label') ?? undefined;

    if (this.href) {
      return html`
        <a part="link"
          aria-label=${ifDefined(ariaLabel)}
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
        aria-label=${ifDefined(ariaLabel)}
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
