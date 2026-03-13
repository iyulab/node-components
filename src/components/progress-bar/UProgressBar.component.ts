import { html, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';

import { UElement } from '../UElement.js';
import { styles } from './UProgressBar.styles.js';

/** 진행 바의 상태 타입 */
export type ProgressBarStatus = 'default' | 'success' | 'warning' | 'error' | 'info';

/**
 * ProgressBar 컴포넌트는 진행 상태를 시각적으로 표시합니다.
 * 로딩 상태나 작업 진행률을 표시하는데 사용됩니다.
 *
 * @cssvar --bar-height - 바의 높이 (기본: 0.5em)
 * @cssvar --bar-color - 바 색상 
 * @cssvar --track-color - 트랙 배경색
 * @cssvar --buffer-color - 버퍼 바 색상
 *
 * @slot - 바 위에 표시할 콘텐츠 (예: 퍼센트)
 */
export class UProgressBar extends UElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {};

  /** 불확정 상태 (로딩 애니메이션 표시) */
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  /** 줄무늬 효과 */
  @property({ type: Boolean, reflect: true }) striped = false;
  /** 둥근 모서리 (false일 경우 직각) */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 상태 (색상 변경) */
  @property({ type: String, reflect: true }) status: ProgressBarStatus = 'default';
  /** 세그먼트 개수 (바를 쪼개서 표시) */
  @property({ type: Number }) segments: number = 0;
  /** 세그먼트 간격 (px) */
  @property({ type: Number, attribute: "segment-gap" }) segmentGap: number = 3;
  /** 최소값 */
  @property({ type: Number }) min: number = 0;
  /** 최대값 */
  @property({ type: Number }) max: number = 100;
  /** 버퍼값 (value보다 앞서 로드된 양 표시) */
  @property({ type: Number }) buffer?: number;
  /** 현재값 */
  @property({ type: Number }) value: number = 0;

  /** 내부 진행률 (0~1) */
  @state() private progress: number = 0;
  /** 내부 버퍼 진행률 (0~1) */
  @state() private bufferProgress: number = 0;

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has('min') || changedProperties.has('max') ||
        changedProperties.has('value') || changedProperties.has('buffer')) {
      this.progress = this.calcProgress(this.value);
      this.bufferProgress = this.buffer !== undefined ? this.calcProgress(this.buffer) : 0;
    }
  }

  render() {
    const hasBuffer = this.buffer !== undefined && !this.indeterminate;
    const hasSegments = this.segments > 1;

    return html`
      <!-- 버퍼 바 (value보다 앞서 로드된 양) -->
      <div class="buffer" part="buffer" ?hidden=${!hasBuffer}
        style=${`transform: scaleX(${this.bufferProgress})`}
      ></div>

      <!-- 진행 바 -->
      <div class="indicator" part="indicator"
        style=${this.indeterminate ? '' : `transform: scaleX(${this.progress})`}
      ></div>

      <!-- 세그먼트 간격 -->
      <div class="segments" part="segments" ?hidden=${!hasSegments}>
        ${Array.from({ length: Math.max(this.segments - 1, 0) }, (_, i) => {
          const left = ((i + 1) / this.segments) * 100;
          return html`<div class="segment-gap" style="left: ${left}%; width: ${this.segmentGap}px;"></div>`;
        })}
      </div>

      <!-- 콘텐츠 슬롯 -->
      <div class="content" part="content">
        <slot></slot>
      </div>
    `;
  }

  /** 값을 0~1 사이 진행률로 변환 */
  private calcProgress(value: number): number {
    const range = this.max - this.min;
    if (range === 0) return 0;
    const clamped = Math.max(this.min, Math.min(this.max, value));
    const p = (clamped - this.min) / range;
    return isNaN(p) ? 0 : p;
  }
}
