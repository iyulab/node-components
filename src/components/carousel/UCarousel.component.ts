import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { UButton } from "../button/UButton.component.js";
import { UIcon } from "../icon/UIcon.component.js";
import { styles } from "./UCarousel.styles.js";

/**
 * Carousel 컴포넌트는 여러 슬라이드를 회전하며 표시합니다.
 *
 * @slot - 슬라이드로 표시할 콘텐츠. 각 자식 요소가 하나의 슬라이드.
 * @event u-change - 슬라이드 변경 시. detail: { currentIndex: number }
 *
 * @csspart slides - 슬라이드 컨테이너 (aspect-ratio 등 외부 스타일링)
 * @csspart prev-button - 이전 버튼
 * @csspart next-button - 다음 버튼
 * @csspart indicator - 인디케이터 컨테이너
 * @csspart dot - 인디케이터 도트
 */
export class UCarousel extends BaseElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-button': UButton,
    'u-icon': UIcon,
  };

  /** 현재 활성 슬라이드 인덱스 */
  @property({ type: Number, reflect: true, attribute: 'current-index' }) currentIndex = 0;
  /** 자동 재생 활성화 */
  @property({ type: Boolean, reflect: true }) autoplay = false;
  /** 자동 재생 간격 (ms) */
  @property({ type: Number, attribute: 'autoplay-interval' }) autoplayInterval = 3000;
  /** 이전/다음 네비게이션 버튼 표시 */
  @property({ type: Boolean, reflect: true }) navigation = true;
  /** 페이지 인디케이터 표시 */
  @property({ type: Boolean, reflect: true }) pagination = true;
  /** 처음/끝에서 순환 이동 */
  @property({ type: Boolean, reflect: true }) loop = true;
  /** 드래그로 슬라이드 전환 */
  @property({ type: Boolean, reflect: true }) draggable = false;
  /** 한 화면에 표시할 슬라이드 수 */
  @property({ type: Number, reflect: true, attribute: 'slides-per-view' }) slidesPerView = 1;
  /** 한 번에 이동할 슬라이드 수 */
  @property({ type: Number, attribute: 'slides-per-move' }) slidesPerMove = 1;
  /** 슬라이드 간 간격 (px) */
  @property({ type: Number, reflect: true }) gap = 0;

  @state() private _slideCount = 0;
  @state() private _isDragging = false;
  @state() private _dragOffset = 0;

  private _autoplayTimer?: number;
  private _dragStartX = 0;
  private _dragStartTime = 0;
  private _pointerTarget: Element | null = null;

  private get _perView() { return Math.max(1, this.slidesPerView); }
  private get _perMove() { return Math.max(1, this.slidesPerMove); }
  private get _maxIndex() { return Math.max(0, this._slideCount - this._perView); }
  private get _pageCount() { return this._maxIndex <= 0 ? 1 : Math.ceil(this._maxIndex / this._perMove) + 1; }
  private get _currentPage() {
    return this.currentIndex >= this._maxIndex
      ? this._pageCount - 1
      : Math.floor(this.currentIndex / this._perMove);
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.autoplay) this.startAutoplay();
  }

  disconnectedCallback(): void {
    this.stopAutoplay();
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has('slidesPerView')) {
      this.style.setProperty('--slides-per-view', String(this._perView));
    }
    if (changedProperties.has('gap')) {
      this.style.setProperty('--slide-gap', `${this.gap}px`);
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('autoplay') || changedProperties.has('autoplayInterval')) {
      if (this.autoplay) this.startAutoplay();
      else this.stopAutoplay();
    }
  }

  render() {
    const pct = -(this.currentIndex * (100 / this._perView)) + this._dragOffset;
    const gapPx = this.gap > 0 ? -(this.currentIndex * this.gap / this._perView) : 0;
    const transform = gapPx
      ? `translateX(calc(${pct}% + ${gapPx}px))`
      : `translateX(${pct}%)`;
    const style = `transform: ${transform}${this._isDragging ? '; transition: none' : ''}`;

    return html`
      <div class="slides-wrapper"
        @dragstart=${this.handleDragStart}
        @pointerdown=${this.draggable ? this.handlePointerDown : null}
        @pointermove=${this.draggable ? this.handlePointerMove : null}
        @pointerup=${this.draggable ? this.handlePointerUp : null}
        @pointerleave=${this.draggable ? this.handlePointerUp : null}>
        <div part="slides" class="slides" style="${style}">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>

      <u-button part="prev-button" class="nav-button prev" variant="borderless"
        ?hidden=${!this.navigation}
        ?disabled=${!this.loop && this.currentIndex <= 0}
        @click=${this.prev}>
        <u-icon lib="internal" name="chevron-left"></u-icon>
      </u-button>
      <u-button part="next-button" class="nav-button next" variant="borderless"
        ?hidden=${!this.navigation}
        ?disabled=${!this.loop && this.currentIndex >= this._maxIndex}
        @click=${this.next}>
        <u-icon lib="internal" name="chevron-right"></u-icon>
      </u-button>

      <div part="indicator" class="indicator"
        ?hidden=${!this.pagination || !this._slideCount}>
        ${Array.from({ length: this._pageCount }, (_, i) => html`
          <button part="dot"
            class="dot ${i === this._currentPage ? 'active' : ''}"
            @click=${() => this.goTo(Math.min(i * this._perMove, this._maxIndex))}>
          </button>
        `)}
      </div>
    `;
  }

  /** 이전 슬라이드로 이동 */
  prev() {
    const target = Math.max(0, this.currentIndex - this._perMove);
    if (target !== this.currentIndex) {
      this.goTo(target);
    } else if (this.loop) {
      this.goTo(Math.min((this._pageCount - 1) * this._perMove, this._maxIndex));
    }
  }

  /** 다음 슬라이드로 이동 */
  next() {
    const target = Math.min(this._maxIndex, this.currentIndex + this._perMove);
    if (target !== this.currentIndex) {
      this.goTo(target);
    } else if (this.loop) {
      this.goTo(0);
    }
  }

  /** 지정한 인덱스로 이동 */
  goTo(index: number) {
    if (index < 0 || index > this._maxIndex || index === this.currentIndex) return;
    this.currentIndex = index;
    this.emit('u-change', { 
      currentIndex: this.currentIndex 
    });
    if (this.autoplay) this.startAutoplay();
  }

  private handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._slideCount = slot.assignedElements().length;
    if (this.currentIndex >= this._slideCount) {
      this.currentIndex = Math.max(0, this._slideCount - 1);
    }
  }

  private startAutoplay() {
    this.stopAutoplay();
    this._autoplayTimer = window.setInterval(() => this.next(), this.autoplayInterval);
  }

  private stopAutoplay() {
    if (this._autoplayTimer) {
      clearInterval(this._autoplayTimer);
      this._autoplayTimer = undefined;
    }
  }

  private handleDragStart = (e: Event) => {
    // 드래그로 인한 이미지 선택 방지
    e.preventDefault();
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    this._isDragging = true;
    this._dragStartX = e.clientX;
    this._dragOffset = 0;
    this._dragStartTime = Date.now();
    this._pointerTarget = (e.composedPath()[0] as Element) || null;
    if (this.autoplay) this.stopAutoplay();

    const wrapper = e.currentTarget as HTMLElement;
    wrapper.setPointerCapture(e.pointerId);
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this._isDragging) return;
    const wrapper = e.currentTarget as HTMLElement;
    this._dragOffset = ((e.clientX - this._dragStartX) / wrapper.offsetWidth) * 100;
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (!this._isDragging) return;
    const elapsed = Date.now() - this._dragStartTime;
    const absDrag = Math.abs(this._dragOffset);
    if (absDrag > 20 || (absDrag > 5 && elapsed < 300)) {
      if (this._dragOffset < 0) this.next();
      else this.prev();
    } else if (this._pointerTarget) {
      // 드래그가 아닌 탭 → 원래 타겟에 클릭 이벤트 발생
      this._pointerTarget.dispatchEvent(
        new MouseEvent('click', { bubbles: true, composed: true })
      );
    }
    this._isDragging = false;
    this._dragOffset = 0;
    this._pointerTarget = null;
    if (this.autoplay) this.startAutoplay();

    const wrapper = e.currentTarget as HTMLElement;
    wrapper.releasePointerCapture(e.pointerId);
  };
}
