import { html } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from './USpinner.styles.js';

export type SpinnerColor =
  | "neutral" | "blue" | "green" | "yellow" | "red"
  | "orange" | "teal" | "cyan" | "purple" | "pink";

/**
 * Spinner 컴포넌트는 로딩 상태를 시각적으로 표시하는 회전하는 원형 스피너를 제공합니다.
 *
 * @slot - 스피너 아래에 표시할 텍스트를 위한 슬롯입니다. (예: "Loading...")
 */
export class USpinner extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 인디케이터 색상 */
  @property({ type: String, reflect: true }) color?: SpinnerColor;

  @state() private hasLabel = false;

  render() {
    return html`
      <svg class="spinner" part="svg">
        <circle class="track"></circle>
        <circle class="indicator"></circle>
      </svg>
      
      <span class="label" part="label" ?hidden=${!this.hasLabel}>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </span>
    `;
  }

  private handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    this.hasLabel = nodes.some(node =>
      node.nodeType === Node.ELEMENT_NODE ||
      (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() !== '')
    );
  }
}