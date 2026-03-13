import { html, nothing, PropertyValues, TemplateResult } from "lit";
import { property, query, state } from "lit/decorators.js";
import type { Placement } from "@floating-ui/dom";

import { UElement } from "../UElement.js";
import { UTooltip } from "../tooltip/UTooltip.component.js";
import { styles } from "./USlider.styles.js";

/** 마크 정의 */
export interface SliderMark {
  /** 마크 위치 값 */
  value: number;
  /** 마크 하단 라벨 */
  label?: string;
}

/** 값 포맷터 함수 타입 */
export type SliderFormatter = (value: number) => string;
/** 방향 타입 */
export type SliderOrientation = 'horizontal' | 'vertical';

/** thumb 식별자 */
type ThumbId = 'min' | 'max';

/**
 * Slider 컴포넌트는 범위 내에서 값을 선택할 수 있는 입력 요소입니다.
 * 단일 thumb 및 range(dual-thumb) 모드를 지원합니다.
 *
 * @slot thumb - 커스텀 thumb 엘리먼트
 * @slot thumb-end - range 모드에서 두 번째 커스텀 thumb 엘리먼트
 *
 * @fires u-input - 드래그 중 값이 변경될 때
 * @fires u-change - 드래그 완료 후 값이 확정될 때
 *
 * @csspart track - 트랙 영역
 * @csspart fill - 채워진 영역
 * @csspart thumb - 첫 번째 thumb
 * @csspart thumb-end - range 모드의 두 번째 thumb
 * @csspart mark - 마크 점
 * @csspart mark-label - 마크 라벨
 *
 * @cssproperty --slider-color - 슬라이더 활성 색상
 * @cssproperty --slider-track-color - 트랙 배경 색상
 * @cssproperty --slider-thumb-color - thumb 색상
 * @cssproperty --slider-thumb-border-color - thumb 테두리 색상
 * @cssproperty --slider-thumb-size - thumb 크기
 * @cssproperty --slider-track-height - 트랙 높이
 */
