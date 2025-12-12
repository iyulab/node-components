import { html, nothing } from "lit";
import { property, state } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { styles } from "./Divider.styles.js";

/**
 * Divider 컴포넌트는 엘리먼트 사이에 움직임이 가능한 구분선을 제공합니다.
 */
export class Divider extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /** 마지막 마우스 포인터 위치를 저장합니다. */
  private prevPointerPosition: number = 0;

  /** 분할선이 움직이는지 여부를 나타냅니다. */
  @state() moving = false;
  
  /** 분할 방향을 설정합니다. */
  @property({ type: String, reflect: true }) orientation: 'horizontal' | 'vertical' = 'horizontal';
  /** 분할선을 움직일 수 있는지 여부를 설정합니다. */
  @property({ type: Boolean, reflect: true }) movable = false;
  
  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('mousemove', this.handleMousemove);
    document.removeEventListener('mouseup', this.handleMouseup);
  }

  render() {
    if (this.movable) {
      return html`
        <div class="handler" part="handler"
          ?moving=${this.moving}
          orientation=${this.orientation}
          @mousedown=${this.handleMousedown}
        ></div>
      `;
    } else {
      return nothing;
    }
  }

  /** 마우스 다운 이벤트 핸들러 */
  private handleMousedown = (e: MouseEvent) => {
    e.preventDefault();
    // 1. 상태 초기화
    this.moving = true;
    this.prevPointerPosition = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    
    // 2. 이동 시작 이벤트 전파
    this.emit('u-movestart');
    document.addEventListener('mousemove', this.handleMousemove);
    document.addEventListener('mouseup', this.handleMouseup);

    // 3. 선택 방지
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';
  }

  /** 마우스 무브 이벤트 핸들러 */
  private handleMousemove = (e: MouseEvent) => {
    if (!this.moving) return;
    e.preventDefault();
    const currentPointerPosition = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPointerPosition - this.prevPointerPosition;
    this.emit('u-move', { delta });
    this.prevPointerPosition = currentPointerPosition;
  }

  /** 마우스 업 이벤트 핸들러 */
  private handleMouseup = (_: MouseEvent) => {
    if (!this.moving) return;
    // 1. 상태 초기화
    this.moving = false;

    // 2. 이동 종료 이벤트 전파
    this.emit('u-moveend');
    document.removeEventListener('mousemove', this.handleMousemove);
    document.removeEventListener('mouseup', this.handleMouseup);

    // 3. 선택 방지 해제
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }
}