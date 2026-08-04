import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import '../icon/UIcon.js';

import { UElement } from "../UElement.js";
import { styles } from "./UExpander.styles.js";
import { type ExpandEventDetail } from "../../events/ExpandEvent.js";
import { type CollapseEventDetail } from "../../events/CollapseEvent.js";

/**
 * 제목을 눌러 본문을 접고 펴는 디스클로저(익스팬더) 컴포넌트입니다.
 *
 * @slot - 펼쳤을 때 보이는 본문
 * @slot header - 제목 영역을 통째로 대체하는 콘텐츠 (`label` 보다 우선)
 * @slot suffix - 제목 우측에 놓이는 콘텐츠 (상태 배지·보조 액션 등)
 *
 * @csspart header - 제목 버튼 영역
 * @csspart icon - 펼침 표시 아이콘
 * @csspart label - 제목 텍스트 영역
 * @csspart content - 본문을 감싸는 영역
 *
 * @event expand - 펼쳐질 때 발생 (취소 가능)
 * @event collapse - 접힐 때 발생 (취소 가능)
 */
@customElement('u-expander')
export class UExpander extends UElement {
  static styles = [super.styles, styles];

  /** 펼침 여부 */
  @property({ type: Boolean, reflect: true }) open = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 제목 텍스트 (`header` 슬롯이 있으면 그쪽이 이깁니다) */
  @property({ type: String }) label = "";

  render() {
    return html`
      <div class="frame">
        <button class="header" part="header" type="button"
          aria-expanded=${this.open ? 'true' : 'false'}
          aria-controls="content"
          ?disabled=${this.disabled}
          @click=${this.handleClick}
        >
          <u-icon class="icon" part="icon" lib="internal" name="chevron-right"></u-icon>
          <span class="label" part="label"><slot name="header">${this.label}</slot></span>
          <slot name="suffix"></slot>
        </button>

        <div class="content" part="content" id="content" role="region">
          <div class="inner">
            <div class="body"><slot></slot></div>
          </div>
        </div>
      </div>
    `;
  }

  /** 펼칩니다. `expand` 이벤트가 취소되면 아무 일도 하지 않고 `false` 를 돌려줍니다. */
  public expand(): boolean {
    if (this.disabled || this.open) return false;
    if (this.fire<ExpandEventDetail>('expand')) {
      this.open = true;
      return true;
    }
    return false;
  }

  /** 접습니다. `collapse` 이벤트가 취소되면 아무 일도 하지 않고 `false` 를 돌려줍니다. */
  public collapse(): boolean {
    if (this.disabled || !this.open) return false;
    if (this.fire<CollapseEventDetail>('collapse')) {
      this.open = false;
      return true;
    }
    return false;
  }

  /** 현재 상태의 반대로 바꿉니다. */
  public toggle(): boolean {
    return this.open ? this.collapse() : this.expand();
  }

  private handleClick = () => {
    this.toggle();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-expander': UExpander;
  }
}
