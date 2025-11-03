import { html, PropertyValues } from "lit";
import { property, state, query } from "lit/decorators.js";

import { UElement } from "../../internals";
import { arrayAttrConverter } from "../../utilities";
import { styles } from "./SplitPanel.styles";

interface PanelSize {
  size: number; // 픽셀 단위
  percentage: number; // 퍼센트 단위
}

/**
 * SplitPanel 컴포넌트는 화면을 여러 개의 패널로 분할하여 표시합니다.
 * 각 패널은 독립적으로 콘텐츠를 포함할 수 있으며,
 * 사용자가 패널 크기를 조절할 수 있는 기능을 제공합니다.
 * 브라우저 확대/축소 시에도 비율이 유지됩니다.
 * 
 * @slot default - 패널에 표시할 콘텐츠들 (자식 요소 개수만큼 패널 생성)
 * 
 * @fires u-split-panel-resize - 패널 크기가 변경될 때 발생합니다.
 */
export class SplitPanel extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  private draggingIndex = -1;
  private startPosition = 0;
  private containerSize = 0;
  private startSizes: number[] = [];
  private resizeObserver?: ResizeObserver;

  @query('.container') container!: HTMLElement;
  @query('slot') defaultSlot!: HTMLSlotElement;

  @state() isDragging = false;
  @state() currentPercentages: number[] = []; // 퍼센트로 저장
  @state() panelCount = 0;

  /** 분할 방향을 설정합니다. 'horizontal'은 좌우 분할, 'vertical'은 상하 분할입니다. */
  @property({ type: String, reflect: true }) 
  direction: 'horizontal' | 'vertical' = 'horizontal';
  /** 각 패널의 초기 크기를 퍼센트로 설정합니다. 배열의 합이 100이어야 합니다. */
  @property({ type: Array, converter: arrayAttrConverter() }) 
  initialSizes?: number[];
  /** 각 패널의 최소 크기를 픽셀로 설정합니다. */
  @property({ type: Array, attribute: 'min-sizes', converter: arrayAttrConverter() }) 
  minSizes?: number[];
  /** 각 패널의 최대 크기를 픽셀로 설정합니다. */
  @property({ type: Array, attribute: 'max-sizes', converter: arrayAttrConverter() }) 
  maxSizes?: number[];
  /** 사용자가 드래그를 통해 패널 크기를 조절할 수 없도록 합니다. */
  @property({ type: Boolean, reflect: true }) 
  disabled = false;

  connectedCallback() {
    super.connectedCallback();
    
    // ResizeObserver로 컨테이너 크기 변경 감지
    this.resizeObserver = new ResizeObserver(() => {
      if (this.panelCount > 0 && this.currentPercentages.length > 0) {
        this.requestUpdate();
      }
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);

    this.updatePanelCount();
    this.initializeSizes();
    // ResizeObserver 시작
    if (this.container) {
      this.resizeObserver?.observe(this.container);
    }
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('panelCount') || changedProperties.has('currentPercentages')) {
      this.updatePanelStyles();
    }
  }

  render() {
    return html`
      <div class="container">
        <slot @slotchange=${this.handleSlotChange}></slot>
        ${this.renderDividers()}
      </div>
    `;
  }

  private renderDividers() {
    if (this.panelCount <= 1) return null;

    const dividers = [];
    for (let i = 0; i < this.panelCount - 1; i++) {
      dividers.push(html`
        <div 
          class="divider ${this.isDragging && this.draggingIndex === i ? 'dragging' : ''}" 
          part="divider"
          data-index="${i}"
          @mousedown=${(e: MouseEvent) => this.handleMouseDown(e, i)}>
        </div>
      `);
    }
    return dividers;
  }

  /**
   * 특정 패널의 크기를 프로그래밍 방식으로 설정합니다.
   * @param index - 패널 인덱스
   * @param size - 설정할 크기 (픽셀 또는 퍼센트)
   * @param unit - 단위 ('px' 또는 'percent')
   */
  public setPanelSize(index: number, size: number, unit: 'px' | 'percent' = 'px') {
    if (index < 0 || index >= this.panelCount) {
      return;
    }

    const newPercentages = [...this.currentPercentages];
    const containerSize = this.getCurrentContainerSize();
    
    // 퍼센트로 변환
    const targetPercent = unit === 'px' 
      ? (size / containerSize) * 100 
      : size;
    
    const oldPercent = newPercentages[index];
    const delta = targetPercent - oldPercent;

    // 인접한 패널에서 크기를 빼거나 더함
    if (index < this.panelCount - 1) {
      // 오른쪽 패널 조정
      newPercentages[index + 1] -= delta;
    } else if (index > 0) {
      // 왼쪽 패널 조정
      newPercentages[index - 1] -= delta;
    }

    newPercentages[index] = targetPercent;
    this.currentPercentages = newPercentages;
  }

  /**
   * 모든 패널을 균등하게 분할합니다.
   */
  public resetToEqual() {
    this.currentPercentages = this.getEqualPercentages();
  }

  private handleSlotChange = () => {
    this.updatePanelCount();
    this.initializeSizes();
  };

  private updatePanelCount() {
    const slot = this.defaultSlot;
    if (!slot) return;
    
    const assignedElements = slot.assignedElements({ flatten: true });
    this.panelCount = assignedElements.length;
  }

  private initializeSizes() {
    if (this.panelCount === 0) return;

    if (this.initialSizes && this.initialSizes.length === this.panelCount) {
      // initialSizes가 제공된 경우
      const sum = this.initialSizes.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 100) < 0.01) {
        this.currentPercentages = [...this.initialSizes];
      } else {
        // initialSizes의 합이 100이 아니면 균등 분할
        this.currentPercentages = this.getEqualPercentages();
      }
    } else {
      // 균등 분할
      this.currentPercentages = this.getEqualPercentages();
    }
  }

  private getEqualPercentages(): number[] {
    const percentPerPanel = 100 / this.panelCount;
    return Array(this.panelCount).fill(percentPerPanel);
  }

  private getCurrentContainerSize(): number {
    const containerRect = this.container.getBoundingClientRect();
    return this.direction === 'horizontal' 
      ? containerRect.width 
      : containerRect.height;
  }

  private updatePanelStyles() {
    if (!this.defaultSlot || this.currentPercentages.length === 0) return;

    const assignedElements = this.defaultSlot.assignedElements({ flatten: true }) as HTMLElement[];
    
    assignedElements.forEach((element, index) => {
      if (this.currentPercentages[index] !== undefined) {
        const percentage = this.currentPercentages[index];
        
        if (this.direction === 'horizontal') {
          element.style.width = `${percentage}%`;
          element.style.height = '100%';
        } else {
          element.style.width = '100%';
          element.style.height = `${percentage}%`;
        }
        element.style.flexShrink = '0';
        element.style.overflow = 'auto';
      }
    });

    // Divider 위치 조정
    const dividers = this.shadowRoot?.querySelectorAll('.divider') as NodeListOf<HTMLElement>;
    dividers.forEach((divider, index) => {
      const position = this.currentPercentages
        .slice(0, index + 1)
        .reduce((sum, percent) => sum + percent, 0);

      if (this.direction === 'horizontal') {
        divider.style.left = `${position}%`;
        divider.style.top = '0';
      } else {
        divider.style.left = '0';
        divider.style.top = `${position}%`;
      }
    });
  }

  private handleMouseDown = (e: MouseEvent, index: number) => {
    if (this.disabled) return;

    e.preventDefault();
    this.isDragging = true;
    this.draggingIndex = index;

    this.containerSize = this.getCurrentContainerSize();
    this.startPosition = this.direction === 'horizontal' ? e.clientX : e.clientY;
    
    // 퍼센트를 픽셀로 변환하여 시작 크기 저장
    this.startSizes = this.currentPercentages.map(
      percent => (percent / 100) * this.containerSize
    );

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    
    // 선택 방지
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.direction === 'horizontal' ? 'col-resize' : 'row-resize';
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging || this.draggingIndex === -1) return;

    const currentPos = this.direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - this.startPosition;

    const leftIndex = this.draggingIndex;
    const rightIndex = this.draggingIndex + 1;

    // 새로운 크기 계산 (픽셀)
    let newLeftSize = this.startSizes[leftIndex] + delta;
    let newRightSize = this.startSizes[rightIndex] - delta;

    // 최소/최대 크기 제한 적용
    const minLeft = this.minSizes?.[leftIndex] ?? 50;
    const maxLeft = this.maxSizes?.[leftIndex] ?? Infinity;
    const minRight = this.minSizes?.[rightIndex] ?? 50;
    const maxRight = this.maxSizes?.[rightIndex] ?? Infinity;

    // 왼쪽 패널 제한
    newLeftSize = Math.max(newLeftSize, minLeft);
    newLeftSize = Math.min(newLeftSize, maxLeft);

    // 오른쪽 패널 제한
    newRightSize = Math.max(newRightSize, minRight);
    newRightSize = Math.min(newRightSize, maxRight);

    // 두 패널의 합이 유지되도록 조정
    const totalSize = this.startSizes[leftIndex] + this.startSizes[rightIndex];
    if (newLeftSize + newRightSize !== totalSize) {
      // 오른쪽 패널을 조정
      newRightSize = totalSize - newLeftSize;
      
      // 다시 제한 확인
      if (newRightSize < minRight) {
        newRightSize = minRight;
        newLeftSize = totalSize - newRightSize;
      }
      if (newRightSize > maxRight) {
        newRightSize = maxRight;
        newLeftSize = totalSize - newRightSize;
      }
    }

    // 픽셀을 퍼센트로 변환하여 저장
    const newPercentages = [...this.currentPercentages];
    newPercentages[leftIndex] = (newLeftSize / this.containerSize) * 100;
    newPercentages[rightIndex] = (newRightSize / this.containerSize) * 100;

    this.currentPercentages = newPercentages;
    
    // 이벤트 발생
    const panelSizes: PanelSize[] = this.currentPercentages.map(percent => ({
      size: (percent / 100) * this.containerSize,
      percentage: percent
    }));

    this.emit('u-split-panel-resize', {
      sizes: panelSizes,
      dividerIndex: this.draggingIndex
    });
  };

  private handleMouseUp = () => {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.draggingIndex = -1;
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  };
}