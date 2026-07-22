import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../src/components/icon/UIcon.js';
import { IconCache } from '../../src/utilities/icons.js';

/**
 * ISSUE-components-20260722-iconregistry-resolver-no-cache:
 * 스트리밍 UI처럼 u-icon이 반복 재마운트되는 시나리오에서 같은 아이콘이
 * 마운트마다 다시 fetch되는 스톰 방지 — `src` 경로와 무-lib 기본(baseUrl) 경로도
 * IconRegistry의 URL 캐시를 경유해 동일 리소스는 세션당 1회만 fetch되어야 한다.
 */
describe('u-icon 재마운트 fetch 캐싱', () => {
  const SVG = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0"/></svg>';

  beforeEach(() => {
    document.body.innerHTML = '';
    IconCache.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function mountIcon(attrs: Record<string, string>): Promise<void> {
    const el = document.createElement('u-icon');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    // until() 디렉티브의 비동기 리졸브가 settle되도록 한 틱 대기
    await new Promise((r) => setTimeout(r, 20));
  }

  it('같은 src로 두 번 마운트해도 fetch는 1회만 발생한다', async () => {
    const fetchMock = vi.fn(async () => new Response(SVG, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await mountIcon({ src: '/icons/copy.svg' });
    document.body.innerHTML = ''; // 스트리밍 재렌더의 재마운트 시뮬레이션
    await mountIcon({ src: '/icons/copy.svg' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    // 캐시 경유 결과가 실제로 shadow DOM에 렌더되는지 검증 (fetch 카운트만으로는 렌더 회귀를 못 잡음)
    const icon = document.querySelector('u-icon')!;
    expect(icon.shadowRoot!.querySelector('svg')).toBeTruthy();
  });

  it('무-lib name 경로(기본 baseUrl)도 재마운트 시 fetch 1회만 발생한다', async () => {
    const fetchMock = vi.fn(async () => new Response(SVG, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await mountIcon({ name: 'copy' });
    document.body.innerHTML = '';
    await mountIcon({ name: 'copy' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const icon = document.querySelector('u-icon')!;
    expect(icon.shadowRoot!.querySelector('svg')).toBeTruthy();
  });

  it('404 아이콘도 재마운트 시 fetch 1회만 발생한다 (404 스톰 방지)', async () => {
    const fetchMock = vi.fn(async () => new Response('nope', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);

    await mountIcon({ src: '/icons/missing.svg' });
    document.body.innerHTML = '';
    await mountIcon({ src: '/icons/missing.svg' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
