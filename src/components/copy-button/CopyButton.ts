import { html } from "lit";
import { property, state } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { IconButton } from "../icon-button/IconButton.js";
import { styles } from "./CopyButton.styles.js";

/**
 * 복사 버튼 컴포넌트입니다.
 */
export class CopyButton extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-icon-button': IconButton
  };

  /** 버튼의 복사 상태를 설정합니다. 복사가 완료되면 true로 변경됩니다. */
  @state() copied = false;

  /** 버튼의 테두리 유무를 설정합니다. 기본값은 false입니다. */
  @property({ type: Boolean }) borderless = false;
  /** 버튼이 비활성화 상태인지 여부를 설정합니다. 비활성화된 버튼은 클릭할 수 없습니다. */
  @property({ type: Boolean }) disabled = false;
  /** 복사할 텍스트를 설정합니다. */
  @property({ type: String }) value: string = "";

  render() {
    return html`
      <u-icon-button part="base"
        ?copied=${this.copied}
        .borderless=${this.borderless}
        .disabled=${this.disabled || this.copied}
        .lib=${"internal"}
        .name=${this.copied ? "check-lg" : "copy"}
        @click=${this.handleButtonClick}>
      </u-icon-button>
    `;
  }

  /** 복사 버튼 클릭 핸들러 */
  private handleButtonClick = async () => {
    try {
      await navigator.clipboard.writeText(this.value);
      this.copied = true;
      this.emit("u-copy", { value: this.value });

      setTimeout(() => this.copied = false, 2000);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  }
}