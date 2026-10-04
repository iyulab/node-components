import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import type { UDateRangePicker } from '../../src/components/date-range-picker/UDateRangePicker.js';
import { Locale } from '../../src/utilities/Locale.js';
import { toDateTimeOffset } from '../../src/components/calendar/datetime.js';

function cal(el: HTMLElement): ShadowRoot {
  return el.shadowRoot!.querySelector('u-calendar')!.shadowRoot!;
}

async function settle(el: UDateRangePicker) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
  const c = el.shadowRoot!.querySelector('u-calendar') as (HTMLElement & { updateComplete?: Promise<unknown> }) | null;
  await c?.updateComplete;
}

async function mount(attrs: string): Promise<UDateRangePicker> {
  document.body.innerHTML = `<u-date-range-picker mode="datetime" ${attrs}></u-date-range-picker>`;
  const el = document.querySelector('u-date-range-picker') as UDateRangePicker;
  await settle(el);
  return el;
}

async function open(el: UDateRangePicker) {
  (el.shadowRoot!.querySelector('.container') as HTMLElement).click();
  await settle(el);
}

const isOpen = (el: UDateRangePicker) => el.shadowRoot!.querySelector('u-popover')!.hasAttribute('open');
const day = (el: UDateRangePicker, iso: string) => cal(el).querySelector(`button.day[data-iso="${iso}"]`) as HTMLButtonElement;
const timeInputs = (el: UDateRangePicker) => Array.from(el.shadowRoot!.querySelectorAll<HTMLInputElement>('.time-input'));
const text = (el: UDateRangePicker) => el.shadowRoot!.querySelector<HTMLInputElement>('.text-input')!;

async function click(el: UDateRangePicker, target: HTMLElement) {
  target.click();
  await settle(el);
}

async function setTime(el: UDateRangePicker, input: HTMLInputElement, time: string) {
  input.value = time;
  input.dispatchEvent(new Event('change'));
  await settle(el);
}

const v = (startDay: string, startTime: string, endDay: string, endTime: string) =>
  `${toDateTimeOffset(startDay, startTime)}/${toDateTimeOffset(endDay, endTime)}`;

describe('u-date-range-picker mode="datetime"', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('달력에서 처음 고른 범위는 하루 전체(00:00–23:59) 이고 값의 두 반쪽은 DateTimeOffset 이다', async () => {
    const el = await mount('');
    await open(el);
    // 값이 없으니 오늘이 든 달로 열린다.
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    await click(el, day(el, `${ym}-05`));
    await click(el, day(el, `${ym}-09`));
    expect(el.value).toBe(v(`${ym}-05`, '00:00', `${ym}-09`, '23:59'));
    expect(el.start).toMatch(new RegExp(`^${ym}-05T00:00:00[+-]\\d{2}:\\d{2}$`));
    expect(el.end).toMatch(new RegExp(`^${ym}-09T23:59:00[+-]\\d{2}:\\d{2}$`));
    expect(text(el).value).toBe(`${ym}-05 00:00 – ${ym}-09 23:59`);
  });

  it('시간 칸 둘은 이름이 있고, 바꾸면 그 끝이 바로 바뀌며 달력은 열린 채다', async () => {
    const el = await mount(`value="${v('2026-03-05', '00:00', '2026-03-09', '23:59')}"`);
    let changes = 0;
    el.addEventListener('change', () => changes++);
    await open(el);
    const [start, end] = timeInputs(el);
    expect(start.closest('label')!.textContent).toContain('Start time');
    expect(end.closest('label')!.textContent).toContain('End time');
    await setTime(el, start, '09:00');
    await setTime(el, end, '18:00');
    expect(el.value).toBe(v('2026-03-05', '09:00', '2026-03-09', '18:00'));
    expect(changes).toBe(2);
    expect(isOpen(el)).toBe(true);
  });

  it('다른 날로 다시 고르면 이미 정한 시간은 그대로다', async () => {
    const el = await mount(`value="${v('2026-03-05', '09:00', '2026-03-09', '18:00')}"`);
    await open(el);
    await click(el, day(el, '2026-03-10'));
    await click(el, day(el, '2026-03-12'));
    expect(el.value).toBe(v('2026-03-10', '09:00', '2026-03-12', '18:00'));
  });

  it('같은 날 시작 시간이 끝보다 늦어지면 둘이 바뀐다(뒤집힌 범위를 담지 않는다)', async () => {
    const el = await mount(`value="${v('2026-03-05', '09:00', '2026-03-05', '18:00')}"`);
    await open(el);
    await setTime(el, timeInputs(el)[0], '20:00');
    expect(el.value).toBe(v('2026-03-05', '18:00', '2026-03-05', '20:00'));
  });

  it('타이핑 — 날짜·시간 범위와 «시간만» 끝을 읽는다', async () => {
    const el = await mount('');
    const input = text(el);
    input.focus();
    await userEvent.fill(input, '2026-10-01 09:00 ~ 18:00');
    await userEvent.keyboard('{Enter}');
    await settle(el);
    expect(el.value).toBe(v('2026-10-01', '09:00', '2026-10-01', '18:00'));
    await userEvent.fill(input, '2026-10-02 ~ 2026-10-03');
    await userEvent.keyboard('{Enter}');
    await settle(el);
    // 시간을 적지 않은 끝은 이미 정한 시간을 따른다.
    expect(el.value).toBe(v('2026-10-02', '09:00', '2026-10-03', '18:00'));
  });

  it('프리셋은 그 날들 전체를 덮는다', async () => {
    const el = await mount(`presets="today" value="${v('2020-01-01', '09:00', '2020-01-02', '18:00')}"`);
    await open(el);
    await click(el, el.shadowRoot!.querySelector<HTMLElement>('.preset')!);
    expect(el.start).toMatch(/T00:00:00/);
    expect(el.end).toMatch(/T23:59:00/);
  });

  it('confirm 과 함께 — 시간 변경도 «Apply» 까지 기다린다', async () => {
    const el = await mount(`confirm value="${v('2026-03-05', '00:00', '2026-03-09', '23:59')}"`);
    await open(el);
    await setTime(el, timeInputs(el)[0], '09:00');
    expect(el.value).toBe(v('2026-03-05', '00:00', '2026-03-09', '23:59'));
    const apply = Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('.calendar-footer u-button'))
      .find(b => b.textContent?.trim() === 'Apply')!;
    await click(el, apply);
    expect(el.value).toBe(v('2026-03-05', '09:00', '2026-03-09', '23:59'));
  });

  it('min 은 날짜만 잰다', async () => {
    const el = await mount(`min="2026-03-05" value="${v('2026-03-05', '00:00', '2026-03-06', '23:59')}"`);
    expect(el.validity!.valid).toBe(true);
    el.value = v('2026-03-04', '23:00', '2026-03-06', '23:59');
    await settle(el);
    expect(el.validity!.rangeUnderflow).toBe(true);
  });
});
