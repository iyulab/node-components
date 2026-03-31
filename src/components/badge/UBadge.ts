import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UBadge.styles.js";

export type BadgeVariant = "pill" | "dot" | "square";
export type BadgeColor =
  | "neutral" | "blue" | "green" | "yellow" | "red"
  | "orange" | "teal" | "cyan" | "purple" | "pink";
export type BadgeAnchor =
  | "top-right" | "top-left" | "bottom-right" | "bottom-left";

/**
 * 상태, 숫자, 알림 등의 정보를 배지로 표시하는 컴포넌트입니다.
 * anchor 속성으로 특정 요소 위치에 배치할 수 있습니다.
 *
 * @slot prefix - 배지 앞에 배치할 컨텐츠
 * @slot - 배지의 주요 컨텐츠 (텍스트, 아이콘)
 * @slot suffix - 배지 뒤에 배치할 컨텐츠
 */
@customElement('u-badge')
export class UBadge extends UElement {
  static styles = [ super.styles, styles ];

  /** 배지 유형 */
  @property({ type: String, reflect: true }) variant: BadgeVariant = "pill";
  /** 배지 색상 */
  @property({ type: String, reflect: true }) color: BadgeColor = "neutral";
  /** 부모 요소 기준 배치 위치 (설정 시 position: absolute) */
  @property({ type: String, reflect: true }) anchor?: BadgeAnchor;

  render() {
    if (this.variant === "dot")
      return nothing;

    return html`
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-badge': UBadge;
  }
}

