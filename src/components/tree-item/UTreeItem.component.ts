import { html, PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { styles } from "./UTreeItem.styles.js";

/**
 * UTreeItem 컴포넌트는 트리의 개별 노드를 나타냅니다.
 * UTree 컴포넌트와 함께 사용되며, 중첩된 구조를 지원합니다.
 */
export class UTreeItem extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-icon': UIcon,
  };

  @query('.header')
  headerEl!: HTMLElement;

  /** 트리 항목이 리프 노드인지 여부입니다. */
  @state() leaf: boolean = true;
  /** 트리 항목의 들여쓰기 레벨입니다. */
  @state() level: number = 0;
  /** 자식 트리 아이템 배열 */
  private childrenItems: UTreeItem[] = [];

  /** 트리 항목이 비활성화 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 트리 항목이 선택된 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  /** 트리 항목이 확장된 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) expanded: boolean = false;
  /** 트리 항목의 값입니다. */
  @property({ type: String }) value: string = '';

  private mutationObserver?: MutationObserver;

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    
    // DOM 변경 감지를 위한 MutationObserver 설정 (동적 로딩 지원)
    this.mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // 새로 추가된 노드들 처리
          mutation.addedNodes.forEach(node => {
            if (node instanceof Element && 
                node.tagName.toLowerCase() === 'u-tree-item' && 
                !node.hasAttribute('slot')) {
              node.setAttribute('slot', 'children');
            }
          });
        }
      }
    });
    this.mutationObserver.observe(this, { childList: true });
    
    // 초기 자식 요소 처리
    this.processChildren();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.mutationObserver?.disconnect();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    }
    if (changedProperties.has('level')) {
      this.headerEl.style.paddingLeft = `calc(${this.level} * var(--indent-size, 20px))`;
    }
  }

  render() {
    return html`
      <div class="header" @click=${this.handleHeaderClick}>
        <u-icon class="expand-icon"
          ?hidden=${this.leaf}
          lib="internal"
          name=${this.expanded ? 'chevron-down' : 'chevron-right'}
        ></u-icon>
        <slot name="prefix"></slot>
        <span class="label">
          <slot></slot>
        </span>
        <slot name="suffix"></slot>
      </div>
      
      <div class="children" ?hidden=${!this.expanded}>
        <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
      </div>
    `;
  }

  /** 자식 u-tree-item 요소들에 slot 속성 부여 */
  private processChildren(): void {
    // 직접 자식 중 u-tree-item 요소들을 찾아서 slot="children" 부여
    Array.from(this.children).forEach(child => {
      if (child.tagName.toLowerCase() === 'u-tree-item' && !child.hasAttribute('slot')) {
        child.setAttribute('slot', 'children');
      }
    });
  }

  /** 자식 슬롯 변경 시 처리 */
  private handleChildrenSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const assignedElements = slot.assignedElements({ flatten: true });
    
    // u-tree-item만 필터링
    this.childrenItems = assignedElements.filter(
      (el): el is UTreeItem => el.tagName.toLowerCase() === 'u-tree-item'
    ) as UTreeItem[];
    
    this.leaf = this.childrenItems.length === 0;
    
    // 자식 요소들의 레벨 설정
    this.childrenItems.forEach(child => {
      child.level = this.level + 1;
    });
  }

  /** 헤더 클릭 이벤트를 처리합니다. */
  private handleHeaderClick = (e: MouseEvent) => {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (this.leaf) {
      this.selected = true;
      this.emit('u-select', { value: this.value, item: this });
    } else {
      this.expanded = !this.expanded;
      this.emit('u-toggle', { expanded: this.expanded, item: this });
    }
  }
}