import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';
import type { UDateRangePicker } from '../../src/components/date-range-picker/UDateRangePicker.js';
import { Locale } from '../../src/utilities/Locale.js';

type Picker = UDatePicker | UDateRangePicker;

/** 2026-03: 7·8·14·15일이 주말. */
const weekend = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
};

function cal(el: HTMLElement): ShadowRoot {
  return el.shadowRoot!.querySelector('u-calendar')!.shadowRoot!;
}

async function settle(el: Picker) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
  const c = el.shadowRoot!.querySelector('u-calendar') as (HTMLElement & { updateComplete?: Promise<unknown> }) | null;
  await c?.updateComplete;
}

async function mount<T extends Picker>(tag: string, attrs: string, rule = weekend): Promise<T> {
  document.body.innerHTML = `<${tag} ${attrs}></${tag}>`;
  const el = document.querySelector(tag) as T;
  el.isDateDisabled = rule;
  await settle(el);
  return el;
}

async function open(el: Picker) {
  (el.shadowRoot!.querySelector('.container') as HTMLElement).click();
  await settle(el);
}

const day = (el: Picker, iso: string) => cal(el).querySelector(`button.day[data-iso="${iso}"]`) as HTMLButtonElement;

async function click(el: Picker, target: HTMLElement) {
  target.click();
  await settle(el);
}

describe('isDateDisabled — u-date-picker', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('막힌 날은 aria-disabled 로 그려지고 눌러도 값이 바뀌지 않는다', async () => {
    const el = await mount<UDatePicker>('u-date-picker', 'value="2026-03-06"');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    await open(el);
    expect(day(el, '2026-03-07').getAttribute('aria-disabled')).toBe('true');
    expect(day(el, '2026-03-09').getAttribute('aria-disabled')).toBe('false');
    await click(el, day(el, '2026-03-07'));
    expect([el.value, changes]).toEqual(['2026-03-06', 0]);
    await click(el, day(el, '2026-03-09'));
    expect([el.value, changes]).toEqual(['2026-03-09', 1]);
  });

  it('막힌 날이 오늘이면 «Today» 가 비활성이다', async () => {
    const el = await mount<UDatePicker>('u-date-picker', '', () => true);
    await open(el);
    const today = Array.from(el.shadowRoot!.querySelectorAll('.calendar-footer u-button'))
      .find(b => b.textContent?.trim() === 'Today') as HTMLElement & { disabled: boolean };
    expect(today.disabled).toBe(true);
  });

  it('타이핑·코드로 막힌 날이 값이 되면 stepMismatch 로 보고하고, 규칙이 바뀌면 다시 잰다', async () => {
    const el = await mount<UDatePicker>('u-date-picker', 'value="2026-03-07"');
    expect(el.validity!.stepMismatch).toBe(true);
    expect(el.validationMessage).toBe('This date is not available');
    el.isDateDisabled = undefined;
    await settle(el);
    expect(el.validity!.valid).toBe(true);
  });

  it('min 이 바뀌어 값이 범위 밖이 되면 그 자리에서 rangeUnderflow 로 다시 잰다', async () => {
    const el = await mount<UDatePicker>('u-date-picker', 'value="2026-03-06"', () => false);
    expect(el.validity!.valid).toBe(true);
    el.min = '2026-03-10';
    await settle(el);
    expect(el.validity!.rangeUnderflow).toBe(true);
  });
});

describe('isDateDisabled — u-date-range-picker', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('범위는 막힌 날을 지나갈 수 있지만 막힌 날로 시작·끝낼 수 없다', async () => {
    const el = await mount<UDateRangePicker>('u-date-range-picker', 'value="2026-03-02/2026-03-03"');
    await open(el);
    await click(el, day(el, '2026-03-07'));      // 막힌 날 — 앵커가 되지 않는다
    await click(el, day(el, '2026-03-05'));      // 앵커
    await click(el, day(el, '2026-03-08'));      // 막힌 날 — 끝이 되지 않는다
    expect(el.value).toBe('2026-03-02/2026-03-03');
    await click(el, day(el, '2026-03-10'));      // 주말을 건너는 범위
    expect(el.value).toBe('2026-03-05/2026-03-10');
    expect(el.validity!.valid).toBe(true);
  });

  it('막힌 날로 시작하거나 끝나는 값은 stepMismatch', async () => {
    const el = await mount<UDateRangePicker>('u-date-range-picker', 'value="2026-03-05/2026-03-08"');
    expect(el.validity!.stepMismatch).toBe(true);
    el.value = '2026-03-05/2026-03-10';
    await settle(el);
    expect(el.validity!.valid).toBe(true);
  });

  it('막힌 날로 시작하거나 끝나는 프리셋은 비활성이다', async () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const el = await mount<UDateRangePicker>('u-date-range-picker', 'presets="today"', d => d === iso);
    await open(el);
    expect((el.shadowRoot!.querySelector('.preset') as HTMLButtonElement).disabled).toBe(true);
  });
});
