import { html } from "lit";
import { property, state, query } from "lit/decorators.js";

import { UElement } from "../../internals";
import { styles } from "./SplitPanel.styles";

/**
 * SplitPanel 컴포넌트는 화면을 두 개의 패널로 분할하여 표시합니다.
 * 각 패널은 독립적으로 콘텐츠를 포함할 수 있으며,
 * 사용자가 패널 크기를 조절할 수 있는 기능을 제공합니다.
 * 
 * @slot start - 첫 번째 패널에 표시할 콘텐츠
 * @slot end - 두 번째 패널에 표시할 콘텐츠
 * 
 * @fires u-split-panel-resize - 패널 크기가 변경될 때 발생합니다.
 */
export class SplitPanel extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 분할 방향을 설정합니다. 'horizontal'은 좌우 분할, 'vertical'은 상하 분할입니다. */
  @property({ type: String, reflect: true }) direction: 'horizontal' | 'vertical' = 'horizontal';

  /** 첫 번째 패널의 초기 크기를 퍼센트로 설정합니다 (0-100). */
  @property({ type: Number }) position = 50;

  /** 첫 번째 패널의 최소 크기를 픽셀로 설정합니다. */
  @property({ type: Number, attribute: 'min-size' }) minSize = 100;

  /** 첫 번째 패널의 최대 크기를 픽셀로 설정합니다. */
  @property({ type: Number, attribute: 'max-size' }) maxSize?: number;

  /** 두 번째 패널의 최소 크기를 픽셀로 설정합니다. */
  @property({ type: Number, attribute: 'end-min-size' }) endMinSize = 100;

  /** 두 번째 패널의 최대 크기를 픽셀로 설정합니다. */
  @property({ type: Number, attribute: 'end-max-size' }) endMaxSize?: number;

  /** 사용자가 드래그를 통해 패널 크기를 조절할 수 없도록 합니다. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  @state() private isDragging = false;
  @state() private currentPosition = 50;

  @query('.container') private container!: HTMLElement;

  private startPosition = 0;
  private startSize = 0;
  private containerSize = 0;

  connectedCallback() {
    super.connectedCallback();
    this.currentPosition = this.position;
  }

  private handleDividerMouseDown = (e: MouseEvent) => {
    if (this.disabled) return;

    e.preventDefault();
    this.isDragging = true;

    const containerRect = this.container.getBoundingClientRect();
    this.containerSize = this.direction === 'horizontal' 
      ? containerRect.width 
      : containerRect.height;

    this.startPosition = this.direction === 'horizontal' ? e.clientX : e.clientY;
    this.startSize = (this.currentPosition / 100) * this.containerSize;

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    
    // 선택 방지
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.direction === 'horizontal' ? 'col-resize' : 'row-resize';
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;

    const currentPos = this.direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - this.startPosition;
    let newSize = this.startSize + delta;

    // 최소/최대 크기 제한 적용
    newSize = Math.max(newSize, this.minSize);
    if (this.maxSize) {
      newSize = Math.min(newSize, this.maxSize);
    }

    // 두 번째 패널의 최소/최대 크기 제한 적용
    const endSize = this.containerSize - newSize;
    if (endSize < this.endMinSize) {
      newSize = this.containerSize - this.endMinSize;
    }
    if (this.endMaxSize && endSize > this.endMaxSize) {
      newSize = this.containerSize - this.endMaxSize;
    }

    // 퍼센트로 변환
    this.currentPosition = (newSize / this.containerSize) * 100;
    
    this.emit('u-split-panel-resize', {
      position: this.currentPosition,
      startSize: newSize,
      endSize: this.containerSize - newSize
    });
  };

  private handleMouseUp = () => {
    if (!this.isDragging) return;

    this.isDragging = false;
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    // 최종 position 속성 업데이트
    this.position = this.currentPosition;
  };

  private handleDividerDoubleClick = () => {
    if (this.disabled) return;
    
    // 더블클릭 시 50%로 리셋
    this.currentPosition = 50;
    this.position = 50;
    
    this.emit('u-split-panel-resize', {
      position: this.currentPosition,
      startSize: this.containerSize / 2,
      endSize: this.containerSize / 2
    });
  };

  render() {
    return html`
      <div 
        class="container" 
        style="--split-position: ${this.currentPosition}%"
      >
        <div class="panel start" part="start-panel">
          <slot name="start"></slot>
        </div>
        
        <div 
          class="divider ${this.isDragging ? 'dragging' : ''}" 
          part="divider"
          @mousedown=${this.handleDividerMouseDown}
          @dblclick=${this.handleDividerDoubleClick}
        >
          <div class="divider-handle" part="divider-handle"></div>
        </div>
        
        <div class="panel end" part="end-panel">
          <slot name="end"></slot>
        </div>
      </div>
    `;
  }
}