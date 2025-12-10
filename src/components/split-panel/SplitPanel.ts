import { html } from "lit";
import { property } from "lit/decorators.js";

import { arrayAttributeConverter } from "../../internals/attribute-converters.js";
import { BaseElement } from "../BaseElement.js";
import { Divider } from "../divider/Divider.js";
import { styles } from "./SplitPanel.styles.js";

/**
 * SplitPanel 컴포넌트는 화면을 여러 개의 패널로 분할하여 표시합니다.
 */
export class SplitPanel extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-divider': Divider,
  };

  private panels: HTMLElement[] = [];
  private dividers: Divider[] = [];

  private panelSizes: number[] = [];
  private panelAdjustSizes: number[] = [];

  /** 분할 방향을 설정합니다. 'horizontal'은 좌우 분할, 'vertical'은 상하 분할입니다. */
  @property({ type: String, reflect: true }) 
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  
  /** 초기 패널 크기 비율을 설정합니다. (예: [30, 70]은 첫 번째 패널이 30%, 두 번째 패널이 70%를 차지) */
  @property({ type: Array, attribute: 'initial-ratio', converter: arrayAttributeConverter(parseFloat) })
  initialRatio: number[] = [];

  disconnectedCallback() {
    // 기존 divider 정리
    this.dividers.forEach(divider => divider.remove());
    super.disconnectedCallback();
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  // Get divider size from CSS variable
  private getDividerSize(): number {
    const sizeStr = getComputedStyle(this).getPropertyValue('--divider-size').trim();
    return parseFloat(sizeStr) || 2;
  }

  private handleSlotChange = async (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const children = slot.assignedElements({ flatten: true });
    const panels = children.filter(el => el instanceof HTMLElement);

    // 패널이 변경되지 않았으면 다시 설정하지 않음
    if (this.panels.length === panels.length && 
        this.panels.every((p, i) => p === panels[i])) {
      return;
    }

    // 기존 패널 및 divider 정리
    this.panels = panels;
    this.dividers.forEach(divider => divider.remove());
    this.dividers = [];

    // 패널 비율 계산
    if (this.initialRatio.length === panels.length) {
      const totalRatio = this.initialRatio.reduce((sum, r) => sum + r, 0);
      this.panelSizes = this.initialRatio.map(r => (r / totalRatio) * 100);
    } else {
      const equalRatio = 100 / panels.length;
      this.panelSizes = panels.map(() => equalRatio);
    }
    this.panelAdjustSizes = panels.map(() => 0);

    const property = this.orientation === 'horizontal' ? 'width' : 'height';
    const dividerSize = this.getDividerSize();
    panels.forEach((panel, index) => {
      // 패널 크기 설정
      const ratio = this.panelSizes[index];
      panel.style.flex = 'none';
      panel.style[property] = (index === 0 || index === panels.length - 1)
        ? `calc(${ratio}% - ${dividerSize / 2}px)`
        : `calc(${ratio}% - ${dividerSize}px)`;

      // divider 생성 및 추가, 마지막 패널 뒤에는 divider를 추가하지 않음
      if (index === panels.length - 1) return;
        
      const divider = new Divider();
      divider.orientation = this.orientation;
      divider.draggable = true;
      divider.addEventListener('u-move', this.handleDividerMove);
      this.dividers.push(divider);
      panel.after(divider);
    });
    
    this.requestUpdate();
    await this.updateComplete;
  }

  /** 디바이더 드래그 이벤트 핸들러 */
  private handleDividerMove = (event: any) => {
    const divider = event.target as Divider;
    const delta = event.detail.delta; // 드래그 픽셀 이동거리
    // console.log('Divider drag delta:', delta);
    const index = this.dividers.indexOf(divider);
    if (index === -1) return;

    const prevPanel = this.panels[index];
    const nextPanel = this.panels[index + 1];

    const property = this.orientation === 'horizontal' ? 'width' : 'height';
    const prevPanelSize = this.panelSizes[index];
    const nextPanelSize = this.panelSizes[index + 1];

    const prevAdjSize = this.panelAdjustSizes[index] || 0;
    const nextAdjSize = this.panelAdjustSizes[index + 1] || 0;

    if (delta === 0) return;
    if (delta > 0) {
      // 이전 패널 크기 증가, 다음 패널 크기 감소
      const prevNewAdjSize = prevAdjSize + delta;
      const nextNewAdjSize = nextAdjSize - delta;
      this.panelAdjustSizes[index] = prevNewAdjSize;
      this.panelAdjustSizes[index + 1] = nextNewAdjSize;
    } else {
      // 이전 패널 크기 감소, 다음 패널 크기 증가
      const prevNewAdjSize = prevAdjSize + delta;
      const nextNewAdjSize = nextAdjSize - delta;
      this.panelAdjustSizes[index] = prevNewAdjSize;
      this.panelAdjustSizes[index + 1] = nextNewAdjSize;
    }

    prevPanel.style[property] = `calc(${prevPanelSize}% - ${this.getDividerSize()/2}px + ${this.panelAdjustSizes[index]}px)`;
    nextPanel.style[property] = `calc(${nextPanelSize}% - ${this.getDividerSize()/2}px + ${this.panelAdjustSizes[index + 1]}px)`;
  }
}