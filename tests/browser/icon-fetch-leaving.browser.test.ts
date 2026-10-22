import { describe, it, expect, vi, afterEach } from 'vitest';
import { IconRegistry } from '../../src/utilities/icons.js';

/**
 * 페이지를 떠나며 끊긴 아이콘 fetch 는 오류 로그를 남기지 않는다 — 사용자가 볼 결과가 없고, 소비 앱의
 * «콘솔 오류 0» 검사가 가짜 오류로 흔들린다. 그 밖의 일시 오류는 재시도되므로 오류가 아니라 경고다.
 */

let n = 0;
const nextLib = () => `leave-test-${n++}`;

afterEach(() => {
  vi.restoreAllMocks();
  window.dispatchEvent(new Event('pageshow'));
});

function spies() {
  return {
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  };
}

describe('IconRegistry — 일시 오류의 로그 수준', () => {
  it('🔴재시도되는 일시 오류는 console.error 가 아니라 console.warn 이다', async () => {
    const { error, warn } = spies();
    const lib = nextLib();
    IconRegistry.register(lib, () => { throw new TypeError('Failed to fetch'); });
    expect(await IconRegistry.resolve(lib, 'a')).toBeUndefined();
    expect(error).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('🔴AbortError 는 조용히 넘긴다', async () => {
    const { error, warn } = spies();
    const lib = nextLib();
    IconRegistry.register(lib, () => { throw new DOMException('aborted', 'AbortError'); });
    expect(await IconRegistry.resolve(lib, 'a')).toBeUndefined();
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it('🔴페이지를 떠나는 중(pagehide)에 끊긴 fetch 는 조용히 넘기고, 돌아오면(pageshow) 다시 알린다', async () => {
    const { error, warn } = spies();
    const lib = nextLib();
    IconRegistry.register(lib, () => { throw new TypeError('Failed to fetch'); });
    window.dispatchEvent(new Event('pagehide'));
    await IconRegistry.resolve(lib, 'a');
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('pageshow'));
    await IconRegistry.resolve(lib, 'b');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
