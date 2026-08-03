import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { statusIcon } from "../../utilities/statusIcon.js";
import { styles } from "./UBadge.styles.js";
import '../icon/UIcon.js';

export type BadgeVariant = "pill" | "dot" | "square";
/** 역할 축(`primary`…`danger`, 의미 · 리브랜딩을 따라옴)과 장식 축(`blue`…, 색 자체 · 면역)이 병존한다. */
export type BadgeColor =
  | "neutral"
  | "primary" | "info" | "success" | "warning" | "danger"
  | "blue" | "green" | "yellow" | "red"
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
 * @cssprop --badge-padding-block - 세로 여백 (`variant="dot"` 은 콘텐츠를 렌더하지 않아 적용되지 않는다)
 * @cssprop --badge-padding-inline - 가로 여백 (`variant="dot"` 은 콘텐츠를 렌더하지 않아 적용되지 않는다)
 */
@customElement('u-badge')
export class UBadge extends UElement {
  static styles = [ super.styles, styles ];

  /** 배지 유형 */
  @property({ type: String, reflect: true }) variant: BadgeVariant = "pill";
  /** 배지 색상 */
  @property({ type: String, reflect: true }) color: BadgeColor = "blue";
  /** 부모 요소 기준 배치 위치 (설정 시 position: absolute) */
  @property({ type: String, reflect: true }) anchor?: BadgeAnchor;
  /**
   * 상태를 **색과 무관하게** 나르는 아이콘을 붙입니다(`info`·`success`·`warning`·`danger`).
   * 의미가 없는 색(`neutral`·`primary`·장식 축)과 `variant="dot"` 에서는 그리지 않습니다.
   */
  @property({ type: Boolean, reflect: true }) icon = false;

  render() {
    if (this.variant === "dot")
      return nothing;

    const iconName = this.icon ? statusIcon(this.color) : undefined;
    return html`
      <div class="base" part="base">
        ${iconName
          ? html`<u-icon class="icon" part="icon" lib="internal" name=${iconName}></u-icon>`
          : nothing}
        <slot name="prefix"></slot>
        <slot></slot>
        <slot name="suffix"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-badge': UBadge;
  }
}

