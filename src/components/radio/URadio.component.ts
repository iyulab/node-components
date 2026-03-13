import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./URadio.styles.js";

export type RadioVariant = "filled" | "outlined";
export type RadioType = "default" | "button";
export type RadioOrientation = "vertical" | "horizontal";

/**
 * Radio 컴포넌트는 단일 선택 옵션을 나타냅니다.
 * RadioGroup과 함께 사용하여 그룹 내에서 하나의 값만 선택할 수 있습니다.
 */
export class URadio extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 읽기 전용 여부 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** 선택 여부 */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;
  /** 라디오 타입 */
  @property({ type: String, reflect: true }) type: RadioType = "default";
  /** 스타일 변형 */
  @property({ type: String, reflect: true }) variant: RadioVariant = "filled";
  /** 배치 방향 (RadioGroup에서 동기화) */
  @property({ type: String, reflect: true }) orientation: RadioOrientation = "horizontal";
  /** name 속성 */
  @property({ type: String }) name?: string;
  /** 라디오 값 */
  @property({ type: String }) value: string = '';

  render() {
    if (this.type === 'button') {
      return html`
        <label class="button-wrapper">
          <input type="radio"
            .value=${this.value}
            .checked=${this.checked}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            @change=${this.handleChange}
          />
          <span class="button-label">
            <slot></slot>
          </span>
        </label>
      `;
    }

    return html`
      <label class="wrapper">
        <input type="radio"
          .value=${this.value}
          .checked=${this.checked}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          @change=${this.handleChange}
        />
        <span class="radio"></span>
        <span class="label">
          <slot></slot>
        </span>
      </label>
    `;
  }

  private handleChange = (e: Event) => {
    if (this.readonly || this.disabled) {
      e.preventDefault();
      return;
    }
    if (!this.emit('u-change')) {
      e.preventDefault();
      return;
    }
    this.checked = true;
  }
}
