import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../../internals/UElement.js";
import { Button } from "../button/Button.js";
import { Icon } from "../icon/Icon.js";
import { styles } from "./CopyButton.styles.js";

/**
 * 복사 버튼 컴포넌트입니다.
 */
export class CopyButton extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    "u-button": Button,
    "u-icon": Icon
  };

  /** 버튼의 테두리 유무를 설정합니다. 기본값은 true로, 테두리가 없습니다. */
  @property({ type: Boolean, reflect: true }) borderless = true;
  /** 버튼이 비활성화 상태인지 여부를 설정합니다. 비활성화된 버튼은 클릭할 수 없습니다. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 버튼의 복사 상태를 설정합니다. 복사가 완료되면 true로 변경됩니다. */
  @property({ type: Boolean, reflect: true }) copied = false;

  render() {
    return html`
      <u-button ?disabled=${this.disabled || this.copied}>
        <u-icon name=${this.copied ? "check-lg" : "copy"}></u-icon>
        <slot></slot>
      </u-button>
    `;
  }
}