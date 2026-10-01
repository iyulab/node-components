import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import type { UDateRangePicker } from '../../src/components/date-range-picker/UDateRangePicker.js';
import { Locale } from '../../src/utilities/Locale.js';
import { formatDateRange } from '../../src/utilities/format.js';
import { resolvePresets } from '../../src/components/date-range-picker/presets.js';

/** 달력 격자는 내부 `u-calendar` 의 섀도 안에 있다. */
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

async function mount(html: string): Promise<UDateRangePicker> {
  document.body.innerHTML = html;
  const el = document.querySelector('u-date-range-picker') as UDateRangePicker;
  await settle(el);
  return el;
}

async function open(el: UDateRangePicker) {
  (el.shadowRoot!.querySelector('.container') as HTMLElement).click();
  await settle(el);
}

const isOpen = (el: UDateRangePicker) => el.shadowRoot!.querySelector('u-popover')!.hasAttribute('open');
const day = (el: UDateRangePicker, iso: string) =>
  cal(el).querySelector(`button.day[data-iso="${iso}"]`) as HTMLButtonElement;

async function pick(el: UDateRangePicker, a: string, b: string) {
  day(el, a).click();
  await settle(el);
  day(el, b).click();
  await settle(el);
}

describe('u-date-range-picker', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('열면 두 달을 보여 주고, 대화상자 이름이 «기간 선택» 이다', async () => {
    const el = await mount('<u-date-range-picker value="2026-03-06/2026-03-12"></u-date-range-picker>');
    await open(el);
    expect(isOpen(el)).toBe(true);
    const titles = Array.from(cal(el).querySelectorAll('.calendar-title')).map(t => t.textContent);
    expect(titles).toEqual(['March 2026', 'April 2026']);
    expect(el.shadowRoot!.querySelector('u-popover')!.getAttribute('aria-label')).toBe('Choose date range');
    // 초점은 범위의 시작일로 들어간다.
    expect((cal(el).activeElement as HTMLElement | null)?.dataset.iso).toBe('2026-03-06');
  });

  it('두 날을 고르면 값이 «시작/끝» 이 되고 change 가 한 번 나며 달력이 닫힌다', async () => {
    const el = await mount('<u-date-range-picker value="2026-03-01/2026-03-02"></u-date-range-picker>');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    await open(el);
    await pick(el, '2026-03-05', '2026-04-03');
    expect(el.value).toBe('2026-03-05/2026-04-03');
    expect([el.start, el.end]).toEqual(['2026-03-05', '2026-04-03']);
    expect(changes).toBe(1);
    expect(isOpen(el)).toBe(false);
    expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('.container'));
  });

  it('🔴뒤에 고른 날이 앞서면 그것이 시작이다 — 뒤집힌 범위는 만들어지지 않는다', async () => {
    const el = await mount('<u-date-range-picker value="2026-03-01/2026-03-02"></u-date-range-picker>');
    await open(el);
    await pick(el, '2026-03-20', '2026-03-04');
    expect(el.value).toBe('2026-03-04/2026-03-20');
  });

  it('코드가 뒤집힌 값을 넣으면 순서를 바로잡는다 — change 는 없다', async () => {
    const el = await mount('<u-date-range-picker></u-date-range-picker>');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    el.value = '2026-05-10/2026-05-01';
    await settle(el);
    expect(el.value).toBe('2026-05-01/2026-05-10');
    expect(changes).toBe(0);
  });

  it('트리거는 로케일이 이은 범위 문구를 보여 준다', async () => {
    const el = await mount('<u-date-range-picker value="2026-03-06/2026-04-03"></u-date-range-picker>');
    const text = el.shadowRoot!.querySelector('.text-content')!.textContent!.trim();
    expect(text).toBe(formatDateRange('2026-03-06', '2026-04-03', undefined, 'en'));
  });

  it('폼에 한 필드로 실린다', async () => {
    document.body.innerHTML = '<form><u-date-range-picker name="period" value="2026-03-06/2026-04-03"></u-date-range-picker></form>';
    const el = document.querySelector('u-date-range-picker') as UDateRangePicker;
    await settle(el);
    const data = new FormData(document.querySelector('form')!);
    expect(data.getAll('period')).toEqual(['2026-03-06/2026-04-03']);
  });

  it('검증: required 빈 값 · min 앞 · max 뒤 · 형식이 깨진 값', async () => {
    const el = await mount('<u-date-range-picker required min="2026-03-05" max="2026-03-25"></u-date-range-picker>');
    expect(el.validate()).toBe(false);
    expect(el.validity?.valueMissing).toBe(true);

    el.value = '2026-03-01/2026-03-10';
    await settle(el);
    expect(el.validate()).toBe(false);
    expect(el.validity?.rangeUnderflow).toBe(true);

    el.value = '2026-03-10/2026-03-30';
    await settle(el);
    expect(el.validate()).toBe(false);
    expect(el.validity?.rangeOverflow).toBe(true);

    el.value = '2026-03-10';
    await settle(el);
    expect(el.validate()).toBe(false);
    expect(el.validity?.badInput).toBe(true);

    el.value = '2026-03-10/2026-03-12';
    await settle(el);
    expect(el.validate()).toBe(true);
  });

  it('범위 밖 날은 고를 수 없다', async () => {
    const el = await mount('<u-date-range-picker value="2026-03-10/2026-03-11" min="2026-03-05"></u-date-range-picker>');
    await open(el);
    expect(day(el, '2026-03-04').getAttribute('aria-disabled')).toBe('true');
  });

  it('clearable: 지우기 아이콘이 값을 비우고 change 를 낸다', async () => {
    const el = await mount('<u-date-range-picker clearable value="2026-03-06/2026-04-03"></u-date-range-picker>');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    (el.shadowRoot!.querySelector('.suffix-item[name="x"]') as HTMLElement).click();
    await settle(el);
    expect(el.value).toBeUndefined();
    expect(changes).toBe(1);
  });

  it('🔴Escape: 반쯤 고른 범위가 있으면 첫 번째는 그것만 버리고, 두 번째가 닫는다', async () => {
    const el = await mount('<u-date-range-picker value="2026-03-06/2026-03-12"></u-date-range-picker>');
    await open(el);
    await userEvent.keyboard('{Enter}');
    await settle(el);
    await userEvent.keyboard('{Escape}');
    await settle(el);
    expect(isOpen(el)).toBe(true);
    await userEvent.keyboard('{Escape}');
    await settle(el);
    expect(isOpen(el)).toBe(false);
    expect(el.value).toBe('2026-03-06/2026-03-12');
  });

  it('반쯤 고른 채 닫았다 다시 열면 앵커가 남아 있지 않다', async () => {
    const el = await mount('<u-date-range-picker value="2026-03-06/2026-03-12"></u-date-range-picker>');
    await open(el);
    day(el, '2026-03-20').click();
    await settle(el);
    el.shadowRoot!.querySelector('u-popover')!.hide();
    await settle(el);
    await open(el);
    expect(cal(el).querySelectorAll('button.day[data-preview]').length).toBe(0);
    expect(cal(el).querySelectorAll('button.day[aria-selected="true"]').length).toBe(7);
  });

  it('달력 파트가 피커 밖에서 닿는다', async () => {
    const style = document.createElement('style');
    style.textContent = 'u-date-range-picker::part(day) { outline: 3px solid rgb(4, 5, 6); }';
    document.head.appendChild(style);
    try {
      const el = await mount('<u-date-range-picker value="2026-03-06/2026-03-12"></u-date-range-picker>');
      await open(el);
      expect(getComputedStyle(day(el, '2026-03-06')).outlineColor).toBe('rgb(4, 5, 6)');
    } finally {
      style.remove();
    }
  });

  describe('빠른 선택(프리셋)', () => {
    const presetButtons = (el: UDateRangePicker) =>
      Array.from(el.shadowRoot!.querySelectorAll('.presets u-button')) as HTMLElement[];
    const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    it('presets 가 없으면 목록도 없다', async () => {
      const el = await mount('<u-date-range-picker></u-date-range-picker>');
      await open(el);
      expect(el.shadowRoot!.querySelector('.presets')).toBeNull();
    });

    it('속성으로 준 이름을 그 순서대로, 로케일 문구로, 이름 붙은 묶음으로 그린다', async () => {
      Locale.set('ko');
      const el = await mount('<u-date-range-picker presets="today last7Days thisMonth"></u-date-range-picker>');
      await open(el);
      expect(presetButtons(el).map(b => b.textContent!.trim())).toEqual(['오늘', '최근 7일', '이번 달']);
      expect(el.shadowRoot!.querySelector('.presets')!.getAttribute('aria-label')).toBe('빠른 선택');
    });

    it('🔴프리셋을 누르면 그 범위로 즉시 확정된다 — change 한 번, 달력 닫힘', async () => {
      const el = await mount('<u-date-range-picker presets="today last7Days"></u-date-range-picker>');
      let changes = 0;
      el.addEventListener('change', () => changes++);
      await open(el);
      presetButtons(el)[1].click();
      await settle(el);
      const [expected] = resolvePresets(['last7Days'], new Date());
      expect(el.value).toBe(`${expected.start}/${expected.end}`);
      expect(changes).toBe(1);
      expect(isOpen(el)).toBe(false);
    });

    it('앱이 정의한 프리셋을 속성(property)으로 받는다', async () => {
      const el = await mount('<u-date-range-picker></u-date-range-picker>');
      el.presets = ['today', { label: 'Q1 2026', range: () => ['2026-01-01', '2026-03-31'] }];
      await settle(el);
      await open(el);
      expect(presetButtons(el).map(b => b.textContent!.trim())).toEqual(['Today', 'Q1 2026']);
      presetButtons(el)[1].click();
      await settle(el);
      expect(el.value).toBe('2026-01-01/2026-03-31');
    });

    it('min/max 밖으로 나가는 프리셋은 비활성이다', async () => {
      const today = iso(new Date());
      const el = await mount(`<u-date-range-picker presets="today yesterday" min="${today}"></u-date-range-picker>`);
      await open(el);
      const [t, y] = presetButtons(el);
      expect(t.hasAttribute('disabled')).toBe(false);
      expect(y.hasAttribute('disabled')).toBe(true);
    });

    it('⚪NEGATIVE — 모르는 이름은 그리지 않고 개발 경고 한 번', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const el = await mount('<u-date-range-picker presets="today lastFortnight"></u-date-range-picker>');
        await open(el);
        expect(presetButtons(el)).toHaveLength(1);
        expect(warn.mock.calls.some(c => String(c[0]).includes('lastFortnight'))).toBe(true);
      } finally {
        warn.mockRestore();
      }
    });
  });
});
