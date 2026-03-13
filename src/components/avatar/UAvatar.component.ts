import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UAvatar.styles.js";

export type AvatarShape = "circle" | "square" | "rounded";

/**
 * Avatar 컴포넌트는 이미지, 라벨, 또는 슬롯 콘텐츠를 표시합니다.
 * 
 * @slot - 아바타 콘텐츠 (이미지 또는 라벨이 없는 경우 표시)
 */
export class UAvatar extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 아바타 형태 */
  @property({ type: String, reflect: true }) shape: AvatarShape = "circle";
  /** 아웃라인 표시 */
  @property({ type: Boolean, reflect: true }) outline: boolean = false;
  /** 이미지 URL */
  @property({ type: String }) image?: string;
  /** 라벨 텍스트 (이미지가 없을 때 표시) */
  @property({ type: String }) label?: string;

  /** 이미지 로드 실패 여부 */
  @state() private errored: boolean = false;

  protected willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);

    if (changedProperties.has("image")) {
      this.errored = false;
    }
  }

  render() {
    if (this.image && !this.errored) {
      return html`
        <img
          src=${this.image}
          @error=${this.handleImageError}
        />`;
    }

    if (this.label) {
      return html`
        <span class="label">
          ${this.label.slice(0, 2)}
        </span>`;
    }

    return html`<slot></slot>`;
  }

  /** 이미지 로드 실패 시 호출되어 에러 상태로 전환합니다. */
  private handleImageError = () => {
    this.errored = true;
  }
}
