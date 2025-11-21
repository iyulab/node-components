import { html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { styles } from "./Divider.styles.js";

/**
 * Divider 컴포넌트는 엘리먼트 사이에 드래그 가능한 구분선을 표시합니다.
 */
export class Divider extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /** 마지막 마우스 위치를 저장합니다. */
  private position: number = 0;

  /** 드래그 중인지 여부를 나타냅니다. */
  @state() dragging = false;
  
  /** 드래그 가능 여부를 설정합니다. */
  @property({ type: Boolean, reflect: true }) draggable = false;
  /** 분할 방향을 설정합니다. */
  @property({ type: String, reflect: true }) orientation: 'horizontal' | 'vertical' = 'horizontal';

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  render() {
    if (this.draggable) {
      return html`
        <div class="handler" 
          ?dragging=${this.dragging}
          orientation=${this.orientation}
          @mousedown=${this.handleMouseDown}
        ></div>
      `;
    } else {
      return nothing;
    }
  }

  /** 마우스 다운 이벤트 핸들러 */
  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    this.dragging = true;
    this.position = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    this.emit('u-dragstart');

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);

    // 선택 방지
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';
  }

  /** 마우스 무브 이벤트 핸들러 */
  private handleMouseMove = (e: MouseEvent) => {
    if (!this.dragging) return;
    e.preventDefault();
    const position = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    const delta = position - this.position;
    this.emit('u-drag', { delta });
    this.position = position;
  }

  /** 마우스 업 이벤트 핸들러 */
  private handleMouseUp = (_: MouseEvent) => {
    if (!this.dragging) return;
    this.dragging = false;
    this.emit('u-dragend');

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);

    // 선택 복원
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }
}