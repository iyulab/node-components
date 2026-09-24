import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../src/components/icon/UIcon.js';
import { IconCache } from '../../src/utilities/icons.js';

/**
 * `u-icon` 은 SVG 가 도착하기 «전» 에도 자기 상자(1em × 1em)를 차지해야 한다.
 *
 * 아이콘은 비동기로 해석되고(`until`), 그 전에는 아무것도 그리지 않는다. 호스트에 고유 크기가
 * 없으면 그 사이 상자는 0 이고, SVG 가 오는 순간 주변이 밀린다 — 아이콘이 있는 모든 자리의
 * 레이아웃 이동이다. 실측: 접힌 사이드바 항목이 로드 전 16px 높이 줄에서 로드 뒤 36px 로 뛰었고,
 * 그 사이에 잰 타깃 크기 게이트가 부하에 따라 흔들렸다(modern-app `target-size`, 3회 중 1회).
 */
describe('u-icon reserves its box before the SVG arrives', () => {
  const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>';
  let release: () => void;

  beforeEach(() => {
    document.body.innerHTML = '';
    IconCache.clear();
    const gate = new Promise<void>((r) => { release = r; });
    vi.stubGlobal('fetch', vi.fn(async () => { await gate; return new Response(SVG, { status: 200 }); }));
  });
  afterEach(() => vi.unstubAllGlobals());

  // 요청마다 다른 URL — 앞 테스트의 풀리지 않은 요청이 진행 중 캐시(dedupe)에 남아 있다.
  let seq = 0;
  async function mount(): Promise<HTMLElement> {
    const wrap = document.createElement('div');
    wrap.style.fontSize = '20px';
    wrap.innerHTML = `<u-icon src="/icons/slow-${++seq}.svg"></u-icon>`;
    document.body.appendChild(wrap);
    const el = wrap.querySelector('u-icon') as HTMLElement & { updateComplete: Promise<unknown> };
    await el.updateComplete;
    return el;
  }

  it('is 1em square while the SVG is still loading', async () => {
    const el = await mount();
    expect(el.shadowRoot!.querySelector('svg')).toBeNull(); // still loading
    const r = el.getBoundingClientRect();
    expect([r.width, r.height]).toEqual([20, 20]);
  });

  it('keeps the same box once the SVG has arrived — nothing around it moves', async () => {
    const el = await mount();
    const before = el.getBoundingClientRect();
    release();
    await new Promise((r) => setTimeout(r, 30));
    expect(el.shadowRoot!.querySelector('svg')).not.toBeNull();
    const after = el.getBoundingClientRect();
    expect([after.width, after.height]).toEqual([before.width, before.height]);
  });
});
