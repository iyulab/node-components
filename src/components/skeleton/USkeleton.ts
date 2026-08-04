import { html, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { UElement } from '../UElement.js';
import { styles } from './USkeleton.styles.js';

export type SkeletonShape = 'rectangle' | 'circle' | 'rounded';
export type SkeletonEffect = 'none' | 'pulse' | 'shimmer';

/**
 * 콘텐츠 로딩 중임을 나타내는 스켈레톤 컴포넌트입니다.
 *
 * @slot - 내부 콘텐츠 (로딩 완료 후 표시)
 * 
 * @cssprop --skeleton-width - 스켈레톤의 너비 (기본값: 100%)
 * @cssprop --skeleton-height - 스켈레톤의 높이 (기본값: 1em)
 * @cssprop --skeleton-color - 스켈레톤의 기본 색상 (기본값: var(--u-neutral-200, #EEEEEE))
 * @cssprop --skeleton-shimmer-color - shimmer 효과의 색상 (기본값: var(--u-neutral-100, #F5F5F5))
 */
@customElement('u-skeleton')
export class USkeleton extends UElement {
  static styles = [super.styles, styles];

  /** 모양 */
  @property({ type: String, reflect: true }) shape: SkeletonShape = 'rectangle';
  /** 애니메이션 효과 */
  @property({ type: String, reflect: true }) effect: SkeletonEffect = 'shimmer';
  /** 너비 (CSS 값) */
  @property({ type: String }) width?: string;
  /** 높이 (CSS 값) */
  @property({ type: String }) height?: string;
  /**
   * 여러 줄 자리표시자로 그릴 줄 수. **2 이상일 때만** 호스트가 «막대들의 통»이 되고,
   * 마지막 줄은 짧게(`--skeleton-last-line-width`, 기본 60%) 그린다 — 문단의 끝을 그렇게 읽는다.
   *
   * ⚠**단일 막대(기본)의 모양은 바꾸지 않는다** — 이 속성이 없으면 종전과 완전히 같다.
   */
  @property({ type: Number, reflect: true }) lines?: number;

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
    const n = this.lines ?? 0;
    if (n < 2) return html`<slot></slot>`;
    return html`${Array.from({ length: n }, () => html`<span class="line" part="line"></span>`)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-skeleton': USkeleton;
  }
}
