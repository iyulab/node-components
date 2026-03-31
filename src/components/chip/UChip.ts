import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import '../tag/UTag.js';
import '../icon/UIcon.js';
import '../button/UButton.js';
import '../tooltip/UTooltip.js';

import { UElement } from "../UElement.js";
import { type TagVariant, type TagColor } from "../tag/UTag.js";
import { styles } from "./UChip.styles.js";
import { type PickEventDetail } from "../../events/PickEvent.js";
import { type RemoveEventDetail } from "../../events/RemoveEvent.js";

/**
 * 태그 상태 표시 또는 선택 UI와 인터랙션(선택, 삭제)을 지원하는 칩 컴포넌트입니다.
 *
 * @slot - 칩의 주요 콘텐츠
 * @slot prefix - 칩의 앞에 표시할 콘텐츠
 * @slot suffix - 칩의 뒤에 표시할 콘텐츠
 * @slot tooltip - 툴팁 표시
 * 
 * @csspart tag - 내부 UTag 요소
 * @csspart check - 선택 상태를 나타내는 체크 아이콘
 * @csspart remove - 삭제 버튼
 * @csspart tooltip - 툴팁 요소
 *
 * @event pick - 선택 시 발생
 * @event remove - 삭제 버튼 클릭 시 발생
 */
@customElement('u-chip')
export class UChip extends UElement {
  static styles = [super.styles, styles];

  /** 칩의 스타일 변형 */
  @property({ type: String, reflect: true }) variant: TagVariant = 'filled';
  /** 칩의 색상 */
  @property({ type: String, reflect: true }) color: TagColor = 'neutral';
  /** 둥근 모서리 여부 */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 삭제 가능 여부 */
  @property({ type: Boolean, reflect: true }) removable = false;
  /** 선택 가능 여부 */
  @property({ type: Boolean, reflect: true }) selectable = false;
  /** 선택 상태 */
  @property({ type: Boolean, reflect: true }) selected = false;
  /** 칩의 고유값 */
  @property({ type: String }) value: string = '';

  render() {
    return html`
      <u-tag part="tag"
        .variant=${this.variant}
        .color=${this.color}
        .rounded=${this.rounded}
        @click=${this.handleTagClick}
      >
        <u-icon class="check-icon" part="check" slot="prefix"
          ?hidden=${!this.selectable || !this.selected}  
          lib="internal" 
          name="check-lg"
        ></u-icon>

        <slot name="prefix" slot="prefix"></slot>
        <slot></slot>
        <slot name="suffix" slot="suffix"></slot>
        
        <u-button class="remove-btn" part="remove" slot="suffix"
          ?hidden=${!this.removable}
          rounded
          variant="ghost"
          tabindex="-1"
          aria-label="Remove"
          @click=${this.handleRemoveClick}>
          <u-icon lib="internal" name="x-lg"></u-icon>
        </u-button>
      </u-tag>

      <u-tooltip part="tooltip">
        <slot name="tooltip"></slot>
      </u-tooltip>
    `;
  }

  private handleTagClick = (e: PointerEvent) => {
    if (!this.selectable) return;
    
    this.selected = !this.selected;
    this.fire<PickEventDetail>('pick', {
      detail: {
        value: this.value,
        selected: this.selected,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
      },
    });
  }

  private handleRemoveClick = (e: PointerEvent) => {
    e.stopImmediatePropagation();
    if(this.fire<RemoveEventDetail>('remove')) {
      this.remove();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-chip': UChip;
  }
}