export class USlider extends UElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {
    'u-tooltip': UTooltip,
  };

  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 읽기 전용 여부 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** 필수 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 유효하지 않은 상태 */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 방향 */
  @property({ type: String, reflect: true }) orientation: SliderOrientation = 'horizontal';
  /** range 모드 (dual-thumb) */
  @property({ type: Boolean, reflect: true }) range: boolean = false;
  /** 드래그/호버 시 값 툴팁 표시 여부 */
  @property({ type: Boolean, attribute: 'show-tooltip' }) showTooltip: boolean = false;
  /** 헤더에 현재 값 표시 여부 */
  @property({ type: Boolean, attribute: 'show-value' }) showValue: boolean = false;
  /** 툴팁 위치 */
  @property({ type: String, attribute: 'tooltip-placement' }) tooltipPlacement: Placement = 'top';
  /** 툴팁 거리 (px) */
  @property({ type: Number, attribute: 'tooltip-distance' }) tooltipDistance: number = 8;
  /** 채우기 시작 오프셋 (단일 모드 전용) */
  @property({ type: Number }) offset?: number;
  /** 커스텀 값 포맷터 */
  @property({ attribute: false }) formatter?: SliderFormatter;
  /** 마크 배열 */
  @property({ attribute: false }) marks?: SliderMark[];
  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** 설명 텍스트 */
  @property({ type: String }) description?: string;
  /** name 속성 (폼 연동용) */
  @property({ type: String }) name?: string;
  /** 최소값 */
  @property({ type: Number }) min: number = 0;
  /** 최대값 */
  @property({ type: Number }) max: number = 100;
  /** 값 변화 단위 */
  @property({ type: Number }) step: number = 1;
  /** 현재 값 (단일 모드) */
  @property({ type: Number }) value: number = 0;
  /** range 모드에서의 최소 선택 값 */
  @property({ type: Number, attribute: 'min-value' }) minValue: number = 0;
  /** range 모드에서의 최대 선택 값 */
  @property({ type: Number, attribute: 'max-value' }) maxValue: number = 100;
  
  @state() private dragging: ThumbId | null = null;
  @state() private hoverThumb: ThumbId | null = null;
  @query('.track') private trackEl!: HTMLElement;
  private activeTooltip: UTooltip | null = null;

  private get fillStart(): number {
    if (this.range) return this.valToPercent(Math.min(this.minValue, this.maxValue));
    if (this.offset !== undefined) return this.valToPercent(Math.min(this.offset, this.value));
    return 0;
  }

  private get fillEnd(): number {
    if (this.range) return this.valToPercent(Math.max(this.minValue, this.maxValue));
    if (this.offset !== undefined) return this.valToPercent(Math.max(this.offset, this.value));
    return this.valToPercent(this.value);
  }

  protected willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);

    if (changedProperties.has('value')) {
      this.value = this.snap(this.value);
    } 
    if (changedProperties.has('minValue')) {
      this.minValue = this.snap(this.minValue);
    }
    if (changedProperties.has('maxValue')) {
      this.maxValue = this.snap(this.maxValue);
    }
  }

  render() {
    const vertical = this.orientation === 'vertical';
    const posAxis = vertical ? 'bottom' : 'left';
    const sizeAxis = vertical ? 'height' : 'width';
    const hasMark = !!this.marks?.length;

    return html`
      <div class="header" ?hidden=${!this.label && !this.showValue}>
        <label class="label" ?hidden=${!this.label}>
          ${this.label}
          <span class="required" ?hidden=${!this.required}>*</span>
        </label>
        <span class="value-display" ?hidden=${!this.showValue}>
          ${this.range
            ? `${this.formatValue(Math.min(this.minValue, this.maxValue))} – ${this.formatValue(Math.max(this.minValue, this.maxValue))}`
            : this.formatValue(this.value)}
        </span>
      </div>

      <div class="slider-container"
        ?dragging=${this.dragging !== null}
        @pointerdown=${this.handleTrackPointerDown}
      >
        <div class="track" part="track">
          <div class="fill" part="fill"
            style="${posAxis}: ${this.fillStart}%; ${sizeAxis}: ${this.fillEnd - this.fillStart}%">
          </div>
        </div>

        <div class="marks" ?hidden=${!hasMark}>
          ${this.marks?.map(m => this.renderMark(m, posAxis))}
        </div>

        ${this.renderThumb('min', posAxis)}
        ${this.renderThumb('max', posAxis)}
      </div>

      <div class="mark-labels" ?hidden=${!hasMark}>
        ${this.marks?.map(m => this.renderMarkLabel(m, posAxis))}
      </div>

      <div class="description" ?hidden=${!this.description}>
        ${this.description}
      </div>
    `;
  }

  private renderThumb(thumb: ThumbId, posAxis: string): TemplateResult {
    const isEnd = thumb === 'max';
    const val = this.thumbValue(thumb);
    const pct = this.valToPercent(val);

    return html`
      <div class="thumb-container"
        part=${isEnd ? 'thumb-end' : 'thumb'}
        data-thumb=${isEnd ? 'end' : 'start'}
        ?hidden=${isEnd && !this.range}
        ?active=${this.dragging === thumb}
        ?hover=${this.hoverThumb === thumb}
        style="${posAxis}: ${pct}%"
        tabindex=${this.disabled || (isEnd && !this.range) ? -1 : 0}
        role="slider"
        aria-label=${isEnd ? (this.label ? `${this.label} end` : 'slider end') : (this.label || 'slider')}
        aria-valuemin=${isEnd ? this.minValue : this.min}
        aria-valuemax=${isEnd ? this.max : (this.range ? this.maxValue : this.max)}
        aria-valuenow=${val}
        aria-valuetext=${this.formatValue(val)}
        aria-orientation=${this.orientation}
        aria-disabled=${this.disabled ? 'true' : 'false'}
        aria-readonly=${this.readonly ? 'true' : 'false'}
        aria-required=${this.required ? 'true' : 'false'}
        aria-invalid=${this.invalid ? 'true' : 'false'}
        @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, thumb)}
        @pointerenter=${() => this.setHover(thumb)}
        @pointerleave=${() => this.clearHover(thumb)}
        @focus=${() => this.setHover(thumb)}
        @blur=${() => this.clearHover(thumb)}
      >
        <div class="thumb"><slot name=${isEnd ? 'thumb-end' : 'thumb'}></slot></div>
        ${this.showTooltip ? html`
          <u-tooltip placement=${this.tooltipPlacement} .distance=${this.tooltipDistance}>
            ${this.formatValue(val)}
          </u-tooltip>
        ` : nothing}
      </div>
    `;
  }

  private renderMark(mark: SliderMark, posAxis: string): TemplateResult {
    const pct = this.valToPercent(mark.value);
    const v = mark.value;
    const inRange = this.range
      ? v >= Math.min(this.minValue, this.maxValue) && v <= Math.max(this.minValue, this.maxValue)
      : this.offset !== undefined
        ? v >= Math.min(this.offset, this.value) && v <= Math.max(this.offset, this.value)
        : v <= this.value;

    return html`
      <div class="mark" part="mark" ?in-range=${inRange}
        style="${posAxis}: ${pct}%">
      </div>
    `;
  }

  private renderMarkLabel(mark: SliderMark, posAxis: string): TemplateResult | typeof nothing {
    if (!mark.label) return nothing;
    return html`
      <span class="mark-label" part="mark-label"
        style="${posAxis}: ${this.valToPercent(mark.value)}%">
        ${mark.label}
      </span>
    `;
  }

  private formatValue(val: number): string {
    return this.formatter ? this.formatter(val) : `${val}`;
  }

  private valToPercent(val: number): number {
    const range = this.max - this.min;
    return range === 0 ? 0 : ((val - this.min) / range) * 100;
  }

  private percentToVal(pct: number): number {
    return this.snap(this.min + (pct / 100) * (this.max - this.min));
  }

  private snap(val: number): number {
    const stepped = Math.round((val - this.min) / this.step) * this.step + this.min;
    return Math.min(this.max, Math.max(this.min, parseFloat(stepped.toFixed(10))));
  }

  private thumbValue(thumb: ThumbId): number {
    if (thumb === 'max') return this.maxValue;
    return this.range ? this.minValue : this.value;
  }

  // ── hover 관리 ──

  private setHover(thumb: ThumbId): void {
    this.hoverThumb = thumb;
  }

  private clearHover(thumb: ThumbId): void {
    if (this.dragging !== thumb) this.hoverThumb = null;
  }

  // ── 포인터 이벤트 ──

  private handleTrackPointerDown = (e: PointerEvent) => {
    if (this.disabled || this.readonly) return;

    const val = this.percentToVal(this.getPointerPercent(e));

    if (this.range) {
      const closer = Math.abs(val - this.minValue) <= Math.abs(val - this.maxValue) ? 'min' : 'max';
      this.dragging = closer;
      if (closer === 'min') this.minValue = val; else this.maxValue = val;
    } else {
      this.dragging = 'min';
      this.value = val;
    }

    this.emit('u-input');
    this.focusThumbAndShowTooltip();

    const handleMove = (ev: PointerEvent) => {
      ev.preventDefault();
      this.applyDragValue(this.percentToVal(this.getPointerPercent(ev)));
      this.emit('u-input');
      this.keepTooltipVisible();
    };

    const handleUp = () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      this.activeTooltip?.hide();
      this.activeTooltip = null;
      this.dragging = null;
      this.hoverThumb = null;
      this.emit('u-change');
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  };

  private applyDragValue(val: number): void {
    if (this.dragging === 'min') {
      if (this.range) this.minValue = Math.min(val, this.maxValue);
      else this.value = val;
    } else if (this.dragging === 'max') {
      this.maxValue = Math.max(val, this.minValue);
    }
  }

  private getPointerPercent(e: PointerEvent): number {
    if (!this.trackEl) return 0;
    const rect = this.trackEl.getBoundingClientRect();
    if (this.orientation === 'vertical') {
      return (Math.max(0, Math.min(rect.height, rect.bottom - e.clientY)) / rect.height) * 100;
    }
    return (Math.max(0, Math.min(rect.width, e.clientX - rect.left)) / rect.width) * 100;
  }

  private focusThumbAndShowTooltip(): void {
    this.updateComplete.then(() => {
      const thumbEl = this.shadowRoot?.querySelector(
        `[data-thumb="${this.dragging === 'max' ? 'end' : 'start'}"]`
      ) as HTMLElement | null;
      thumbEl?.focus();

      if (this.showTooltip && thumbEl) {
        this.activeTooltip = thumbEl.querySelector('u-tooltip') as UTooltip | null;
        this.activeTooltip?.show(thumbEl);
      }
    });
  }

  private keepTooltipVisible(): void {
    if (!this.activeTooltip) return;
    this.updateComplete.then(() => {
      const parent = this.activeTooltip?.parentElement as Element;
      if (parent) this.activeTooltip?.show(parent);
    });
  }

  // ── 키보드 이벤트 ──

  private handleKeyDown = (e: KeyboardEvent, thumb: ThumbId) => {
    if (this.disabled || this.readonly) return;

    const currentVal = this.thumbValue(thumb);
    const bigStep = (this.max - this.min) / 10;

    let delta: number;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowUp':    delta = this.step;           break;
      case 'ArrowLeft':  case 'ArrowDown':   delta = -this.step;          break;
      case 'PageUp':                         delta = bigStep;             break;
      case 'PageDown':                       delta = -bigStep;            break;
      case 'Home':                           delta = this.min - currentVal; break;
      case 'End':                            delta = this.max - currentVal; break;
      default: return;
    }

    e.preventDefault();
    const newVal = this.snap(currentVal + delta);

    if (thumb === 'min') {
      if (this.range) this.minValue = Math.min(newVal, this.maxValue);
      else this.value = newVal;
    } else {
      this.maxValue = Math.max(newVal, this.minValue);
    }

    this.emit('u-input');
    this.emit('u-change');
  };
}
