import { describe, it, expect, afterEach, vi } from 'vitest';
import { IconCache, IconRegistry } from '../../src/utilities/icons.js';

// IconCache/IconRegistry are static singletons and register() ignores a duplicate lib, so
// each test uses a unique lib name and clears the cache in afterEach.
let libSeq = 0;
function uniqueLib(): string {
  return `test-lib-${libSeq++}`;
}

afterEach(() => {
  IconCache.clear();
  vi.unstubAllGlobals();
});

describe('IconRegistry.resolve caching contract', () => {
  it('caches a successful result per (lib, name) so the resolver is not called again', async () => {
    const lib = uniqueLib();
    const resolver = vi.fn(async () => '<svg>ok</svg>');
    IconRegistry.register(lib, resolver);

    const first = await IconRegistry.resolve(lib, 'copy');
    const second = await IconRegistry.resolve(lib, 'copy');

    expect(first).toBe('<svg>ok</svg>');
    expect(second).toBe('<svg>ok</svg>');
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  it('a different name resolves independently (the cache key is lib+name)', async () => {
    const lib = uniqueLib();
    const resolver = vi.fn(async (name: string) => `<svg>${name}</svg>`);
    IconRegistry.register(lib, resolver);

    await IconRegistry.resolve(lib, 'a');
    await IconRegistry.resolve(lib, 'b');

    expect(resolver).toHaveBeenCalledTimes(2);
    expect(await IconRegistry.resolve(lib, 'a')).toBe('<svg>a</svg>');
    expect(resolver).toHaveBeenCalledTimes(2);
  });

  it('concurrent requests for the same (lib, name) share the in-flight Promise (dedupe)', async () => {
    const lib = uniqueLib();
    let release!: (svg: string) => void;
    const gate = new Promise<string>((resolve) => { release = resolve; });
    const resolver = vi.fn(() => gate);
    IconRegistry.register(lib, resolver);

    const p1 = IconRegistry.resolve(lib, 'copy');
    const p2 = IconRegistry.resolve(lib, 'copy');
    release('<svg>once</svg>');

    expect(await p1).toBe('<svg>once</svg>');
    expect(await p2).toBe('<svg>once</svg>');
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  it('the cached result has trim applied', async () => {
    const lib = uniqueLib();
    IconRegistry.register(lib, async () => '  <svg>pad</svg>\n');

    expect(await IconRegistry.resolve(lib, 'x')).toBe('<svg>pad</svg>');
    expect(IconCache.get(lib, 'x')).toBe('<svg>pad</svg>');
  });

  it('after IconCache.clear(), the resolver is called again (the escape hatch)', async () => {
    const lib = uniqueLib();
    const resolver = vi.fn(async () => '<svg>v1</svg>');
    IconRegistry.register(lib, resolver);

    await IconRegistry.resolve(lib, 'x');
    IconCache.clear();
    await IconRegistry.resolve(lib, 'x');

    expect(resolver).toHaveBeenCalledTimes(2);
  });
});

describe('IconRegistry.resolve failure-semantics contract', () => {
  it('returning undefined = a confirmed not-found → gets negative-cached, not re-called', async () => {
    const lib = uniqueLib();
    const resolver = vi.fn(async () => undefined);
    IconRegistry.register(lib, resolver);

    const first = await IconRegistry.resolve(lib, 'missing');
    const second = await IconRegistry.resolve(lib, 'missing');

    expect(first).toBeUndefined();
    expect(second).toBeUndefined();
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  it('a throw = a transient error → not cached, and it retries on the next call', async () => {
    const lib = uniqueLib();
    let calls = 0;
    const resolver = vi.fn(async () => {
      calls++;
      if (calls === 1) throw new Error('network down');
      return '<svg>recovered</svg>';
    });
    IconRegistry.register(lib, resolver);

    // first call: throw → resolve() returns undefined for render safety (no propagation)
    const first = await IconRegistry.resolve(lib, 'x');
    expect(first).toBeUndefined();

    // an undefined that came from a throw must not be cached — the resolver reruns on the next call
    const second = await IconRegistry.resolve(lib, 'x');
    expect(second).toBe('<svg>recovered</svg>');
    expect(resolver).toHaveBeenCalledTimes(2);
  });

  it('even if a throw happens during concurrent requests, every caller gets undefined (no rejection propagation)', async () => {
    const lib = uniqueLib();
    let reject!: (err: Error) => void;
    const gate = new Promise<string>((_, rej) => { reject = rej; });
    const resolver = vi.fn(() => gate);
    IconRegistry.register(lib, resolver);

    const p1 = IconRegistry.resolve(lib, 'x');
    const p2 = IconRegistry.resolve(lib, 'x');
    reject(new Error('boom'));

    // both callers must settle by resolving undefined, not by rejecting
    await expect(p1).resolves.toBeUndefined();
    await expect(p2).resolves.toBeUndefined();
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  it('unregister also clears that lib\'s cache (prevents stale results when unregister→register overrides it)', async () => {
    const lib = uniqueLib();
    IconRegistry.register(lib, async () => '<svg>old</svg>');
    await IconRegistry.resolve(lib, 'x');

    IconRegistry.unregister(lib);
    const newResolver = vi.fn(async () => '<svg>new</svg>');
    IconRegistry.register(lib, newResolver);

    expect(await IconRegistry.resolve(lib, 'x')).toBe('<svg>new</svg>');
    expect(newResolver).toHaveBeenCalledTimes(1);
  });

  it('IconCache.clear(lib) clears only that lib\'s entries', async () => {
    const libA = uniqueLib();
    const libB = uniqueLib();
    IconCache.set(libA, 'x', '<svg>a</svg>');
    IconCache.set(libB, 'x', '<svg>b</svg>');

    IconCache.clear(libA);

    expect(IconCache.has(libA, 'x')).toBe(false);
    expect(IconCache.get(libB, 'x')).toBe('<svg>b</svg>');
  });

  it('an unregistered lib returns undefined but is not cached (allows registering later)', async () => {
    const lib = uniqueLib();
    expect(await IconRegistry.resolve(lib, 'x')).toBeUndefined();

    // once registered afterward, it must resolve normally
    IconRegistry.register(lib, async () => '<svg>late</svg>');
    expect(await IconRegistry.resolve(lib, 'x')).toBe('<svg>late</svg>');
  });
});

describe('IconRegistry.resolveUrl (direct URL resolution caching)', () => {
  it('caches a successful result per URL so fetch is not called again', async () => {
    const fetchMock = vi.fn(async () => new Response('<svg>u</svg>', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await IconRegistry.resolveUrl('https://x.test/a.svg')).toBe('<svg>u</svg>');
    expect(await IconRegistry.resolveUrl('https://x.test/a.svg')).toBe('<svg>u</svg>');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('HTTP 404 → undefined → negative-cached, fetch only once', async () => {
    const fetchMock = vi.fn(async () => new Response('nope', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await IconRegistry.resolveUrl('https://x.test/missing.svg')).toBeUndefined();
    expect(await IconRegistry.resolveUrl('https://x.test/missing.svg')).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('a network error is not cached and gets retried', async () => {
    let calls = 0;
    const fetchMock = vi.fn(async () => {
      calls++;
      if (calls === 1) throw new TypeError('fetch failed');
      return new Response('<svg>back</svg>', { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    expect(await IconRegistry.resolveUrl('https://x.test/flaky.svg')).toBeUndefined();
    expect(await IconRegistry.resolveUrl('https://x.test/flaky.svg')).toBe('<svg>back</svg>');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('concurrent requests for the same URL share the in-flight one (dedupe)', async () => {
    let release!: (r: Response) => void;
    const gate = new Promise<Response>((resolve) => { release = resolve; });
    const fetchMock = vi.fn(() => gate);
    vi.stubGlobal('fetch', fetchMock);

    const p1 = IconRegistry.resolveUrl('https://x.test/con.svg');
    const p2 = IconRegistry.resolveUrl('https://x.test/con.svg');
    release(new Response('<svg>once</svg>', { status: 200 }));

    expect(await p1).toBe('<svg>once</svg>');
    expect(await p2).toBe('<svg>once</svg>');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('built-in resolver purity (fetch contract)', () => {
  it('bootstrap: HTTP 404 → undefined (not-found) → negative-cached, fetch only once', async () => {
    const fetchMock = vi.fn(async () => new Response('nope', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await IconRegistry.resolve('bootstrap', 'no-such-icon')).toBeUndefined();
    expect(await IconRegistry.resolve('bootstrap', 'no-such-icon')).toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('bootstrap: a network error is not cached and gets retried; on recovery the success result is cached', async () => {
    let calls = 0;
    const fetchMock = vi.fn(async () => {
      calls++;
      if (calls === 1) throw new TypeError('fetch failed');
      return new Response('<svg>net-ok</svg>', { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    expect(await IconRegistry.resolve('bootstrap', 'flaky-icon')).toBeUndefined();
    expect(await IconRegistry.resolve('bootstrap', 'flaky-icon')).toBe('<svg>net-ok</svg>');
    // a cache hit after success
    expect(await IconRegistry.resolve('bootstrap', 'flaky-icon')).toBe('<svg>net-ok</svg>');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('bootstrap: a successful result is cached, so fetch happens only once', async () => {
    const fetchMock = vi.fn(async () => new Response('<svg>b</svg>', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await IconRegistry.resolve('bootstrap', 'copy')).toBe('<svg>b</svg>');
    expect(await IconRegistry.resolve('bootstrap', 'copy')).toBe('<svg>b</svg>');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('internal: a bundled icon resolves with no fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    // fetch must not be called regardless of whether the icon actually exists in the bundle
    await IconRegistry.resolve('internal', 'anything');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
