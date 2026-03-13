import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UTag.styles.js";

export type TagVariant = "solid" | "surface" | "filled" | "outlined";
export type TagColor =
  | "neutral" | "blue" | "green" | "yellow" | "red"
  | "orange" | "teal" | "cyan" | "purple" | "pink";

/**
 * Tag 컴포넌트는 레이블, 카테고리, 상태 등을 표시하는데 사용됩니다.
 * 
 * @slot - 태그 내부에 표시할 콘텐츠를 삽입합니다.
 * @slot prefix - 태그의 접두사로 표시할 콘텐츠를 삽입합니다.
 * @slot suffix - 태그의 접미사로 표시할 콘텐츠를 삽입합니다.
 *
 * @csspart content - 콘텐츠 영역
 * @csspart remove-btn - 삭제 버튼
 *
 * @cssprop --tag-color - 텍스트 색상
 * @cssprop --tag-bg-color - 배경 색상
 * @cssprop --tag-border-color - 테두리 색상
 */
export class UTag extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 태그의 스타일 변형을 설정합니다. */
  @property({ type: String, reflect: true }) variant: TagVariant = "filled";
  /** 태그의 색상을 설정합니다. */
  @property({ type: String, reflect: true }) color: TagColor = "neutral";
  /** 태그를 둥글게 표시합니다. */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 태그를 제거 가능하게 설정합니다. */
  @property({ type: Boolean, reflect: true }) removable = false;

  render() {
    return html`
      <slot name="prefix"></slot>
      <span class="content" part="content">
        <slot></slot>
      </span>
      <slot name="suffix"></slot>
      
      <button class="remove-btn" part="remove-btn"
        ?hidden=${!this.removable}
        @click=${this.handleRemoveClick}>
        &times;
      </button>
    `;
  }

  private handleRemoveClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (!this.emit('u-remove')) return;
    
    this.remove();
  };
}
