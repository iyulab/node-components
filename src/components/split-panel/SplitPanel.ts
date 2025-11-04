import { html, PropertyValues } from "lit";
import { property, state, query } from "lit/decorators.js";

import { UElement } from "../../internals/UElement.js";
import { arrayAttrConverter } from "../../internals/converters.js";
import { Panel } from "./Panel.js";
import { styles } from "./SplitPanel.styles.js";

type Orientation = 'horizontal' | 'vertical';

/**
 * SplitPanel 컴포넌트는 화면을 여러 개의 패널로 분할하여 표시합니다.
 * u-panel 자식 요소들을 감지하고 그 사이에 자동으로 디바이더를 삽입합니다.
 */
export class SplitPanel extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-panel': Panel
  };

  private draggingIndex = -1;
  private startPosition = 0;
  private startFlexes: number[] = [];

  @query('.container') container!: HTMLElement;

  @state() isDragging: boolean = false;
  @state() ratio: number[] = []; // flex 비율로 저장
  @state() panels: Panel[] = [];

  /** 분할 방향을 설정합니다. 'horizontal'은 좌우 분할, 'vertical'은 상하 분할입니다. */
  @property({ type: String, reflect: true }) orientation: Orientation = 'horizontal';
  /** 사용자가 드래그를 통해 패널 크기를 조절할 수 없도록 합니다. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 초기 패널 크기 비율 배열입니다. 각 값은 flex 비율을 나타냅니다. */
  @property({ type: Array, attribute: 'initial-sizes', converter: arrayAttrConverter() }) 
  initialSizes: number[] = [];

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('ratio') || changedProperties.has('panels')) {
      this.updatePanelStyles();
    }
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  private handleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    const panels = slot.assignedElements({ flatten: true }).filter(
      el => el instanceof Panel
    ) as Panel[];
    
    // 패널의 변경이 없으면 무시
    if (this.panels.length === panels.length && this.panels.every((p, i) => p === panels[i])) {
      return;
    }

    // 패널 목록 갱신
    this.panels = panels;
    
    // 각 패널의 size 속성을 기반으로 초기 flex 설정
    if (this.initialSizes.length === panels.length) {
      this.ratio = [...this.initialSizes];
    } else {
      this.ratio = Array.from({ length: panels.length }, () => 1);
    }

    // 각 패널에 이벤트 리스너 추가 (마지막 패널 제외)
    this.panels.forEach((panel) => {
      // 기존 리스너 제거 및 새 리스너 추가 (::after 영역에서만 작동하도록)
      panel.removeEventListener('mousedown', this.handleMouseDown);
      panel.addEventListener('mousedown', this.handleMouseDown);
    });
  };

  private updatePanelStyles() {
    if (this.panels.length === 0 || this.ratio.length === 0) return;
    this.panels.forEach((panel, index) => {
      const totalFlex = this.ratio.reduce((sum, flex) => sum + flex, 0);
      const percent = (this.ratio[index] / totalFlex) * 100;
      if (this.orientation === 'horizontal') {
        panel.style.width = `${percent}%`;
        panel.style.height = '100%';
      } else {
        panel.style.width = '100%';
        panel.style.height = `${percent}%`;
      }
    });
  }

  private handleMouseDown = (e: MouseEvent) => {
    if (this.disabled) return;

    // 양쪽 패널 중 하나라도 fixed면 리사이즈 불가
    const panel = e.currentTarget as Panel;
    const index = this.panels.indexOf(panel);

    e.preventDefault();
    this.isDragging = true;
    this.draggingIndex = index;
    panel.classList.add('dragging');

    this.startPosition = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    this.startFlexes = [...this.ratio];

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    
    // 선택 방지
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging || this.draggingIndex === -1) return;

    const currentPos = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - this.startPosition;

    const prevIndex = this.draggingIndex;
    const nextIndex = this.draggingIndex + 1;

    // 컨테이너 크기
    const containerRect = this.getBoundingClientRect();
    const containerSize = this.orientation === 'horizontal' 
      ? containerRect.width 
      : containerRect.height;

    // 총 flex
    const totalFlex = this.startFlexes.reduce((sum, flex) => sum + flex, 0);
    
    // 픽셀 delta를 flex 변화량으로 변환
    const deltaFlex = (delta / containerSize) * totalFlex;

    // 새로운 flex 계산
    const newFlexes = [...this.startFlexes];
    newFlexes[prevIndex] = Math.max(0.1, this.startFlexes[prevIndex] + deltaFlex);
    newFlexes[nextIndex] = Math.max(0.1, this.startFlexes[nextIndex] - deltaFlex);

    this.ratio = newFlexes;
    
    // 이벤트 발생
    this.emit('u-resize', {
      index: this.draggingIndex
    });
  };

  private handleMouseUp = (_: MouseEvent) => {
    if (!this.isDragging) return;

    const panel = this.panels[this.draggingIndex];
    this.isDragging = false;
    this.draggingIndex = -1;
    panel.classList.remove('dragging');
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };
}