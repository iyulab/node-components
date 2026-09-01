// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { BrowserStorage } from '../../src/utilities/BrowserStorage.js';
import type { BrowserStorageOptions } from '../../src/utilities/BrowserStorage.js';

/**
 * `ISSUE-components-20260901-browserstorage-generic-error.md` — `set`/`get`/`remove`
 * 세 메서드 모두 지원하지 않는 `options.type`을 만나면 실제 값·유효 목록을 안 낸다.
 * `type`은 컴파일 타임엔 `'localStorage' | 'cookie'`로 좁혀지므로, 런타임에 그 계약을
 * 어긴 값(오타·구버전 저장 설정 등)을 시뮬레이션하려면 타입 단언으로 우회해야 한다.
 */
describe('BrowserStorage — 지원하지 않는 storage type 오류 메시지', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  function createWithInvalidType(): BrowserStorage {
    const options = { type: 'sessionStorage' } as unknown as BrowserStorageOptions;
    return new BrowserStorage(options);
  }

  it('set()이 실제 값과 유효 옵션 목록을 담은 오류를 낸다', async () => {
    const storage = createWithInvalidType();
    await storage.set('key', 'value');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[BrowserStorage Error: set]',
      expect.objectContaining({
        message: 'Unsupported storage type: "sessionStorage" (expected "localStorage" or "cookie")',
      }),
    );
  });

  it('get()이 실제 값과 유효 옵션 목록을 담은 오류를 내고 null을 반환한다', async () => {
    const storage = createWithInvalidType();
    const result = await storage.get('key');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[BrowserStorage Error: get]',
      expect.objectContaining({
        message: 'Unsupported storage type: "sessionStorage" (expected "localStorage" or "cookie")',
      }),
    );
  });

  it('remove()가 실제 값과 유효 옵션 목록을 담은 오류를 낸다', async () => {
    const storage = createWithInvalidType();
    await storage.remove('key');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[BrowserStorage Error: remove]',
      expect.objectContaining({
        message: 'Unsupported storage type: "sessionStorage" (expected "localStorage" or "cookie")',
      }),
    );
  });
});
