import { html, nothing, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { keyed } from "lit/directives/keyed.js";
import '../button/UButton.js';
import '../icon/UIcon.js';

import { UElement } from "../UElement.js";
import { Locale } from "../../utilities/Locale.js";
import { HostAria } from "../../utilities/hostAria.js";
import { UNATTENDED_IDLE_MS } from "../../utilities/unattended.js";
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
 * `unattended` 는 아무도 앞에서 조작하지 않는 화면(벽걸이 보드 · 로비 · 키오스크)이다 — 전체 화면이면 마우스 커서가 늘 그 위에
 * 있으므로 포인터로는 멈추지 않고, 키보드 초점으로 멈춘 회전은 `resume-delay`(기본 30초) 동안 손대지 않으면 다시 돈다. 정지 버튼으로 멈춘 것은
 * 그대로 멈춰 있다(멈출 수단은 남는다 — 2.2.2).
 *
 * 보조기기에는 WAI-ARIA APG Carousel 구조로 나간다 — 호스트는 «캐러셀» 역할 설명을 단 영역(`region`), 각 슬라이드는
 * «슬라이드» 역할 설명과 «n / 전체» 이름을 단 그룹이다. 캐러셀의 이름은 호스트의 `aria-label` 로 준다(영역은 이름이
 * 있어야 랜드마크다). 슬라이드에 소비자가 이미 단 `role`·`aria-roledescription`·`aria-label` 은 덮지 않는다.
 *
 * 보이지 않는 장은 `inert` 다 — 화면 밖 장의 링크 · 단추가 Tab 순서와 읽기 순서에서 빠진다(소비자가 처음부터 단 `inert` 는 덮지 않는다).
 *
 * @event change - 보이는 장이 바뀌었다 — 사람(단추 · 점 · 끌기 · `next()`/`prev()`/`goTo()`)이든 자동 넘김이든. `detail` 은 새 순번 · 직전 순번 · `cause`(`user` · `autoplay`). `index` 를 대입하면 내지 않고, 거품을 일으키지 않는다(`u-tab-panel` 과 같다).
 * @csspart slides - 슬라이드 컨테이너
 * @csspart prev-button - 이전 버튼
 * @csspart next-button - 다음 버튼
 * @csspart indicator - 페이지네이션 컨테이너
 * @csspart dot - 페이지네이션 점 (`pagination-style="labels"` 이면 이름 칸)
 * @csspart dot-label - 이름 칸의 글자 (`labels` 일 때만)
 * @csspart dot-track - 이름 칸의 진행 막대 자리 (`labels` 일 때만)
 * @csspart dot-progress - 진행 막대의 채움 — 넘기는 동안 현재 칸이 간격만큼 차오른다 (`labels` 일 때만)
 * @csspart rotation-button - 자동 넘김 정지/시작 버튼 (`autoplay` 일 때만, 인디케이터 안)
 */
@customElement('u-carousel')
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
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
  /**
   * 페이지네이션 모양 — `dots`(기본, 슬라이드 위에 겹친 점) · `labels`(슬라이드 아래 줄에 각 슬라이드의 이름과 진행 막대).
   * `labels` 는 벽걸이 화면처럼 «지금 어느 장이고 다음은 무엇이며 언제 넘어가는가» 를 멀리서 읽어야 할 때다. 이름은 슬라이드에
   * 단 `aria-label` 이고(없으면 순번), 넘기는 동안 현재 칸의 막대가 `autoplay-interval` 만큼 차오른다.
   */
  @property({ type: String, reflect: true, attribute: 'pagination-style' }) paginationStyle: 'dots' | 'labels' = 'dots';
  /** 드래그로 슬라이드 이동 */
  @property({ type: Boolean, reflect: true }) draggable = false;
  /**
   * 아무도 조작하지 않는 화면 — 포인터가 위에 있어도 멈추지 않고, 키보드 초점으로 멈춘 회전은 `resume-delay`(기본 30초) 동안 손대지
   * 않으면 다시 돈다. 정지 버튼으로 멈춘 것은 그대로다. `u-auto-scroll` 의 같은 속성과 짝이다.
   */
  @property({ type: Boolean, reflect: true }) unattended = false;
  /** `unattended` 에서 키보드 초점으로 멈춘 회전이 다시 돌기까지 손대지 않은 시간 (ms). */
  @property({ type: Number, attribute: 'resume-delay' }) resumeDelay = UNATTENDED_IDLE_MS;
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
  /** 포인터가 캐러셀 위에 있다 — 그동안만 잠시 멈춘다(`unattended` 가 아닐 때). */
  @state() private hovered = false;
  /** 왜 멈췄는가 — `unattended` 에서 초점으로 멈춘 것만 손대지 않으면 다시 돈다. */
  private stopReason?: 'user' | 'focus' | 'motion';
  private idleTimer?: number;

  private autoplayTimer?: number;
  /** 호스트 역할(region · «캐러셀» 역할 설명)을 속성으로 — 소비자의 `role`·`aria-roledescription` 이 있으면 그것이 이긴다. */
  private readonly aria = new HostAria(this);
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
    return this.autoplay && !this.rotationStopped && (this.unattended || !this.hovered);
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
    this.aria.set('role', 'region');
    this.aria.set('aria-roledescription', Locale.getValue('carousel'));
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.handlePointerLeave);
    this.addEventListener('keydown', this.handleActivity);
    this.addEventListener('pointerdown', this.handleActivity);
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
    this.removeEventListener('keydown', this.handleActivity);
    this.removeEventListener('pointerdown', this.handleActivity);
    this.clearIdle();
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    // 자동 넘김을 새로 켜면 이전의 «사용자가 멈춤» 은 잊는다 — 동작 줄이기를 켠 사용자에게는
    // 정지 상태로 시작한다(움직임은 사용자가 시작 버튼으로 고른다).
    if (changedProperties.has('autoplay') && this.autoplay) {
      this.rotationStopped = !!this.reducedMotion?.matches;
      this.stopReason = this.rotationStopped ? 'motion' : undefined;
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

    if (changedProperties.has('index') || changedProperties.has('slideCount') || changedProperties.has('slidesPerView')) {
      this.syncInertSlides();
    }

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
        ${!this.showDots ? nothing : this.paginationStyle === 'labels' ? this.renderLabels() : Array.from({ length: this.pageCount }, (_, i) => html`
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

  /** 이름 칸 — 지나온 칸은 찬 막대, 현재 칸은 넘기는 동안 간격만큼 차오르는 막대(멈추면 빈 막대). */
  private renderLabels() {
    const current = this.currentPage;
    return Array.from({ length: this.pageCount }, (_, i) => {
      const fill = i === current && this.rotating
        // 장이 바뀌거나 다시 넘기기 시작하면 새 요소로 — 애니메이션이 처음부터 타이머와 함께 돈다.
        ? keyed(`${this.index}`, html`<span part="dot-progress" class="tab-fill running"
            style="animation-duration: ${this.autoplayInterval}ms"></span>`)
        : html`<span part="dot-progress" class="tab-fill" ?full=${i < current}></span>`;
      return html`
        <button part="dot" class="tab"
          aria-current=${i === current ? 'true' : 'false'}
          ?active=${i === current}
          @click=${() => this.goTo(Math.min(i * this.perMove, this.maxIndex))}>
          <span part="dot-label" class="tab-label">${this.pageLabel(i)}</span>
          <span part="dot-track" class="tab-track">${fill}</span>
        </button>
      `;
    });
  }

  /** 한 칸의 이름 — 그 칸 첫 슬라이드에 소비자가 단 `aria-label`, 없으면 순번. */
  private pageLabel(page: number): string {
    const slide = this.slides[Math.min(page * this.perMove, this.maxIndex)];
    const ours = slide ? this.ownedSlideAttrs.get(slide)?.includes('aria-label') : true;
    return (!ours && slide?.getAttribute('aria-label')) || String(page + 1);
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
    const previousIndex = this.index;
    this.index = index;
    if (this.rotating) this.startAutoplay();
    // 바깥(장마다 따라가는 제목 · 범례)이 지금 장을 알게 — 형제 `u-tab-panel` 과 같은 이름 · 같은 전파(거품 없음).
    this.fire<UCarouselChangeDetail>('change', {
      detail: { index, previousIndex, cause: this.moveCause },
      bubbles: false,
      composed: false,
    });
  }

  /** 지금 넘김을 일으킨 것 — 자동 넘김 타이머만 `autoplay` 로 바꾸고 곧바로 되돌린다. */
  private moveCause: UCarouselChangeDetail['cause'] = 'user';

  private startAutoplay() {
    this.stopAutoplay();
    this.autoplayTimer = window.setInterval(() => {
      this.moveCause = 'autoplay';
      try {
        this.next();
      } finally {
        this.moveCause = 'user';
      }
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
    if (this.isConnected) this.aria.set('aria-roledescription', Locale.getValue('carousel'));
    this.slides.forEach((slide, i) => this.labelSlide(slide, i, this.slides.length));
    super.localeChanged();
  }

  /** 슬라이드를 «n / 전체» 이름의 그룹으로 — 처음 볼 때 비어 있던 속성만 우리 것으로 삼고, 그것만 갱신한다. */
  private labelSlide(slide: Element, i: number, total: number) {
    let owned = this.ownedSlideAttrs.get(slide);
    if (!owned) {
      owned = ['role', 'aria-roledescription', 'aria-label', 'inert'].filter((name) => !slide.hasAttribute(name));
      this.ownedSlideAttrs.set(slide, owned);
    }
    const values: Record<string, string> = {
      role: 'group',
      'aria-roledescription': Locale.getValue('slide'),
      'aria-label': Locale.getValue('slideOf', { n: i + 1, total }),
    };
    for (const name of owned) if (name in values) slide.setAttribute(name, values[name]);
  }

  /**
   * 보이지 않는 장을 `inert` 로 — 화면 밖 장의 링크 · 단추가 Tab 순서에 남고 읽기 순서에서 보이는 장과 섞이지 않게(APG Carousel).
   * 여러 장을 함께 보이면(`slides-per-view`) 그 범위 밖만. 소비자가 처음부터 단 `inert` 는 우리 것이 아니라 건드리지 않는다.
   */
  private syncInertSlides() {
    const from = this.index;
    const to = this.index + this.perView;
    this.slides.forEach((slide, i) => {
      if (!this.ownedSlideAttrs.get(slide)?.includes('inert')) return;
      slide.toggleAttribute('inert', i < from || i >= to);
    });
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
    if (this.rotationStopped) this.startRotation();
    else this.stopRotation();
  };

  /** 자동 넘김을 다시 시작한다 — 정지 버튼 · 초점 · 동작 줄이기로 멈춘 것 모두(`autoplay` 일 때만 돈다). */
  public startRotation(): void {
    this.clearIdle();
    this.stopReason = undefined;
    this.rotationStopped = false;
  }

  /** 자동 넘김을 멈춘다 — 정지 버튼과 같다(`unattended` 에서도 저절로 다시 돌지 않는다). */
  public stopRotation(): void {
    this.clearIdle();
    this.stopReason = 'user';
    this.rotationStopped = true;
  }

  /** `unattended` 에서 초점으로 멈췄으면, 손대지 않고 `resumeDelay` 가 지나면 다시 돈다 — 키 · 포인터를 누를 때마다 다시 잰다. */
  private scheduleIdleResume() {
    this.clearIdle();
    if (!this.unattended || this.stopReason !== 'focus') return;
    this.idleTimer = window.setTimeout(() => {
      this.idleTimer = undefined;
      if (this.unattended && this.stopReason === 'focus') {
        this.stopReason = undefined;
        this.rotationStopped = false;
      }
    }, this.resumeDelay);
  }

  private clearIdle() {
    if (this.idleTimer !== undefined) window.clearTimeout(this.idleTimer);
    this.idleTimer = undefined;
  }

  private handleActivity = () => {
    if (this.idleTimer !== undefined) this.scheduleIdleResume();
  };

  /** 키보드 초점이 들어오면 멈춘다 — 포인터로 누른 초점은 멈추지 않는다(누른 버튼이 정지 버튼이면 그 클릭이 결정한다). */
  private handleFocusIn = (e: FocusEvent) => {
    if (!this.autoplay) return;
    const origin = e.composedPath()[0];
    if (origin instanceof Element && origin.matches(':focus-visible') && this.stopReason !== 'user') {
      this.rotationStopped = true;
      this.stopReason = 'focus';
      this.scheduleIdleResume();
    }
  };

  /** 보는 중에 동작 줄이기가 켜지면 멈춘다. 꺼질 때는 다시 시작하지 않는다 — 멈춘 것을 움직이게
   *  하는 것은 사용자의 몫이다. */
  private handleReducedMotionChange = (e: MediaQueryListEvent) => {
    if (e.matches && this.autoplay) {
      this.clearIdle();
      this.rotationStopped = true;
      this.stopReason = 'motion';
    }
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

/** `<u-carousel>` 의 `change` detail. */
export interface UCarouselChangeDetail {
  /** 지금 장(첫 보이는 장)의 순번. */
  index: number;
  /** 바뀌기 전 순번. */
  previousIndex: number;
  /** 사람이 넘겼는가(단추 · 점 · 끌기 · 메서드) · 자동 넘김인가. */
  cause: 'user' | 'autoplay';
}

/** Events `<u-carousel>` dispatches. */
export interface UCarouselEventMap {
  /** The shown slide changed — by a person (buttons, dots, drag, `next()`/`prev()`/`goTo()`) or by autoplay. Not when `index` is set. Does not bubble. */
  'change': CustomEvent<UCarouselChangeDetail>;
}

/** Typed listeners for {@link UCarouselEventMap} — element-scoped, the DOM's own pattern (`HTMLMediaElementEventMap`). */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
export interface UCarousel {
  addEventListener<K extends keyof UCarouselEventMap>(type: K, listener: (this: UCarousel, ev: UCarouselEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: UCarousel, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof UCarouselEventMap>(type: K, listener: (this: UCarousel, ev: UCarouselEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: UCarousel, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'u-carousel': UCarousel;
  }
}

