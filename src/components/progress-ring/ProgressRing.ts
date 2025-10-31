import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../../internals/UElement.js";
import { styles } from './ProgressRing.styles.js';

/**
 * ProgressRing 컴포넌트는 원형 진행 표시기를 제공합니다.
 * 진행 상태를 시각적으로 나타내며, 크기와 두께를 조절할 수 있습니다.
 * 대시 스타일로 진행률에 따라 원을 그리며, 중앙에 퍼센트가 표시됩니다.
 * 
 * @property {number} value - 현재 값
 * @property {number} minValue - 최소값 (기본: 0)
 * @property {number} maxValue - 최대값 (기본: 100)
 * @property {number} size - 링의 크기 (픽셀)
 * @property {number} strokeWidth - 선의 두께 (픽셀)
 * @property {number} dashCount - 대시의 개수
 * @property {string} color - 진행률 표시 색상
 */
export class ProgressRing extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  @property({ type: Number }) value: number = 0;
  @property({ type: Number }) minValue: number = 0;
  @property({ type: Number }) maxValue: number = 100;
  @property({ type: Number }) size: number = 120;
  @property({ type: Number }) strokeWidth: number = 8;
  @property({ type: Number }) dashCount: number = 40;
  @property({ type: String }) color: string = 'var(--u-color-primary, #3b82f6)';

  private get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  private get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  private get dashLength(): number {
    return this.circumference / this.dashCount;
  }

  private get gapLength(): number {
    return this.dashLength * 0.3; // 갭은 대시 길이의 30%
  }

  private get dashArray(): string {
    return `${this.dashLength - this.gapLength} ${this.gapLength}`;
  }

  private get progress(): number {
    const range = this.maxValue - this.minValue;
    if (range <= 0) return 0;
    
    const clampedValue = Math.min(Math.max(this.value, this.minValue), this.maxValue);
    return ((clampedValue - this.minValue) / range) * 100;
  }

  private get displayValue(): number {
    return Math.round(this.progress);
  }

  private get dashOffset(): number {
    const progressCircumference = (this.circumference * this.progress) / 100;
    return this.circumference - progressCircumference;
  }

  render() {
    const center = this.size / 2;

    return html`
      <div class="progress-ring" part="base" style="width: ${this.size}px; height: ${this.size}px;">
        <svg
          class="ring-svg"
          part="svg"
          width="${this.size}"
          height="${this.size}"
          viewBox="0 0 ${this.size} ${this.size}">
          
          <!-- 배경 트랙 (회색 대시들) -->
          <circle
            class="track"
            part="track"
            cx="${center}"
            cy="${center}"
            r="${this.radius}"
            fill="none"
            stroke="var(--u-color-neutral-200, #e5e7eb)"
            stroke-width="${this.strokeWidth}"
            stroke-dasharray="${this.dashArray}"
            stroke-linecap="round"
          />
          
          <!-- 진행률 표시 (컬러 대시들) -->
          <circle
            class="indicator"
            part="indicator"
            cx="${center}"
            cy="${center}"
            r="${this.radius}"
            fill="none"
            stroke="${this.color}"
            stroke-width="${this.strokeWidth}"
            stroke-dasharray="${this.dashArray}"
            stroke-dashoffset="${this.dashOffset}"
            stroke-linecap="round"
            transform="rotate(-90 ${center} ${center})"
          />
        </svg>
        
        <!-- 중앙 퍼센트 텍스트 -->
        <div class="percentage" part="percentage">
          <span class="value">${this.displayValue}</span>
          <span class="unit">%</span>
        </div>
      </div>
    `;
  }
}