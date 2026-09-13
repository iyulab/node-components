import { describe, it, expect, vi } from 'vitest';
import { existsSync } from 'fs';
import { resolve, join } from 'path';
import { pathToFileURL } from 'url';

const root = resolve(__dirname, '../..');
const distFile = join(root, 'dist/utilities/devWarning.js');

/**
 * **게시 계약 — `createDevWarner`/`devWarnOnce` 는 dist 에서도 실제로 경고한다.**
 *
 * `tests/browser/dev-warnings.browser.test.ts` 는 `../../src/...` 를 직접 import 하므로
 * vitest 의 vite dev 서버가 `import.meta.env.DEV` 를 참으로 주고 항상 그린이다 — **그
 * 서버가 게시본을 검증하지 않는다.** 이 파일은 `dist/` 를 직접 import 해 그 축을 덮는다.
 *
 * 발견 경위(2026-09-13): `import.meta.env.DEV` 는 이 라이브러리 자신의 `vite build`
 * 시점에 정적으로 `false` 로 치환되고 Rollup DCE 가 그 뒤 분기를 통째로 지운다 —
 * 소비자가 dev 서버로 띄워도 이미 죽은 코드라 살아나지 않는다. `process.env.NODE_ENV`
 * 는 이 라이브러리의 `vite build` 가 손대지 않고 그대로 dist 에 남는다(실측 확인) — 대신
 * 소비자 자신의 번들러가 자기 빌드 시점에 치환한다(React 등 생태계 라이브러리와 동일한
 * 관례).
 */
describe('게시 계약 — devWarner 는 dist 에서도 동작한다', () => {
  if (!existsSync(distFile)) {
    it.skip('dist 없음 — 빌드 후 재실행', () => {});
    return;
  }

  it('NODE_ENV가 production이 아니면 키당 정확히 한 번 console.warn한다', async () => {
    const mod = await import(pathToFileURL(distFile).href);
    mod.resetDevWarnings();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      const devWarn = mod.createDevWarner('@iyulab/probe');
      devWarn('k1', 'first message');
      devWarn('k1', 'first message');
      devWarn('k2', 'second message');
      expect(warn).toHaveBeenCalledTimes(2);
      expect(String(warn.mock.calls[0][0])).toBe('[@iyulab/probe] first message');
      expect(String(warn.mock.calls[1][0])).toBe('[@iyulab/probe] second message');
    } finally {
      process.env.NODE_ENV = original;
      warn.mockRestore();
    }
  });

  it('NODE_ENV가 production이면 호출 자체가 no-op이다', async () => {
    const mod = await import(pathToFileURL(distFile).href);
    mod.resetDevWarnings();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      mod.createDevWarner('@iyulab/probe')('k1', 'message');
      expect(warn).not.toHaveBeenCalled();
    } finally {
      process.env.NODE_ENV = original;
      warn.mockRestore();
    }
  });
});
