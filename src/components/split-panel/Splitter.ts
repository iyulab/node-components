import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../../internals/UElement.js";
import { styles } from "./Splitter.styles.js";

type Orientation = 'horizontal' | 'vertical';

/**
 * Splitter 컴포넌트는 SplitPanel의 패널들 사이에 배치되는 디바이더입니다.
 * 사용자가 드래그하여 패널의 크기를 조절할 수 있습니다.
 */
export class Splitter extends UElement {
  static styles = [ super.styles, styles ];

  /** 분할 방향을 설정합니다. */
  @property({ type: String, reflect: true }) orientation: Orientation = 'horizontal';

  /** 드래그 중인지 여부를 나타냅니다. */
  @property({ type: Boolean, reflect: true }) dragging = false;

  render() {
    return html`
      <div class="divider-line"></div>
    `;
  }

  /**
   * 드래그 시작 이벤트를 발생시킵니다.
   */
  startDrag(event: MouseEvent) {
    this.dragging = true;
    this.dispatchEvent(new CustomEvent('splitter-drag-start', {
      detail: { event },
      bubbles: true,
      composed: true
    }));
  }

  /**
   * 드래그 종료 이벤트를 발생시킵니다.
   */
  endDrag() {
    this.dragging = false;
    this.dispatchEvent(new CustomEvent('splitter-drag-end', {
      bubbles: true,
      composed: true
    }));
  }
}
