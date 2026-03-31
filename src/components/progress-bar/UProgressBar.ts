import { html, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { UElement } from '../UElement.js';
import { styles } from './UProgressBar.styles.js';

export type ProgressBarStatus = 'default' | 'success' | 'warning' | 'error' | 'info';

/**
 * 진행 상태를 시각적으로 표시하는 프로그레스 바 컴포넌트입니다.
 *
 * @slot - 바 위에 표시할 콘텐츠 (예: 퍼센트)
 *
 * @csspart buffer - 버퍼 바
 * @csspart indicator - 진행 바
 * @csspart segments - 세그먼트 간격 컨테이너
 * @csspart content - 슬롯 콘텐츠 영역
 *
 * @cssprop --progress-bar-height - 바의 높이 (기본: 0.5em)
 * @cssprop --progress-bar-color - 바 색상
 * @cssprop --progress-bar-track-color - 트랙 배경색
 * @cssprop --progress-bar-buffer-color - 버퍼 바 색상
 */
@customElement('u-progress-bar')
export class UProgressBar extends UElement {
  static styles = [super.styles, styles];

  /** 불확정 상태 (로딩 애니메이션 표시) */
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  /** 줄무늬 효과 */
  @property({ type: Boolean, reflect: true }) striped = false;
  /** 둥근 모서리 */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 상태 (색상 변경) */
  @property({ type: String, reflect: true }) status: ProgressBarStatus = 'default';
  /** 세그먼트 개수 */
  @property({ type: Number }) segments: number = 0;
  /** 세그먼트 간격 (px) */
  @property({ type: Number, attribute: "segment-gap" }) segmentGap: number = 3;
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

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (['min','max','buffer','value'].some(k => changedProperties.has(k))) {
      this.progress = this.calcProgress(this.value);
      this.bufferProgress = this.buffer !== undefined ? this.calcProgress(this.buffer) : 0;
    }
  }

  render() {
    const hasBuffer = this.buffer !== undefined && !this.indeterminate;
    const hasSegments = this.segments > 1;

    return html`
      <div class="buffer" part="buffer" ?hidden=${!hasBuffer}
        style=${`transform: scaleX(${this.bufferProgress})`}
      ></div>

      <div class="indicator" part="indicator"
        style=${this.indeterminate ? '' : `transform: scaleX(${this.progress})`}
      ></div>

      <div class="segments" part="segments" ?hidden=${!hasSegments}>
        ${Array.from({ length: Math.max(this.segments - 1, 0) }, (_, i) => {
          const left = ((i + 1) / this.segments) * 100;
          return html`<div class="segment-gap" style="left: ${left}%; width: ${this.segmentGap}px;"></div>`;
        })}
      </div>

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
}

declare global {
  interface HTMLElementTagNameMap {
    'u-progress-bar': UProgressBar;
  }
}