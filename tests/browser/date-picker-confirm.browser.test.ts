import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';
import type { UDateRangePicker } from '../../src/components/date-range-picker/UDateRangePicker.js';
import { Locale } from '../../src/utilities/Locale.js';

type Picker = UDatePicker | UDateRangePicker;

/** 달력 격자는 내부 `u-calendar` 의 섀도 안에 있다. */
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

const isOpen = (el: Picker) => el.shadowRoot!.querySelector('u-popover')!.hasAttribute('open');
const day = (el: Picker, iso: string) => cal(el).querySelector(`button.day[data-iso="${iso}"]`) as HTMLButtonElement;
const footerButton = (el: Picker, label: string) =>
  Array.from(el.shadowRoot!.querySelectorAll('.calendar-footer u-button'))
    .find(b => b.textContent?.trim() === label) as HTMLElement | undefined;

async function click(el: Picker, target: HTMLElement | undefined) {
  expect(target, 'click target').toBeTruthy();
  target!.click();
  await settle(el);
}

describe('confirm 모드 — u-date-picker', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('날을 고르면 값은 그대로 · 달력이 열린 채 · 고른 날이 선택으로 보인다', async () => {
    const el = await mount<UDatePicker>('<u-date-picker confirm value="2026-03-06"></u-date-picker>', 'u-date-picker');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    await open(el);
    await click(el, day(el, '2026-03-10'));
    expect(el.value).toBe('2026-03-06');
    expect(changes).toBe(0);
    expect(isOpen(el)).toBe(true);
    expect(day(el, '2026-03-10').getAttribute('aria-selected')).toBe('true');
  });

  it('«Apply» 가 고른 날을 값으로 확정하고 change 한 번 · 닫힘 · 초점은 텍스트 칸', async () => {
    const el = await mount<UDatePicker>('<u-date-picker confirm value="2026-03-06"></u-date-picker>', 'u-date-picker');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    await open(el);
    await click(el, day(el, '2026-03-10'));
    await click(el, footerButton(el, 'Apply'));
    expect(el.value).toBe('2026-03-10');
    expect(changes).toBe(1);
    expect(isOpen(el)).toBe(false);
    expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('.text-input'));
  });

  it('«Cancel» 과 Escape 는 고른 것을 버리고, 다시 열면 값에서 시작한다', async () => {
    const el = await mount<UDatePicker>('<u-date-picker confirm value="2026-03-06"></u-date-picker>', 'u-date-picker');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    await open(el);
    await click(el, day(el, '2026-03-10'));
    await click(el, footerButton(el, 'Cancel'));
    expect([el.value, changes, isOpen(el)]).toEqual(['2026-03-06', 0, false]);

    await open(el);
    expect(day(el, '2026-03-06').getAttribute('aria-selected')).toBe('true');
    expect(day(el, '2026-03-10').getAttribute('aria-selected')).not.toBe('true');
    await click(el, day(el, '2026-03-12'));
    day(el, '2026-03-12').focus();
    await userEvent.keyboard('{Escape}');
    await settle(el);
    expect([el.value, changes, isOpen(el)]).toEqual(['2026-03-06', 0, false]);
  });

  it('datetime — 날과 시간을 바꾼 뒤 «Apply» 에서 한 번에 확정한다', async () => {
    const el = await mount<UDatePicker>(
      '<u-date-picker confirm mode="datetime" value="2026-03-06T09:00:00+09:00"></u-date-picker>', 'u-date-picker');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    await open(el);
    await click(el, day(el, '2026-03-10'));
    const time = el.shadowRoot!.querySelector('.time-input') as HTMLInputElement;
    time.value = '14:30';
    time.dispatchEvent(new Event('change'));
    await settle(el);
    expect(el.value).toBe('2026-03-06T09:00:00+09:00');
    expect(changes).toBe(0);
    await click(el, footerButton(el, 'Apply'));
    expect(el.value!.slice(0, 19)).toBe('2026-03-10T14:30:00');
    expect(changes).toBe(1);
  });

  it('달력의 «Clear value» 는 비움을 고를 뿐이고 «Apply» 에서 값이 빈다', async () => {
    const el = await mount<UDatePicker>('<u-date-picker confirm clearable value="2026-03-06"></u-date-picker>', 'u-date-picker');
    await open(el);
    await click(el, footerButton(el, 'Clear value'));
    expect(el.value).toBe('2026-03-06');
    await click(el, footerButton(el, 'Apply'));
    expect(el.value).toBeUndefined();
  });

  it('confirm 이 없으면 종전대로 고르는 순간 확정된다(버튼 없음)', async () => {
    const el = await mount<UDatePicker>('<u-date-picker value="2026-03-06"></u-date-picker>', 'u-date-picker');
    await open(el);
    expect(footerButton(el, 'Apply')).toBeUndefined();
    await click(el, day(el, '2026-03-10'));
    expect([el.value, isOpen(el)]).toEqual(['2026-03-10', false]);
  });
});

describe('confirm 모드 — u-date-range-picker', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('범위를 완성해도 값은 그대로 · 열린 채 · «Apply» 에서 확정된다', async () => {
    const el = await mount<UDateRangePicker>(
      '<u-date-range-picker confirm value="2026-03-01/2026-03-02"></u-date-range-picker>', 'u-date-range-picker');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    await open(el);
    await click(el, day(el, '2026-03-05'));
    await click(el, day(el, '2026-03-09'));
    expect([el.value, changes, isOpen(el)]).toEqual(['2026-03-01/2026-03-02', 0, true]);
    await click(el, footerButton(el, 'Apply'));
    expect([el.value, changes, isOpen(el)]).toEqual(['2026-03-05/2026-03-09', 1, false]);
  });

  it('프리셋도 고른 것으로만 표시되고(aria-pressed) «Cancel» 이 버린다', async () => {
    const el = await mount<UDateRangePicker>(
      '<u-date-range-picker confirm presets="today" value="2020-01-01/2020-01-02"></u-date-range-picker>', 'u-date-range-picker');
    await open(el);
    const preset = el.shadowRoot!.querySelector('.preset') as HTMLButtonElement;
    await click(el, preset);
    expect(preset.getAttribute('aria-pressed')).toBe('true');
    expect(el.value).toBe('2020-01-01/2020-01-02');
    await click(el, footerButton(el, 'Cancel'));
    expect([el.value, isOpen(el)]).toEqual(['2020-01-01/2020-01-02', false]);
  });

  it('한국어 로케일에서 버튼 문구는 «취소»·«적용» 이다', async () => {
    Locale.set('ko');
    const el = await mount<UDateRangePicker>('<u-date-range-picker confirm></u-date-range-picker>', 'u-date-range-picker');
    await open(el);
    expect(footerButton(el, '취소')).toBeTruthy();
    expect(footerButton(el, '적용')).toBeTruthy();
  });
});
