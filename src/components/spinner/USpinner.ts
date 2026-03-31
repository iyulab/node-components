import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from './USpinner.styles.js';

export type SpinnerColor =
  | "neutral" | "blue" | "green" | "yellow" | "red"
  | "orange" | "teal" | "cyan" | "purple" | "pink";

/**
 * 로딩 상태를 나타내는 회전 스피너 컴포넌트입니다.
 *
 * @slot - 스피너 아래에 표시할 텍스트
 *
 * @csspart svg - 스피너 SVG 요소
 * @csspart label - 라벨 영역
 *
 * @cssprop --spinner-track-width - 트랙 두께 (기본: 0.125em)
 * @cssprop --spinner-track-color - 트랙 배경색
 * @cssprop --spinner-indicator-color - 인디케이터 색상
 * @cssprop --spinner-indicator-speed - 회전 속도 (기본: 2s)
 */
@customElement('u-spinner')
export class USpinner extends UElement {
  static styles = [ super.styles, styles ];

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

declare global {
  interface HTMLElementTagNameMap {
    'u-spinner': USpinner;
  }
}
