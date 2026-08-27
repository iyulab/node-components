import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/carousel/UCarousel.js';
import type { UCarousel } from '../../src/components/carousel/UCarousel.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `u-carousel`의 이전/다음 버튼(`u-button`)과 페이지네이션 점(native `<button>`)이
 * 아이콘 전용이라 접근 가능한 이름이 아예 생성된 적이 없었다(cycle-345 실측 —
 * HD-17). `Locale.getValue()`로 채운 `aria-label`이 실제 접근성 트리에 노출되는
 * 노드까지 도달하는지(u-button은 shadow forwarding을 거친다) 확인한다.
 */
describe('u-carousel accessible name', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // 활성 로케일은 실브라우저의 navigator.language(호스트 OS 설정)를 따라간다 —
    // 값 자체는 여기서 재는 대상이 아니므로 'en'으로 고정해 결정론적으로 만든다.
    Locale.set('en');
  });

  async function mount(): Promise<UCarousel> {
    const el = document.createElement('u-carousel') as UCarousel;
    el.setAttribute('navigation', '');
    el.setAttribute('pagination', '');
    el.setAttribute('loop', '');
    el.setAttribute('slides-per-move', '1');
    for (let i = 0; i < 3; i++) {
      const slide = document.createElement('div');
      slide.textContent = `slide ${i}`;
      el.appendChild(slide);
    }
    document.body.appendChild(el);
    await el.updateComplete;
    // slotchange가 slideCount를 채운 뒤 한 번 더 렌더 사이클이 돈다
    await new Promise(r => setTimeout(r, 0));
    await el.updateComplete;
    return el;
  }

  it('prev/next 버튼의 aria-label이 내부 native <button>까지 forwarding된다', async () => {
    const el = await mount();
    const prevHost = el.shadowRoot!.querySelector('u-button[part="prev-button"]') as HTMLElement;
    const nextHost = el.shadowRoot!.querySelector('u-button[part="next-button"]') as HTMLElement;
    expect(prevHost.getAttribute('aria-label')).toBe('Previous slide');
    expect(nextHost.getAttribute('aria-label')).toBe('Next slide');

    await (prevHost as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    await (nextHost as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    const prevInner = prevHost.shadowRoot!.querySelector('button');
    const nextInner = nextHost.shadowRoot!.querySelector('button');
    expect(prevInner!.getAttribute('aria-label')).toBe('Previous slide');
    expect(nextInner!.getAttribute('aria-label')).toBe('Next slide');
  });

  it('페이지네이션 점마다 1-based 순번이 들어간 aria-label을 갖는다', async () => {
    const el = await mount();
    const dots = [...el.shadowRoot!.querySelectorAll('button[part="dot"]')];
    expect(dots.length).toBeGreaterThan(0);
    expect(dots[0].getAttribute('aria-label')).toBe('Go to slide 1');
    expect(dots[1].getAttribute('aria-label')).toBe('Go to slide 2');
  });

  it('현재 페이지의 점만 aria-current="true"다', async () => {
    const el = await mount();
    const dots = [...el.shadowRoot!.querySelectorAll('button[part="dot"]')];
    expect(dots[0].getAttribute('aria-current')).toBe('true');
    expect(dots[1].getAttribute('aria-current')).toBe('false');
  });
});
