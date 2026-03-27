import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { UFormControlElement } from "../UFormControlElement.js";
import { UElement } from "../UElement.js";
import { UField } from "../field/UField.component.js";
import { styles } from "./URating.styles.js";

/**
 * Rating 컴포넌트는 별점 등의 평가 입력을 제공합니다.
 *
 * @slot symbol - 채워진 상태의 커스텀 심볼 (단일 또는 max 개수만큼)
 * @slot symbol-off - 비어있는 상태의 커스텀 심볼 (단일 또는 max 개수만큼)
 * @csspart label - 라벨 영역
 * @cssprop --symbol-color - 채워진 심볼 색상 (기본: var(--u-yellow-500))
 */
export class URating extends UFormControlElement<number> {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {
    'u-field': UField,
  };

  /** 최소 값 (기본: 0) */
  @property({ type: Number }) min = 0;
  /** 최대 값 (기본: 5) */
  @property({ type: Number }) max = 5;
  /** 정밀도 (기본: 1, 예: 0.5) */
  @property({ type: Number }) precision = 1;

  // 마우스 오버 시 임시로 표시할 값 (버퍼)
  @state() private buffer = -1;
  // 커스텀 심볼 노드 참조 (슬롯에서 할당)
  @state() private symbol: Node | null = null;
  @state() private symbolOff: Node | null = null;

  private get interactive() {
    return !this.disabled && !this.readonly;
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('value')) {
      this.onChangeValue();
    }
  }

  render() {
    const value = this.buffer >= 0 ? this.buffer : this.value || 0;

    return html`
      <u-field
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?invalid=${this.invalid}
        .label=${this.label}
        .description=${this.description}
        .validationMessage=${this.validationMessage}
      >
        <div class="symbols" role="radiogroup">
          ${Array.from({ length: this.max }, (_, i) => {
            const score = i + 1;
            const fill = Math.max(0, Math.min(1, value - score + 1));
            return html`
              <span class="symbol"
                role="radio"
                tabindex=${this.interactive ? '0' : '-1'}
                data-score=${score}
                @pointermove=${this.handleSymbolPointerMove}
                @pointerleave=${this.handleSymbolPointerLeave}
                @click=${this.handleSymbolClick}
                @keydown=${this.handleSymbolKeydown}
              >
                ${this.symbolOff
                  ? this.symbolOff.cloneNode(true)
                  : html`<u-icon lib="internal" name="star"></u-icon>`}

                <span class="symbol-fg" ?hidden=${fill <= 0} style="width: ${fill * 100}%">
                  ${this.symbol
                    ? this.symbol.cloneNode(true)
                    : html`<u-icon lib="internal" name="star-fill"></u-icon>`}
                </span>
              </span>
            `;
          })}
        </div>
      </u-field>

      <div hidden>
        <slot name="symbol" @slotchange=${this.handleSlotChange}></slot>
        <slot name="symbol-off" @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  public validate(): boolean {
    if (this.internals) {
      this.invalid = !this.internals.checkValidity();
    } else {
      const { flags } = this.getValidity();
      this.invalid = Object.values(flags).some(Boolean);
    }
    return !this.invalid;
  }

  public reset(): void {
    this.value = 0;
    this.invalid = false;
  }

  private onChangeValue() {
    this.buffer = -1;
    this.internals?.setFormValue(this.value?.toString() || '');
    const { flags, message } = this.getValidity();
    this.internals?.setValidity(
      flags, 
      this.validationMessage || message, 
      this.renderRoot.querySelector('.symbols') as HTMLElement || undefined
    );

    if (!this.novalidate) {
      this.validate();
    }
    this.emit('u-change');
  }

  private getValidity(): { flags: ValidityStateFlags; message: string } {
    const v = this.value || 0;
    if (this.required && !v) {
      return { flags: { valueMissing: true }, message: 'This field is required' };
    }
    if (v && v < this.min) {
      return { flags: { rangeUnderflow: true }, message: `Value must be at least ${this.min}` };
    }
    if (v && v > this.max) {
      return { flags: { rangeOverflow: true }, message: `Value must be no more than ${this.max}` };
    }
    if (v && this.precision < 1) {
      const remainder = Math.abs(v % this.precision);
      if (remainder > 0.001 && Math.abs(remainder - this.precision) > 0.001) {
        return { flags: { stepMismatch: true }, message: `Value must be a multiple of ${this.precision}` };
      }
    }
    return { flags: {}, message: '' };
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const name = slot.name;
    const node = slot.assignedNodes({ flatten: true }).at(0);
    if (!node) return;
    
    if (name === 'symbol') {
      this.symbol = node;
    } else if (name === 'symbol-off') {
      this.symbolOff = node;
    }
  }

  private handleSymbolPointerMove = (e: PointerEvent) => {
    if (this.disabled || this.readonly) return;
    const score = Number((e.currentTarget as HTMLElement).dataset.score);
    this.buffer = this.calibrate(e, score);
  }

  private handleSymbolPointerLeave = (_: PointerEvent) => {
    if (this.disabled || this.readonly) return;
    this.buffer = -1;
  }

  private handleSymbolClick = (e: PointerEvent) => {
    if (this.disabled || this.readonly) return;
    const score = Number((e.currentTarget as HTMLElement).dataset.score);
    const val = this.precision < 1 ? this.calibrate(e, score) : score;
    this.value = this.value === val ? 0 : val;
  }

  private handleSymbolKeydown = (e: KeyboardEvent) => {
    if (this.disabled || this.readonly) return;

    const symbols = Array.from(this.renderRoot.querySelectorAll('.symbol')) as HTMLElement[];
    const currentSymbol = e.currentTarget as HTMLElement;
    const currentIndex = symbols.indexOf(currentSymbol);
    if (currentIndex === -1) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        const nextIndex = Math.min(symbols.length - 1, currentIndex + 1);
        symbols[nextIndex].focus();
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        const prevIndex = Math.max(0, currentIndex - 1);
        symbols[prevIndex].focus();
        break;
      case 'Home':
        e.preventDefault();
        symbols[0].focus();
        break;
      case 'End':
        e.preventDefault();
        symbols[symbols.length - 1].focus();
        break;
      case ' ':
      case 'Enter': {
        e.preventDefault();
        const score = Number((e.currentTarget as HTMLElement).dataset.score);
        this.value = this.value === score ? 0 : score;
        return;
      }
      default:
        return;
    }
  }

  private calibrate(e: PointerEvent, score: number): number {
    // 실제 점수 계산
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const raw = (score - 1) + ratio;
    // 정밀도에 맞게 반올림
    const p = Math.max(0.01, Math.min(1, this.precision));
    return Math.max(p, Math.min(this.max, Math.round(raw / p) * p));
  }
}
