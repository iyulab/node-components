import { html, nothing } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UBadge.styles.js";

export type BadgeVariant = 
  | "pill" | "dot" | "square";
export type BadgeColor =
  | "neutral" | "blue" | "green" | "yellow" | "red"
  | "orange" | "teal" | "cyan" | "purple" | "pink";
export type BadgeAnchor =
  | "top-right" | "top-left" | "bottom-right" | "bottom-left";

/**
 * Badge 컴포넌트는 상태, 카운트, 라벨 등을 작은 배지로 표시합니다.
 * dot variant로 알림 인디케이터로도 사용할 수 있습니다.
 * anchor 속성으로 부모 요소의 구석에 위치시킬 수 있습니다.
 * 
 * @slot prefix - 배지 앞에 위치할 콘텐츠 (예: 아이콘)
 * @slot - 배지의 주요 콘텐츠 (예: 숫자, 텍스트)
 * @slot suffix - 배지 뒤에 위치할 콘텐츠 (예: 아이콘)
 */
export class UBadge extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 배지 형태 */
  @property({ type: String, reflect: true }) variant: BadgeVariant = "pill";
  /** 배지 색상 */
  @property({ type: String, reflect: true }) color: BadgeColor = "neutral";
  /** 부모 요소 기준 위치 (설정 시 position: absolute) */
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
