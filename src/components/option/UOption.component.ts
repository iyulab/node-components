import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UOption.styles.js";

/**
 * Option 컴포넌트는 USelect의 선택 항목을 표현합니다.
 */
export class UOption extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 옵션 값 */
  @property({ type: String, reflect: true }) value: string = '';
  /** 표시 텍스트 (미지정 시 slot textContent 사용) */
  @property({ type: String }) label: string = '';
  /** 비활성화 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 선택 상태 (USelect가 관리) */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;

  render() {
    return html`<slot></slot>`;
  }

  /** 표시 텍스트 반환: label prop 우선, 없으면 textContent */
  public getDisplayLabel(): string {
    return this.label || this.textContent?.trim() || this.value;
  }
}
