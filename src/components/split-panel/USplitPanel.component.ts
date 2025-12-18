import { html, PropertyValues } from "lit";
import { property, queryAssignedElements } from "lit/decorators.js";

import { arrayAttributeConverter } from "../../internals/attribute-converters.js";
import { BaseElement } from "../BaseElement.js";
import { UDivider } from "../divider/UDivider.component.js";
import { styles } from "./USplitPanel.styles.js";

/**
 * SplitPanel 컴포넌트는 화면을 여러 개의 패널로 분할하여 표시합니다.
 */
export class USplitPanel extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-divider': UDivider,
  };

  private panels: HTMLElement[] = [];
  private dividers: UDivider[] = [];

  private panelSizes: number[] = [];
  private panelAdjustSizes: number[] = [];

  @queryAssignedElements({ flatten: true }) 
  childElements!: HTMLElement[];

  /** 분할 방향을 설정합니다. 'horizontal'은 좌우 분할, 'vertical'은 상하 분할입니다. */
  @property({ type: String, reflect: true }) 
  orientation: 'horizontal' | 'vertical' = 'horizontal';
  
  /** 초기 패널 크기 비율을 설정합니다. (예: [30, 70]은 첫 번째 패널이 30%, 두 번째 패널이 70%를 차지) */
  @property({ type: Array, attribute: 'init-ratio', converter: arrayAttributeConverter(parseFloat) })
  initRatio: number[] = [];

  /** 각 패널의 최소 크기를 설정합니다. (픽셀 단위) */
  @property({ type: Array, attribute: 'min-sizes', converter: arrayAttributeConverter(parseFloat) })
  minSizes: number[] = [];

  /** 각 패널의 최대 크기를 설정합니다. (픽셀 단위) */
  @property({ type: Array, attribute: 'max-sizes', converter: arrayAttributeConverter(parseFloat) })
  maxSizes: number[] = [];

  disconnectedCallback() {
    this.dividers.forEach(divider => divider.remove());
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    // 방향이 변경되었을 때 패널 및 디바이더 재설정
    if (changedProperties.has('orientation')) {
      this.initialize();
    }
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  // 초기화 메서드
  private initialize = async () => {
    // 기존 패널 및 divider 정리
    this.panels = this.childElements.filter(el => el instanceof UDivider === false);
    this.dividers.forEach(divider => divider.remove());
    this.dividers = [];

    // 패널 비율 계산
    if (this.initRatio.length === this.panels.length) {
      const totalRatio = this.initRatio.reduce((sum, r) => sum + r, 0);
      this.panelSizes = this.initRatio.map(r => (r / totalRatio) * 100);
    } else {
      const equalRatio = 100 / this.panels.length;
      this.panelSizes = this.panels.map(() => equalRatio);
    }
    this.panelAdjustSizes = this.panels.map(() => 0);

    const property = this.orientation === 'horizontal' ? 'width' : 'height';
    const dividerSize = this.getDividerSize();
    this.panels.forEach((panel, index) => {
      // 패널 크기 설정
      const ratio = this.panelSizes[index];
      panel.style.flex = 'none';
      panel.style[property] = (index === 0 || index === this.panels.length - 1)
        ? `calc(${ratio}% - ${dividerSize / 2}px)`
        : `calc(${ratio}% - ${dividerSize}px)`;

      // divider 생성 및 추가, 마지막 패널 뒤에는 divider를 추가하지 않음
      if (index === this.panels.length - 1) return;
        
      const divider = new UDivider();
      divider.orientation = this.orientation;
      divider.movable = true;
      divider.addEventListener('u-move', this.handleDividerMove);
      this.dividers.push(divider);
      panel.after(divider);
    });
    
    this.requestUpdate();
    await this.updateComplete;
  }

  private handleSlotChange = async () => {
    // 변경된 내용이 없으면 무시
    const panels = this.childElements.filter(el => el instanceof UDivider === false);
    if (panels.every((p, i) => p === this.panels[i])) {
      return; 
    }
    await this.initialize();
  }

  /** 디바이더 드래그 이벤트 핸들러 */
  private handleDividerMove = (event: any) => {
    const divider = event.target as UDivider;
    const delta = event.detail.delta; // 드래그 픽셀 이동거리
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

  // Get divider size from CSS variable
  private getDividerSize(): number {
    const sizeStr = getComputedStyle(this).getPropertyValue('--divider-size').trim();
    return parseFloat(sizeStr) || 2;
  }
}