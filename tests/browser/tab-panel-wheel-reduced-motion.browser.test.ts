import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/tab-panel/UTabPanel.js';
import '../../src/components/tab/UTab.js';
import type { UTabPanel } from '../../src/components/tab-panel/UTabPanel.js';

/**
 * 가로 탭 목록의 휠 스크롤이 «동작 줄이기» 를 존중하는가.
 *
 * 휠을 가로 스크롤로 바꿀 때 `behavior: 'smooth'` 를 무조건 넘겼다 — 스크립트의 부드러운
 * 스크롤은 엔진이 이 설정을 알아서 꺼 주지 않는다. 러너에서 미디어 상태를 켤 수 없으므로
 * `matchMedia` 를 그 질의에 한해 바꿔 끼운다(캐러셀 시험과 같은 관용구).
 */
const real = window.matchMedia.bind(window);
const stubReducedMotion = (matches: boolean) => {
  window.matchMedia = ((q: string) =>
    q.includes('prefers-reduced-motion') ? ({ matches, media: q } as MediaQueryList) : real(q)) as typeof window.matchMedia;
};

async function wheelBehavior(): Promise<ScrollBehavior | undefined> {
  const el = document.createElement('u-tab-panel') as UTabPanel;
  for (const v of ['a', 'b']) {
    const tab = document.createElement('u-tab');
    tab.setAttribute('value', v);
    tab.textContent = v;
    el.appendChild(tab);
  }
  document.body.appendChild(el);
  await el.updateComplete;
  const nav = el.shadowRoot!.querySelector('.nav') as HTMLElement;
  let seen: ScrollBehavior | undefined;
  nav.scrollBy = ((opts: ScrollToOptions) => { seen = opts.behavior; }) as typeof nav.scrollBy;
  nav.dispatchEvent(new WheelEvent('wheel', { deltaY: 40, bubbles: true, cancelable: true }));
  el.remove();
  return seen;
}

describe('u-tab-panel — 휠 스크롤과 동작 줄이기', () => {
  afterEach(() => { window.matchMedia = real; });

  it('🔴동작 줄이기면 즉시 스크롤한다', async () => {
    stubReducedMotion(true);
    expect(await wheelBehavior()).toBe('auto');
  });

  it('평상시에는 부드럽게 스크롤한다', async () => {
    stubReducedMotion(false);
    expect(await wheelBehavior()).toBe('smooth');
  });
});
