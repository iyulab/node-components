import { describe, it, expect, vi, afterEach } from 'vitest';
import '../../src/components/alert/UAlert.js';

/**
 * 알 수 없는 `status` 의 개발 경고가 **맞는 낱말**을 말한다 — `status` 는 결과 상태(`error`)이고 버튼·배지의 `color` 는
 * 팔레트 역할(`danger`)이다. 소비자가 `color` 의 낱말을 옮겨 `status="danger"` 로 썼고, 그 알림은 오류처럼 보이지 않는
 * 중립 알림(`role="status"`)으로 그려졌다. 경고는 있었지만 «무엇을 쓰라» 가 목록뿐이었다.
 */
const mount = async (status: string) => {
  document.body.innerHTML = `<u-alert open status="${status}">Saved</u-alert>`;
  const el = document.querySelector('u-alert') as HTMLElement & { updateComplete: Promise<unknown> };
  await el.updateComplete;
  return el;
};

describe('u-alert 알 수 없는 status 안내', () => {
  afterEach(() => vi.restoreAllMocks());

  it('status="danger" → «Did you mean status="error"?»', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mount('danger');
    expect(warn.mock.calls.map((c) => String(c[0])).join('\n')).toContain('Did you mean status="error"?');
  });

  it('대소문자와 무관하다(속성값을 그대로 옮겨 쓴 경우)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mount('Warn');
    expect(warn.mock.calls.map((c) => String(c[0])).join('\n')).toContain('Did you mean status="warning"?');
  });

  it('NEGATIVE — 짐작할 낱말이 없으면 제안 없이 목록만', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mount('purple');
    const text = warn.mock.calls.map((c) => String(c[0])).join('\n');
    expect(text).toContain('is not a known status');
    expect(text).not.toContain('Did you mean');
  });

  it('NEGATIVE — 알려진 status 는 경고하지 않는다', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mount('error');
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('u-alert')).length).toBe(0);
  });
});
