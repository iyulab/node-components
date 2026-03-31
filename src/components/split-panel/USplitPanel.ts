import { html, PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import { arrayAttrConverter } from "../../utilities/converters.js";
import { UElement } from "../UElement.js";
import { styles } from "./USplitPanel.styles.js";
import { type ShiftEventDetail } from "../../events/ShiftEvent.js";

/**
 * 두 패널을 분할하고 크기를 조절할 수 있는 레이아웃 컴포넌트입니다.
 *
 * @slot - 분할된 패널 요소들
 * @slot splitter - 핸들(스플리터) UI
 *
 * @cssprop --splitter-size - 스플리터 크기 (default: 4px)
 * @cssprop --splitter-color - 스플리터 색상
 * @cssprop --splitter-color-hover - 스플리터 호버 색상
 * @cssprop --splitter-color-active - 스플리터 활성 색상
 *
 * @event shift-start - 구분선 이동 시작 시 발생
 * @event shift - 구분선 이동 중 발생
 * @event shift-end - 구분선 이동 완료 시 발생
 */
@customElement('u-split-panel')
export class USplitPanel extends UElement {
  static styles = [super.styles, styles];

  /** 리사이즈 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 분할 방향 */
  @property({ type: String, reflect: true }) orientation: 'horizontal' | 'vertical' = "horizontal";
  /** 가상 스플리터를 보여주면서 마우스 놓을 지점에 업데이트 */
  @property({ type: Boolean, reflect: true }) lazy = false;
  /** 기본(초기) 패널 비율 */
  @property({
    type: Array,
    reflect: true,
    attribute: 'default-ratio',
    converter: arrayAttrConverter(parseFloat)
  })
  defaultRatio: number[] = [];
  /** 현재 패널 크기 비율 상태 */
  @property({
    type: Array,
    reflect: true,
    converter: arrayAttrConverter(parseFloat)
  })
  ratio: number[] = [];

  @query('.splitter-ghost') private ghost?: HTMLElement;

  private panels: HTMLElement[] = [];
  private splitter?: Node;
  private dragState = {
    index: -1,
    startPoint: 0,
    availableSize: 0,
    percentages: [] as number[],
    ghostDelta: 0,
  };

  private get percentages(): number[] {
    const source = this.ratio.length === this.panels.length ? this.ratio
      : this.defaultRatio.length === this.panels.length ? this.defaultRatio
      : [];

    if (source.length === this.panels.length) {
      const total = source.reduce((sum, s) => sum + s, 0);
      return source.map(s => (s / total) * 100);
    }
    const equals = 100 / this.panels.length;
    return this.panels.map(() => equals);
  }

  private get splitterSize(): number {
    const sizeStr = getComputedStyle(this).getPropertyValue('--splitter-size').trim();
    return parseFloat(sizeStr) || 4;
  }

  private get splitterCount(): number {
    return Math.max(0, this.panels.length - 1);
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (['orientation','defaultRatio','ratio'].some(k => changedProperties.has(k))) {
      this.updatePanelLayout();
    }
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>

      <div class="splitter-ghost"></div>
      <div hidden aria-hidden="true">
        <slot name="splitter" @slotchange=${this.handleSplitterSlotChange}></slot>
      </div>
    `;
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.panels = slot.assignedElements({ flatten: true })
      .filter((el): el is HTMLElement => el instanceof HTMLElement);
    this.appendSplitters();
    this.updatePanelLayout();
  }

  private handleSplitterSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.splitter = slot.assignedNodes({ flatten: true }).at(0);
    this.appendSplitters();
  }

  private appendSplitters() {
    const root = this.renderRoot;
    if (!root) return;

    root.querySelectorAll('.splitter').forEach(el => el.remove());

    const ref = this.ghost ?? null;
    for (let i = 0; i < this.splitterCount; i++) {
      const splitter = this.createSplitter(i);
      root.insertBefore(splitter, ref);
    }
  }

  private createSplitter(index: number) {
    const el = document.createElement('div');
    el.setAttribute('class', 'splitter');
    el.setAttribute('part', 'splitter');
    el.style.order = String(index * 2 + 1);
    el.dataset.index = String(index);

    if (this.splitter) {
      el.appendChild(this.splitter.cloneNode(true));
    }

    el.addEventListener('pointerdown', this.handlePointerDown);
    el.addEventListener('dblclick', this.handleDblClick);

    return el;
  }

  private updatePanelLayout() {
    if (this.panels.length === 0) return;
    const dim = this.orientation === 'horizontal' ? 'width' : 'height';
    const otherDim = this.orientation === 'horizontal' ? 'height' : 'width';
    const percentages = this.percentages;
    const splitterOffset = this.splitterSize * (this.splitterCount / this.panels.length);

    this.panels.forEach((panel, index) => {
      panel.style[dim] = `calc(${percentages[index]}% - ${splitterOffset}px)`;
      panel.style[otherDim] = '';
      panel.style.order = String(index * 2);
      panel.style.boxSizing = 'border-box';
      panel.style.flexShrink = '0';
      panel.style.overflow = 'auto';
    });
  }

  private handleDblClick = () => {
    if (this.disabled) return;
    this.ratio = this.defaultRatio.length === this.panels.length ? [...this.defaultRatio] : [];
    this.updatePanelLayout();
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || this.disabled) return;
    e.preventDefault();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    target.addEventListener('pointermove', this.handlePointerMove);
    target.addEventListener('pointerup', this.handlePointerUp);
    target.addEventListener('pointercancel', this.handlePointerUp);

    const hostRect = this.getBoundingClientRect();
    const containerSize = this.orientation === 'horizontal' ? hostRect.width : hostRect.height;
    const splitterRect = target.getBoundingClientRect();
    const splitterPos = this.orientation === 'horizontal'
      ? splitterRect.left - hostRect.left
      : splitterRect.top - hostRect.top;

    this.dragState = {
      index: parseInt(target.dataset.index || '-1'),
      startPoint: this.orientation === 'horizontal' ? e.clientX : e.clientY,
      availableSize: containerSize - this.splitterSize * this.splitterCount,
      percentages: this.percentages,
      ghostDelta: 0,
    };

    if (this.lazy && this.ghost) {
      this.ghost.style.left = '';
      this.ghost.style.top = '';
      this.ghost.style.transform = '';
      const prop = this.orientation === 'horizontal' ? 'left' : 'top';
      this.ghost.style[prop] = `${splitterPos}px`;
      this.ghost.setAttribute('active', '');
    }

    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';

    this.fire<ShiftEventDetail>('shift-start', { 
      detail: { 
        index: this.dragState.index,
        ratio: [...this.percentages], 
      } 
    });
  }

  private handlePointerMove = (e: PointerEvent) => {
    e.preventDefault();

    const current = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    const deltaPixel = current - this.dragState.startPoint;
    const deltaPercent = (deltaPixel / this.dragState.availableSize) * 100;
    const aIdx = this.dragState.index;
    const bIdx = aIdx + 1;

    if (this.lazy && this.ghost) {
      const maxDelta = (this.dragState.percentages[bIdx] / 100) * this.dragState.availableSize;
      const minDelta = -(this.dragState.percentages[aIdx] / 100) * this.dragState.availableSize;
      this.dragState.ghostDelta = Math.max(minDelta, Math.min(maxDelta, deltaPixel));
      const axis = this.orientation === 'horizontal' ? 'X' : 'Y';
      this.ghost.style.transform = `translate${axis}(${this.dragState.ghostDelta}px)`;
    } else {
      const [aPercent, bPercent] = this.clampPair(
        this.dragState.percentages[aIdx] + deltaPercent,
        this.dragState.percentages[bIdx] - deltaPercent,
      );
      const dim = this.orientation === 'horizontal' ? 'width' : 'height';
      const offset = this.splitterSize * (this.splitterCount / this.panels.length);
      this.panels[aIdx].style[dim] = `calc(${aPercent}% - ${offset}px)`;
      this.panels[bIdx].style[dim] = `calc(${bPercent}% - ${offset}px)`;
      const newRatio = [...this.dragState.percentages];
      newRatio[aIdx] = aPercent;
      newRatio[bIdx] = bPercent;
      this.ratio = newRatio;
    }

    this.fire<ShiftEventDetail>('shift', { 
      detail: { 
        index: this.dragState.index,
        ratio: this.lazy ? this.percentages : [...this.ratio], 
      } 
    });
  }

  private handlePointerUp = (e: PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    target.removeEventListener('pointermove', this.handlePointerMove);
    target.removeEventListener('pointerup', this.handlePointerUp);
    target.removeEventListener('pointercancel', this.handlePointerUp);

    if (this.lazy && this.ghost) {
      this.ghost.removeAttribute('active');
      this.ghost.style.transform = '';

      const deltaPercent = (this.dragState.ghostDelta / this.dragState.availableSize) * 100;
      const aIdx = this.dragState.index;
      const bIdx = aIdx + 1;
      const newRatio = [...this.dragState.percentages];
      const [a, b] = this.clampPair(newRatio[aIdx] + deltaPercent, newRatio[bIdx] - deltaPercent);
      newRatio[aIdx] = a;
      newRatio[bIdx] = b;
      this.ratio = newRatio;
      this.updatePanelLayout();
    }

    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    this.fire<ShiftEventDetail>('shift-end', { 
      detail: { 
        index: this.dragState.index,
        ratio: [...this.percentages],
      }
    });
  }

  private clampPair(aRaw: number, bRaw: number): [number, number] {
    const sum = aRaw + bRaw;
    let a = aRaw, b = bRaw;
    if (a < 0) { a = 0; b = sum; }
    else if (b < 0) { b = 0; a = sum; }
    return [a, b];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-split-panel': USplitPanel;
  }
}
