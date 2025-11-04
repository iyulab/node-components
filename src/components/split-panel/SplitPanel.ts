import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../../internals/UElement.js";
import { Panel } from "./Panel.js";
import { Splitter } from "./Splitter.js";
import { styles } from "./SplitPanel.styles.js";

type Orientation = 'horizontal' | 'vertical';

/**
 * SplitPanel 컴포넌트는 화면을 여러 개의 패널로 분할하여 표시합니다.
 * 라이트돔을 사용하여 children 태그들 사이에 Splitter를 주입합니다.
 */
export class SplitPanel extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-panel': Panel,
    'u-splitter': Splitter
  };

  private panels: Panel[] = [];
  private splitters: Splitter[] = [];
  private isDragging = false;
  private currentSplitter: Splitter | null = null;
  private startPosition = 0;
  private startSizes: number[] = [];

  /** 분할 방향을 설정합니다. 'horizontal'은 좌우 분할, 'vertical'은 상하 분할입니다. */
  @property({ type: String, reflect: true }) orientation: Orientation = 'horizontal';

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

    // 초기 크기 설정 (균등 분할)
    const size = `${100 / panels.length}%`;
    panels.forEach((panel) => {
      (panel as HTMLElement).style.flex = `0 0 ${size}`;
    });

    // splitter 추가
    panels.forEach((panel, index) => {
      // 마지막 패널 뒤에는 splitter를 추가하지 않음
      if (index === panels.length - 1) {
        return;
      }

      const splitter = this.createSplitter();
      this.splitters.push(splitter);
      panel.after(splitter);
    });

    this.requestUpdate();
    await this.updateComplete;
  }

  private createSplitter() {
    const splitter = document.createElement('u-splitter') as Splitter;
    splitter.orientation = this.orientation;
    splitter.addEventListener('mousedown', this.handleMouseDown);
    return splitter;
  }

  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    
    const splitter = e.currentTarget as Splitter;
    this.currentSplitter = splitter;
    this.isDragging = true;
    
    // 드래그 시작 위치 저장
    this.startPosition = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    
    // 현재 패널들의 크기 저장
    this.startSizes = this.panels.map(panel => {
      const rect = panel.getBoundingClientRect();
      return this.orientation === 'horizontal' ? rect.width : rect.height;
    });

    // Splitter에 dragging 상태 설정
    splitter.startDrag(e);
    
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

    // 현재 위치와 시작 위치의 차이 계산
    const currentPosition = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPosition - this.startPosition;

    // splitter의 인덱스 찾기
    const splitterIndex = this.splitters.indexOf(this.currentSplitter);
    if (splitterIndex === -1) return;

    // 앞 패널과 뒤 패널
    const prevPanel = this.panels[splitterIndex];
    const nextPanel = this.panels[splitterIndex + 1];

    if (!prevPanel || !nextPanel) return;

    // 새로운 크기 계산
    const prevSize = this.startSizes[splitterIndex] + delta;
    const nextSize = this.startSizes[splitterIndex + 1] - delta;

    // 최소 크기 제한 (50px)
    const minSize = 50;
    if (prevSize < minSize || nextSize < minSize) return;

    // 크기 적용
    prevPanel.style.flex = `0 0 ${prevSize}px`;
    nextPanel.style.flex = `0 0 ${nextSize}px`;
  }

  private handleMouseUp = (_e: MouseEvent) => {
    if (!this.isDragging) return;

    this.isDragging = false;
    
    // Splitter의 dragging 상태 해제
    if (this.currentSplitter) {
      this.currentSplitter.endDrag();
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