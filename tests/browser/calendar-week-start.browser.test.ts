import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/calendar/UCalendar.js';
import type { UCalendar } from '../../src/components/calendar/UCalendar.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * 달력은 한 주를 로케일이 여는 요일에서 시작한다. 요일 머리글 · 1일 앞의 빈 칸 · Home/End 가 한 값을 읽어야 하고,
 * 어긋나면 «머리글은 월요일부터인데 격자는 일요일부터» 같은 거짓말이 된다 — 그래서 셋을 같은 화면에서 함께 잰다.
 * 2026-11-01 은 일요일이다.
 */
async function mount(value: string): Promise<UCalendar> {
  document.body.innerHTML = '';
  const el = document.createElement('u-calendar') as UCalendar;
  el.setAttribute('value', value);
  document.body.appendChild(el);
  el.showDate(value); // 초점 날짜는 `value` 가 아니라 «보이는 날» 이다 — 정하지 않으면 오늘에서 시작한다
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 30));
  return el;
}

/** 2023-01-01 이 일요일 — 머리글 기대값을 «요일 번호» 로 만든다(같은 로케일의 narrow 표기). */
const narrow = (locale: string, weekday: number) =>
  new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(2023, 0, 1 + weekday));

const headers = (el: UCalendar) => Array.from(el.shadowRoot!.querySelectorAll('.weekday')).map(n => n.textContent!.trim());
/** 첫 주 행에서 1일 앞의 빈 칸 수. */
const leadingEmpties = (el: UCalendar) => el.shadowRoot!.querySelector('.calendar-week')!.querySelectorAll('.day-empty').length;
const focusedIso = (el: UCalendar) => (el.shadowRoot!.activeElement as HTMLElement | null)?.dataset.iso;

describe('u-calendar — 주 시작은 로케일의 첫 요일', () => {
  afterEach(() => { Locale.set('en'); document.body.innerHTML = ''; });

  it.each([
    // [locale, 첫 요일(0=일), 2026-11-01(일요일) 앞의 빈 칸]
    ['en', 0, 0],
    ['ko', 0, 0],
    ['de', 1, 6],
    ['fa', 6, 1],
    ['ar-EG', 6, 1],
  ])('%s: 머리글이 요일 %i 부터 · 일요일인 1일 앞에 빈 칸 %i', async (locale, first, empties) => {
    Locale.set(locale);
    const el = await mount('2026-11-05');
    expect(headers(el), `${locale}: 머리글`).toEqual(Array.from({ length: 7 }, (_, i) => narrow(locale, (first + i) % 7)));
    expect(leadingEmpties(el), `${locale}: 1일 앞의 빈 칸`).toBe(empties);
    // 머리글과 격자가 한 줄로 서는지 — 첫 주 행의 1일이 놓인 칸(빈 칸 수번째)의 요일이 머리글의 같은 칸이 말하는 요일이어야 한다.
    const firstWeek = Array.from(el.shadowRoot!.querySelector('.calendar-week')!.children) as HTMLElement[];
    expect(firstWeek[empties].dataset.iso, `${locale}: 첫 주 행의 첫 실제 날`).toBe('2026-11-01');
    expect(new Date(2026, 10, 1).getDay(), `${locale}: 2026-11-01 은 일요일`).toBe(0);
    expect(headers(el)[empties], `${locale}: 그 칸의 머리글은 일요일`).toBe(narrow(locale, 0));
  });

  it('마운트 뒤 로케일이 바뀌면 머리글과 격자가 새 주 시작을 따라온다 (런타임 i18n 전환)', async () => {
    Locale.set('en');
    const el = await mount('2026-11-05');
    expect(leadingEmpties(el)).toBe(0);
    Locale.set('de');
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 30));
    expect(headers(el)).toEqual(Array.from({ length: 7 }, (_, i) => narrow('de', (1 + i) % 7)));
    expect(leadingEmpties(el), 'de: 일요일인 1일이 첫 주 행의 마지막 칸으로').toBe(6);
    Locale.set('en');
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 30));
    expect(leadingEmpties(el), 'en 으로 되돌리면 다시 일요일부터').toBe(0);
  });

  it.each([
    // 2026-11-05 는 목요일 — 그 주의 처음 / 끝
    ['en', '2026-11-01', '2026-11-07'],
    ['de', '2026-11-02', '2026-11-08'],
    ['fa', '2026-10-31', '2026-11-06'],
  ])('%s: Home → %s · End → %s (실제 키 입력)', async (locale, home, end) => {
    Locale.set(locale);
    const el = await mount('2026-11-05');
    await el.focusDay();
    expect(focusedIso(el)).toBe('2026-11-05');
    await userEvent.keyboard('{Home}');
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 30));
    expect(focusedIso(el), `${locale}: Home`).toBe(home);
    await el.focusDay();
    await userEvent.keyboard('{End}');
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 30));
    expect(focusedIso(el), `${locale}: End`).toBe(end);
  });
});
