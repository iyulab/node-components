import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/carousel/UCarousel.js';
import type { UCarousel } from '../../src/components/carousel/UCarousel.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * 자동 넘김 캐러셀은 «움직이는 콘텐츠» 라 멈출 수단이 있어야 한다(WCAG 2.2.2 · KWCAG 6.2.2).
 * WAI-ARIA APG Carousel 패턴을 따른다:
 * - 회전 제어 버튼(정지/시작)이 인디케이터 줄의 첫 자리다 — 캐러셀 자체 컨트롤 중 첫 탭 정지점이다.
 * - 키보드 초점이 안으로 들어오면 멈추고, 사용자가 시작할 때까지 그대로다.
 * - 포인터가 위에 있는 동안은 잠시 멈춘다.
 * - 넘기는 동안 슬라이드 영역은 `aria-live="off"`, 멈추면 `polite` 다.
 */
describe('u-carousel rotation control', () => {
  // ⚠`loop` 를 쓰지 않는다 — 순환하면 슬라이드 수만큼 넘긴 뒤 다시 0 이라 «넘어갔다» 가
  //   «안 넘어갔다» 로 읽힌다(첫 판이 슬라이드 셋 · 세 번 넘김으로 정확히 그렇게 실패했다).
  const INTERVAL = 80;

  beforeEach(() => {
    document.body.innerHTML = '';
    Locale.set('en');
  });

  async function mount(attrs = 'autoplay'): Promise<UCarousel> {
    document.body.innerHTML =
      `<button id="before">before</button>` +
      `<u-carousel ${attrs} autoplay-interval="${INTERVAL}" style="display:block;width:300px;height:120px">` +
      `<div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div></u-carousel>`;
    // 포인터가 앞 시험의 자리에 남아 캐러셀 위에 있으면 «잠시 멈춤» 으로 시작한다 — 밖으로 옮겨 둔다.
    await userEvent.hover(document.getElementById('before')!);
    const el = document.querySelector('u-carousel') as UCarousel;
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    await el.updateComplete;
    return el;
  }

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
  const button = (el: UCarousel) =>
    el.shadowRoot!.querySelector('[part="rotation-button"]') as HTMLElement | null;
  const live = (el: UCarousel) =>
    el.shadowRoot!.querySelector('[part="slides"]')!.getAttribute('aria-live');

  it('autoplay 가 아니면 회전 버튼도 aria-live 도 없다', async () => {
    const el = await mount('');
    expect(button(el)).toBeNull();
    expect(live(el)).toBeNull();
  });

  it('간섭이 없으면 넘어간다 — 아래 «멈춤» 단언들의 대조군', async () => {
    const el = await mount();
    expect(button(el)!.getAttribute('aria-label')).toBe('Stop automatic slide show');
    expect(live(el)).toBe('off');
    await wait(INTERVAL * 3);
    expect(el.index).toBeGreaterThan(0);
  });

  it('정지 버튼을 누르면 멈추고, 시작 버튼으로 바뀌며, 다시 누르면 넘어간다', async () => {
    const el = await mount();
    await userEvent.click(button(el)!);
    await userEvent.hover(document.getElementById('before')!);
    await el.updateComplete;
    const at = el.index;
    await wait(INTERVAL * 3);
    expect(el.index).toBe(at);
    expect(button(el)!.getAttribute('aria-label')).toBe('Start automatic slide show');
    expect(live(el)).toBe('polite');

    await userEvent.click(button(el)!);
    await userEvent.hover(document.getElementById('before')!);
    await el.updateComplete;
    await wait(INTERVAL * 3);
    expect(el.index).toBeGreaterThan(at);
  });

  it('캐러셀의 첫 탭 정지점이 회전 버튼이고, 키보드 초점이 들어오면 멈춘다', async () => {
    const el = await mount();
    (document.getElementById('before') as HTMLElement).focus();
    await userEvent.tab();
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).toBe(button(el));
    expect(button(el)!.getAttribute('aria-label')).toBe('Start automatic slide show');
    const at = el.index;
    await wait(INTERVAL * 3);
    expect(el.index).toBe(at);
  });

  describe('prefers-reduced-motion: reduce', () => {
    /** 동작 줄이기 질의만 가짜로 답한다 — 다른 질의는 브라우저에 맡긴다. */
    function fakeReducedMotion(initial: boolean) {
      const real = window.matchMedia.bind(window);
      const listeners = new Set<(e: MediaQueryListEvent) => void>();
      const mql = {
        matches: initial,
        media: '(prefers-reduced-motion: reduce)',
        addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => listeners.add(fn),
        removeEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => listeners.delete(fn),
      } as unknown as MediaQueryList;
      window.matchMedia = ((q: string) => q.includes('prefers-reduced-motion') ? mql : real(q)) as typeof window.matchMedia;
      return {
        set(matches: boolean) {
          (mql as { matches: boolean }).matches = matches;
          listeners.forEach(fn => fn({ matches } as MediaQueryListEvent));
        },
        restore() { window.matchMedia = real; },
      };
    }

    it('정지 상태로 시작하고, 시작 버튼으로 켤 수 있다', async () => {
      const media = fakeReducedMotion(true);
      try {
        const el = await mount();
        expect(button(el)!.getAttribute('aria-label')).toBe('Start automatic slide show');
        await wait(INTERVAL * 3);
        expect(el.index).toBe(0);
        button(el)!.click();
        await el.updateComplete;
        await wait(INTERVAL * 3);
        expect(el.index).toBeGreaterThan(0);
      } finally {
        media.restore();
      }
    });

    it('보는 중에 설정이 켜지면 멈추고, 꺼져도 저절로 다시 시작하지 않는다', async () => {
      const media = fakeReducedMotion(false);
      try {
        const el = await mount();
        expect(button(el)!.getAttribute('aria-label')).toBe('Stop automatic slide show');
        media.set(true);
        await el.updateComplete;
        expect(button(el)!.getAttribute('aria-label')).toBe('Start automatic slide show');
        const at = el.index;
        media.set(false);
        await el.updateComplete;
        await wait(INTERVAL * 3);
        expect(el.index).toBe(at);
      } finally {
        media.restore();
      }
    });
  });

  it('포인터가 위에 있는 동안만 잠시 멈춘다', async () => {
    const el = await mount();
    await userEvent.hover(el);
    await el.updateComplete;
    // 부하가 걸린 실행에서는 hover 전에 이미 마지막 슬라이드까지 넘어가 있을 수 있다(`loop` 없음 —
    // 그러면 아래 «다시 넘어간다» 가 원리적으로 성립하지 않는다). 처음으로 되돌려 재기 시작한다.
    el.index = 0;
    await el.updateComplete;
    const at = el.index;
    await wait(INTERVAL * 3);
    expect(el.index).toBe(at);
    // 잠시 멈춤은 «정지» 가 아니다 — 버튼은 여전히 정지 버튼이다.
    expect(button(el)!.getAttribute('aria-label')).toBe('Stop automatic slide show');

    await userEvent.hover(document.getElementById('before')!);
    await el.updateComplete;
    await wait(INTERVAL * 3);
    expect(el.index).toBeGreaterThan(at);
  });
});
