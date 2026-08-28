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

const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

/** 15일 — 값을 안 준 채로 열면 캘린더가 "오늘이 속한 달"을 보여주므로(고정된 2월이 아니라)
 *  실행 시점 기준으로 항상 그리드에 있는 날짜를 동적으로 구한다. */
function fifteenthOfCurrentMonthIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`;
}

async function openCalendar(el: UDatePicker): Promise<void> {
  await settle(el);
  const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
  container.click();
  await settle(el);
}

describe('UDatePicker — mode="datetime"', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('date 모드(기본값)에는 시간 입력 행이 없다', async () => {
    const el = createDatePicker();
    document.body.appendChild(el);
    await openCalendar(el);

    expect(el.shadowRoot!.querySelector('.calendar-time')).toBeNull();
  });

  it('datetime 모드에는 시간 입력이 있고 날짜 셀 클릭으로 완전한 ISO-8601 값이 만들어진다', async () => {
    const el = createDatePicker({ mode: 'datetime' });
    document.body.appendChild(el);
    await openCalendar(el);

    const timeInput = el.shadowRoot!.querySelector('.time-input') as HTMLInputElement;
    expect(timeInput).not.toBeNull();
    expect(timeInput.value).toBe('00:00');

    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);

    const iso = fifteenthOfCurrentMonthIso();
    const day15 = el.shadowRoot!.querySelector(`button.day[data-iso="${iso}"]`) as HTMLButtonElement;
    day15.click();
    await settle(el);

    expect(el.value).toMatch(ISO_DATETIME_RE);
    expect(el.value!.startsWith(`${iso}T00:00:00`)).toBe(true);
    expect(changeCount).toBe(1);
  });

  it('날짜가 있는 상태에서 시간 입력을 바꾸면 값의 시간 부분만 갱신되고 change 가 발화한다', async () => {
    const el = createDatePicker({ mode: 'datetime', value: '2026-02-15T00:00:00+09:00' });
    document.body.appendChild(el);
    await openCalendar(el);

    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);

    const timeInput = el.shadowRoot!.querySelector('.time-input') as HTMLInputElement;
    expect(timeInput.value).toBe('00:00');
    timeInput.value = '14:30';
    timeInput.dispatchEvent(new Event('change', { bubbles: true }));
    await settle(el);

    expect(el.value).toMatch(ISO_DATETIME_RE);
    expect(el.value!.startsWith('2026-02-15T14:30:00')).toBe(true);
    expect(changeCount).toBe(1);
    // 시간 변경만으로는 팝오버가 닫히지 않는다 — 날짜 선택과 달리 상호작용이 끝난 게 아니다.
    const popover = el.shadowRoot!.querySelector('u-popover')!;
    expect(popover.hasAttribute('open')).toBe(true);
  });

  it('값이 없는 상태에서 시간만 먼저 바꾸면 value 는 그대로 비어 있고, 이후 날짜 클릭 시 그 시간이 반영된다', async () => {
    const el = createDatePicker({ mode: 'datetime' });
    document.body.appendChild(el);
    await openCalendar(el);

    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);

    const timeInput = el.shadowRoot!.querySelector('.time-input') as HTMLInputElement;
    timeInput.value = '09:15';
    timeInput.dispatchEvent(new Event('change', { bubbles: true }));
    await settle(el);

    expect(el.value).toBeUndefined();
    expect(changeCount).toBe(0);

    const iso = fifteenthOfCurrentMonthIso();
    const day15 = el.shadowRoot!.querySelector(`button.day[data-iso="${iso}"]`) as HTMLButtonElement;
    day15.click();
    await settle(el);

    expect(el.value!.startsWith(`${iso}T09:15:00`)).toBe(true);
    expect(changeCount).toBe(1);
  });

  it('날짜 셀만 다시 클릭하면(시간 안 건드림) 기존 시간이 보존된다', async () => {
    const el = createDatePicker({ mode: 'datetime', value: '2026-02-10T08:00:00+09:00' });
    document.body.appendChild(el);
    await openCalendar(el);

    const day20 = el.shadowRoot!.querySelector('button.day[data-iso="2026-02-20"]') as HTMLButtonElement;
    day20.click();
    await settle(el);

    expect(el.value!.startsWith('2026-02-20T08:00:00')).toBe(true);
  });

  it('"오늘" 퀵액션은 datetime 모드에서 오늘 날짜 + 현재 시:분을 함께 채운다', async () => {
    const el = createDatePicker({ mode: 'datetime', value: '2020-01-01T00:00:00+09:00' });
    document.body.appendChild(el);
    await openCalendar(el);

    const now = new Date();
    const todayBtn = el.shadowRoot!.querySelector('.calendar-footer u-button') as HTMLElement;
    todayBtn.click();
    await settle(el);

    const isoDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const isoTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    expect(el.value!.startsWith(`${isoDate}T${isoTime}`)).toBe(true);
  });

  it('date 모드 트리거에는 날짜만, datetime 모드 트리거에는 날짜+시간이 표시된다', async () => {
    const dateEl = createDatePicker({ value: '2026-02-24' });
    const dtEl = createDatePicker({ mode: 'datetime', value: '2026-02-24T09:30:00+09:00' });
    document.body.append(dateEl, dtEl);
    await settle(dateEl);
    await settle(dtEl);

    const dateText = dateEl.shadowRoot!.querySelector('.text-content')!.textContent!.trim();
    const dtText = dtEl.shadowRoot!.querySelector('.text-content')!.textContent!.trim();
    expect(dtText.length).toBeGreaterThan(dateText.length);
  });
});
