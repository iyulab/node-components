import { html, PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';

import { BaseElement } from '../BaseElement.js';
import { styles } from './ProgressBar.styles.js';

/**
 * ProgressBar 컴포넌트는 진행 상태를 시각적으로 표시합니다.
 * 로딩 상태나 작업 진행률을 표시하는데 사용됩니다.
 */
export class ProgressBar extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  @query('.indicator') indicatorEl!: HTMLElement;

  /** 내부 진행 상태 */
  @state() progressState: 'turned-on' | 'turned-off' | 'determinate' | 'indeterminate' = 'turned-on';
  /** 내부 진행 상태 (0과 1 사이 값) */
  @state() progress: number = 0;

  /** 불확정 상태 (로딩 애니메이션 표시) */
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  /** 최소값 (기본값: 0) */
  @property({ type: Number }) minValue = 0;
  /** 최대값 (기본값: 100) */
  @property({ type: Number }) maxValue = 100;
  /** 현재값 */
  @property({ type: Number }) value = 0;

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has('indeterminate')) {
      this.progressState = this.indeterminate ? 'indeterminate' : 'turned-on';
    }

    if (changedProperties.has('minValue') || 
        changedProperties.has('maxValue') || 
        changedProperties.has('value')) {
      this.updateProgress();
    }
  }

  render() {
    return html`
      <div class="indicator" part="indicator"
        state=${this.progressState}
      ></div>
      <div class="content" part="content">
        <slot></slot>
      </div>
    `;
  }

  /** 내부 진행 상태 업데이트 */
  private async updateProgress(): Promise<void> {
    await this.updateComplete;
    if (this.indeterminate) return;

    const range = this.maxValue - this.minValue;
    const clampedValue = Math.max(this.minValue, Math.min(this.maxValue, this.value));
    const progress = range === 0 ? 0 : ((clampedValue - this.minValue) / range);
    if (isNaN(progress)) return;

    // 처음 시작하거나 역방향 진행 시 리셋
    if (this.progress <= 0 || (progress < this.progress)) {
      this.progressState = 'turned-on';
      await this.updateComplete;
      this.progressState = 'determinate';
    }

    // 정상 진행 시
    if (this.progressState === 'determinate') {
      this.indicatorEl.style.setProperty('--progress-value', progress.toString());
    }

    // 완료시 끄기 애니메이션 후 리셋
    if (progress >= 1) {
      setTimeout(() => {
        this.progressState = 'turned-off';
        setTimeout(() => {
          this.progressState = 'turned-on';
        }, 500);
      }, 300);
    }

    this.progress = progress;
  }
}