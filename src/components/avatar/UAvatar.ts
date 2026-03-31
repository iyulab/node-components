import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UAvatar.styles.js";

export type AvatarShape = "circle" | "square" | "rounded";

/**
 * 이미지, 라벨, 또는 슬롯 콘텐츠를 표시하는 아바타 컴포넌트입니다.
 *
 * @slot - 이미지나 라벨이 없을 때 표시할 커스텀 콘텐츠
 * 
 * @csspart image - 아바타 이미지 요소
 * @csspart label - 이니셜 라벨 텍스트 요소
 */
@customElement('u-avatar')
export class UAvatar extends UElement {
  static styles = [ super.styles, styles ];

  /** 아바타 형태 */
  @property({ type: String, reflect: true }) shape: AvatarShape = "circle";
  /** 아웃라인 표시 */
  @property({ type: Boolean, reflect: true }) outline: boolean = false;
  /** 이미지 URL */
  @property({ type: String }) image?: string;
  /** 이니셜 라벨 텍스트 (이미지가 없을 때 표시) */
  @property({ type: String }) label?: string;

  render() {
    if (this.image) {
      return html`
        <img part="image"
          src=${this.image}
          alt=${this.label || "Avatar"}
        />`;
    }

    if (this.label) {
      return html`
        <span part="label" class="label">
          ${this.label.slice(0, 2)}
        </span>`;
    }

    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-avatar': UAvatar;
  }
}

