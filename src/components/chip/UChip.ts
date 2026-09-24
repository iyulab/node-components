import { html, type PropertyValues } from "lit";
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
import { Locale } from '../../utilities/Locale.js';

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
          name="check"
        ></u-icon>

        <slot name="prefix" slot="prefix"></slot>
        <slot></slot>
        <slot name="suffix" slot="suffix"></slot>
        
        <u-button class="remove-btn" part="remove" slot="suffix"
          ?hidden=${!this.removable}
          rounded
          variant="ghost"
          aria-label=${Locale.getValue('remove')}
          @click=${this.handleRemoveClick}>
          <u-icon lib="internal" name="x"></u-icon>
        </u-button>
      </u-tag>

      <u-tooltip part="tooltip">
        <slot name="tooltip"></slot>
      </u-tooltip>
    `;
  }

  /** 이 요소가 스스로 붙인 `tabindex` 인가 — 소비자가 준 값은 건드리지 않는다. */
  private ownsTabindex = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('keydown', this.handleKeydown);
    super.disconnectedCallback();
  }

  /**
   * `selectable` 칩은 토글 버튼이다(WAI-ARIA APG «Button» · `aria-pressed`) — 역할·포커스·키가
   * 없으면 키보드로 닿지 못하고 보조기기는 토글인지 모른다. 선택할 수 없는 칩은 상태 표시라
   * 탭 순서에 들어오지 않는다.
   */
  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (!changed.has('selectable') && !changed.has('selected')) return;
    if (this.selectable) {
      this.setAttribute('role', 'button');
      this.setAttribute('aria-pressed', String(this.selected));
      if (!this.hasAttribute('tabindex')) {
        this.setAttribute('tabindex', '0');
        this.ownsTabindex = true;
      }
    } else if (changed.has('selectable')) {
      this.removeAttribute('role');
      this.removeAttribute('aria-pressed');
      if (this.ownsTabindex) {
        this.removeAttribute('tabindex');
        this.ownsTabindex = false;
      }
    }
  }

  /** Enter 와 Space 는 클릭과 같다 — 안쪽 삭제 버튼에서 온 키는 그 버튼의 몫이다. */
  private handleKeydown = (e: KeyboardEvent) => {
    if (!this.selectable || e.composedPath()[0] !== this) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this.toggle(e);
  };

  private handleTagClick = (e: PointerEvent) => {
    this.toggle(e);
  };

  private toggle(e: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }): void {
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
    if(this.fire<RemoveEventDetail>('remove', { bubbles: false, composed: false })) {
      this.remove();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-chip': UChip;
  }
}
