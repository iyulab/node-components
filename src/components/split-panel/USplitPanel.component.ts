import { html, PropertyValues } from "lit";
import { property, queryAssignedElements, state } from "lit/decorators.js";

import { arrayAttrConverter } from "../../utilities/converters.js";
import { BaseElement } from "../BaseElement.js";
import { styles } from "./USplitPanel.styles.js";

/**
 * SplitPanel 컴포넌트는 화면을 여러 개의 패널로 분할하여 표시합니다.
 */
export class USplitPanel extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /** 현재 상태를 저장하는 패널 요소들 */
  private panels: HTMLElement[] = [];
  private sizes: number[] = [];

  /** 드래그 시작 시 저장되는 정보 */
  private draggingIndex: number = -1;
  private dragStartSizes: number[] = [];
  private dragStartPosition: number = 0;
  private containerSize: number = 0;

  @queryAssignedElements({ flatten: true }) 
  slotEls?: HTMLElement[];

  /** 스플리터 개수 (렌더링용) */
  @state() splitterCount: number = 0;

  /** 분할 방향을 설정합니다. 'horizontal'은 좌우 분할, 'vertical'은 상하 분할입니다. */
  @property({ type: String, reflect: true }) 
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  
  /** 초기 패널 크기 비율을 설정합니다. (예: [30, 70]은 첫 번째 패널이 30%, 두 번째 패널이 70%를 차지) */
  @property({ type: Array, attribute: 'init-ratio', converter: arrayAttrConverter(parseFloat) })
  initRatio: number[] = [];

  /** 각 패널의 최소 크기를 설정합니다. (픽셀 단위) */
  @property({ type: Array, attribute: 'min-sizes', converter: arrayAttrConverter(parseFloat) })
  minSizes: number[] = [];

  /** 각 패널의 최대 크기를 설정합니다. (픽셀 단위) */
  @property({ type: Array, attribute: 'max-sizes', converter: arrayAttrConverter(parseFloat) })
  maxSizes: number[] = [];

  disconnectedCallback() {
    this.removeEventListeners();
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    
    if (changedProperties.has('orientation')) {
      this.initialize();
    }
  }

  render() {
    return html`
      ${Array.from({ length: this.splitterCount }, (_, i) => html`
        <div class="splitter" style="order: ${i * 2 + 1}"
          orientation=${this.orientation}
          @mousedown=${(e: MouseEvent) => this.handleSplitterMouseDown(e, i)}>
        </div>
      `)}
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  /** 슬롯 변경시 패널 초기화 */
  private handleSlotChange = () => {
    const panels = this.slotEls || [];
    if (panels.every((p, i) => p === this.panels[i])) {
      return;
    }
    this.initialize();
  }

  /** 패널 및 크기 초기화 */
  private initialize = () => {
    this.panels = this.slotEls || [];
    
    if (this.panels.length === 0) {
      this.splitterCount = 0;
      return;
    }

    this.splitterCount = Math.max(0, this.panels.length - 1);

    // 초기 비율 계산 (퍼센트)
    if (this.initRatio.length === this.panels.length) {
      const total = this.initRatio.reduce((sum, r) => sum + r, 0);
      this.sizes = this.initRatio.map(r => (r / total) * 100);
    } else {
      const equalSize = 100 / this.panels.length;
      this.sizes = this.panels.map(() => equalSize);
    }

    this.updatePanelStyles();
    this.requestUpdate();
  }

  /** 패널에 새로운 스타일 적용 */
  private updatePanelStyles() {
    const dimension = this.orientation === 'horizontal' ? 'width' : 'height';
    const gutterSize = this.getGutterSize();

    this.panels.forEach((panel, index) => {
      const size = this.sizes[index];
      // calc(percentage% - gutterSize 비율만큼 차감)
      panel.style[dimension] = `calc(${size}% - ${gutterSize * (this.splitterCount / this.panels.length)}px)`;
      panel.style.order = String(index * 2);
    });
  }

  private handleSplitterMouseDown = (e: MouseEvent, index: number) => {
    if (e.button !== 0) return; // 좌클릭만
    e.preventDefault();

    this.draggingIndex = index;
    this.dragStartPosition = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    this.dragStartSizes = [...this.sizes];
    
    // 컨테이너 크기 저장
    const rect = this.getBoundingClientRect();
    this.containerSize = this.orientation === 'horizontal' ? rect.width : rect.height;
    // 거터 크기 제외
    this.containerSize -= this.getGutterSize() * this.splitterCount;

    // 활성 상태 표시
    const splitters = this.shadowRoot?.querySelectorAll('.splitter');
    splitters?.[index]?.classList.add('active');

    // 전역 이벤트 등록
    document.addEventListener('mousemove', this.handleDocumentMouseMove);
    document.addEventListener('mouseup', this.handleDocumentMouseUp);

    // 드래그 중 선택 방지
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';
  }

  private handleDocumentMouseMove = (e: MouseEvent) => {
    if (this.draggingIndex === -1) return;
    e.preventDefault();

    const currentPosition = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPosition - this.dragStartPosition;
    
    // delta를 퍼센트로 변환
    const deltaPercent = (delta / this.containerSize) * 100;

    const aIndex = this.draggingIndex;
    const bIndex = this.draggingIndex + 1;

    // 새 크기 계산
    let newASize = this.dragStartSizes[aIndex] + deltaPercent;
    let newBSize = this.dragStartSizes[bIndex] - deltaPercent;

    // 최소/최대 크기 제한 (픽셀을 퍼센트로 변환)
    const minAPercent = ((this.minSizes[aIndex] ?? 0) / this.containerSize) * 100;
    const minBPercent = ((this.minSizes[bIndex] ?? 0) / this.containerSize) * 100;
    const maxAPercent = this.maxSizes[aIndex] ? ((this.maxSizes[aIndex]) / this.containerSize) * 100 : 100;
    const maxBPercent = this.maxSizes[bIndex] ? ((this.maxSizes[bIndex]) / this.containerSize) * 100 : 100;

    // 제한 적용
    if (newASize < minAPercent) {
      newASize = minAPercent;
      newBSize = this.dragStartSizes[aIndex] + this.dragStartSizes[bIndex] - newASize;
    }
    if (newBSize < minBPercent) {
      newBSize = minBPercent;
      newASize = this.dragStartSizes[aIndex] + this.dragStartSizes[bIndex] - newBSize;
    }
    if (newASize > maxAPercent) {
      newASize = maxAPercent;
      newBSize = this.dragStartSizes[aIndex] + this.dragStartSizes[bIndex] - newASize;
    }
    if (newBSize > maxBPercent) {
      newBSize = maxBPercent;
      newASize = this.dragStartSizes[aIndex] + this.dragStartSizes[bIndex] - newBSize;
    }

    // 크기 업데이트
    this.sizes[aIndex] = newASize;
    this.sizes[bIndex] = newBSize;

    // 스타일 적용
    this.updatePanelStyles();
  }

  private handleDocumentMouseUp = () => {
    if (this.draggingIndex === -1) return;

    // 활성 상태 해제
    const splitters = this.shadowRoot?.querySelectorAll('.splitter');
    splitters?.[this.draggingIndex]?.classList.remove('active');

    this.draggingIndex = -1;
    this.removeEventListeners();

    // 스타일 복원
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  /** 전역 이벤트 리스너 제거 */
  private removeEventListeners() {
    document.removeEventListener('mousemove', this.handleDocumentMouseMove);
    document.removeEventListener('mouseup', this.handleDocumentMouseUp);
  }

  /** 거터 크기 가져오기 */
  private getGutterSize(): number {
    const sizeStr = getComputedStyle(this).getPropertyValue('--splitter-size').trim();
    return parseFloat(sizeStr) || 4;
  }
}