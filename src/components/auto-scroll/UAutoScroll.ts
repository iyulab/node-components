import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { HostAria } from "../../utilities/hostAria.js";
import { styles } from "./UAutoScroll.styles.js";

/**
 * 넘치는 내용을 스스로 천천히 굴리는 상자 — 아무도 손대지 않는 화면(벽걸이 보드, 키오스크)에서 한 화면보다 긴 목록을
 * 끝까지 보이게 한다.
 *
 * 한 바퀴: 맨 위에서 `pause` 만큼 멈춤 → `speed`(px/초)로 끝까지 → 끝에서 `pause` 만큼 멈춤 → 맨 위로. 내용이 넘치지 않으면
 * 움직이지 않는다. 사람이 손을 대면 비킨다 — 포인터가 위에 있거나 초점이 안에 있으면 멈추고, 직접 굴리는 것은 언제나 된다.
 * 동작 줄이기(`prefers-reduced-motion: reduce`)를 켠 사용자에게는 움직이지 않는다(WCAG 2.2.2 — 손으로 굴리면 된다).
 * 화면에서 사라졌다가 다시 보이면(캐러셀이 그 장으로 돌아오면) 맨 위부터 다시 시작한다.
 *
 * 넘치는 동안 호스트는 키보드로 닿는 스크롤 영역이다(`tabindex="0"` — 소비자가 단 값은 덮지 않는다).
 *
 * @slot - 굴릴 내용
 */
@customElement('u-auto-scroll')
export class UAutoScroll extends UElement {
  static styles = [super.styles, styles];

  /** 굴리는 속도 (px/초) — `duration` 을 주면 그것이 정한다 */
  @property({ type: Number }) speed = 30;
  /**
   * 한 바퀴(위에서 멈춤 + 굴림 + 끝에서 멈춤)에 쓸 시간 (ms). 주면 속도는 남은 거리와 이 시간에서 나온다 — 캐러셀의 한 장처럼
   * 보이는 시간이 정해진 자리에서, 목록 길이와 상관없이 그 시간 안에 끝까지 보이게 한다. 0 이면 `speed` 를 쓴다.
   */
  @property({ type: Number }) duration = 0;
  /** 맨 위와 끝에서 멈추는 시간 (ms) */
  @property({ type: Number }) pause = 3000;
  /** 굴리지 않는다 — 손으로만 굴린다 */
  @property({ type: Boolean, reflect: true }) paused = false;

  private readonly aria = new HostAria(this);
  private frame?: number;
  private waitUntil = 0;
  /** 한 바퀴의 자리 — 맨 위에서 멈춤 · 굴림 · 끝에서 멈춤. */
  private phase: 'top' | 'down' | 'end' = 'top';
  /** 지금 굴리는 구간을 시작한 시각과 그때의 위치 — 소수 픽셀도 잃지 않는다(scrollTop 만 더하면 느린 속도에서 0 이 된다). */
  private legStart?: number;
  private legFrom = 0;
  private hovered = false;
  private focused = false;
  private visible = false;
  private reducedMotion?: MediaQueryList;
  private intersection?: IntersectionObserver;
  private resize?: ResizeObserver;

  connectedCallback(): void {
    super.connectedCallback();
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    this.addEventListener('pointerenter', this.onPointerEnter);
    this.addEventListener('pointerleave', this.onPointerLeave);
    this.addEventListener('focusin', this.onFocusIn);
    this.addEventListener('focusout', this.onFocusOut);
    this.intersection = new IntersectionObserver((entries) => {
      const now = entries.some((e) => e.isIntersecting);
      if (now && !this.visible) this.restart();
      this.visible = now;
    });
    this.intersection.observe(this);
    this.resize = new ResizeObserver(() => this.syncTabStop());
    this.resize.observe(this);
    this.frame = requestAnimationFrame(this.tick);
  }

  disconnectedCallback(): void {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = undefined;
    this.intersection?.disconnect();
    this.resize?.disconnect();
    this.removeEventListener('pointerenter', this.onPointerEnter);
    this.removeEventListener('pointerleave', this.onPointerLeave);
    this.removeEventListener('focusin', this.onFocusIn);
    this.removeEventListener('focusout', this.onFocusOut);
    super.disconnectedCallback();
  }

  /** 맨 위로 돌아가 한 바퀴를 처음부터 시작한다. */
  public restart(): void {
    this.scrollTop = 0;
    this.legStart = undefined;
    this.phase = 'top';
    this.waitUntil = performance.now() + this.pause;
  }

  protected render() {
    return html`<slot @slotchange=${this.syncTabStop}></slot>`;
  }

  private get overflowing() {
    return this.scrollHeight - this.clientHeight > 1;
  }

  private get moving() {
    return !this.paused && !this.hovered && !this.focused && this.visible && !this.reducedMotion?.matches;
  }

  private tick = (time: number) => {
    this.frame = requestAnimationFrame(this.tick);
    if (!this.moving || !this.overflowing) {
      // 멈춘 동안 사람이 굴린 자리에서 다시 이어 간다 — 다시 움직일 때 기준점을 새로 잡는다.
      this.legStart = undefined;
      return;
    }
    if (time < this.waitUntil) return;
    if (this.phase === 'top') this.phase = 'down';
    if (this.phase === 'end') {
      this.restart();
      return;
    }
    // 위치는 이 구간을 시작한 시각에서 계산한다 — 프레임 간격(느린 기기 · 스로틀)이 속도를 바꾸지 않는다.
    if (this.legStart === undefined) {
      this.legStart = time;
      this.legFrom = this.scrollTop;
    }
    const end = this.scrollHeight - this.clientHeight;
    const position = Math.min(end, this.legFrom + (this.pace(end - this.legFrom) * (time - this.legStart)) / 1000);
    this.scrollTop = position;
    if (position >= end) {
      this.phase = 'end';
      this.legStart = undefined;
      this.waitUntil = time + this.pause;
    }
  };

  /** px/초 — `duration` 이 있으면 남은 거리를 그 시간에서 두 번의 멈춤을 뺀 동안에 간다(최소 1초). */
  private pace(distance: number): number {
    if (!(this.duration > 0)) return this.speed;
    const travel = Math.max(1000, this.duration - 2 * this.pause);
    return Math.max(1, distance) / (travel / 1000);
  }

  private syncTabStop = () => {
    this.aria.set('tabindex', this.overflowing ? '0' : null);
  };

  private onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') this.hovered = true;
  };
  private onPointerLeave = () => {
    this.hovered = false;
  };
  private onFocusIn = () => {
    this.focused = true;
  };
  private onFocusOut = (e: FocusEvent) => {
    if (!this.contains(e.relatedTarget as Node | null)) this.focused = false;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-auto-scroll': UAutoScroll;
  }
}
