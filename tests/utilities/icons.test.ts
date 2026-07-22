import { describe, it, expect, afterEach, vi } from 'vitest';
import { IconCache, IconRegistry } from '../../src/utilities/icons.js';

// IconCache/IconRegistry는 static 싱글톤이고 register()는 중복 lib을 무시하므로,
// 각 테스트는 고유한 lib 이름을 사용하고 afterEach에서 캐시를 비운다.
let libSeq = 0;
function uniqueLib(): string {
  return `test-lib-${libSeq++}`;
}

afterEach(() => {
  IconCache.clear();
  vi.unstubAllGlobals();
});

describe('IconRegistry.resolve 캐싱 계약', () => {
  it('성공 결과를 (lib, name) 단위로 캐시해 리졸버를 재호출하지 않는다', async () => {
    const lib = uniqueLib();
    const resolver = vi.fn(async () => '<svg>ok</svg>');
    IconRegistry.register(lib, resolver);

    const first = await IconRegistry.resolve(lib, 'copy');
    const second = await IconRegistry.resolve(lib, 'copy');

    expect(first).toBe('<svg>ok</svg>');
    expect(second).toBe('<svg>ok</svg>');
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  it('다른 name은 각각 리졸브한다 (캐시 키는 lib+name)', async () => {
    const lib = uniqueLib();
    const resolver = vi.fn(async (name: string) => `<svg>${name}</svg>`);
    IconRegistry.register(lib, resolver);

    await IconRegistry.resolve(lib, 'a');
    await IconRegistry.resolve(lib, 'b');

    expect(resolver).toHaveBeenCalledTimes(2);
    expect(await IconRegistry.resolve(lib, 'a')).toBe('<svg>a</svg>');
    expect(resolver).toHaveBeenCalledTimes(2);
  });

  it('동일 (lib, name) 동시 요청은 in-flight Promise를 공유한다 (dedupe)', async () => {
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

  it('캐시된 결과는 trim 적용된 값이다', async () => {
    const lib = uniqueLib();
    IconRegistry.register(lib, async () => '  <svg>pad</svg>\n');

    expect(await IconRegistry.resolve(lib, 'x')).toBe('<svg>pad</svg>');
    expect(IconCache.get(lib, 'x')).toBe('<svg>pad</svg>');
  });

  it('IconCache.clear() 후에는 리졸버가 다시 호출된다 (탈출구)', async () => {
    const lib = uniqueLib();
    const resolver = vi.fn(async () => '<svg>v1</svg>');
    IconRegistry.register(lib, resolver);

    await IconRegistry.resolve(lib, 'x');
    IconCache.clear();
    await IconRegistry.resolve(lib, 'x');

    expect(resolver).toHaveBeenCalledTimes(2);
  });
});

describe('IconRegistry.resolve 실패 시멘틱 계약', () => {
  it('undefined 반환 = not-found 확정 → 네거티브 캐시되어 재호출하지 않는다', async () => {
    const lib = uniqueLib();
    const resolver = vi.fn(async () => undefined);
    IconRegistry.register(lib, resolver);

    const first = await IconRegistry.resolve(lib, 'missing');
    const second = await IconRegistry.resolve(lib, 'missing');

    expect(first).toBeUndefined();
    expect(second).toBeUndefined();
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  it('throw = 일시 오류 → 캐시하지 않고 재호출 시 재시도한다', async () => {
    const lib = uniqueLib();
    let calls = 0;
    const resolver = vi.fn(async () => {
      calls++;
      if (calls === 1) throw new Error('network down');
      return '<svg>recovered</svg>';
    });
    IconRegistry.register(lib, resolver);

    // 첫 호출: throw → resolve()는 렌더 안전을 위해 undefined 반환 (전파 금지)
    const first = await IconRegistry.resolve(lib, 'x');
    expect(first).toBeUndefined();

    // throw 유래 undefined는 캐시되면 안 된다 — 재호출 시 리졸버 재실행
    const second = await IconRegistry.resolve(lib, 'x');
    expect(second).toBe('<svg>recovered</svg>');
    expect(resolver).toHaveBeenCalledTimes(2);
  });

  it('동시 요청 중 throw가 나도 모든 호출자가 undefined를 받는다 (rejection 전파 금지)', async () => {
    const lib = uniqueLib();
    let reject!: (err: Error) => void;
    const gate = new Promise<string>((_, rej) => { reject = rej; });
    const resolver = vi.fn(() => gate);
    IconRegistry.register(lib, resolver);

    const p1 = IconRegistry.resolve(lib, 'x');
    const p2 = IconRegistry.resolve(lib, 'x');
    reject(new Error('boom'));

    // 두 호출자 모두 reject가 아닌 undefined resolve로 종결되어야 한다
    await expect(p1).resolves.toBeUndefined();
    await expect(p2).resolves.toBeUndefined();
    expect(resolver).toHaveBeenCalledTimes(1);
  });

  it('unregister는 해당 lib의 캐시를 함께 비운다 (unregister→register 오버라이드 시 stale 방지)', async () => {
    const lib = uniqueLib();
    IconRegistry.register(lib, async () => '<svg>old</svg>');
    await IconRegistry.resolve(lib, 'x');

    IconRegistry.unregister(lib);
    const newResolver = vi.fn(async () => '<svg>new</svg>');
    IconRegistry.register(lib, newResolver);

    expect(await IconRegistry.resolve(lib, 'x')).toBe('<svg>new</svg>');
    expect(newResolver).toHaveBeenCalledTimes(1);
  });

  it('IconCache.clear(lib)는 해당 lib 항목만 비운다', async () => {
    const libA = uniqueLib();
    const libB = uniqueLib();
    IconCache.set(libA, 'x', '<svg>a</svg>');
    IconCache.set(libB, 'x', '<svg>b</svg>');

    IconCache.clear(libA);

    expect(IconCache.has(libA, 'x')).toBe(false);
    expect(IconCache.get(libB, 'x')).toBe('<svg>b</svg>');
  });

  it('미등록 lib은 undefined를 반환하되 캐시하지 않는다 (나중 등록 허용)', async () => {
    const lib = uniqueLib();
    expect(await IconRegistry.resolve(lib, 'x')).toBeUndefined();

    // 이후 등록되면 정상 리졸브되어야 한다
    IconRegistry.register(lib, async () => '<svg>late</svg>');
    expect(await IconRegistry.resolve(lib, 'x')).toBe('<svg>late</svg>');
  });
});

describe('IconRegistry.resolveUrl (URL 직접 리졸브 캐싱)', () => {
  it('성공 결과를 URL 단위로 캐시해 fetch를 재호출하지 않는다', async () => {
    const fetchMock = vi.fn(async () => new Response('<svg>u</svg>', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await IconRegistry.resolveUrl('https://x.test/a.svg')).toBe('<svg>u</svg>');
    expect(await IconRegistry.resolveUrl('https://x.test/a.svg')).toBe('<svg>u</svg>');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('HTTP 404 → undefined → 네거티브 캐시로 fetch 1회만', async () => {
    const fetchMock = vi.fn(async () => new Response('nope', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await IconRegistry.resolveUrl('https://x.test/missing.svg')).toBeUndefined();
    expect(await IconRegistry.resolveUrl('https://x.test/missing.svg')).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('네트워크 오류 → 캐시하지 않고 재시도한다', async () => {
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

  it('동일 URL 동시 요청은 in-flight를 공유한다 (dedupe)', async () => {
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

describe('내장 리졸버 순수화 (fetch 계약)', () => {
  it('bootstrap: HTTP 404 → undefined(not-found) → 네거티브 캐시로 fetch 1회만', async () => {
    const fetchMock = vi.fn(async () => new Response('nope', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await IconRegistry.resolve('bootstrap', 'no-such-icon')).toBeUndefined();
    expect(await IconRegistry.resolve('bootstrap', 'no-such-icon')).toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('bootstrap: 네트워크 오류 → 캐시하지 않고 재시도, 회복 시 성공 결과 캐시', async () => {
    let calls = 0;
    const fetchMock = vi.fn(async () => {
      calls++;
      if (calls === 1) throw new TypeError('fetch failed');
      return new Response('<svg>net-ok</svg>', { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    expect(await IconRegistry.resolve('bootstrap', 'flaky-icon')).toBeUndefined();
    expect(await IconRegistry.resolve('bootstrap', 'flaky-icon')).toBe('<svg>net-ok</svg>');
    // 성공 후에는 캐시 히트
    expect(await IconRegistry.resolve('bootstrap', 'flaky-icon')).toBe('<svg>net-ok</svg>');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('bootstrap: 성공 결과는 캐시되어 fetch 1회만 발생한다', async () => {
    const fetchMock = vi.fn(async () => new Response('<svg>b</svg>', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await IconRegistry.resolve('bootstrap', 'copy')).toBe('<svg>b</svg>');
    expect(await IconRegistry.resolve('bootstrap', 'copy')).toBe('<svg>b</svg>');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('internal: 번들 아이콘은 fetch 없이 리졸브된다', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    // 번들에 실제 존재하는 아이콘과 무관하게 fetch가 불리지 않아야 한다
    await IconRegistry.resolve('internal', 'anything');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
