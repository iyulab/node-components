import { html } from "lit";
import { property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";

import { UFormControlElement } from "../UFormControlElement.js";
import { UElement } from "../UElement.js";
import { styles } from "./USwitch.styles.js";

/**
 * Switch 컴포넌트는 온/오프 상태를 토글할 수 있는 스위치 입력 요소입니다.
 * font-size로 전체 크기를 조정하고, CSS 변수로 세부 스타일을 제어합니다.
 *
 * @slot - 스위치 옆에 표시할 라벨 텍스트
 * @slot track-checked - 체크 상태에서 트랙에 표시할 콘텐츠
 * @slot track-unchecked - 체크 해제 상태에서 트랙에 표시할 콘텐츠
 * @slot thumb-checked - 체크 상태에서 썸에 표시할 콘텐츠
 * @slot thumb-unchecked - 체크 해제 상태에서 썸에 표시할 콘텐츠
 *
 * @csspart track - 트랙 요소
 * @csspart thumb - 썸 요소
 * @csspart label - 라벨 영역
 *
 * @cssprop --switch-track-width - 트랙 너비 (2.4em)
 * @cssprop --switch-track-height - 트랙 높이 (1.4em)
 * @cssprop --switch-track-color - 비활성 트랙 배경색
 * @cssprop --switch-track-color-checked - 활성 트랙 배경색
 * @cssprop --switch-thumb-size - 썸 크기 (1.1em)
 * @cssprop --switch-thumb-offset - 썸 여백 (0.15em)
 * @cssprop --switch-thumb-color - 썸 배경색 (#fff)
 * @cssprop --switch-thumb-color-checked - 활성 썸 배경색 (#fff)
 * @cssprop --switch-radius - border-radius (9999px, pill 형태)
 * @cssprop --switch-duration - 트랜지션 시간 (0.25s)
 */
export class USwitch extends UFormControlElement<string> {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 체크 여부 */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;

  render() {
    return html`
      <label class="wrapper">
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

  /** 기존 이벤트를 대체하여 change 이벤트 발생 */
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
    this.dispatchEvent(new Event('change', {
      bubbles: true,
      composed: true,
    }));
  }
}
