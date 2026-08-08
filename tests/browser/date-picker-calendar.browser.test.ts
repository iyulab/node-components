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

describe('UDatePicker — 달력 렌더 + 마우스 선택', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('초기 상태에서 팝오버가 닫혀 있고 값이 없다', async () => {
    const el = createDatePicker();
    document.body.appendChild(el);
    await settle(el);

    expect(el.value).toBeUndefined();
    const popover = el.shadowRoot!.querySelector('u-popover')!;
    expect(popover.hasAttribute('open')).toBe(false);
  });

  it('트리거 클릭으로 팝오버가 열리고 오늘이 포함된 달의 그리드가 보인다', async () => {
    const el = createDatePicker();
    document.body.appendChild(el);
    await settle(el);

    const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
    container.click();
    await settle(el);

    const today = new Date();
    const title = el.shadowRoot!.querySelector('.calendar-title')!.textContent!;
    expect(title).toContain(String(today.getFullYear()));
  });

  it('값이 있으면 트리거에 로케일 포맷으로 표시된다', async () => {
    const el = createDatePicker({ value: '2026-02-24' });
    document.body.appendChild(el);
    await settle(el);

    const text = el.shadowRoot!.querySelector('.text-content')!.textContent!.trim();
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toBe('');
  });

  it('날짜 셀 클릭으로 값이 설정되고 change 가 발화하며 팝오버가 닫힌다', async () => {
    const el = createDatePicker({ value: '2026-02-01' });
    document.body.appendChild(el);
    await settle(el);

    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);

    const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
    container.click();
    await settle(el);

    const day15 = el.shadowRoot!.querySelector('button.day[data-iso="2026-02-15"]') as HTMLButtonElement;
    day15.click();
    await settle(el);

    expect(el.value).toBe('2026-02-15');
    expect(changeCount).toBe(1);
    const popover = el.shadowRoot!.querySelector('u-popover')!;
    expect(popover.hasAttribute('open')).toBe(false);
  });

  it('마운트만으로는 change 를 발화하지 않는다', async () => {
    const el = createDatePicker({ value: '2026-02-01' });
    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);
    document.body.appendChild(el);
    await settle(el);

    expect(changeCount).toBe(0);
  });

  it('min/max 범위 밖 날짜 셀은 disabled 이고 클릭해도 값이 바뀌지 않는다', async () => {
    const el = createDatePicker({ value: '2026-02-15', min: '2026-02-10', max: '2026-02-20' });
    document.body.appendChild(el);
    await settle(el);

    const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
    container.click();
    await settle(el);

    const outOfRange = el.shadowRoot!.querySelector('button.day[data-iso="2026-02-05"]') as HTMLButtonElement;
    expect(outOfRange.disabled).toBe(true);

    outOfRange.click();
    await settle(el);
    expect(el.value).toBe('2026-02-15');
  });

  it('clearable 이면 지우기 아이콘 클릭으로 값이 비워지고 change 가 발화한다', async () => {
    const el = createDatePicker({ value: '2026-02-15', clearable: 'true' });
    document.body.appendChild(el);
    await settle(el);

    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);

    const clearIcon = el.shadowRoot!.querySelector('.suffix-item[name="x"]') as HTMLElement;
    clearIcon.click();
    await settle(el);

    expect(el.value).toBeUndefined();
    expect(changeCount).toBe(1);
  });
});
