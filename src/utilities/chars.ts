import type { ReactiveController, ReactiveControllerHost } from 'lit';

/** `chars` 가 유효한 글자 수인가 — 양의 유한수일 때만(그 밖은 지정 없음과 같다). 소수는 올린다. */
export function charsCount(n: number | undefined | null): number | undefined {
  return n != null && Number.isFinite(n) && n > 0 ? Math.ceil(n) : undefined;
}

/** 이 컨트롤러가 측정하는 컨트롤이 내주는 것. */
export interface CharsWidthOptions {
  /** 칸이 담을 글자 수(`chars` 속성). */
  chars(): number | undefined;
  /** 글자를 그리는 요소 — 그 계산된 글꼴로 잰다. 없으면 `box` 의 글꼴로. */
  text(): HTMLElement | null | undefined;
  /** 측정용 요소를 붙일 자리(글자 영역을 담는 컨테이너). */
  box(): HTMLElement | null | undefined;
}

/** 측정용 요소에 옮기는 글꼴 속성 — 그려지는 글자 폭을 바꾸는 것 전부. */
const FONT_PROPS = [
  'font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch',
  'font-variant-numeric', 'font-feature-settings', 'font-variation-settings', 'font-kerning', 'letter-spacing',
] as const;

/**
 * `chars` 의 폭 — «N자 칸» 을 **그려지는 N자** 로 잰다.
 *
 * CSS `ch` 는 글꼴 기능을 뺀 `0` 하나의 폭이다. 숫자를 고정폭(`font-variant-numeric: tabular-nums`)으로 그리거나
 * 자간(`letter-spacing`)을 주면 N자가 `Nch` 를 넘어, «N자리 숫자 칸» 이 마지막 숫자를 잘랐다(Pretendard 14px 에서 자당
 * 0.33px — 6자리면 2px). 그래서 글자 요소의 계산된 글꼴을 옮긴 보이지 않는 요소에 `0` N개를 실제로 그리고 그 폭을 쓴다.
 * 크기는 `ResizeObserver` 로 따른다 — 웹 글꼴이 늦게 실리거나 크기 단(`size`)이 바뀌어 폭이 달라지면 다시 읽는다.
 * 재기 전(첫 그림)에는 `Nch` 로 그린다.
 */
export class CharsWidthController implements ReactiveController {
  private sizer?: HTMLSpanElement;
  private observer?: ResizeObserver;
  private measured?: number;

  constructor(private readonly host: ReactiveControllerHost & HTMLElement, private readonly options: CharsWidthOptions) {
    host.addController(this);
  }

  /** 글자 영역의 CSS 길이 — 잰 폭(px), 재기 전에는 `Nch`, `chars` 가 없으면 `undefined`. */
  get width(): string | undefined {
    const n = charsCount(this.options.chars());
    if (!n) return undefined;
    return this.measured != null ? `${this.measured}px` : `${n}ch`;
  }

  hostUpdated(): void {
    this.measure();
  }

  hostDisconnected(): void {
    this.release();
  }

  private measure(): void {
    const n = charsCount(this.options.chars());
    const box = this.options.box();
    if (!n || !box) {
      if (this.sizer) {
        this.release();
        this.host.requestUpdate();
      }
      return;
    }
    if (!this.sizer || this.sizer.parentNode?.parentNode !== box) {
      this.release();
      // 두 겹: 바깥은 0×0 · overflow:hidden 이라 배치·스크롤 넘침에 아무것도 보태지 않고(흐름 밖 · 잘림),
      // 안쪽이 글자를 제 폭으로 그린다 — 그 폭을 ResizeObserver 가 읽는다.
      const frame = document.createElement('span');
      frame.setAttribute('aria-hidden', 'true');
      frame.style.cssText =
        'position:absolute;inset-block-start:0;inset-inline-start:0;inline-size:0;block-size:0;overflow:hidden;' +
        'visibility:hidden;pointer-events:none';
      const sizer = document.createElement('span');
      sizer.style.cssText = 'display:inline-block;white-space:pre';
      frame.appendChild(sizer);
      box.appendChild(frame);
      this.sizer = sizer;
      this.observer = new ResizeObserver((entries) => this.read(entries[entries.length - 1].contentRect.width));
      this.observer.observe(sizer);
    }
    const sizer = this.sizer;
    const source = getComputedStyle(this.options.text() ?? box);
    for (const prop of FONT_PROPS) sizer.style.setProperty(prop, source.getPropertyValue(prop));
    const digits = '0'.repeat(n);
    if (sizer.textContent !== digits) sizer.textContent = digits;
  }

  private read(width: number): void {
    if (!(width > 0)) return;
    // 정수 px 로 올린다 — 소수 폭을 그대로 주면 반올림 차이로 마지막 글자가 1px 미만 잘릴 수 있다.
    const rounded = Math.ceil(width);
    if (rounded === this.measured) return;
    this.measured = rounded;
    this.host.requestUpdate();
  }

  private release(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.sizer?.parentElement?.remove();
    this.sizer = undefined;
    this.measured = undefined;
  }
}
