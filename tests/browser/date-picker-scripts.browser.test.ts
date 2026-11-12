import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/date-picker/UDatePicker.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';
import { Locale } from '../../src/utilities/Locale.js';
import { formatDateText } from '../../src/utilities/format.js';

/**
 * `format="locale"` writes the date the way the page's locale does and reads back what is typed with the same rules. In the
 * locales that write their own digits (`ar-EG`, `fa`), put direction marks between the parts (`ar`) or prefer another calendar
 * (`fa` the Persian year 1405, `th` the Buddhist 2569) the field wrote a text it could not read, or read it as another day.
 * A person who edits the text they see must get the day they typed.
 */
async function settle(el: UDatePicker) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 30));
  await el.updateComplete;
}

async function mount(value: string): Promise<UDatePicker> {
  document.body.innerHTML = '';
  const el = document.createElement('u-date-picker') as UDatePicker;
  el.setAttribute('format', 'locale');
  el.setAttribute('value', value);
  el.label = 'Order date';
  document.body.appendChild(el);
  await settle(el);
  return el;
}

const input = (el: UDatePicker) => el.shadowRoot!.querySelector<HTMLInputElement>('.text-input')!;

async function typeDate(el: UDatePicker, text: string) {
  await userEvent.click(input(el));
  await userEvent.keyboard('{Control>}a{/Control}');
  await userEvent.keyboard(text);
  await userEvent.keyboard('{Enter}');
  await settle(el);
}

describe('UDatePicker format="locale" — scripts, direction marks and calendars', () => {
  beforeEach(() => { document.body.innerHTML = ''; });
  afterEach(() => { Locale.set('en'); document.body.innerHTML = ''; });

  it.each(['ar', 'ar-EG', 'fa', 'th', 'bn'])('%s: the text it shows is the text it reads back for another day', async (locale) => {
    Locale.set(locale);
    const el = await mount('2026-10-02');
    expect(input(el).value, 'the field shows the date as the locale writes it').toBe(formatDateText('2026-10-02', 'locale', locale));

    await typeDate(el, formatDateText('2026-11-05', 'locale', locale));
    expect(el.value).toBe('2026-11-05');
    expect(input(el).value).toBe(formatDateText('2026-11-05', 'locale', locale));
  });

  it('ar-EG: a day typed in Arabic-Indic digits with the ISO shape is read', async () => {
    Locale.set('ar-EG');
    const el = await mount('2026-10-02');
    await typeDate(el, '٢٠٢٦-١١-٠٥');
    expect(el.value).toBe('2026-11-05');
  });

  it('th: the field shows the Gregorian year, the year the calendar next to it shows', async () => {
    Locale.set('th');
    const el = await mount('2026-10-02');
    expect(input(el).value).toContain('2026');
    expect(input(el).value).not.toContain('2569');
  });

  it('NEGATIVE: an impossible day typed in Arabic digits is still bad input — value empty, text kept to fix', async () => {
    Locale.set('ar-EG');
    const el = await mount('2026-10-02');
    await typeDate(el, '٢٠٢٦-٠٢-٣٠');
    expect(el.value).toBeUndefined();
    expect(el.validity!.badInput).toBe(true);
    expect(input(el).value).toBe('٢٠٢٦-٠٢-٣٠');
  });
});
