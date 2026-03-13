import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UButton } from "../button/UButton.component.js";
import { UIcon } from "../icon/UIcon.component.js";
import { styles } from "./UCarousel.styles.js";

/**
 * Carousel 컴포넌트는 여러 슬라이드를 회전하며 표시합니다.
 *
 * @slot - 슬라이드로 표시할 콘텐츠. 각 자식 요소가 하나의 슬라이드.
 * @event u-change - 슬라이드 변경 시. detail: { index: number }
 *
 * @csspart slides - 슬라이드 컨테이너 (aspect-ratio 등 외부 스타일링)
 * @csspart prev-button - 이전 버튼
 * @csspart next-button - 다음 버튼
 * @csspart indicator - 인디케이터 컨테이너
 * @csspart dot - 인디케이터 도트
 */
export class UCarousel extends UElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {
    'u-button': UButton,
    'u-icon': UIcon,
  };
  
  /** 자동 재생 활성화 */
  @property({ type: Boolean, reflect: true }) autoplay = false;
  /** 자동 재생 간격 (ms) */
  @property({ type: Number, attribute: 'autoplay-interval' }) autoplayInterval = 3000;
  /** 처음/끝에서 순환 이동 */
  @property({ type: Boolean, reflect: true }) loop = false;
  /** 이전/다음 네비게이션 버튼 표시 */
  @property({ type: Boolean, reflect: true }) navigation = false;
  /** 페이지 인디케이터 표시 */
  @property({ type: Boolean, reflect: true }) pagination = false;
  /** 드래그로 슬라이드 전환 */
  @property({ type: Boolean, reflect: true }) draggable = false;
  /** 한 화면에 표시할 슬라이드 수 */
  @property({ type: Number, attribute: 'slides-per-view' }) slidesPerView = 1;
  /** 한 번에 이동할 슬라이드 수 */
  @property({ type: Number, attribute: 'slides-per-move' }) slidesPerMove = 1;
  /** 슬라이드 간 간격 (px) */
  @property({ type: Number }) gap = 0;
  /** 현재 활성 슬라이드 인덱스 */
  @property({ type: Number }) index = 0;

  /** 전체 슬라이드 수 */
  @state() private slideCount = 0;
  /** 드래그 중인지 여부 */
  @state() private isDragging = false;
  /** 드래그 중 이동 보정값 (단위: %) */
  @state() private dragOffset = 0;

  /** 타이머 및 드래그 상태 추적 필드 */
  private autoplayTimer?: number;
  private dragStartX = 0;
  private dragStartTime = 0;
  private pointerDown = false;

  /** 한 화면에 표시할 슬라이드 수 (최소 1) */
  private get perView() { 
    return Math.max(1, this.slidesPerView); 
  }
  /** 한 번에 이동할 슬라이드 수 (최소 1) */
  private get perMove() { 
    return Math.max(1, this.slidesPerMove);
  }
  /** 슬라이드가 이동할 수 있는 최대 index */
  private get maxIndex() { 
    return Math.max(0, this.slideCount - this.perView); 
  }
  /** 총 페이지 수 (인디케이터 도트 수) */
  private get pageCount() { 
    return this.maxIndex <= 0 
      ? 1 
      : Math.ceil(this.maxIndex / this.perMove) + 1;
  }
  /** 현재 페이지 (인디케이터 도트 활성화에 사용) */
  private get currentPage() { 
    return this.index >= this.maxIndex 
      ? this.pageCount - 1 
      : Math.floor(this.index / this.perMove); 
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
      this.style.setProperty('--slides-per-view', String(this.perView));
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
    const pct = -(this.index * (100 / this.perView)) + this.dragOffset;
    const gapPx = this.gap > 0 ? -(this.index * this.gap / this.perView) : 0;
    const transform = gapPx
      ? `translateX(calc(${pct}% + ${gapPx}px))`
      : `translateX(${pct}%)`;
    const style = `transform: ${transform}${this.isDragging ? '; transition: none' : ''}`;

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

      <u-button part="prev-button" class="nav-button prev"
        ?hidden=${!this.navigation || (!this.loop && this.index <= 0)}
        variant="ghost"
        rounded
        @click=${this.prev}>
        <u-icon lib="internal" name="chevron-left"></u-icon>
      </u-button>
      <u-button part="next-button" class="nav-button next"
        ?hidden=${!this.navigation || (!this.loop && this.index >= this.maxIndex)}
        variant="ghost"
        rounded
        @click=${this.next}>
        <u-icon lib="internal" name="chevron-right"></u-icon>
      </u-button>

      <div part="indicator" class="indicator"
        ?hidden=${!this.pagination || this.pageCount <= 1}>
        ${Array.from({ length: this.pageCount }, (_, i) => html`
          <button part="dot" class="dot"
            ?active=${i === this.currentPage}
            @click=${() => this.goTo(Math.min(i * this.perMove, this.maxIndex))}>
          </button>
        `)}
      </div>
    `;
  }

  /** 
   * 이전 슬라이드로 이동합니다.
   */
  public prev = () => {
    const target = Math.max(0, this.index - this.perMove);
    if (target !== this.index) {
      this.goTo(target);
    } else if (this.loop) {
      this.goTo(Math.min((this.pageCount - 1) * this.perMove, this.maxIndex));
    }
  }

  /** 
   * 다음 슬라이드로 이동합니다.
   */
  public next = () => {
    const target = Math.min(this.maxIndex, this.index + this.perMove);
    if (target !== this.index) {
      this.goTo(target);
    } else if (this.loop) {
      this.goTo(0);
    }
  }

  /** 
   * 지정한 인덱스로 이동합니다.
   */
  public goTo = (index: number) => {
    if (index < 0 || index > this.maxIndex || index === this.index) return;
    this.index = index;
    if (this.autoplay) this.startAutoplay();
  }

  private startAutoplay() {
    this.stopAutoplay();
    this.autoplayTimer = window.setInterval(() => {
      this.next();
    }, this.autoplayInterval);
  }

  private stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = undefined;
    }
  }

//#region Event Handlers

  private handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this.slideCount = slot.assignedElements().length;
    if (this.index >= this.slideCount) {
      this.index = Math.max(0, this.slideCount - 1);
    }
  }

  private handleDragStart = (e: Event) => {
    // 드래그로 인한 이미지 선택 방지
    e.preventDefault();
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    // 드래그 확정 시 pointermove에서 capture를 설정함
    this.pointerDown = true;
    this.dragStartX = e.clientX;
    this.dragOffset = 0;
    this.dragStartTime = Date.now();
    if (this.autoplay) this.stopAutoplay();
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.pointerDown) return;
    const wrapper = e.currentTarget as HTMLElement;
    const offset = ((e.clientX - this.dragStartX) / wrapper.offsetWidth) * 100;

    // 5px 이상 움직였을 때 드래그 모드 진입 (그 전까지는 탭으로 간주)
    // 드래그 확정 시점에만 capture 설정 → 포인터가 요소 밖으로 나가도 이벤트 수신 유지
    if (!this.isDragging && Math.abs(e.clientX - this.dragStartX) > 5) {
      this.isDragging = true;
      wrapper.setPointerCapture(e.pointerId);
    }

    // 드래그 중 이동 보정값 업데이트
    if (this.isDragging) {
      this.dragOffset = offset;
    }
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (!this.pointerDown) return;
    const elapsed = Date.now() - this.dragStartTime;
    const absDrag = Math.abs(this.dragOffset);
    
    // 20% 이상 드래그했거나, 5% 이상 빠르게 드래그한 경우 슬라이드 이동
    if (this.isDragging && (absDrag > 20 || (absDrag > 5 && elapsed < 300))) {
      if (this.dragOffset < 0) this.next();
      else this.prev();
      // 브라우저는 pointerup 직후 손을 뗀 위치 아래 요소에 click을 자동 발생시킴.
      // 드래그로 슬라이드를 넘긴 경우 해당 click이 슬라이드 내부 링크·버튼을
      // 의도치 않게 활성화할 수 있으므로, 다음 click 이벤트 한 번만 차단.
      this.addEventListener('click', this.handleClickCancel, { 
        capture: true, 
        once: true 
      });
    }
    
    // 드래그 중에만 capture가 설정되므로 드래그 시에만 해제
    if (this.isDragging) {
      const wrapper = e.currentTarget as HTMLElement;
      wrapper.releasePointerCapture(e.pointerId);
    }

    this.pointerDown = false;
    this.isDragging = false;
    this.dragOffset = 0;
    if (this.autoplay) this.startAutoplay();
  };

  private handleClickCancel = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

//#endregion
}
