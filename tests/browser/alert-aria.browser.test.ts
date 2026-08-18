import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/alert/UAlert.js';

/**
 * u-alert가 role/aria-live를 내부에서 스스로 잡지 않아, 소비자가 매 사용처마다
 * role="alert"를 직접 부착해야 했다(스크린리더 사용자는 로그인 실패 같은 동적 등장을
 * 놓쳤다). status가 이미 심각도를 표현하므로 그 값에서 role을 유도한다(WAI-ARIA
 * Alert/Status 패턴) — error/warning은 role="alert"(암묵적 assertive), 그 외는
 * role="status"(암묵적 polite).
 */
describe('u-alert ARIA role', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  async function mount(attrs: Record<string, string> = {}): Promise<HTMLElement> {
    const el = document.createElement('u-alert');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    return el;
  }

  it('status="error"는 role="alert"다', async () => {
    const el = await mount({ status: 'error' });
    expect(el.getAttribute('role')).toBe('alert');
  });

  it('status="warning"은 role="alert"다', async () => {
    const el = await mount({ status: 'warning' });
    expect(el.getAttribute('role')).toBe('alert');
  });

  it('status="info"는 role="status"다', async () => {
    const el = await mount({ status: 'info' });
    expect(el.getAttribute('role')).toBe('status');
  });

  it('status="success"는 role="status"다', async () => {
    const el = await mount({ status: 'success' });
    expect(el.getAttribute('role')).toBe('status');
  });

  it('status="notice"는 role="status"다(비긴급 안내로 취급)', async () => {
    const el = await mount({ status: 'notice' });
    expect(el.getAttribute('role')).toBe('status');
  });

  it('status 미지정(기본)은 role="status"다 — 심각도를 알 수 없으면 assertive로 방해하지 않는다', async () => {
    const el = await mount();
    expect(el.getAttribute('role')).toBe('status');
  });

  it('aria-atomic="true"가 항상 설정된다(전체 내용이 하나의 알림으로 낭독됨)', async () => {
    const el = await mount({ status: 'error' });
    expect(el.getAttribute('aria-atomic')).toBe('true');
  });

  it('status가 동적으로 바뀌면 role도 함께 갱신된다', async () => {
    const el = await mount({ status: 'info' }) as HTMLElement & { status?: string; updateComplete: Promise<unknown> };
    expect(el.getAttribute('role')).toBe('status');

    el.status = 'error';
    await el.updateComplete;
    expect(el.getAttribute('role')).toBe('alert');
  });
});
