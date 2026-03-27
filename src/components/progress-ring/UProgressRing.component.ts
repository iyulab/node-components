import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from './UProgressRing.styles.js';

/** 원형 진행 표시기의 둘레 길이 계산을 위한 상수 */
const PATH_LENGTH = 100;
/** SVG viewBox 기준 반지름 */
const RADIUS = 44;

/** 링의 상태 타입 */
export type ProgressRingStatus = 'default' | 'success' | 'warning' | 'error' | 'info';

/**
 * ProgressRing 컴포넌트는 원형 진행 표시기를 제공합니다.
 * 진행 상태를 시각적으로 나타내며, 크기와 두께를 CSS 변수로 조절할 수 있습니다.
 *
 * @cssvar --ring-size - 링의 크기 (기본: 6em) 
 * @cssvar --ring-color - 링 색상
 * @cssvar --track-width - 트랙/링 두께 (기본: 6)
 * @cssvar --track-color - 트랙 배경색
 * @cssvar --buffer-color - 버퍼 링 색상
 *
 * @slot - 링 중앙에 표시할 콘텐츠 (예: 퍼센트)
 */
export class UProgressRing extends UElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {};

  /** 불확정 상태 (로딩 애니메이션 표시) */
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  /** 둥근 끝 (stroke-linecap: round) */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 상태 (색상 변경) */
  @property({ type: String, reflect: true }) status: ProgressRingStatus = 'default';
  /** 세그먼트 개수 */
  @property({ type: Number }) segments: number = 0;
  /** 세그먼트 간격 (pathLength 기준 비율) */
  @property({ type: Number, attribute: "segment-gap" }) segmentGap: number = 2;
  /** 최소값 */
  @property({ type: Number }) min: number = 0;
  /** 최대값 */
  @property({ type: Number }) max: number = 100;
  /** 버퍼값 */
  @property({ type: Number }) buffer?: number;
  /** 현재값 */
  @property({ type: Number }) value: number = 0;

  /** 내부 진행률 (0~1) */
  @state() private progress: number = 0;
  /** 내부 버퍼 진행률 (0~1) */
  @state() private bufferProgress: number = 0;
  /** 세그먼트용 dasharray */
  @state() private dasharray: string = PATH_LENGTH.toString();

  /** 고유 ID (mask 충돌 방지) */
  private uuid = `pr-${Math.random().toString(36).slice(2, 8)}`;

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (['min','max','buffer','value'].some(k => changedProperties.has(k))) {
      this.progress = this.calcProgress(this.value);
      this.bufferProgress = this.buffer !== undefined ? this.calcProgress(this.buffer) : 0;
    }

    if (['segments','segmentGap'].some(k => changedProperties.has(k))) {
      this.dasharray = this.calcDasharray(this.segments, this.segmentGap);
    }
  }

  render() {
    const hasBuffer = this.buffer !== undefined && !this.indeterminate;
    const linecap = this.rounded ? 'round' : 'butt';
    const progressOffset = PATH_LENGTH * (1 - this.progress);
    const bufferOffset = PATH_LENGTH * (1 - this.bufferProgress);
    const maskId = `${this.uuid}-mask`;
    const bufferMaskId = `${this.uuid}-buf-mask`;

    return html`
      <svg class="ring" part="svg" viewBox="0 0 100 100">
        <defs>
          <mask id="${maskId}">
            <circle class="mask-progress"
              cx="50" cy="50" r="${RADIUS}"
              fill="none"
              pathLength="${PATH_LENGTH}"
              stroke="white"
              stroke-width="var(--track-width, 6)"
              stroke-dasharray="${PATH_LENGTH}"
              stroke-dashoffset="${progressOffset}"
              stroke-linecap="${linecap}"
            />
          </mask>
          <mask id="${bufferMaskId}">
            <circle class="mask-buffer"
              cx="50" cy="50" r="${RADIUS}"
              ?hidden=${!hasBuffer}
              fill="none"
              pathLength="${PATH_LENGTH}"
              stroke="white"
              stroke-width="var(--track-width, 6)"
              stroke-dasharray="${PATH_LENGTH}"
              stroke-dashoffset="${bufferOffset}"
              stroke-linecap="${linecap}"
            />
          </mask>
        </defs>

        <!-- 트랙 -->
        <circle class="track"
          cx="50" cy="50" r="${RADIUS}"
          pathLength="${PATH_LENGTH}"
          stroke-dasharray="${this.dasharray}"
          stroke-linecap="${linecap}"
        ></circle>

        <!-- 버퍼 링 -->
        <circle class="buffer"
          cx="50" cy="50" r="${RADIUS}"
          ?hidden=${!hasBuffer}
          pathLength="${PATH_LENGTH}"
          stroke-dasharray="${this.dasharray}"
          stroke-linecap="${linecap}"
          mask="url(#${bufferMaskId})"
        ></circle>

        <!-- 인디케이터 링 (determinate) -->
        <circle class="indicator determinate"
          cx="50" cy="50" r="${RADIUS}"
          ?hidden=${this.indeterminate}
          pathLength="${PATH_LENGTH}"
          stroke-dasharray="${this.dasharray}"
          stroke-linecap="${linecap}"
          mask="url(#${maskId})"
        ></circle>

        <!-- 인디케이터 링 (indeterminate) -->
        <circle class="indicator indeterminate"
          cx="50" cy="50" r="${RADIUS}"
          ?hidden=${!this.indeterminate}
          pathLength="${PATH_LENGTH}"
        ></circle>
      </svg>

      <!-- 슬롯 콘텐츠 -->
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

  /** 세그먼트 개수와 간격에 따라 dasharray 계산 */
  private calcDasharray(count: number, gap: number) {
    if (count > 1) {
      const totalGap = count * gap;
      const dashLen = (PATH_LENGTH - totalGap) / count;
      return `${Math.max(dashLen, 0.5)} ${gap}`;
    } else {
      return PATH_LENGTH.toString();
    }
  }
}
