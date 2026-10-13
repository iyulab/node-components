import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/alert/UAlert.js';
import type { UAlert } from '../../src/components/alert/UAlert.js';

/**
 * `u-alert inline` — 페이지 흐름 안의 알림(콜아웃 · 오류 요약 · 결과 줄).
 *
 * 기본 모양은 떠 있는 알림(토스트)이라 흐름 안에 두면 내용 폭 · 큰 그림자 · 닫혀도 남는 빈 자리로 그려졌다.
 * `inline` 은 그 자리의 폭을 채우고 떠 있는 모양을 걷는다. 그리고 역할은 작성자가 정할 수 있다 — 정적 메모는
 * 라이브 영역이 아니다(`role="note"`).
 */
describe('u-alert inline', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  async function mount(markup: string): Promise<{ box: HTMLElement; alert: UAlert }> {
    const box = document.createElement('div');
    box.style.width = '600px';
    box.innerHTML = markup;
    document.body.appendChild(box);
    const alert = box.querySelector('u-alert') as UAlert;
    await alert.updateComplete;
    return { box, alert };
  }

  it('fills its container, without the floating shadow', async () => {
    const { alert } = await mount('<u-alert inline open status="info" title="Totals follow the filters">Short.</u-alert>');
    expect(alert.getBoundingClientRect().width).toBe(600);
    expect(getComputedStyle(alert).boxShadow).toBe('none');
    expect(getComputedStyle(alert).transform).toBe('none');
  });

  it('takes no space while closed, and returns when opened', async () => {
    const { box, alert } = await mount('<u-alert inline status="warning" title="Check">Body.</u-alert><p>after</p>');
    const after = box.querySelector('p')!;
    expect(alert.getBoundingClientRect().height).toBe(0);
    expect(after.getBoundingClientRect().top).toBe(box.getBoundingClientRect().top);

    alert.open = true;
    await alert.updateComplete;
    expect(alert.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(after.getBoundingClientRect().top).toBeGreaterThan(box.getBoundingClientRect().top);
  });

  it('NEGATIVE: without inline it keeps the floating look (toasts)', async () => {
    const { alert } = await mount('<u-alert open status="info">Short.</u-alert>');
    expect(alert.getBoundingClientRect().width).toBeLessThan(600);
    expect(getComputedStyle(alert).boxShadow).not.toBe('none');
  });

  it('keeps a role the author set — a static note is not a live region', async () => {
    const { alert } = await mount('<u-alert inline open status="notice" role="note" title="Note">Same cover as last year.</u-alert>');
    expect(alert.getAttribute('role')).toBe('note');
    alert.status = 'warning';
    await alert.updateComplete;
    expect(alert.getAttribute('role')).toBe('note');
  });

  it('still derives the role from status when the author left it empty', async () => {
    const { alert } = await mount('<u-alert inline open status="error" title="Failed">x</u-alert>');
    expect(alert.getAttribute('role')).toBe('alert');
    alert.status = 'info';
    await alert.updateComplete;
    expect(alert.getAttribute('role')).toBe('status');
  });

  it('an icon slot replaces the status icon', async () => {
    const { alert } = await mount(
      '<u-alert inline open status="notice" title="Note"><span slot="icon" id="pen">✎</span>Body.</u-alert>',
    );
    const slot = alert.shadowRoot!.querySelector('slot[name="icon"]') as HTMLSlotElement;
    expect(slot.assignedElements().map((el) => el.id)).toEqual(['pen']);
    expect(alert.querySelector('#pen')!.getBoundingClientRect().width).toBeGreaterThan(0);
  });
});
