import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/calendar/UCalendar.js';
import type { UCalendar } from '../../src/components/calendar/UCalendar.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * The calendar's grid is Gregorian — `value` is a Gregorian ISO date and the day cells are Gregorian days. The month title and the
 * grid's accessible name must name the same month. In `th` (Buddhist), `fa` (Persian) and `ar-SA` (Islamic) the locale's default
 * calendar names a different month (or only a different year), so a title taken from the locale default tells a person and a screen
 * reader something the grid does not show.
 */
async function mount(value: string): Promise<UCalendar> {
  document.body.innerHTML = '';
  const el = document.createElement('u-calendar') as UCalendar;
  el.setAttribute('value', value);
  document.body.appendChild(el);
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 30));
  return el;
}

const title = (el: UCalendar) => el.shadowRoot!.querySelector('.calendar-title')!.textContent!.trim();
const gridName = (el: UCalendar) => el.shadowRoot!.querySelector('.calendar-grid')!.getAttribute('aria-label')!;
const firstDay = (el: UCalendar) => el.shadowRoot!.querySelector<HTMLElement>('.day[data-iso]')!.dataset.iso!;

/** What a Gregorian month title looks like in a locale — the same options with the calendar pinned. */
const gregorianTitle = (locale: string, iso: string) =>
  new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', calendar: 'gregory' }).format(new Date(`${iso}T12:00:00`));

describe('UCalendar — the month title names the month the Gregorian grid shows', () => {
  afterEach(() => { Locale.set('en'); document.body.innerHTML = ''; });

  it.each(['th', 'fa', 'ar-SA', 'ar-EG', 'en'])('%s: title and grid name are the Gregorian month', async (locale) => {
    Locale.set(locale);
    const el = await mount('2026-11-05');
    expect(firstDay(el), 'the grid starts on the 1st of the month of the value').toBe('2026-11-01');
    expect(title(el), `${locale}: title`).toBe(gregorianTitle(locale, '2026-11-05'));
    expect(gridName(el), `${locale}: grid accessible name`).toBe(gregorianTitle(locale, '2026-11-05'));
  });
});

const dayTexts = (el: UCalendar) =>
  [...el.shadowRoot!.querySelectorAll<HTMLElement>('.day[data-iso]')].map(b => b.textContent!.trim());

describe('UCalendar — the day numbers use the locale\'s digits', () => {
  afterEach(() => { Locale.set('en'); document.body.innerHTML = ''; });

  // The date text field writes a date in the locale's digits (۲۰۲۶/۱۱/۰۵), so the grid beside it must not write the day in Latin ones.
  // `ko` is here because `Intl.DateTimeFormat`'s `day` writes «5일» there: the cell must carry the number alone.
  it.each(['fa', 'ar-EG', 'bn', 'ko', 'en'])('%s: every cell is the day number in that locale\'s digits', async (locale) => {
    Locale.set(locale);
    const el = await mount('2026-11-05');
    const expected = Array.from({ length: 30 }, (_, i) => new Intl.NumberFormat(locale, { useGrouping: false }).format(i + 1));
    expect(dayTexts(el), `${locale}: day cells`).toEqual(expected);
  });

  it('the Latin digits stay for a locale that writes them', async () => {
    Locale.set('en');
    const el = await mount('2026-11-05');
    expect(dayTexts(el)[0]).toBe('1');
    expect(dayTexts(el)[29]).toBe('30');
  });

  it('a locale change redraws the numbers', async () => {
    Locale.set('en');
    const el = await mount('2026-11-05');
    expect(dayTexts(el)[4]).toBe('5');
    Locale.set('fa');
    el.requestUpdate();
    await el.updateComplete;
    expect(dayTexts(el)[4]).toBe(new Intl.NumberFormat('fa', { useGrouping: false }).format(5));
    expect(dayTexts(el)[4]).not.toBe('5');
  });
});
