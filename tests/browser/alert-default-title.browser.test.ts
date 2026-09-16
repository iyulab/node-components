import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../src/components/alert/UAlert.js';
import { Locale } from '../../src/utilities/Locale.js';
import { resetDevWarnings } from '../../src/utilities/devWarning.js';

/**
 * `title` 을 주지 않은 `u-alert` 의 제목 기본값이 **현재 로케일**을 따르는가.
 *
 * 종전 구현은 `status` 를 대문자로 올려 썼다(`ERROR`) — 어느 로케일의 낱말도 아니라,
 * 한국어 화면에 영문 대문자가 그대로 찍혔다(소비자 실측, docket `#316`). 같은 컴포넌트의
 * 닫기 버튼은 처음부터 `Locale` 을 탔으므로 빠져 있던 것은 인프라가 아니라 이 한 자리였다.
 *
 * ⚠**브라우저 프로젝트에 두는 이유**: 제목은 섀도 DOM 안 `part="title"` 의 렌더 결과라
 * 실제로 그려 봐야 «무엇이 보이는가» 를 잴 수 있다.
 */
describe('u-alert 제목 기본값', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    resetDevWarnings();
  });
  afterEach(() => {
    Locale.set('en');
  });

  async function mount(attrs: Record<string, string> = {}): Promise<HTMLElement> {
    const el = document.createElement('u-alert');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    return el;
  }

  function titleOf(el: HTMLElement): string {
    return (el.shadowRoot!.querySelector('[part="title"]') as HTMLElement).textContent!.trim();
  }

  it('ko 로케일에서 status 이름이 한국어로 나온다 — 영문 대문자가 아니다', async () => {
    Locale.set('ko');
    const el = await mount({ open: '', status: 'error' });
    expect(titleOf(el)).toBe('오류');
    expect(titleOf(el)).not.toBe('ERROR');
  });

  it('en 로케일에서는 영어 낱말이다 — 대문자 status 가 아니다', async () => {
    Locale.set('en');
    const el = await mount({ open: '', status: 'warning' });
    expect(titleOf(el)).toBe('Warning');
  });

  it('status 가 없으면 로케일의 «메시지» 다', async () => {
    Locale.set('ko');
    const el = await mount({ open: '' });
    expect(titleOf(el)).toBe('메시지');
  });

  it('명시한 title 은 그대로 이긴다', async () => {
    Locale.set('ko');
    const el = await mount({ open: '', status: 'error', title: '로그인 실패' });
    expect(titleOf(el)).toBe('로그인 실패');
  });

  it('로케일 다섯 상태가 서로 다른 낱말이다 — 한 키로 뭉뚱그려지지 않았다', async () => {
    Locale.set('ko');
    const seen = new Set<string>();
    for (const status of ['error', 'warning', 'success', 'info', 'notice']) {
      seen.add(titleOf(await mount({ open: '', status })));
    }
    expect(seen.size).toBe(5);
  });

  it('알 수 없는 status 는 개발 모드에서 한 번 경고한다 — 종전에는 신호가 0 이었다', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mount({ open: '', status: 'danger' });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('danger');
    warn.mockRestore();
  });

  it('유효한 status 에는 경고하지 않는다 — 오탐이 예산을 먹지 않는다', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (const status of ['error', 'warning', 'success', 'info', 'notice']) {
      await mount({ open: '', status });
    }
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
