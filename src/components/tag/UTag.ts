import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { statusIcon } from "../../utilities/statusIcon.js";
import { styles } from "./UTag.styles.js";
import '../icon/UIcon.js';

export type TagVariant = "solid" | "surface" | "filled" | "outlined";
/**
 * 두 축이 병존한다 — **역할 축**(`primary`·`info`·`success`·`warning`·`danger`)은 *의미*를
 * 말하고 리브랜딩을 따라오며 대비 계약을 물려받는다. **장식 축**(`blue`·`purple` …)은
 * *색 자체*를 말하고 리브랜딩에 의도적으로 면역이다.
 */
export type TagColor =
  | "neutral"
  | "primary" | "info" | "success" | "warning" | "danger"
  | "blue" | "green" | "yellow" | "red"
  | "orange" | "teal" | "cyan" | "purple" | "pink";

/**
 * 레이블, 카테고리, 상태 등을 표시하는 태그 컴포넌트입니다.
 *
 * @slot - 태그 메인 콘텐츠
 * @slot prefix - 태그 앞에 표시할 콘텐츠
 * @slot suffix - 태그 뒤에 표시할 콘텐츠
 *
 * @csspart content - 콘텐츠 영역
 * @csspart icon - 상태 아이콘 (`icon` + 역할 색일 때만 렌더된다)
 *
 * @cssprop --tag-color - 텍스트 색상
 * @cssprop --tag-bg-color - 배경 색상
 * @cssprop --tag-border-color - 테두리 색상
 * @cssprop --tag-fill-color - variant 별 채움 기준색 (기본: --u-primary-color)
 * @cssprop --tag-padding-block - 세로 여백
 * @cssprop --tag-padding-inline - 가로 여백
 * @cssprop --tag-gap - prefix/본문/suffix 사이 간격
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
  /**
   * 상태를 **색과 무관하게** 나르는 아이콘을 붙입니다(`info`·`success`·`warning`·`danger`).
   * 색각 이상·흑백 인쇄에서 상태가 갈리게 하는 축입니다.
   * 의미가 없는 색(`neutral`·`primary`·장식 축)에서는 아무것도 그리지 않습니다.
   */
  @property({ type: Boolean, reflect: true }) icon = false;

  render() {
    const iconName = this.icon ? statusIcon(this.color) : undefined;
    return html`
      <div class="base" part="base">
        ${iconName
          ? html`<u-icon class="icon" part="icon" lib="internal" name=${iconName}></u-icon>`
          : nothing}
        <slot name="prefix"></slot>
        <span class="content" part="content">
          <slot></slot>
        </span>
        <slot name="suffix"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-tag': UTag;
  }
}