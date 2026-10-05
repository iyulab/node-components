import { html, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../spinner/USpinner.js';

import { UElement } from "../UElement.js";
import { styles } from "./UButton.styles.js";
import { FORWARDED_ARIA } from "./forwarded-aria.js";


/**
 * 외형 정도(chrome) — 컴포넌트 공통 어휘. `solid` 꽉 찬 면 · `soft` 옅은 틴트 면 · `outlined` 테두리 ·
 * `plain` 외형 없음 · `link` 링크처럼(버튼류만).
 */
export type ButtonAppearance = "solid" | "soft" | "outlined" | "plain" | "link";
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
 * @cssprop --u-primary-color - 기본(color="primary") 버튼의 기준색. 지정 시 hover/active/soft 톤이 color-mix()로 자동 파생.
 * @cssprop --btn-padding-block - 내부 버튼의 상하 여백 (기본: 0.5em)
 * @cssprop --btn-padding-inline - 내부 버튼의 좌우 여백 (기본: 1em, appearance="link"는 0).
 *   ⚠1.20.0 에서 0.5em → 1em. 세로와 같은 값이라 글자가 테두리에 붙어 있었다.
 *   최소높이는 상하 여백에서 파생되므로(`1.5em + 상하×2 + 2px`) 이 값을 덮어도 높이는 안 변한다.
 * @cssprop --btn-border-color - 내부 버튼의 테두리 색. appearance/hover/active 규칙이 이 값을 정한다
 *   (기본: transparent)
 * @cssprop --btn-color - 버튼의 **면** 색. 아래 파생 토큰이 전부 이 값에서 color-mix()로 계산된다 —
 *   보통 이것 하나만 덮으면 된다.
 * @cssprop --btn-txt-color - 그 **면 위**의 글자색 — appearance="solid" 가 읽는다
 *   (기본: #fff · 역할 값 지정 시 --u-{role}-txt-color)
 * @cssprop --btn-color-strong - **바탕 위**의 글자색 — appearance="link"·"plain" 이 읽는다.
 *   면과 요구가 반대라 슬롯이 따로 있다 (기본: --btn-color 와 동일 · 역할 값 지정 시 --u-{role}-color-strong)
 * @cssprop --btn-color-strong-hover - 바탕 위 글자 hover (기본: 85% + black · 역할 값은 움직이지 않고 밑줄로 강조)
 * @cssprop --btn-color-strong-active - 바탕 위 글자 active (기본: 70% + black · 역할 값은 고정)
 * @cssprop --btn-color-hover - solid 배경 hover (기본: --btn-color 85% + black)
 * @cssprop --btn-color-active - solid 배경 active (기본: --btn-color 70% + black)
 * @cssprop --btn-color-surface - soft 배경 (역할 색: --u-{role}-bg-color · 그 밖: --btn-color 12% + 배경색)
 * @cssprop --btn-color-surface-hover - soft 배경 hover (역할 색: 면에 --btn-color 18% · 그 밖: 22%)
 * @cssprop --btn-color-surface-active - soft 배경 active (역할 색: 면에 --btn-color 30% · 그 밖: 32%)
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
  /**
   * 호스트의 `.focus()` 를 섀도 안의 네이티브 `<button>`/`<a>` 로 위임한다. 호스트는 포커스
   * 가능하지 않으므로 위임이 없으면 `el.focus()` 가 오류 없이 아무 일도 하지 않는다 —
   * 네이티브 버튼을 대체하는 요소가 잃으면 안 되는 계약이다.
   */
  static shadowRootOptions: ShadowRootInit = { ...UElement.shadowRootOptions, delegatesFocus: true };

  /** 외형 정도 — `solid`(기본) · `soft` · `outlined` · `plain` · `link` */
  @property({ type: String, reflect: true }) appearance: ButtonAppearance = "solid";
  /**
   * 색. 주지 않으면 `primary` 로 칠한다(`--u-primary-color` 역할 토큰) — 브랜드 색을 덮으면 맨 버튼이
   * 함께 따라온다. `neutral` 은 **무채색**(회색) 버튼이다(모든 컴포넌트에서 같은 뜻).
   * `plain`·`link` 는 글자만 있는 외형이라 색을 주지 않았거나 `neutral` 이면 본문/링크 색을 쓰고,
   * 그 밖의 색을 주면 글자가 그 색을 따른다 — `plain` 에 `primary` 를 **명시**하면 브랜드색 글자다.
   *
   * ⚠기본값을 두지 않는다(반영되는 속성이라, 기본값을 두면 맨 버튼도 `color="primary"` 를 달아
   * «명시한 primary» 와 구별되지 않는다).
   */
  @property({ type: String, reflect: true }) color?: ButtonColor;
  /** 버튼 크기. `font-size`만 변경하며 나머지는 `em` 단위라 비례 조정됨. */
  @property({ type: String, reflect: true }) size: ButtonSize = "md";
  /** 경계선 둥글게 여부 */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** UA 가 알려 준 비활성 상태 — 폼 컨트롤 기반 클래스와 같은 계약(사용자 `disabled` 와 따로 든다). */
  private formDisabled = false;

  /** 자기 `disabled` 또는 조상 fieldset. */
  protected get effectivelyDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  /** form-associated 표준 콜백 — 조상 fieldset 의 비활성 상태가 바뀔 때 UA 가 부른다. */
  formDisabledCallback(disabled: boolean): void {
    const old = this.formDisabled;
    this.formDisabled = disabled;
    // ⚠자기 `disabled` 속성이 바뀔 때도 불리고, 그때는 **Lit 의 update 도중**(속성 반영 순간)이다 —
    // 거기서 요청한 변경은 그 update 끝에서 지워져 재렌더가 사라진다. 현재 update 뒤에 요청한다.
    void this.updateComplete.then(() => this.requestUpdate('formDisabled', old));
  }
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
   * 접근성 트리에 자동 반영되지 않는다(실측 — 속성은 붙어 있는데
   * 접근성 이름이 비어 있음). `render()`가 이 값을 읽어 내부 엘리먼트에 직접 옮긴다.
   *
   * `aria-label`은 Lit 리액티브 프로퍼티로 선언돼 있지 않아 `observedAttributes`에
   * 없다 — 그 목록에 없는 속성은 `attributeChangedCallback` 자체가 호출되지 않는다
   * (커스텀 엘리먼트 표준 동작). 초기 렌더는 되지만 연결 후 동적 변경은 반영되지
   * 않았다 — 목록에 명시적으로 추가해야 한다.
   */
  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, ...FORWARDED_ARIA];
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if ((FORWARDED_ARIA as readonly string[]).includes(name)) this.requestUpdate();
  }

  protected override updated(changed: PropertyValues): void {
    super.updated(changed);
    this.forwardControls();
  }

  /**
   * `aria-controls` 는 id 참조라 섀도 경계를 넘지 못한다 — 안쪽 버튼에 문자열로 옮기면 아무것도
   * 가리키지 않는다. 호스트의 트리에서 id 를 풀어 **요소 참조**(`ariaControlsElements`)로 싣는다.
   * 섀도 안에서 바깥 트리의 요소를 가리키는 것은 요소 참조가 허용하는 방향이다. 그 API 가 없는
   * 브라우저에서는 옮기지 않는다(호스트의 속성은 그대로 남는다).
   */
  private forwardControls() {
    const inner = this.shadowRoot?.querySelector<HTMLElement>('button, a') as
      (HTMLElement & { ariaControlsElements?: Element[] | null }) | null;
    if (!inner || !('ariaControlsElements' in inner)) return;
    const ids = this.getAttribute('aria-controls')?.split(/\s+/).filter(Boolean) ?? [];
    // 감싼 컴포넌트(`u-icon-button`)가 이 버튼에 속성을 넘기면 id 는 그 바깥 트리에 있다 — 위로 올라가며 찾는다.
    const find = (id: string) => {
      for (let root: Node = this.getRootNode(); ; ) {
        const hit = (root as Document | ShadowRoot).getElementById?.(id);
        if (hit) return hit;
        if (!(root instanceof ShadowRoot)) return null;
        root = root.host.getRootNode();
      }
    };
    const targets = ids.map(find).filter((el): el is HTMLElement => !!el);
    inner.ariaControlsElements = targets.length ? targets : null;
  }

  render() {
    const ariaLabel = this.getAttribute('aria-label') ?? undefined;
    const pressed = this.getAttribute('aria-pressed') ?? undefined;
    const expanded = this.getAttribute('aria-expanded') ?? undefined;
    const haspopup = this.getAttribute('aria-haspopup') ?? undefined;

    if (this.href) {
      return html`
        <a part="link"
          aria-label=${ifDefined(ariaLabel)}
          aria-expanded=${ifDefined(expanded)}
          aria-haspopup=${ifDefined(haspopup)}
          ?disabled=${this.effectivelyDisabled || this.loading}
          tabindex=${this.effectivelyDisabled || this.loading ? -1 : 0}
          href=${ifDefined(this.effectivelyDisabled || this.loading ? undefined : this.href)}
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
        aria-pressed=${ifDefined(pressed)}
        aria-expanded=${ifDefined(expanded)}
        aria-haspopup=${ifDefined(haspopup)}
        type=${this.type}
        ?disabled=${this.effectivelyDisabled || this.loading}
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
    if (this.effectivelyDisabled || this.loading) {
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
