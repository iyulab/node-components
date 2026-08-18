import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../src/components/icon/UIcon.js';
import { IconCache } from '../../src/utilities/icons.js';

/**
 * ISSUE-components-20260722-iconregistry-resolver-no-cache:
 * Guards against a fetch storm when u-icon is repeatedly remounted, as in a streaming UI —
 * the same icon must not be re-fetched on every mount. Both `src` paths and the no-lib
 * default (baseUrl) path must go through IconRegistry's URL cache, so the same resource is
 * fetched at most once per session.
 */
describe('u-icon remount fetch caching', () => {
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
    // wait one tick for the until() directive's async resolve to settle
    await new Promise((r) => setTimeout(r, 20));
  }

  it('mounting twice with the same src still fetches only once', async () => {
    const fetchMock = vi.fn(async () => new Response(SVG, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await mountIcon({ src: '/icons/copy.svg' });
    document.body.innerHTML = ''; // simulates a remount from streaming re-render
    await mountIcon({ src: '/icons/copy.svg' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    // check the cached result actually renders into the shadow DOM (fetch count alone can't catch a render regression)
    const icon = document.querySelector('u-icon')!;
    expect(icon.shadowRoot!.querySelector('svg')).toBeTruthy();
  });

  it('the no-lib name path (default baseUrl) also fetches only once on remount', async () => {
    const fetchMock = vi.fn(async () => new Response(SVG, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await mountIcon({ name: 'copy' });
    document.body.innerHTML = '';
    await mountIcon({ name: 'copy' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const icon = document.querySelector('u-icon')!;
    expect(icon.shadowRoot!.querySelector('svg')).toBeTruthy();
  });

  it('a 404 icon also fetches only once on remount (guards against a 404 storm)', async () => {
    const fetchMock = vi.fn(async () => new Response('nope', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);

    await mountIcon({ src: '/icons/missing.svg' });
    document.body.innerHTML = '';
    await mountIcon({ src: '/icons/missing.svg' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
