import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UButton } from "../button/UButton.component.js";
import { UIcon } from "../icon/UIcon.component.js";
import { styles } from "./UTab.styles.js";

/**
 * Tab 컴포넌트는 탭 패널에서 사용되는 핸들(탭 버튼)입니다.
 * u-tab-panel 내부에서 사용하며, value로 패널과 매칭됩니다.
 *
 * @slot - 탭 라벨 콘텐츠를 삽입합니다.
 * @slot prefix - 탭 라벨 앞에 표시되는 콘텐츠 (아이콘 등)
 * @slot suffix - 탭 라벨 뒤에 표시되는 콘텐츠
 *
 * @fires u-close - 탭 닫기 버튼 클릭 시 발생
 */
export class UTab extends UElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {
    'u-button': UButton,
    'u-icon': UIcon,
  };

  /** 탭 활성 상태 (탭패널에서 자동 관리) */
  @property({ type: Boolean, reflect: true }) active = false;
  /** 탭 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 탭 닫기 가능 여부 */
  @property({ type: Boolean, reflect: true }) closable = false;
  /** 탭 고유값 (패널 매칭시 사용) */
  @property({ type: String, reflect: true }) value = "";

  /** 탭 드래그 여부 (추후 구현) */
  @property({ type: Boolean, reflect: true }) override draggable = false;

  connectedCallback(): void {
    super.connectedCallback();

    if (!this.hasAttribute('slot')) {
      this.setAttribute('slot', 'tab');
    }
    this.setAttribute('role', 'tab');
    this.setAttribute('tabindex', '0');
  }

  render() {
    return html`
      <slot name="prefix"></slot>
      <slot></slot>
      <slot name="suffix"></slot>
      
      <u-button class="close-btn" part="close-btn"
        ?hidden=${!this.closable}
        variant="ghost"
        tabindex="-1"
        aria-label="Close tab"
        @click=${this.handleCloseClick}>
        <u-icon lib="internal" name="x-lg"></u-icon>
      </u-button>
    `;
  }

  private handleCloseClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;
    this.emit('u-close');
  }
}
