import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { styles } from './ProgressRing.styles.js';

/** 원형 진행 표시기의 둘레 길이 계산을 위한 상수 */
const PATH_LENGTH = 100;
/** 원형 진행 표시기의 변형 타입 */
export type ProgressRingVariant = 'smooth' | 'blocks' | 'ticks';

/**
 * ProgressRing 컴포넌트는 원형 진행 표시기를 제공합니다.
 * 진행 상태를 시각적으로 나타내며, 크기와 두께를 스타일 속성으로 조절할 수 있습니다.
 */
export class ProgressRing extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  @state() progress: number = 0;
  @state() dasharray: string = PATH_LENGTH.toString();

  /** 진행 표시기의 스타일 변형을 설정합니다. */
  @property({ type: String, reflect: true }) variant: ProgressRingVariant = 'smooth';
  /** 진행 표시기의 최소값을 설정합니다. */
  @property({ type: Number }) minValue = 0;
  /** 진행 표시기의 최대값을 설정합니다. */
  @property({ type: Number }) maxValue = 100;
  /** 진행 표시기의 현재 값을 설정합니다. */
  @property({ type: Number }) value = 0;

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has('variant')) {
      this.updateDashArray();
    }
    if (changedProperties.has('minValue') || 
        changedProperties.has('maxValue') || 
        changedProperties.has('value')) {
      this.updateProgress();
    }
  }

  render() {
    return html`
      <svg class="progress-ring" part="base">
        <defs>
          <mask id="progress-mask">
            <circle
              pathLength="${PATH_LENGTH}"
              stroke="white"
              stroke-dasharray="${PATH_LENGTH}"
              stroke-dashoffset="${PATH_LENGTH * (1 - this.progress)}"
            ></circle>
          </mask>
        </defs>
        
        <circle 
          class="track"
          pathLength="${PATH_LENGTH}"
          stroke-dasharray="${this.dasharray}"
        ></circle>
        <circle 
          class="indicator"
          pathLength="${PATH_LENGTH}"
          stroke-dasharray="${this.dasharray}"
          mask="url(#progress-mask)"
        ></circle>
      </svg>
      <div class="label" part="label">
        ${Math.round(this.progress * 100)}%
      </div>
    `;
  }

  /** 
   * 진행 상태를 0과 1 사이의 값으로 반환합니다. 
   */
  private updateProgress() {
    const range = this.maxValue - this.minValue;
    const clampedValue = Math.max(this.minValue, Math.min(this.maxValue, this.value));
    this.progress = range === 0 ? 0 : ((clampedValue - this.minValue) / range);
  }

  /** 
   * variant에 따라 dasharray 값을 반환합니다. 
   * [dash-length] [gap-length] or [dash-length] 형식
   */
  private updateDashArray() {
    if (this.variant === 'ticks') {
      this.dasharray = "1 1" // 50개 틱 [1 길이, 1 간격]
    } else if (this.variant === 'blocks') {
      this.dasharray = "8 2" // 10개 블록 [8 길이, 2 간격]
    } else {
      this.dasharray = PATH_LENGTH.toString(); // 매끄러운 원형
    }
  }
}