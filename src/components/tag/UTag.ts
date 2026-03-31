import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UTag.styles.js";

export type TagVariant = "solid" | "surface" | "filled" | "outlined";
export type TagColor =
  | "neutral" | "blue" | "green" | "yellow" | "red"
  | "orange" | "teal" | "cyan" | "purple" | "pink";

/**
 * 레이블, 카테고리, 상태 등을 표시하는 태그 컴포넌트입니다.
 *
 * @slot - 태그 메인 콘텐츠
 * @slot prefix - 태그 앞에 표시할 콘텐츠
 * @slot suffix - 태그 뒤에 표시할 콘텐츠
 *
 * @csspart content - 콘텐츠 영역
 *
 * @cssprop --tag-color - 텍스트 색상
 * @cssprop --tag-bg-color - 배경 색상
 * @cssprop --tag-border-color - 테두리 색상
 */
@customElement('u-tag')
export class UTag extends UElement {
  static styles = [ super.styles, styles ];

  /** 태그의 스타일 변형을 설정합니다. */
  @property({ type: String, reflect: true }) variant: TagVariant = "filled";
  /** 태그의 색상을 설정합니다. */
  @property({ type: String, reflect: true }) color: TagColor = "neutral";
  /** 태그를 둥글게 표시합니다. */
  @property({ type: Boolean, reflect: true }) rounded = false;

  render() {
    return html`
      <slot name="prefix"></slot>
      <span class="content" part="content">
        <slot></slot>
      </span>
      <slot name="suffix"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-tag': UTag;
  }
}