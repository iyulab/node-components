import { html, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UFloatingElement } from "../UFloatingElement.js";
import { OverlayManager } from "../../utilities/OverlayManager.js";
import { styles } from "./UTooltip.styles.js";
import { HostAria } from '../../utilities/hostAria.js';
import type { VirtualElement } from '@floating-ui/dom';

let nextTooltipId = 0;

/**
 * 특정 요소에 툴팁을 표시하는 컴포넌트입니다.
 * 호버 또는 포커스 시 자동으로 표시합니다. 열린 툴팁은 Escape 로 닫힌다(포인터·포커스를 옮기지 않고 — WCAG 1.4.13).
 *
 * @slot - 툴팁 콘텐츠
 *
 * @event show - 툴팁을 표시하기 직전 발생 (취소 가능)
 * @event hide - 툴팁을 숨기기 직전 발생 (취소 가능)
 * @cssprop --tooltip-padding-block - 세로 여백
 * @cssprop --tooltip-padding-inline - 가로 여백
 */
@customElement('u-tooltip')
export class UTooltip extends UFloatingElement {
  static styles = [ super.styles, styles ];

  /** 마우스가 툴팁 위에 이동해도 유지하는지 여부 */
  @property({ type: Boolean, reflect: true }) interactive: boolean = false;
  /** 호버 시 마우스 커서 위치를 따라가는지 여부 */
  @property({ type: Boolean, reflect: true }) tracking: boolean = false;

  private isEmpty: boolean = true;

  private readonly aria = new HostAria(this);
  /** 우리가 `id` 를 준 경우 — 떠날 때 걷는다(작성자가 준 `id` 는 건드리지 않는다). */
  private givenId: string | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.syncAria();
    if (this.anchors) this.describe(this.anchors, true);
  }

  disconnectedCallback(): void {
    OverlayManager.closeLayer(this);
    if (this.anchors) {
      this.describe(this.anchors, false);
      this.unbind(this.anchors);
    }
    if (this.givenId && this.id === this.givenId) this.removeAttribute('id');
    this.givenId = null;
    super.disconnectedCallback();
  }

  /**
   * 열린 툴팁의 글이 보조기술에 닿으려면 호스트가 `tooltip` 역할을 갖고 대상이 `aria-describedby` 로 그것을 가리켜야 한다
   * (WAI-ARIA APG 툴팁 패턴). 링크 등을 담는 `interactive` 툴팁은 APG 상 툴팁이 아니라(비모달 대화상자·토글팁 쪽) 역할은
   * 덧씌우지 않고 설명 연결만 둔다.
   */
  private syncAria(): void {
    this.aria.set('role', this.interactive ? null : 'tooltip');
  }

  /** 대상의 `aria-describedby` 에 이 툴팁의 id 를 더하거나(덧붙임) 걷는다 — 대상에 이미 있는 값은 보존한다. */
  private describe(anchors: HTMLElement[], on: boolean): void {
    if (on && !this.id) {
      this.id = `u-tooltip-${++nextTooltipId}`;
      this.givenId = this.id;
    }
    const id = this.id;
    if (!id) return;
    for (const anchor of anchors) {
      const tokens = (anchor.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
      const has = tokens.includes(id);
      if (on && !has) anchor.setAttribute('aria-describedby', [...tokens, id].join(' '));
      if (!on && has) {
        const rest = tokens.filter((t) => t !== id);
        if (rest.length) anchor.setAttribute('aria-describedby', rest.join(' '));
        else anchor.removeAttribute('aria-describedby');
      }
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // 열린 툴팁은 층이다 — 가리는 내용을 포인터·포커스를 옮기지 않고 걷을 수 있어야 한다(WCAG 1.4.13).
    // 층 스택이 Escape 를 가장 위 층 하나에만 주므로, 대화상자 안의 툴팁은 첫 Escape 에 자기만 닫힌다.
    if (changedProperties.has('open')) {
      if (this.open) OverlayManager.openLayer(this, () => { void this.hide(); });
      else OverlayManager.closeLayer(this);
    }

    if (changedProperties.has('anchors')) {
      const oldAnchors = changedProperties.get('anchors') as HTMLElement[] | undefined;
      const newAnchors = this.anchors as HTMLElement[] | undefined;

      if (oldAnchors) { this.describe(oldAnchors, false); this.unbind(oldAnchors); }
      if (newAnchors) { this.describe(newAnchors, true); this.bind(newAnchors); }
    }

    if (changedProperties.has('interactive')) this.syncAria();

    if (changedProperties.has('offset') || changedProperties.has('interactive')) {
      if (this.interactive) {
        let size = 0;
        if (typeof this.offset === 'number') {
          size = this.offset;
        }
        if (typeof this.offset === 'object') {
          const { mainAxis = 0, crossAxis = 0 } = this.offset;
          size = Math.max(mainAxis, crossAxis);
        }
        this.style.setProperty('--tooltip-bridge-area', `${size}px`);
      } else {
        this.style.removeProperty('--tooltip-bridge-area');
      }
    }
  }

  render() {
    return html`
      <div class="base" part="base">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  private bind(anchors: HTMLElement[]): void {
    for (const anchor of anchors) {
      anchor.addEventListener('pointerenter', this.handleAnchorTrigger);
      anchor.addEventListener('pointerleave', this.handleAnchorDismiss);
      anchor.addEventListener('pointermove', this.handleAnchorPointerMove);
      anchor.addEventListener('focusin', this.handleAnchorTrigger);
      anchor.addEventListener('focusout', this.handleAnchorDismiss);
    }

    this.addEventListener('pointerleave', this.handleAnchorDismiss);
    this.addEventListener('focusout', this.handleAnchorDismiss);
  }

  private unbind(anchors: HTMLElement[]): void {
    for (const anchor of anchors) {
      anchor.removeEventListener('pointerenter', this.handleAnchorTrigger);
      anchor.removeEventListener('pointerleave', this.handleAnchorDismiss);
      anchor.removeEventListener('pointermove', this.handleAnchorPointerMove);
      anchor.removeEventListener('focusin', this.handleAnchorTrigger);
      anchor.removeEventListener('focusout', this.handleAnchorDismiss);
    }

    this.removeEventListener('pointerleave', this.handleAnchorDismiss);
    this.removeEventListener('focusout', this.handleAnchorDismiss);
  }

  private handleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.isEmpty = slot.assignedNodes({ flatten: true }).every(node => {
      return (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === '')
        || node.nodeType === Node.COMMENT_NODE;
    });
  };

  private handleAnchorTrigger = (event: PointerEvent | FocusEvent) => {
    if (this.isEmpty) return;
    let target: Element | VirtualElement | null = event.currentTarget as Element | null;
    if (!target) return;

    if (this.tracking && event instanceof PointerEvent) {
      target = this.createVirtualTarget(event);
    }

    this.show(target);
  };

  private handleAnchorDismiss = (event: PointerEvent | FocusEvent) => {
    if (this.interactive) {
      const related = event.relatedTarget;
      if (related instanceof Node) {
        if (this.contains(related)) return;
        if (this.targetEl instanceof Element && this.targetEl.contains(related)) return;
      }
    }

    this.hide();
  };

  private handleAnchorPointerMove = (event: PointerEvent) => {
    if (!this.tracking || !this.open) return;

    const virtualEl = this.createVirtualTarget(event);
    this.reposition(virtualEl);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-tooltip': UTooltip;
  }
}