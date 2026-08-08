import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/date-picker/UDatePicker.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';

async function settle(el: UDatePicker) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
}

function createDatePicker(attrs: Record<string, string> = {}): UDatePicker {
  const el = document.createElement('u-date-picker') as UDatePicker;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

async function openWithFocus(el: UDatePicker): Promise<HTMLButtonElement> {
  const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
  container.click();
  await settle(el);
  return el.shadowRoot!.activeElement as HTMLButtonElement;
}

describe('UDatePicker — 키보드 내비게이션', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('열리면 선택된 날짜(또는 오늘)의 셀에 포커스가 간다', async () => {
    const el = createDatePicker({ value: '2026-02-15' });
    document.body.appendChild(el);
    await settle(el);

    const focused = await openWithFocus(el);
    expect(focused.dataset.iso).toBe('2026-02-15');
  });

  it('ArrowRight 로 하루, ArrowDown 으로 한 주 이동한다', async () => {
    const el = createDatePicker({ value: '2026-02-15' });
    document.body.appendChild(el);
    await settle(el);
    const day15 = await openWithFocus(el);

    day15.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    await settle(el);
    let focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-16');

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-23');
  });

  it('월 경계를 넘어가면 달력이 다음/이전 달로 넘어간다', async () => {
    const el = createDatePicker({ value: '2026-02-27' });
    document.body.appendChild(el);
    await settle(el);
    let focused = await openWithFocus(el);

    // 2026-02-27 (금) 에서 하루씩 전진하며 2월 마지막날(28)을 지나 3월로 넘어간다
    for (let i = 0; i < 2; i++) {
      focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      await settle(el);
      focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    }
    expect(focused.dataset.iso).toBe('2026-03-01');
    expect(el.shadowRoot!.querySelector('.calendar-title')!.textContent).toContain('March');
  });

  it('Home/End 로 그 주의 처음/끝으로 이동한다', async () => {
    const el = createDatePicker({ value: '2026-02-18' }); // 수요일
    document.body.appendChild(el);
    await settle(el);
    let focused = await openWithFocus(el);

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-15'); // 그 주 일요일

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-21'); // 그 주 토요일
  });

  it('Enter 로 포커스된 날짜를 선택하고 팝오버를 닫는다', async () => {
    const el = createDatePicker({ value: '2026-02-15' });
    document.body.appendChild(el);
    await settle(el);
    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);

    let focused = await openWithFocus(el);
    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    await settle(el);

    expect(el.value).toBe('2026-02-16');
    expect(changeCount).toBe(1);
    expect(el.shadowRoot!.querySelector('u-popover')!.hasAttribute('open')).toBe(false);
  });

  it('Escape 로 팝오버를 닫고 트리거로 포커스를 되돌린다', async () => {
    const el = createDatePicker({ value: '2026-02-15' });
    document.body.appendChild(el);
    await settle(el);
    const focused = await openWithFocus(el);

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await settle(el);

    expect(el.shadowRoot!.querySelector('u-popover')!.hasAttribute('open')).toBe(false);
    expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('.container'));
  });

  it('범위 밖 날짜에서 Enter 를 눌러도 선택되지 않는다', async () => {
    const el = createDatePicker({ value: '2026-02-15', min: '2026-02-10', max: '2026-02-16' });
    document.body.appendChild(el);
    await settle(el);
    let focused = await openWithFocus(el);

    // 2026-02-16(max) 까지 이동
    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-16');

    // 한 칸 더 — 범위 밖(2026-02-17)으로 포커스는 이동하되 disabled
    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-17');
    expect(focused.getAttribute('aria-disabled')).toBe('true');

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    await settle(el);
    expect(el.value).toBe('2026-02-15'); // 변경 안 됨
  });
});
