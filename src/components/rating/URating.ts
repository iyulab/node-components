import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import '../field/UField.js';
import '../icon/UIcon.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { styles } from "./URating.styles.js";

/**
 * 별점 등의 숫자 입력을 지원하는 레이팅 컴포넌트입니다.
 *
 * @slot symbol - 활성화 상태의 심볼 슬롯 아이콘
 * @slot symbol-off - 비활성화 상태의 심볼 슬롯 아이콘
 *
 * @csspart field - u-field 요소
 * @csspart container - 심볼들을 감싸는 컨테이너
 * @csspart symbol - 각 심볼 요소
 * @csspart symbol-fg - 각 심볼의 활성화된 부분을 나타내는 요소
 *
 * @cssprop --rating-symbol-color - 활성화된 심볼 색상
 * @cssprop --rating-symbol-off-color - 비활성화된 심볼 색상
 *
 * @event change - 레이팅 값 변경 시 발생
 */
@customElement('u-rating')
export class URating extends UFormControlElement<number> {
  static styles = [super.styles, styles];

  /** 理쒖냼 媛?*/
  @property({ type: Number }) min = 0;
  /** 理쒕? 媛?*/
  @property({ type: Number }) max = 5;
  /** 정밀도 (0.5 등) */
  @property({ type: Number }) precision = 1;

  @state() private buffer = -1;
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
      <u-field part="field"
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?invalid=${this.invalid}
        .label=${this.label}
        .description=${this.description}
        .validationMessage=${this.validationMessage}
      >
        <div class="symbols" part="container" role="radiogroup">
          ${Array.from({ length: this.max }, (_, i) => {
            const score = i + 1;
            const fill = Math.max(0, Math.min(1, value - score + 1));
            return html`
              <span class="symbol" part="symbol"
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

                <span class="symbol-fg" part="symbol-fg" 
                  ?hidden=${fill <= 0} 
                  style="width: ${fill * 100}%">
                  ${this.symbol
                    ? this.symbol.cloneNode(true)
                    : html`<u-icon lib="internal" name="star-fill"></u-icon>`}
                </span>
              </span>
            `;
          })}
        </div>
      </u-field>

      <div hidden aria-hidden="true">
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
    this.dispatchEvent(new Event('change', { 
      bubbles: true, 
      composed: true 
    }));
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
    if (name === 'symbol') {
      this.symbol = node ?? null;
    } else if (name === 'symbol-off') {
      this.symbolOff = node ?? null;
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
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const raw = (score - 1) + ratio;
    const p = Math.max(0.01, Math.min(1, this.precision));
    return Math.max(p, Math.min(this.max, Math.round(raw / p) * p));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-rating': URating;
  }
}
