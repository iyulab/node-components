import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../../internals/UElement.js";
import { styles } from './ProgressRing.styles.js';

/**
 * ProgressRing 컴포넌트는 원형 진행 표시기를 제공합니다.
 * 진행 상태를 시각적으로 나타내며, 크기와 두께를 조절할 수 있습니다.
 * 
 * @property {string} variant - 스타일 변형 ('smooth' | 'blocks' | 'ticks') 
 * @property {number} value - 현재 값
 * @property {number} minValue - 최소값 (기본: 0)
 * @property {number} maxValue - 최대값 (기본: 100)
 */
export class ProgressRing extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  @property({ type: String, reflect: true }) variant: 'smooth' | 'blocks' | 'ticks' = 'smooth';
  @property({ type: Number }) minValue = 0;
  @property({ type: Number }) maxValue = 100;
  @property({ type: Number }) value = 0;

  render() {
    const progress = this.calcProgress();
    const percent = Math.round(progress * 100);

    // [dash-length] [gap-length]
    const dashArray = 'ticks' === this.variant ? '9 11' // 48개 눈금
        : 'blocks' === this.variant ? '60 20' // 12개 블록
        : '960'; // smooth
    
    return html`
      <svg class="progress-ring" part="base">
        <defs>
          <mask id="progress-mask">
            <circle
              class="mask"
              pathLength="960"
              stroke-dasharray="960"
              stroke-dashoffset="${960 * (1 - progress)}"
            ></circle>
          </mask>
        </defs>
        
        <circle 
          class="track"
          pathLength="960"
          stroke-dasharray="${dashArray}"
        ></circle>
        <circle 
          class="indicator"
          pathLength="960"
          stroke-dasharray="${dashArray}"
          mask="url(#progress-mask)"
        ></circle>
      </svg>
      <div class="label" part="label">${percent}%</div>
    `;
  }

  private calcProgress(): number {
    const min = Number(this.minValue ?? 0);
    const max = Number(this.maxValue ?? 100);
    const val = Math.min(Math.max(Number(this.value ?? 0), min), max);
    return max === min ? 0 : (val - min) / (max - min);
  }
}