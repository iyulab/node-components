import { html, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../button/UButton.js';
import '../icon/UIcon.js';

import { UElement } from "../UElement.js";
import { Locale } from "../../utilities/Locale.js";
import { styles } from "./UCarousel.styles.js";

/**
 * 여러 슬라이드를 전환하며 표시하는 캐러셀 컴포넌트입니다.
 *
 * @slot - 슬라이드로 표시할 콘텐츠 (각 자식 요소가 하나의 슬라이드)
 *
 * `autoplay` 이면 회전 제어 버튼(정지/시작)이 인디케이터 줄의 첫 자리에 그려진다. 포인터가 캐러셀 위에
 * 있는 동안은 잠시 멈추고, 키보드 초점이 안으로 들어오면 사용자가 다시 시작할 때까지 멈춘다
 * (WAI-ARIA APG Carousel · WCAG 2.2.2). 사용자가 동작 줄이기(`prefers-reduced-motion: reduce`)를
 * 켜 두었으면 정지 상태로 시작하고(시작 버튼으로 켤 수 있다), 보는 중에 그 설정이 켜지면 멈춘다.
 *
 * 보조기기에는 WAI-ARIA APG Carousel 구조로 나간다 — 호스트는 «캐러셀» 역할 설명을 단 영역(`region`), 각 슬라이드는
 * «슬라이드» 역할 설명과 «n / 전체» 이름을 단 그룹이다. 캐러셀의 이름은 호스트의 `aria-label` 로 준다(영역은 이름이
 * 있어야 랜드마크다). 슬라이드에 소비자가 이미 단 `role`·`aria-roledescription`·`aria-label` 은 덮지 않는다.
 *
 * @csspart slides - 슬라이드 컨테이너
 * @csspart prev-button - 이전 버튼
 * @csspart next-button - 다음 버튼
 * @csspart indicator - 페이지네이션 컨테이너
 * @csspart dot - 페이지네이션 점
 * @csspart rotation-button - 자동 넘김 정지/시작 버튼 (`autoplay` 일 때만, 인디케이터 안)
 */
@customElement('u-carousel')
export class UCarousel extends UElement {
  static styles = [super.styles, styles];
  
  /** 자동 재생 활성화 */
  @property({ type: Boolean, reflect: true }) autoplay = false;
  /** 자동 재생 간격 (ms) */
  @property({ type: Number, attribute: 'autoplay-interval' }) autoplayInterval = 3000;
  /** 처음/끝에서 순환 이동 */
  @property({ type: Boolean, reflect: true }) loop = false;
  /** 이전/다음 내비게이션 버튼 표시 */
  @property({ type: Boolean, reflect: true }) navigation = false;
  /** 페이지 페이지네이션 표시 */
  @property({ type: Boolean, reflect: true }) pagination = false;
  /** 드래그로 슬라이드 이동 */
  @property({ type: Boolean, reflect: true }) draggable = false;
  /** 한 화면에 표시할 슬라이드 수 */
  @property({ type: Number, attribute: 'slides-per-view' }) slidesPerView = 1;
  /** 한 번에 이동할 슬라이드 수 */
  @property({ type: Number, attribute: 'slides-per-move' }) slidesPerMove = 1;
  /** 슬라이드 간 간격 (px) */
  @property({ type: Number }) gap = 0;
  /** 현재 활성 슬라이드 인덱스 */
  @property({ type: Number }) index = 0;

  @state() private slideCount = 0;
  @state() private isDragging = false;
  @state() private dragOffset = 0;
  /** 사용자가 회전을 멈췄다(정지 버튼, 또는 키보드 초점 진입). 다시 시작할 때까지 유지된다. */
  @state() private rotationStopped = false;
  /** 포인터가 캐러셀 위에 있다 — 그동안만 잠시 멈춘다. */
  @state() private hovered = false;

  private autoplayTimer?: number;
  /** 호스트 역할(region · «캐러셀» 역할 설명) — 소비자의 `role` 속성이 있으면 그것이 이긴다. */
  private readonly internals: ElementInternals | undefined =
    'attachInternals' in this ? this.attachInternals() : undefined;
  /** 지금 슬롯에 꽂힌 슬라이드와, 그중 우리가 단 속성(소비자가 단 것은 여기 없다 — 덮지도 회수하지도 않는다). */
  private slides: Element[] = [];
  private readonly ownedSlideAttrs = new WeakMap<Element, string[]>();
  /** `prefers-reduced-motion: reduce` 질의 — 연결된 동안만 듣는다. */
  private reducedMotion?: MediaQueryList;
  private dragStartX = 0;
  private dragStartTime = 0;
  private pointerDown = false;

  /** 지금 자동으로 넘기고 있는가. */
  private get rotating() {
    return this.autoplay && !this.rotationStopped && !this.hovered;
  }

  private get showDots() {
    return this.pagination && this.pageCount > 1;
  }

  private get perView() { 
    return Math.max(1, this.slidesPerView); 
  }
  private get perMove() { 
    return Math.max(1, this.slidesPerMove);
  }
  private get maxIndex() { 
    return Math.max(0, this.slideCount - this.perView); 
  }
  private get pageCount() { 
    return this.maxIndex <= 0 
      ? 1 
      : Math.ceil(this.maxIndex / this.perMove) + 1;
  }
  private get currentPage() { 
    return this.index >= this.maxIndex 
      ? this.pageCount - 1 
      : Math.floor(this.index / this.perMove); 
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.internals) {
      this.internals.role = 'region';
      this.internals.ariaRoleDescription = Locale.getValue('carousel');
    }
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.handlePointerLeave);
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    this.reducedMotion?.addEventListener('change', this.handleReducedMotionChange);
    if (this.rotating) this.startAutoplay();
  }

  disconnectedCallback(): void {
    this.stopAutoplay();
    this.reducedMotion?.removeEventListener('change', this.handleReducedMotionChange);
    this.reducedMotion = undefined;
    this.removeEventListener('focusin', this.handleFocusIn);
    this.removeEventListener('pointerenter', this.handlePointerEnter);
    this.removeEventListener('pointerleave', this.handlePointerLeave);
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    // 자동 넘김을 새로 켜면 이전의 «사용자가 멈춤» 은 잊는다 — 동작 줄이기를 켠 사용자에게는
    // 정지 상태로 시작한다(움직임은 사용자가 시작 버튼으로 고른다).
    if (changedProperties.has('autoplay') && this.autoplay) {
      this.rotationStopped = !!this.reducedMotion?.matches;
    }

    if (changedProperties.has('slidesPerView')) {
      this.style.setProperty('--slides-per-view', String(this.perView));
    }
    if (changedProperties.has('gap')) {
      this.style.setProperty('--slide-gap', `${this.gap}px`);
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (
      changedProperties.has('autoplay') ||
      changedProperties.has('autoplayInterval') ||
      changedProperties.has('rotationStopped') ||
      changedProperties.has('hovered')
    ) {
      if (this.rotating) this.startAutoplay();
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
        <div part="slides" class="slides" style="${style}"
          aria-live=${ifDefined(this.autoplay ? (this.rotating ? 'off' : 'polite') : undefined)}>
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>

      <u-button part="prev-button" class="nav-button prev"
        ?hidden=${!this.navigation || (!this.loop && this.index <= 0)}
        appearance="plain"
        rounded
        aria-label=${Locale.getValue('previousSlide')}
        @click=${this.prev}>
        <u-icon lib="internal" name="chevron-left"></u-icon>
      </u-button>
      <u-button part="next-button" class="nav-button next"
        ?hidden=${!this.navigation || (!this.loop && this.index >= this.maxIndex)}
        appearance="plain"
        rounded
        aria-label=${Locale.getValue('nextSlide')}
        @click=${this.next}>
        <u-icon lib="internal" name="chevron-right"></u-icon>
      </u-button>

      <div part="indicator" class="indicator"
        ?hidden=${!this.autoplay && !this.showDots}>
        ${this.autoplay ? html`
          <button part="rotation-button" class="rotation-button"
            aria-label=${Locale.getValue(this.rotationStopped ? 'startSlideRotation' : 'stopSlideRotation')}
            @click=${this.toggleRotation}>
            <u-icon lib="internal" name=${this.rotationStopped ? 'player-play-fill' : 'player-pause-fill'}></u-icon>
          </button>
        ` : nothing}
        ${!this.showDots ? nothing : Array.from({ length: this.pageCount }, (_, i) => html`
          <button part="dot" class="dot"
            aria-label=${Locale.getValue('goToSlide', { n: i + 1 })}
            aria-current=${i === this.currentPage ? 'true' : 'false'}
            ?active=${i === this.currentPage}
            @click=${() => this.goTo(Math.min(i * this.perMove, this.maxIndex))}>
          </button>
        `)}
      </div>
    `;
  }

  public prev = () => {
    const target = Math.max(0, this.index - this.perMove);
    if (target !== this.index) {
      this.goTo(target);
    } else if (this.loop) {
      this.goTo(Math.min((this.pageCount - 1) * this.perMove, this.maxIndex));
    }
  }

  public next = () => {
    const target = Math.min(this.maxIndex, this.index + this.perMove);
    if (target !== this.index) {
      this.goTo(target);
    } else if (this.loop) {
      this.goTo(0);
    }
  }

  public goTo = (index: number) => {
    if (index < 0 || index > this.maxIndex || index === this.index) return;
    this.index = index;
    if (this.rotating) this.startAutoplay();
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

  private handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const next = slot.assignedElements();
    for (const gone of this.slides) if (!next.includes(gone)) this.releaseSlide(gone);
    this.slides = next;
    next.forEach((slide, i) => this.labelSlide(slide, i, next.length));
    this.slideCount = next.length;
    if (this.index >= this.slideCount) {
      this.index = Math.max(0, this.slideCount - 1);
    }
  }

  /** 렌더 밖에서 적어 둔 로케일 문장(호스트 역할 설명 · 슬라이드 이름)을 새 로케일로 다시 적는다. */
  protected override localeChanged(): void {
    if (this.internals) this.internals.ariaRoleDescription = Locale.getValue('carousel');
    this.slides.forEach((slide, i) => this.labelSlide(slide, i, this.slides.length));
    super.localeChanged();
  }

  /** 슬라이드를 «n / 전체» 이름의 그룹으로 — 처음 볼 때 비어 있던 속성만 우리 것으로 삼고, 그것만 갱신한다. */
  private labelSlide(slide: Element, i: number, total: number) {
    let owned = this.ownedSlideAttrs.get(slide);
    if (!owned) {
      owned = ['role', 'aria-roledescription', 'aria-label'].filter((name) => !slide.hasAttribute(name));
      this.ownedSlideAttrs.set(slide, owned);
    }
    const values: Record<string, string> = {
      role: 'group',
      'aria-roledescription': Locale.getValue('slide'),
      'aria-label': Locale.getValue('slideOf', { n: i + 1, total }),
    };
    for (const name of owned) slide.setAttribute(name, values[name]);
  }

  /** 슬롯을 떠난 슬라이드에서 우리가 단 속성을 걷는다. */
  private releaseSlide(slide: Element) {
    for (const name of this.ownedSlideAttrs.get(slide) ?? []) slide.removeAttribute(name);
    this.ownedSlideAttrs.delete(slide);
  }

  private handleDragStart = (e: Event) => {
    e.preventDefault();
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    this.pointerDown = true;
    this.dragStartX = e.clientX;
    this.dragOffset = 0;
    this.dragStartTime = Date.now();
    this.stopAutoplay();
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.pointerDown) return;
    const wrapper = e.currentTarget as HTMLElement;
    const offset = ((e.clientX - this.dragStartX) / wrapper.offsetWidth) * 100;

    if (!this.isDragging && Math.abs(e.clientX - this.dragStartX) > 5) {
      this.isDragging = true;
      wrapper.setPointerCapture(e.pointerId);
    }

    if (this.isDragging) {
      this.dragOffset = offset;
    }
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (!this.pointerDown) return;
    const elapsed = Date.now() - this.dragStartTime;
    const absDrag = Math.abs(this.dragOffset);
    
    if (this.isDragging && (absDrag > 20 || (absDrag > 5 && elapsed < 300))) {
      if (this.dragOffset < 0) this.next();
      else this.prev();
      this.addEventListener('click', this.handleClickCancel, { 
        capture: true, 
        once: true 
      });
    }
    
    if (this.isDragging) {
      const wrapper = e.currentTarget as HTMLElement;
      wrapper.releasePointerCapture(e.pointerId);
    }

    this.pointerDown = false;
    this.isDragging = false;
    this.dragOffset = 0;
    if (this.rotating) this.startAutoplay();
  };

  private toggleRotation = () => {
    this.rotationStopped = !this.rotationStopped;
  };

  /** 키보드 초점이 들어오면 멈춘다 — 포인터로 누른 초점은 멈추지 않는다(누른 버튼이 정지 버튼이면 그 클릭이 결정한다). */
  private handleFocusIn = (e: FocusEvent) => {
    if (!this.autoplay) return;
    const origin = e.composedPath()[0];
    if (origin instanceof Element && origin.matches(':focus-visible')) {
      this.rotationStopped = true;
    }
  };

  /** 보는 중에 동작 줄이기가 켜지면 멈춘다. 꺼질 때는 다시 시작하지 않는다 — 멈춘 것을 움직이게
   *  하는 것은 사용자의 몫이다. */
  private handleReducedMotionChange = (e: MediaQueryListEvent) => {
    if (e.matches && this.autoplay) this.rotationStopped = true;
  };

  private handlePointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') this.hovered = true;
  };

  private handlePointerLeave = () => {
    this.hovered = false;
  };

  private handleClickCancel = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-carousel': UCarousel;
  }
}

