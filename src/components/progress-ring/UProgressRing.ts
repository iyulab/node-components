import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from './UProgressRing.styles.js';

const PATH_LENGTH = 100;
const RADIUS = 44;

export type ProgressRingStatus = 'default' | 'success' | 'warning' | 'error' | 'info';

/**
 * 원형 진행 표시기 컴포넌트입니다.
 *
 * @slot - 링 중앙에 표시할 콘텐츠 (예: 퍼센트)
 *
 * @csspart svg - 링을 감싸는 SVG 요소
 * @csspart content - 링 중앙의 콘텐츠 래퍼
 * 
 * @cssprop --progress-ring-size - 링의 크기 (기본: 6em)
 * @cssprop --progress-ring-color - 링 색상
 * @cssprop --progress-ring-track-width - 트랙/링 두께 (기본: 6)
 * @cssprop --progress-ring-track-color - 트랙 배경색
 * @cssprop --progress-ring-buffer-color - 버퍼 링 색상
 */
@customElement('u-progress-ring')
export class UProgressRing extends UElement {
  static styles = [super.styles, styles];

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

  @state() private progress: number = 0;
  @state() private bufferProgress: number = 0;
  @state() private dasharray: string = PATH_LENGTH.toString();

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
              stroke-width="var(--progress-ring-track-width, 6)"
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
              stroke-width="var(--progress-ring-track-width, 6)"
              stroke-dasharray="${PATH_LENGTH}"
              stroke-dashoffset="${bufferOffset}"
              stroke-linecap="${linecap}"
            />
          </mask>
        </defs>

        <circle class="track"
          cx="50" cy="50" r="${RADIUS}"
          pathLength="${PATH_LENGTH}"
          stroke-dasharray="${this.dasharray}"
          stroke-linecap="${linecap}"
        ></circle>

        <circle class="buffer"
          cx="50" cy="50" r="${RADIUS}"
          ?hidden=${!hasBuffer}
          pathLength="${PATH_LENGTH}"
          stroke-dasharray="${this.dasharray}"
          stroke-linecap="${linecap}"
          mask="url(#${bufferMaskId})"
        ></circle>

        <circle class="indicator determinate"
          cx="50" cy="50" r="${RADIUS}"
          ?hidden=${this.indeterminate}
          pathLength="${PATH_LENGTH}"
          stroke-dasharray="${this.dasharray}"
          stroke-linecap="${linecap}"
          mask="url(#${maskId})"
        ></circle>

        <circle class="indicator indeterminate"
          cx="50" cy="50" r="${RADIUS}"
          ?hidden=${!this.indeterminate}
          pathLength="${PATH_LENGTH}"
        ></circle>
      </svg>

      <div class="content" part="content">
        <slot></slot>
      </div>
    `;
  }

  private calcProgress(value: number): number {
    const range = this.max - this.min;
    if (range === 0) return 0;
    const clamped = Math.max(this.min, Math.min(this.max, value));
    const p = (clamped - this.min) / range;
    return isNaN(p) ? 0 : p;
  }

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

declare global {
  interface HTMLElementTagNameMap {
    'u-progress-ring': UProgressRing;
  }
}
