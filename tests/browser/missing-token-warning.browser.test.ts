import { describe, it, expect, vi } from 'vitest';
import '../../src/components/button/UButton.js';

/**
 * 토큰 시트가 없으면 컴포넌트는 **에러 없이** 무스타일로 렌더된다 — CSS 는 아무 신호도 내지
 * 않는다. 개발 빌드 경고가 그 침묵을 깨는 유일한 장치이므로, 실제로 발화하는지 확인한다.
 *
 * (이 테스트 환경은 `Theme.init()` 을 부르지 않고 CSS 도 임포트하지 않으므로 토큰이 없다 —
 *  즉 문제 상황을 그대로 재현한다.)
 */
describe('토큰 부재 경고', () => {
  it('토큰이 없을 때 첫 컴포넌트 연결에서 1회 경고한다', async () => {
    const probe = getComputedStyle(document.documentElement)
      .getPropertyValue('--u-blue-600').trim();
    expect(probe, '이 테스트는 토큰이 없는 상태를 전제한다').toBe('');

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const a = document.createElement('u-button');
      document.body.appendChild(a);
      await (a as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;

      const messages = warn.mock.calls.map(c => String(c[0]));
      const hit = messages.filter(m => m.includes('디자인 토큰 시트가 문서에 없습니다'));
      expect(hit.length, `경고가 발화하지 않았다. 받은 경고: ${JSON.stringify(messages)}`).toBe(1);
      expect(hit[0]).toContain('@iyulab/components/styles/tokens.css');

      // 두 번째 컴포넌트에서는 다시 경고하지 않는다 (소음 방지)
      warn.mockClear();
      const b = document.createElement('u-button');
      document.body.appendChild(b);
      await (b as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
      expect(warn.mock.calls.filter(c => String(c[0]).includes('디자인 토큰'))).toHaveLength(0);

      a.remove();
      b.remove();
    } finally {
      warn.mockRestore();
    }
  });
});
