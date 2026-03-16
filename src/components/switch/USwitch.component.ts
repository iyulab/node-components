import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./USwitch.styles.js";

/**
 * Switch 컴포넌트는 즉시 효과가 있는 on/off 토글에 사용됩니다.
 */
export class USwitch extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 토글 상태 */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;
  /** 레이블 텍스트 */
  @property({ type: String }) label: string = '';
  /** 폼 값 */
  @property({ type: String }) value: string = '';
  /** 비활성화 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 필수 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 폼 이름 */
  @property({ type: String }) name: string = '';

  render() {
    return html`
      <label class="container" part="base">
        <input type="checkbox"
          .checked=${this.checked}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @change=${this.handleChange}
        />
        <span class="track" part="track">
          <span class="thumb" part="thumb"></span>
        </span>
        <span class="label" part="label" ?hidden=${!this.label}>${this.label}</span>
      </label>
    `;
  }

  private handleChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.checked = input.checked;
    this.emit('u-change', { checked: this.checked, value: this.value });
  }
}
