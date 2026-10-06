import { describe, it, expect, afterEach, vi } from 'vitest';
import { Toast } from '../../src/utilities/Toast.js';

/**
 * `Toast.*(content)` 의 문자열은 **글자**다.
 *
 * 결함: `el.innerHTML = content` — 메시지를 HTML 로 해석했다. 토스트는 서버 오류 문장(`Toast.error(err.message)` · 데이터
 * 서비스의 `notify.error`)과 사용자 데이터(«"<이름>" 을 저장했습니다»)를 싣는 자리라, 그 문장 속 마크업이 요소가 되고
 * 스크립트가 돌았다. HTML 이라 문서화된 적은 없다 — 형제 `Dialog.alert`·`confirm` 과 같은 부류(`#820`).
 */
describe('Toast 메시지는 글자다', () => {
  afterEach(() => {
    document.querySelectorAll('u-alert').forEach((a) => a.remove());
    delete (window as unknown as { __pwned?: boolean }).__pwned;
  });

  it.each(['message', 'notice', 'info', 'success', 'warning', 'error'] as const)(
    '%s: 문자열 속 마크업은 요소가 되지 않고 글자로 보인다',
    async (kind) => {
      void Toast[kind]('Saved "<img src=x onerror="window.__pwned=true">"', { duration: 0 });
      await vi.waitFor(() => expect(document.querySelector('u-alert')).toBeTruthy());
      const alert = document.querySelector('u-alert')!;
      await new Promise((r) => setTimeout(r, 50));
      expect(alert.querySelector('img'), 'no element was injected').toBeNull();
      expect(alert.textContent).toContain('<img src=x');
      expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
    },
  );

  it('NEGATIVE 평문은 그대로 보인다', async () => {
    void Toast.success('Order 12 saved', { duration: 0 });
    await vi.waitFor(() => expect(document.querySelector('u-alert')).toBeTruthy());
    expect(document.querySelector('u-alert')!.textContent).toContain('Order 12 saved');
  });
});
