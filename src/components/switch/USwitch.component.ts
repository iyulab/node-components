import { html } from "lit";
import { property } from "lit/decorators.js";

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
 * @event u-change - 체크 상태 변경 시 발생
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
export class USwitch extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 체크 여부 */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 읽기 전용 여부 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** 필수 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 유효하지 않음 표시 */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 컴포넌트 하단 설명 텍스트 */
  @property({ type: String }) description?: string;
  /** 폼 제출 시 전송 이름 */
  @property({ type: String }) name?: string;
  /** 폼 제출 시 전송 값 */
  @property({ type: String }) value: string = '';

  render() {
    return html`
      <label class="wrapper">
        <input type="checkbox"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
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

  /** 유효성 검사 */
  protected validate(): boolean {
    if (this.required && !this.checked) {
      this.invalid = true;
      return false;
    }
    this.invalid = false;
    return true;
  }

  /** 기존 이벤트를 대체하여 change 이벤트 발생 */
  private handleInputChange = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.readonly || this.disabled) {
      return;
    }

    const input = e.target as HTMLInputElement;
    this.checked = input.checked;
    this.validate();
    this.emit('u-change');
  }
}
