import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

import { UFormControlElement } from "../UFormControlElement.js";
import { styles } from "./USwitch.styles.js";

/**
 * 온/오프 상태를 전환하는 스위치 컴포넌트입니다.
 * font-size로 전체 크기를 지정하고, CSS 변수로 다양한 스타일을 적용할 수 있습니다.
 *
 * @slot - 스위치 옆에 표시될 레이블 텍스트
 * @slot track-checked - 체크 상태에서 트랙에 표시될 콘텐츠
 * @slot track-unchecked - 체크 해제 상태에서 트랙에 표시될 콘텐츠
 * @slot thumb-checked - 체크 상태에서 thumb에 표시될 콘텐츠
 * @slot thumb-unchecked - 체크 해제 상태에서 thumb에 표시될 콘텐츠
 *
 * @csspart wrapper - 스위치 전체 래퍼
 * @csspart track - 트랙 요소
 * @csspart thumb - thumb 요소
 * @csspart label - 레이블 영역
 *
 * @cssprop --switch-track-width - 트랙 너비 (2.4em)
 * @cssprop --switch-track-height - 트랙 높이 (1.4em)
 * @cssprop --switch-track-color - 비활성 트랙 배경색
 * @cssprop --switch-track-color-checked - 활성 트랙 배경색
 * @cssprop --switch-thumb-size - thumb 크기 (1.1em)
 * @cssprop --switch-thumb-offset - thumb 간격 (0.15em)
 * @cssprop --switch-thumb-color - thumb 색상 (#fff)
 * @cssprop --switch-thumb-color-checked - 활성 thumb 색상 (#fff)
 * @cssprop --switch-radius - border-radius (9999px, pill 형태)
 * @cssprop --switch-duration - 전환 애니메이션 시간 (0.25s)
 *
 * @event change - 스위치 상태 변경 시 발생
 */
@customElement('u-switch')
export class USwitch extends UFormControlElement<string> {
  static styles = [ super.styles, styles ];

  /** 체크 여부 */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;

  render() {
    return html`
      <label class="wrapper" part="wrapper">
        <input
          type="checkbox"
          ?disabled=${this.disabled || this.readonly}
          ?required=${this.required}
          .checked=${live(this.checked)}
          @change=${this.handleInputChange}
        />
        <span class="track" part="track">
          <span class="track-checked">
            <slot name="track-checked"></slot>
          </span>
          <span class="track-unchecked">
            <slot name="track-unchecked"></slot>
          </span>
          <span class="thumb" part="thumb">
            <span class="thumb-checked">
              <slot name="thumb-checked"></slot>
            </span>
            <span class="thumb-unchecked">
              <slot name="thumb-unchecked"></slot>
            </span>
          </span>
        </span>
        <span class="label" part="label">
          <slot></slot>
          <span class="required" ?hidden=${!this.required}>*</span>
        </span>
      </label>

      <div class="description" ?hidden=${!this.description}>
        ${this.description}
      </div>
    `;
  }

  public validate(): boolean {
    if (this.internals) {
      this.invalid = !this.internals.reportValidity();
    } else {
      this.invalid = this.required && !this.checked;
    }
    return !this.invalid;
  }

  public reset(): void {
    this.checked = false;
    this.invalid = false;
  }

  private handleInputChange = (e: Event) => {
    e.stopImmediatePropagation();

    if (this.readonly || this.disabled) {
      return;
    }

    const input = e.target as HTMLInputElement;
    this.checked = input.checked;
    this.internals?.setFormValue(
      this.checked
      ? this.value || String(this.checked)
      : String(this.checked));
    this.internals?.setValidity(
      input.validity,
      this.validationMessage || input.validationMessage,
      this.shadowRoot?.querySelector('.track') || undefined
    );

    if (!this.novalidate) {
      this.validate();
    }
    this.relay(e);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-switch': USwitch;
  }
}
