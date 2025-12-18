import { html, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { BaseElement } from '../BaseElement.js';
import { styles } from './USkeleton.styles.js';

export type SkeletonShape = 'default' | 'circle' | 'rounded';
export type SkeletonEffect = 'pulse' | 'shimmer' | 'none';

/**
 * 콘텐츠가 로딩 중임을 나타내는 Skeleton 컴포넌트입니다.
 * 다양한 모양과 애니메이션 효과를 지원합니다.
 */
export class USkeleton extends BaseElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof BaseElement> = {};

  /** 모양 (default, circle, rounded) */
  @property({ type: String, reflect: true }) shape: SkeletonShape = 'default';
  /** 애니메이션 효과 (pulse, shimmer, none) */
  @property({ type: String, reflect: true }) effect: SkeletonEffect = 'pulse';
  /** 스켈레톤의 너비 (CSS 값) */
  @property({ type: String }) width?: string;
  /** 스켈레톤의 높이 (CSS 값) */
  @property({ type: String }) height?: string;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('width') && this.width) {
      this.style.setProperty('--skeleton-width', this.width);
    }
    if (changedProperties.has('height') && this.height) {
      this.style.setProperty('--skeleton-height', this.height);
    }
  }

  render() {
    return html`
      <div class="skeleton" part="base"
        shape=${this.shape}
        effect=${this.effect}
      ></div>
    `;
  }
}
