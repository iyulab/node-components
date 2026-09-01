import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/date-picker/UDatePicker.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';
import { Locale } from '../../src/utilities/Locale.js';

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

  describe('접근 가능한 이름 — 로케일 레지스트리 경유(하드코딩 리터럴 없음)', () => {
    afterEach(() => {
      Locale.set('en');
    });

    async function labelsOf(el: UDatePicker) {
      const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
      container.click();
      await settle(el);
      const popover = el.shadowRoot!.querySelector('u-popover')!;
      const [prevMonth, nextMonth] = el.shadowRoot!.querySelectorAll('.calendar-header u-icon-button');
      return {
        dialog: popover.getAttribute('aria-label'),
        prev: prevMonth.getAttribute('aria-label'),
        next: nextMonth.getAttribute('aria-label'),
      };
    }

    // 별도 it()로 나누면 브라우저 프로젝트의 테스트 실행이 동일 페이지에서 module-singleton
    // 인 Locale 상태를 공유해, Locale.set() 타이밍에 따라 서로 다른 테스트가 서로의 로케일을
    // 관측하는 레이스가 생긴다(실측) — 하나의 it() 안에서 순차 전환·검증한다.
    it('팝오버 다이얼로그·이전/다음 달 버튼이 로케일 전환을 따라간다(하드코딩 영어 리터럴 없음)', async () => {
      // 실브라우저(Chromium)는 Node/SSR 과 달리 OS navigator.language 를 그대로 따르므로
      // (이 머신은 ko) 여기서 명시적으로 'en' 을 지정한다 — 기본값을 가정하지 않는다.
      Locale.set('en');
      const en = createDatePicker();
      document.body.appendChild(en);
      await settle(en);
      expect(await labelsOf(en)).toEqual({ dialog: 'Choose date', prev: 'Previous month', next: 'Next month' });
      document.body.removeChild(en);

      Locale.set('ko');
      const ko = createDatePicker();
      document.body.appendChild(ko);
      await settle(ko);
      expect(await labelsOf(ko)).toEqual({ dialog: '날짜 선택', prev: '이전 달', next: '다음 달' });
    });
  });
});
