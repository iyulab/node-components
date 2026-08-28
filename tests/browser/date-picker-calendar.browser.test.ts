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
    expect(outOfRange.getAttribute('aria-disabled')).toBe('true');

    outOfRange.click();
    await settle(el);
    expect(el.value).toBe('2026-02-15');
  });

  it('그리드가 WAI-ARIA Date Picker Dialog 패턴의 row 레이어를 갖는다 — grid > row > gridcell', async () => {
    const el = createDatePicker();
    document.body.appendChild(el);
    await settle(el);

    const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
    container.click();
    await settle(el);

    const grid = el.shadowRoot!.querySelector('.calendar-grid')!;
    expect(grid.getAttribute('role')).toBe('grid');
    const rows = grid.querySelectorAll(':scope > [role="row"]');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const directChildren = row.children;
      expect(directChildren.length).toBeGreaterThan(0);
      for (const cell of directChildren) {
        expect(cell.getAttribute('role')).toBe('gridcell');
      }
    }
    const headerCells = el.shadowRoot!.querySelectorAll('.calendar-weekdays [role="columnheader"]');
    expect(headerCells.length).toBe(7);
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

  describe('캘린더 footer 퀵액션 — "오늘"/"초기화"', () => {
    it('"오늘" 버튼 클릭으로 오늘 날짜가 선택되고 change 가 발화하며 팝오버가 닫힌다', async () => {
      const el = createDatePicker({ value: '2020-01-01' });
      document.body.appendChild(el);
      await settle(el);

      let changeCount = 0;
      el.addEventListener('change', () => changeCount++);

      const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
      container.click();
      await settle(el);

      const todayBtn = el.shadowRoot!.querySelector('.calendar-footer u-button') as HTMLElement;
      todayBtn.click();
      await settle(el);

      const iso = new Date().toISOString().slice(0, 10);
      expect(el.value).toBe(iso);
      expect(changeCount).toBe(1);
      const popover = el.shadowRoot!.querySelector('u-popover')!;
      expect(popover.hasAttribute('open')).toBe(false);
    });

    it('오늘이 min/max 범위 밖이면 "오늘" 버튼이 disabled 다', async () => {
      const el = createDatePicker({ min: '2020-01-01', max: '2020-01-31' });
      document.body.appendChild(el);
      await settle(el);

      const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
      container.click();
      await settle(el);

      const todayBtn = el.shadowRoot!.querySelector('.calendar-footer u-button') as HTMLElement;
      expect(todayBtn.hasAttribute('disabled')).toBe(true);
    });

    it('clearable 이 아니거나 값이 없으면 footer에 "초기화" 버튼이 없다', async () => {
      const el = createDatePicker();
      document.body.appendChild(el);
      await settle(el);

      const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
      container.click();
      await settle(el);

      const buttons = el.shadowRoot!.querySelectorAll('.calendar-footer u-button');
      expect(buttons.length).toBe(1); // "오늘"만
    });

    it('clearable + 값 있음이면 footer "초기화" 버튼 클릭으로 값이 비워지고 팝오버가 닫힌다', async () => {
      const el = createDatePicker({ value: '2026-02-15', clearable: 'true' });
      document.body.appendChild(el);
      await settle(el);

      let changeCount = 0;
      el.addEventListener('change', () => changeCount++);

      const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
      container.click();
      await settle(el);

      const buttons = el.shadowRoot!.querySelectorAll('.calendar-footer u-button');
      expect(buttons.length).toBe(2); // "오늘" + "초기화"
      (buttons[1] as HTMLElement).click();
      await settle(el);

      expect(el.value).toBeUndefined();
      expect(changeCount).toBe(1);
      const popover = el.shadowRoot!.querySelector('u-popover')!;
      expect(popover.hasAttribute('open')).toBe(false);
    });
  });
});
