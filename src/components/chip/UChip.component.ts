import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UTag, type TagVariant, type TagColor } from "../tag/UTag.component.js";
import { UIcon } from "../icon/UIcon.component.js";
import { UButton } from "../button/UButton.component.js";
import { UTooltip } from "../tooltip/UTooltip.component.js";
import { styles } from "./UChip.styles.js";

/**
 * Chip 컴포넌트는 작은 상태 표시 또는 선택 UI로 인터랙션(선택, 삭제)을 지원합니다.
 *
 * @slot - 칩 내부에 표시할 콘텐츠를 삽입합니다.
 * @slot prefix - 칩의 접두사로 표시할 콘텐츠를 삽입합니다.
 * @slot suffix - 칩의 접미사로 표시할 콘텐츠를 삽입합니다.
 * @slot tooltip - 툴팁 표시
 *
 * @fires u-remove - 삭제 버튼 클릭 시 발생
 * @fires u-select - 선택 상태 변경 시 발생
 */
export class UChip extends UElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {
    'u-tag': UTag,
    'u-icon': UIcon,
    'u-button': UButton,
    'u-tooltip': UTooltip,
  };

  /** 칩의 스타일 변형 (u-tag variant와 동일) */
  @property({ type: String, reflect: true }) variant: TagVariant = 'filled';
  /** 칩의 색상 (u-tag color와 동일) */
  @property({ type: String, reflect: true }) color: TagColor = 'neutral';
  /** 둥근 모서리 여부 */
  @property({ type: Boolean, reflect: true }) rounded = false;
  /** 삭제 가능 여부 */
  @property({ type: Boolean, reflect: true }) removable = false;
  /** 선택 가능 여부 */
  @property({ type: Boolean, reflect: true }) selectable = false;
  /** 선택 상태 */
  @property({ type: Boolean, reflect: true }) selected = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick);
    super.disconnectedCallback();
  }

  render() {
    return html`
      <u-tag part="tag"
        .variant=${this.variant}
        .color=${this.color}
        .rounded=${this.rounded}
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

  private handleClick = () => {
    if (!this.selectable) return;
    this.selected = !this.selected;
    this.emit('u-select');
  }

  private handleRemoveClick = (e: MouseEvent) => {
    e.stopPropagation();
    if(this.emit('u-remove')) {
      this.remove();
    }
  }
}
