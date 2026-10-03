import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';
import type { UDateRangePicker } from '../../src/components/date-range-picker/UDateRangePicker.js';
import { Locale } from '../../src/utilities/Locale.js';
import { toDateTimeOffset } from '../../src/components/calendar/datetime.js';

type Picker = UDatePicker | UDateRangePicker;

async function settle(el: Picker) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
}

async function mount<T extends Picker>(html: string, tag: string): Promise<T> {
  document.body.innerHTML = html;
  const el = document.querySelector(tag) as T;
  await settle(el);
  return el;
}

async function open(el: Picker) {
  (el.shadowRoot!.querySelector('.container') as HTMLElement).click();
  await settle(el);
}

const text = (el: Picker) => el.shadowRoot!.querySelector<HTMLInputElement>('.text-input')!;
const timeInputs = (el: Picker) => Array.from(el.shadowRoot!.querySelectorAll<HTMLInputElement>('.time-input'));

async function type(el: Picker, value: string) {
  const input = text(el);
  input.focus();
  await userEvent.fill(input, value);
  await userEvent.keyboard('{Enter}');
  await settle(el);
}

describe('seconds — u-date-picker mode="datetime"', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('타이핑한 초를 값에 담고 텍스트 칸·시간 칸이 초까지 보인다', async () => {
    const el = await mount<UDatePicker>('<u-date-picker mode="datetime" seconds></u-date-picker>', 'u-date-picker');
    expect(text(el).placeholder).toBe('YYYY-MM-DD HH:mm:ss');
    await type(el, '2026-10-01 09:05:30');
    expect(el.value).toBe(toDateTimeOffset('2026-10-01', '09:05:30'));
    expect(text(el).value).toBe('2026-10-01 09:05:30');
    await open(el);
    const [time] = timeInputs(el);
    expect(time.step).toBe('1');
    expect(time.value).toBe('09:05:30');
  });

  it('시간 칸에서 초를 바꾸면 값에 들어간다', async () => {
    const el = await mount<UDatePicker>(
      `<u-date-picker mode="datetime" seconds value="${toDateTimeOffset('2026-10-01', '09:05:30')}"></u-date-picker>`, 'u-date-picker');
    await open(el);
    const [time] = timeInputs(el);
    time.value = '09:05:45';
    time.dispatchEvent(new Event('change'));
    await settle(el);
    expect(el.value).toBe(toDateTimeOffset('2026-10-01', '09:05:45'));
  });

  it('seconds 가 없으면 종전대로 분까지 — 타이핑한 초는 버린다', async () => {
    const el = await mount<UDatePicker>('<u-date-picker mode="datetime"></u-date-picker>', 'u-date-picker');
    await type(el, '2026-10-01 09:05:30');
    expect(el.value).toBe(toDateTimeOffset('2026-10-01', '09:05'));
    expect(text(el).value).toBe('2026-10-01 09:05');
  });
});

describe('seconds — u-date-range-picker mode="datetime"', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('날짜만 적으면 하루 전체가 초까지(00:00:00–23:59:59)', async () => {
    const el = await mount<UDateRangePicker>('<u-date-range-picker mode="datetime" seconds></u-date-range-picker>', 'u-date-range-picker');
    await type(el, '2026-10-01 ~ 2026-10-02');
    expect(el.value).toBe(`${toDateTimeOffset('2026-10-01', '00:00:00')}/${toDateTimeOffset('2026-10-02', '23:59:59')}`);
    expect(text(el).value).toBe('2026-10-01 00:00:00 – 2026-10-02 23:59:59');
  });

  it('시간 칸 둘이 초까지 받는다', async () => {
    const el = await mount<UDateRangePicker>(
      `<u-date-range-picker mode="datetime" seconds value="${toDateTimeOffset('2026-10-01', '09:00:00')}/${toDateTimeOffset('2026-10-01', '18:00:00')}"></u-date-range-picker>`,
      'u-date-range-picker');
    await open(el);
    const [start, end] = timeInputs(el);
    expect([start.step, end.step]).toEqual(['1', '1']);
    end.value = '18:00:30';
    end.dispatchEvent(new Event('change'));
    await settle(el);
    expect(el.end).toBe(toDateTimeOffset('2026-10-01', '18:00:30'));
  });
});
