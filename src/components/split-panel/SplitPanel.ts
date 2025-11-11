import { html } from "lit";
import { property } from "lit/decorators.js";

import { arrayAttributeConverter } from "../../internals/attribute-converters.js";
import { BaseElement } from "../BaseElement.js";
import { Panel } from "../panel/Panel.js";
import { Splitter } from "./Splitter.js";
import type { PanelOrientation } from "./SplitPanel.types.js";
import { styles } from "./SplitPanel.styles.js";

/**
 * SplitPanel 컴포넌트는 화면을 여러 개의 패널로 분할하여 표시합니다.
 */
export class SplitPanel extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-panel': Panel,
    'u-splitter': Splitter
  };

  private panels: Panel[] = [];
  private splitters: Splitter[] = [];
  private isDragging = false;
  private currentSplitter: Splitter | null = null;
  private totalSize = 0;
  private startPosition = 0;
  private startRatio: number[] = [];

  /** 분할 방향을 설정합니다. 'horizontal'은 좌우 분할, 'vertical'은 상하 분할입니다. */
  @property({ type: String, reflect: true }) orientation: PanelOrientation = 'horizontal';
  /** 초기 패널 크기 비율을 설정합니다. (예: [30, 70]은 첫 번째 패널이 30%, 두 번째 패널이 70%를 차지) */
  @property({ type: Array, converter: arrayAttributeConverter(parseFloat) }) ratio: number[] = [];

  disconnectedCallback() {
    // 컴포넌트 제거 시 이벤트 리스너 정리
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    // splitter 제거
    this.splitters.forEach(splitter => {
      splitter.removeEventListener('mousedown', this.handleMouseDown);
      splitter.remove();
    });

    super.disconnectedCallback();
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  private handleSlotChange = async (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const childrens = slot.assignedElements({ flatten: true });
    const panels = childrens.filter(el => el instanceof Panel);

    // 패널이 변경되지 않았으면 다시 설정하지 않음
    if (this.panels.length === panels.length && 
        this.panels.every((p, i) => p === panels[i])) {
      return;
    }

    // 기존 splitter 제거
    this.splitters.forEach(splitter => splitter.remove());
    this.splitters = [];

    this.panels = panels as Panel[];

    // splitter 추가
    panels.forEach((panel, index) => {
      // 마지막 패널 뒤에는 splitter를 추가하지 않음
      if (index === panels.length - 1) {
        return;
      }

      const splitter = new Splitter();
      splitter.orientation = this.orientation;
      splitter.addEventListener('mousedown', this.handleMouseDown);
      this.splitters.push(splitter);
      panel.after(splitter);
    });

    // 초기 크기 설정 (균등 분할, 비율 기반)
    // splitter의 크기를 제외한 나머지 공간을 패널들이 균등 분할
    if (this.ratio.length === panels.length) {
      const totalRatio = this.ratio.reduce((sum, r) => sum + r, 0);
      panels.forEach((panel, i) => {
        const panelRatio = (this.ratio[i] / totalRatio) * 100;
        panel.style.flex = `${panelRatio} 1 0%`;
      });
      return;
    } else {
      panels.forEach((panel) => {
        panel.style.flex = `${100 / panels.length} 1 0%`;
      });
    }
    
    this.requestUpdate();
    await this.updateComplete;
  }

  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    
    const splitter = e.currentTarget as Splitter;
    this.currentSplitter = splitter;
    this.isDragging = true;
    
    // 드래그 시작 위치 저장
    this.startPosition = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    
    // 전체 크기 저장 (컨테이너 크기 - splitter 크기 합계)
    const containerRect = this.getBoundingClientRect();
    const containerSize = this.orientation === 'horizontal' ? containerRect.width : containerRect.height;
    const splittersSize = this.splitters.reduce((sum, sp) => sum + sp.size, 0);
    this.totalSize = containerSize - splittersSize;
    
    // 현재 패널들의 비율 저장 (실제 크기를 사용 가능한 크기로 나눔)
    this.startRatio = this.panels.map(panel => {
      const rect = panel.getBoundingClientRect();
      const size = this.orientation === 'horizontal' ? rect.width : rect.height;
      return (size / this.totalSize) * 100; // 퍼센트로 변환
    });

    // Splitter에 dragging 상태 설정
    splitter.dragging = true;
    
    // 전역 이벤트 리스너 등록
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    
    // 선택 방지
    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging || !this.currentSplitter) return;

    e.preventDefault();

    // 현재 위치와 시작 위치의 차이 계산 (픽셀)
    const currentPosition = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    const deltaPixels = currentPosition - this.startPosition;

    // splitter의 인덱스 찾기
    const splitterIndex = this.splitters.indexOf(this.currentSplitter);
    if (splitterIndex === -1) return;

    // 앞 패널과 뒤 패널
    const prevPanel = this.panels[splitterIndex];
    const nextPanel = this.panels[splitterIndex + 1];

    if (!prevPanel || !nextPanel) return;

    // 픽셀 변화를 비율로 변환
    const deltaRatio = (deltaPixels / this.totalSize) * 100;

    // 새로운 비율 계산
    const prevRatio = this.startRatio[splitterIndex] + deltaRatio;
    const nextRatio = this.startRatio[splitterIndex + 1] - deltaRatio;

    // 최소 비율 제한 (0% 또는 0px에 해당하는 비율 중 큰 값)
    if (prevRatio < 0 || nextRatio < 0) return;

    // 비율로 크기 적용 (flex-grow flex-shrink flex-basis)
    prevPanel.style.flex = `${prevRatio} 1 0%`;
    nextPanel.style.flex = `${nextRatio} 1 0%`;
  }

  private handleMouseUp = (_e: MouseEvent) => {
    if (!this.isDragging) return;

    this.isDragging = false;
    
    // Splitter의 dragging 상태 해제
    if (this.currentSplitter) {
      this.currentSplitter.dragging = false;
      this.currentSplitter = null;
    }

    // 전역 이벤트 리스너 제거
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    
    // 선택 복원
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }
}