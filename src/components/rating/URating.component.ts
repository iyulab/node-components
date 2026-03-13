import { html, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

import { UElement } from "../UElement.js";
import { styles } from "./URating.styles.js";

/**
 * Rating 컴포넌트는 별점 등의 평가 입력을 제공합니다.
 *
 * @slot symbol - 채워진 상태의 커스텀 심볼 (단일 또는 max 개수만큼)
 * @slot symbol-off - 비어있는 상태의 커스텀 심볼 (단일 또는 max 개수만큼)
 * @csspart label - 라벨 영역
 * @cssprop --symbol-color - 채워진 심볼 색상 (기본: var(--u-yellow-500))
 */
export class URating extends UElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {};
  
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) label = '';
  @property({ type: Number }) precision = 1;
  @property({ type: Number }) max = 5;
  @property({ type: Number }) value = 0;
  
  @state() private hoverValue = -1;

  render() {
    const active = this.hoverValue >= 0 ? this.hoverValue : this.value;
    const interactive = !this.disabled && !this.readonly;
    const fractional = this.precision < 1;
    const hasCustom = this.querySelectorAll('[slot="symbol"]').length > 0;

    const symbols: TemplateResult[] = [];
    for (let i = 1; i <= this.max; i++) {
      symbols.push(fractional
        ? this.renderFractionalSymbol(i, active, interactive, hasCustom)
        : this.renderIntegerSymbol(i, active, interactive, hasCustom)
      );
    }

    return html`
      <label class="label" part="label" ?hidden=${!this.label}>
        ${this.label}
        <span class="required" ?hidden=${!this.required}>*</span>
      </label>
      <div class="symbols" role="radiogroup" aria-label=${this.label || 'Rating'}>
        ${symbols}
      </div>

      <div hidden>
        <slot name="symbol"></slot>
        <slot name="symbol-off"></slot>
      </div>
    `;
  }

  // ── 렌더링 ──

  private renderIntegerSymbol(
    i: number, active: number, interactive: boolean, hasCustom: boolean
  ) {
    const filled = active >= i;
    return html`
      <span class="symbol" 
        role="radio" 
        aria-checked=${filled ? 'true' : 'false'} 
        aria-label="${i}"
        tabindex=${interactive ? '0' : '-1'}
        data-index=${i} 
        ?filled=${filled}
        @click=${this.handleSymbolClick}
        @pointerenter=${this.handleSymbolPointerEnter}
        @pointerleave=${this.handleSymbolPointerLeave}
        @keydown=${this.handleSymbolKeydown}>
        ${this.renderSymbolContent(i, filled, hasCustom)}
      </span>
    `;
  }

  private renderFractionalSymbol(
    i: number, active: number, interactive: boolean, hasCustom: boolean
  ) {
    const fill = Math.max(0, Math.min(1, active - (i - 1)));
    return html`
      <span class="symbol"
        role="radio"
        aria-checked=${fill >= 1 ? 'true' : fill > 0 ? 'mixed' : 'false'}
        aria-label="${i}"
        tabindex=${interactive ? '0' : '-1'}
        data-index=${i}
        @click=${this.handleSymbolClick}
        @pointermove=${this.handleSymbolPointerMove}
        @pointerleave=${this.handleSymbolPointerLeave}
        @keydown=${this.handleSymbolKeydown}>
        <span class="symbol-bg">
          ${this.renderSymbolContent(i, false, hasCustom)}
        </span>
        <span class="symbol-fg" ?hidden=${fill <= 0} style="width: ${fill * 100}%">
          ${this.renderSymbolContent(i, true, hasCustom)}
        </span>
      </span>
    `;
  }

  private renderSymbolContent(
    i: number, filled: boolean, hasCustom: boolean
  ): TemplateResult {
    if (hasCustom) {
      const slotName = filled ? 'symbol' : 'symbol-off';
      const els = this.querySelectorAll<HTMLElement>(`[slot="${slotName}"]`);
      if (els.length === 0) {
        return this.renderSymbolContent(i, filled, false) as any;
      }
      const node = (els.length >= this.max ? els[i - 1] : els[0]);
      return html`${unsafeHTML(node ? node.innerHTML : '')}`;
    } else {
      return html`<u-icon lib="internal" name=${filled ? 'star-fill' : 'star'}></u-icon>`;
    }
  }

  // ── 값 계산 ──

  private valueFromPointer(e: PointerEvent, starIndex: number): number {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const raw = (starIndex - 1) + ratio;
    const p = Math.max(0.01, Math.min(1, this.precision));
    return Math.max(p, Math.min(this.max, Math.ceil(raw / p) * p));
  }

  private quantize(val: number): number {
    const p = Math.max(0.01, Math.min(1, this.precision));
    return Math.round(val / p) * p;
  }

  // ── 이벤트 핸들러 ──

  private handleSymbolClick = (e: PointerEvent) => {
    if (this.disabled || this.readonly) return;
    const i = Number((e.currentTarget as HTMLElement).dataset.index);
    const val = this.precision < 1 ? this.valueFromPointer(e, i) : i;
    this.value = this.value === val ? 0 : val;
    this.emit('u-change');
  }

  private handleSymbolPointerEnter = (e: PointerEvent) => {
    if (this.disabled || this.readonly) return;
    this.hoverValue = Number((e.currentTarget as HTMLElement).dataset.index);
  }

  private handleSymbolPointerMove = (e: PointerEvent) => {
    if (this.disabled || this.readonly) return;
    const i = Number((e.currentTarget as HTMLElement).dataset.index);
    this.hoverValue = this.valueFromPointer(e, i);
  }

  private handleSymbolPointerLeave = () => {
    if (this.disabled || this.readonly) return;
    this.hoverValue = -1;
  }

  private handleSymbolKeydown = (e: KeyboardEvent) => {
    if (this.disabled || this.readonly) return;

    const step = this.precision;
    let next = this.value;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        next = Math.min(this.max, this.quantize(this.value + step));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        next = Math.max(0, this.quantize(this.value - step));
        break;
      case 'Home':
        e.preventDefault();
        next = 0;
        break;
      case 'End':
        e.preventDefault();
        next = this.max;
        break;
      case ' ':
      case 'Enter': {
        e.preventDefault();
        const i = Number((e.currentTarget as HTMLElement).dataset.index);
        if (i) {
          this.value = this.value === i ? 0 : i;
          this.emit('u-change');
        }
        return;
      }
      default:
        return;
    }

    if (next !== this.value) {
      this.value = next;
      this.emit('u-change');
    }

    const symbols = this.renderRoot?.querySelectorAll('.symbol');
    const idx = Math.ceil(next) - 1;
    if (symbols && idx >= 0 && idx < symbols.length) {
      (symbols[idx] as HTMLElement).focus();
    }
  }
}
