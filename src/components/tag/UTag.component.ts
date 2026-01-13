import { html } from "lit";
import { property } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { styles } from "./UTag.styles.js";

export type TagVariant = "default" | "info" | "success" | "warning" | "danger";

/**
 * Tag 컴포넌트는 레이블, 카테고리, 상태 등을 표시하는데 사용됩니다.
 * @slot - 태그 내부에 표시할 콘텐츠를 삽입합니다.
 * @slot prefix - 태그의 접두사로 표시할 콘텐츠를 삽입합니다.
 * @slot suffix - 태그의 접미사로 표시할 콘텐츠를 삽입합니다.
 */
export class UTag extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /** 태그의 스타일 변형을 설정합니다. */
  @property({ type: String, reflect: true }) variant: TagVariant = "default";
  /** 태그를 둥글게 표시합니다. */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 태그를 제거 가능하게 설정합니다. */
  @property({ type: Boolean, reflect: true }) removable = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('transitionend', this.handleTransitionEnd);
  }

  disconnectedCallback(): void {
    this.removeEventListener('transitionend', this.handleTransitionEnd);
    super.disconnectedCallback();
  }

  render() {
    return html`
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
      <button class="remove-btn" part="remove-btn"
        ?hidden=${!this.removable}
        @click=${this.handleRemoveButtonClick}>
        &times;
      </button>
    `;
  }

  private handleRemoveButtonClick = (e: MouseEvent) => {
    e.stopPropagation();

    this.emit('u-remove');

    requestAnimationFrame(() => {
      this.style.transform = 'scale(0.8)';
      this.style.opacity = '0';
    });
  }

  private handleTransitionEnd = (e: TransitionEvent) => {
    if (e.propertyName === 'opacity' && this.style.opacity === '0') {
      this.remove();
    }
  };
}