import { html, PropertyValues, TemplateResult } from "lit";
import { property, query, state } from "lit/decorators.js";

import { UFormControlElement } from "../UFormControlElement.js";
import { UElement } from "../UElement.js";
import { UField } from "../field/UField.component.js";
import { UTooltip } from "../tooltip/UTooltip.component.js";
import { styles } from "./USlider.styles.js";

/** 마크 정의 */
export interface SliderMark {
  /** 마크 위치 값 */
  value: number;
  /** 마크 하단 디스플레이 */
  label?: string;
}

/** 값 포맷터 함수 타입 */
export type SliderFormatter = (value: number) => string;

/** thumb 내부 식별자 */
type ThumbId = 'min' | 'max';

/**
 * Slider 컴포넌트는 범위 내에서 값을 선택할 수 있는 입력 요소입니다.
 * 단일 thumb 및 range(dual-thumb) 모드를 지원합니다.
 *
 * - 단일 모드: value는 number
 * - range 모드: value는 [min, max] number[]
 *
 * @slot thumb - 커스텀 thumb 엘리먼트
 * @slot thumb-end - range 모드에서 두 번째 커스텀 thumb 엘리먼트
 *
 * @event u-input - 드래그 중 값이 변경될 때
 * @event u-change - 드래그 완료 후 값이 확정될 때
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
export class USlider extends UFormControlElement<number | number[]> {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {
    'u-field': UField,
    'u-tooltip': UTooltip,
  };

  /** range 모드 (dual-thumb) */
  @property({ type: Boolean, reflect: true }) range: boolean = false;
  /** 슬라이더 옆에 현재 값 표시 여부 */
  @property({ type: Boolean, attribute: 'show-value' }) showValue: boolean = false;
  /** 드래그/호버 시 값 툴팁 표시 여부 */
  @property({ type: Boolean, attribute: 'show-tooltip' }) showTooltip: boolean = false;
  /** 커스텀 값 포맷터 */
  @property({ attribute: false }) formatter?: SliderFormatter;
  /** 마크 배열 */
  @property({ attribute: false }) marks?: SliderMark[];
  /** 시작값 오프셋 (single value only) */
  @property({ type: Number }) offset?: number;
  /** 최소값 */
  @property({ type: Number }) min: number = 0;
  /** 최대값 */
  @property({ type: Number }) max: number = 100;
  /** 값 변화 단위 */
  @property({ type: Number }) step: number = 1;

  @state() private dragging: ThumbId | null = null;
  @query('.track') private trackEl!: HTMLElement;

  public get valueAsNumber(): number {
    return Array.isArray(this.value) ? this.value[0] : this.value || 0;
  }

  public get valueAsArray(): number[] {
    return Array.isArray(this.value) ? this.value : [this.value || 0, this.value || 0];
  }

  private get minVal(): number {
    return Array.isArray(this.value) ? this.value[0] : this.min;
  }
  private set minVal(v: number) {
    this.value = [v, this.maxVal];
  }

  private get maxVal(): number {
    return Array.isArray(this.value) ? this.value[1] : this.max;
  }
  private set maxVal(v: number) {
    this.value = [this.minVal, v];
  }

  private get fillStart(): number {
    if (this.range) return this.valToPercent(Math.min(this.minVal, this.maxVal));
    if (this.offset !== undefined) return this.valToPercent(Math.min(this.offset, this.valueAsNumber));
    return 0;
  }

  private get fillEnd(): number {
    if (this.range) return this.valToPercent(Math.max(this.minVal, this.maxVal));
    if (this.offset !== undefined) return this.valToPercent(Math.max(this.offset, this.valueAsNumber));
    return this.valToPercent(this.valueAsNumber);
  }

  private get hasMarks(): boolean {
    return !!this.marks && this.marks.length > 0;
  }

  protected willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);

    if (changedProperties.has('value')) {
      this.onChangeValue();
    }
  }

  render() {
    return html`
      <u-field
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?invalid=${this.invalid}
        .label=${this.label}
        .description=${this.description}
        .validationMessage=${this.validationMessage}
      >
        <span slot="label-aside" ?hidden=${!this.showValue}>
          ${this.formatDisplay()}
        </span>

        <div class="container"
          @pointerdown=${this.handleContainerPointerDown}
        >
          <div class="track" part="track">
            <div class="fill" part="fill"
              style="left: ${this.fillStart}%; width: ${this.fillEnd - this.fillStart}%">
            </div>
          </div>

          <div class="marks" ?hidden=${!this.hasMarks}>
            ${this.marks?.map(m => html`
                <span class="mark" part="mark" 
                  style="left: ${this.valToPercent(m.value)}%"
                ></span>`
              )}
          </div>

          ${this.renderThumb('min')}
          ${this.renderThumb('max')}
        </div>

        <div class="mark-labels" ?hidden=${!this.hasMarks}>
          ${this.marks?.map(m => html`
              <span class="mark-label" part="mark-label"
                style="left: ${this.valToPercent(m.value)}%">
                ${m.label}
              </span>`
            )}
        </div>
      </u-field>
    `;
  }

  public validate(): boolean {
    if (this.internals) {
      this.invalid = !this.internals.checkValidity();
    } else {
      const { flags } = this.getValidity();
      this.invalid = Object.values(flags).some(Boolean);
    }
    return !this.invalid;
  }

  public reset(): void {
    if (this.range) {
      this.value = [this.min, this.max];
    } else {
      this.value = this.offset ?? this.min;
    }
    this.invalid = false;
  }

  private onChangeValue() {
    // snap 처리 및 유효성 검사
    if (Array.isArray(this.value)) {
      this.value = [this.snap(this.value[0]), this.snap(this.value[1])];
    } else if (typeof this.value === 'number') {
      this.value = this.snap(this.value);
    }

    this.internals?.setFormValue(this.valueAsNumber.toString());
    const { flags, message } = this.getValidity();
    this.internals?.setValidity(
      flags,
      this.validationMessage || message,
      this.renderRoot.querySelector('.container') as HTMLElement || undefined
    );
    
    this.emit('u-change');
  }

  private getValidity(): { flags: ValidityStateFlags; message: string } {
    const v = this.valueAsNumber;
    if (this.required && !v) {
      return { flags: { valueMissing: true }, message: 'This field is required' };
    }
    if (v < this.min) {
      return { flags: { rangeUnderflow: true }, message: `Value must be at least ${this.min}` };
    }
    if (v > this.max) {
      return { flags: { rangeOverflow: true }, message: `Value must be at most ${this.max}` };
    }
    return { flags: {}, message: '' };
  }

  private renderThumb(thumb: ThumbId): TemplateResult {
    const isEnd = thumb === 'max';
    const val = this.getThumbValue(thumb);
    const pct = this.valToPercent(val);

    return html`
      <div class="thumb" part=${isEnd ? 'thumb-end' : 'thumb'}
        role="slider"
        ?hidden=${isEnd && !this.range}
        style="left: ${pct}%"
        tabindex=${this.disabled || (isEnd && !this.range) ? -1 : 0}
        data-thumb=${thumb}
        @keydown=${this.handleThumbKeyDown}
      >
        <div class="thumb-content">
          <slot name=${isEnd ? 'thumb-end' : 'thumb'}></slot>
        </div>
        <u-tooltip
          ?disabled=${!this.showTooltip} 
          placement="top"
          offset="8"
        >
          ${this.formatValue(val)}
        </u-tooltip>
      </div>
    `;
  }

  private formatDisplay(): string {
    if (this.range) {
      return `${this.formatValue(this.minVal)} – ${this.formatValue(this.maxVal)}`;
    } else {
      return this.formatValue(this.valueAsNumber);
    }
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

  // 값을 step 단위로 보정하고, min/max 범위 내로 클램핑
  private snap(val: number): number {
    const stepped = Math.round((val - this.min) / this.step) * this.step + this.min;
    return Math.min(this.max, Math.max(this.min, parseFloat(stepped.toFixed(10))));
  }

  private getThumbValue(thumb: ThumbId): number {
    if (thumb === 'max') return this.maxVal;
    return this.range ? this.minVal : this.valueAsNumber;
  }

  private handleContainerPointerDown = (e: PointerEvent) => {
    if (this.disabled || this.readonly) return;

    const getPointerValue = (ev: PointerEvent) => {
      if (!this.trackEl) return 0;
      const rect = this.trackEl.getBoundingClientRect();
      const pct = (Math.max(0, Math.min(rect.width, ev.clientX - rect.left)) / rect.width) * 100;
      return this.percentToVal(pct);
    }

    const val = getPointerValue(e);
    if (this.range) {
      const closer = Math.abs(val - this.minVal) <= Math.abs(val - this.maxVal) ? 'min' : 'max';
      this.dragging = closer;
      if (closer === 'min') this.minVal = val; 
      else this.maxVal = val;
    } else {
      this.dragging = 'min';
      this.value = val;
    }

    const handleDocumentMove = (ev: PointerEvent) => {
      ev.preventDefault();
      const val = getPointerValue(ev);
      if (this.dragging === 'min') {
        if (this.range) this.minVal = Math.min(val, this.maxVal);
        else this.value = val;
      } else if (this.dragging === 'max') {
        this.maxVal = Math.max(val, this.minVal);
      }
    };

    const handleDocumentUp = () => {
      document.removeEventListener('pointermove', handleDocumentMove);
      document.removeEventListener('pointerup', handleDocumentUp);
      this.dragging = null;
    };

    document.addEventListener('pointermove', handleDocumentMove);
    document.addEventListener('pointerup', handleDocumentUp);
  };

  private handleThumbKeyDown = (e: KeyboardEvent) => {
    if (this.disabled || this.readonly) return;

    const thumb = (e.currentTarget as HTMLElement).dataset.thumb as ThumbId;
    const currentVal = this.getThumbValue(thumb);
    const bigStep = (this.max - this.min) / 10;

    let delta: number;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowUp':
        delta = this.step;
        break;
      case 'ArrowLeft':  case 'ArrowDown':
        delta = -this.step;
        break;
      case 'PageUp':
        delta = bigStep;
        break;
      case 'PageDown':
        delta = -bigStep;              
        break;
      case 'Home':
        delta = this.min - currentVal; 
        break;
      case 'End':
        delta = this.max - currentVal; 
        break;
      default:
        return;
    }

    e.preventDefault();
    const newVal = this.snap(currentVal + delta);

    if (thumb === 'min') {
      if (this.range) this.minVal = Math.min(newVal, this.maxVal);
      else this.value = newVal;
    } else {
      this.maxVal = Math.max(newVal, this.minVal);
    }
  };
}
