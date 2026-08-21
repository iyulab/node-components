import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isFocusable } from "tabbable";

import { UElement } from "../UElement.js";
import { styles } from "./UField.styles.js";

/**
 * 폼 컨트롤의 공통 레이아웃을 제공하는 필드 컴포넌트입니다.
 * 라벨, 필수 표시, 설명 텍스트, 유효성 검사 메시지를 포함합니다.
 *
 * @slot - 폼 컨트롤 (input, select, textarea 등)
 * @slot label-aside - 라벨 오른쪽 슬롯 영역 (숫자 표시, 알림 등)
 */
@customElement('u-field')
export class UField extends UElement {
  static styles = [super.styles, styles];

  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 유효성 검사 실패 상태 */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** 하단 설명 텍스트 */
  @property({ type: String }) description?: string;
  /**
   * 유효성 검사 실패 시 표시할 메시지.
   *
   * ⚠**속성 이름을 명시한다.** Lit 의 기본 속성명은 프로퍼티명을 **소문자화**한 것이라
   * (kebab 이 아니다) 그대로 두면 `validationmessage` 가 되는데, 문서·샘플·소비 코드가
   * 전부 `validation-message` 로 적고 있었고 그 형태는 **아무것도 설정하지 않았다**.
   * 형제 프로퍼티들도 명시형을 쓴다(`show-delay`·`hide-delay`).
   */
  @property({ type: String, attribute: 'validation-message' }) validationMessage?: string;

  render() {
    return html`
      <div class="header" ?hidden=${!this.label}>
        <label class="label" @click=${this.handleLabelClick}>
          <span class="required" ?hidden=${!this.required}>*</span>
          ${this.label}
        </label>
        <slot name="label-aside"></slot>
      </div>

      <slot></slot>

      ${this.renderFooter()}
    `;
  }

  private renderFooter() {
    const message = this.invalid && this.validationMessage
      ? this.validationMessage
      : this.description;
    if (!message) return nothing;
    return html`<div class="footer">${message}</div>`;
  }

  /** 슬롯에 꽂힌 첫 포커스 가능 자식으로 위임한다 — 라벨 클릭과 같은 대상 탐색 로직을
   *  공개 API로도 노출해, 소비자가 임의의 폼 컨트롤(자체 웹 컴포넌트가 아닌 것 포함)을
   *  슬롯에 꽂아도 host의 `.focus()`가 `UInput.focus()`와 같은 계약으로 동작하게 한다. */
  public focus(options?: FocusOptions): void {
    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
    const nodes = slot?.assignedElements({ flatten: true }) || [];
    for (const node of nodes) {
      if (isFocusable(node)) {
        (node as HTMLElement).focus(options);
        return;
      }
    }
  }

  private handleLabelClick = () => {
    this.focus();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-field': UField;
  }
}

