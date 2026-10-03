import { describe, it, expect, afterEach } from 'vitest';
import { Locale } from '../../src/utilities/Locale.js';
import { formatNumber, formatCurrency, formatDate, formatDateRange, parseNumber, parseDate, formatDateText, dateTextPattern, parseDateTime, formatDateTimeText, parseDateRange, formatDateRangeText, parseDateTimeRange, formatDateTimeRangeText } from '../../src/utilities/format.js';

describe('format utilities', () => {
  afterEach(() => Locale.set('en'));

  describe('formatNumber', () => {
    it('formats using the active locale by default', () => {
      Locale.set('en');
      expect(formatNumber(1234567)).toBe('1,234,567');
    });

    it('accepts an explicit locale override', () => {
      expect(formatNumber(1234567, undefined, 'de')).toBe('1.234.567');
    });

    it('passes through Intl.NumberFormatOptions', () => {
      expect(formatNumber(0.5, { style: 'percent' }, 'en')).toBe('50%');
    });
  });

  describe('formatCurrency', () => {
    it('requires an explicit currency — no silent default', () => {
      expect(formatCurrency(550000, 'KRW', undefined, 'ko')).toBe('₩550,000');
    });

    it('formats USD with the active locale', () => {
      Locale.set('en');
      expect(formatCurrency(1999.5, 'USD')).toBe('$1,999.50');
    });
  });

  describe('formatDate', () => {
    it('parses an ISO date string as a local date, not UTC', () => {
      // Date.parse("2026-02-24") (UTC interpretation) shifts the date back to 2026-02-23
      // in UTC-5 or lower regions. Splitting y/m/d and parsing via new Date(y, m-1, d)
      // keeps it as the 24th regardless of timezone.
      const text = formatDate('2026-02-24', { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en');
      expect(text).toContain('24');
      expect(text).toContain('2026');
    });

    it('accepts a Date object directly', () => {
      const d = new Date(2026, 1, 24); // month index 1 = February
      expect(formatDate(d, { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en')).toBe('02/24/2026');
    });

    it('uses the active locale by default', () => {
      Locale.set('ko');
      expect(formatDate('2026-02-24', { year: 'numeric', month: '2-digit', day: '2-digit' })).toBe('2026. 02. 24.');
    });

    it('does not throw on a full ISO datetime string and formats its date portion', () => {
      // The y/m/d split yields a non-numeric day segment ("24T09:00:00Z"), so this falls
      // back to native Date parsing instead of producing an Invalid Date.
      const text = formatDate('2026-02-24T09:00:00Z', { year: 'numeric', month: '2-digit', day: '2-digit' }, 'en');
      expect(text).toContain('2026');
      expect(text).toContain('24');
    });

    it('degrades to the raw string instead of throwing on a malformed value', () => {
      expect(() => formatDate('not-a-date')).not.toThrow();
      expect(formatDate('not-a-date')).toBe('not-a-date');
    });
  });

  describe('formatDateRange', () => {
    const opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };

    it('lets the locale join the two ends and drop what they share', () => {
      expect(formatDateRange('2026-03-06', '2026-04-03', opts, 'en')).toBe(
        new Intl.DateTimeFormat('en', opts).formatRange(new Date(2026, 2, 6), new Date(2026, 3, 3)),
      );
      // Same year: the year is written once, not twice.
      expect(formatDateRange('2026-03-06', '2026-04-03', opts, 'en').match(/2026/g)).toHaveLength(1);
    });

    it('reads ISO dates as local days (no UTC shift)', () => {
      const text = formatDateRange('2026-03-01', '2026-03-01', { day: 'numeric', month: 'numeric' }, 'en');
      expect(text).toBe('3/1');
    });

    it('formats a reversed pair earliest first', () => {
      expect(formatDateRange('2026-04-03', '2026-03-06', opts, 'en'))
        .toBe(formatDateRange('2026-03-06', '2026-04-03', opts, 'en'));
    });

    it('degrades a malformed end to its raw string instead of throwing', () => {
      expect(() => formatDateRange('x', 'y')).not.toThrow();
      expect(formatDateRange('x', 'y')).toBe('x – y');
      expect(formatDateRange('2026-03-06', 'y', opts, 'en')).toBe(`${formatDate('2026-03-06', opts, 'en')} – y`);
    });
  });

  describe('parseNumber', () => {
    it.each([
      // both separators — the last one is decimal
      ['1.234,5', 'de', 1234.5],
      ['1,234.5', 'en', 1234.5],
      ['1,234.5', 'de', 1234.5],
      // one separator repeated — grouping
      ['1.234.567', 'de', 1234567],
      ['1,234,567', 'en', 1234567],
      // a single dot is decimal, even on a comma-decimal page
      ['0.125', 'de', 0.125],
      ['1.234', 'de', 1.234],
      // a single comma is decimal, except 3 digits after on a dot-decimal page
      ['1,5', 'de', 1.5],
      ['1,5', 'en', 1.5],
      ['2,25', 'en', 2.25],
      ['1,234', 'en', 1234],
      ['1,234', 'de', 1.234],
      // spaces / NBSP / apostrophes group
      ['1 234,5', 'fr', 1234.5],
      ['1\u202F234,5', 'fr', 1234.5],
      ['1\u00A0234\u00A0567', 'ru', 1234567],
      ["1'234.5", 'de-CH', 1234.5],
      // signs and edges
      ['-0,5', 'de', -0.5],
      ['\u22123', 'en', -3],
      ['+7', 'en', 7],
      ['.5', 'en', 0.5],
      ['1.', 'en', 1],
      ['  42  ', 'ko', 42],
      ['0', 'en', 0],
    ] as const)('%s (%s) → %s', (text, locale, expected) => {
      expect(parseNumber(text, locale)).toBe(expected);
    });

    it.each([
      ['', 'en'], ['   ', 'en'], [',', 'en'], ['.', 'de'], ['-', 'en'],
      ['1,23,4', 'en'], ['12 34', 'fr'], ['1.234,5,6', 'de'], ['1,5.2.3', 'en'],
      ['1,5x', 'de'], ['abc', 'en'], ['1e3', 'en'], [' 1 2', 'fr'],
      ['1..2', 'en'], ['--1', 'en'], ['1-', 'en'],
    ] as const)('⚪NEGATIVE — %j (%s) is not a number, never a partial one', (text, locale) => {
      expect(parseNumber(text, locale)).toBeNull();
    });

    it('defaults to the active Locale for the one ambiguous case', async () => {
      const { Locale } = await import('../../src/utilities/Locale.js');
      Locale.set('en');
      expect(parseNumber('1,234')).toBe(1234);
      Locale.set('de');
      expect(parseNumber('1,234')).toBe(1.234);
      Locale.set('en');
    });

    it('round-trips formatNumber in every built-in locale', () => {
      for (const locale of ['en', 'ko', 'de', 'fr', 'es', 'pt-BR', 'ru', 'vi', 'id', 'ja', 'zh-CN', 'th']) {
        for (const n of [0.5, 12.75, 1234.5, 1234567.25, -9876.125]) {
          expect(parseNumber(formatNumber(n, { maximumFractionDigits: 3 }, locale), locale), `${locale} ${n}`).toBe(n);
        }
      }
    });
  });
  describe('parseDate', () => {
    const ref = new Date(2026, 9, 3);
    it.each([
      ['2026-10-02', 'iso', 'en', '2026-10-02'],
      ['2026/10/2', 'iso', 'en', '2026-10-02'],
      ['2026. 10. 2.', 'iso', 'ko', '2026-10-02'],
      ['20261002', 'iso', 'en', '2026-10-02'],
      ['10-02', 'iso', 'en', '2026-10-02'],
      ['  2026-10-02 ', 'iso', 'en', '2026-10-02'],
      // locale order — and ISO still reads
      ['10/02/2026', 'locale', 'en-US', '2026-10-02'],
      ['10/2', 'locale', 'en-US', '2026-10-02'],
      ['02.10.2026', 'locale', 'de', '2026-10-02'],
      ['2.10', 'locale', 'de', '2026-10-02'],
      ['2026-10-02', 'locale', 'de', '2026-10-02'],
    ])('reads %s (%s, %s) as %s', (text, format, locale, expected) => {
      expect(parseDate(text, { format: format as 'iso' | 'locale', locale, referenceDate: ref })).toBe(expected);
    });

    it.each(['', 'abc', '2026-02-30', '2026-13-01', '26-10-02', '2026-10', '10/02/26', '2026-10-02x', '1-2-3-4'])(
      'does not read %j', (text) => {
        expect(parseDate(text, { referenceDate: ref })).toBeNull();
      });
  });

  describe('formatDateText / dateTextPattern', () => {
    it('writes ISO as is, and the locale numeric order on request', () => {
      expect(formatDateText('2026-10-02')).toBe('2026-10-02');
      expect(formatDateText('2026-10-02', 'locale', 'en-US')).toBe('10/02/2026');
      expect(formatDateText('2026-10-02', 'locale', 'de')).toBe('02.10.2026');
      expect(formatDateText('not-a-date', 'locale', 'de')).toBe('not-a-date');
    });
    it('round-trips through parseDate', () => {
      for (const locale of ['en-US', 'de', 'ko', 'ja', 'fr']) {
        expect(parseDate(formatDateText('2026-10-02', 'locale', locale), { format: 'locale', locale })).toBe('2026-10-02');
      }
    });
    it('names the pattern to type', () => {
      expect(dateTextPattern()).toBe('YYYY-MM-DD');
      expect(dateTextPattern('locale', 'en-US')).toBe('MM/DD/YYYY');
      expect(dateTextPattern('locale', 'de')).toBe('DD.MM.YYYY');
    });
  });
  describe('parseDateTime / formatDateTimeText', () => {
    const ref = new Date(2026, 9, 3);
    it.each([
      ['2026-10-02 14:05', '2026-10-02T14:05'],
      ['2026-10-02T14:05', '2026-10-02T14:05'],
      ['2026-10-02 9:05', '2026-10-02T09:05'],
      ['2026-10-02 14:05:59', '2026-10-02T14:05'],
      ['20261002 1405', null],
      ['2026. 10. 2. 14:05', '2026-10-02T14:05'],
      ['10-02 08:00', '2026-10-02T08:00'],
      ['2026-10-02', '2026-10-02T07:30'],
      ['2026-10-02 24:00', null],
      ['2026-10-02 12:60', null],
      ['14:05', null],
    ])('reads %j as %j', (text, expected) => {
      expect(parseDateTime(text, { referenceDate: ref, defaultTime: '07:30' })).toBe(expected);
    });
    it('writes {date} HH:mm and round-trips in a locale order', () => {
      expect(formatDateTimeText('2026-10-02T14:05')).toBe('2026-10-02 14:05');
      expect(formatDateTimeText('2026-10-02T14:05:00+09:00', 'locale', 'de')).toBe('02.10.2026 14:05');
      expect(parseDateTime(formatDateTimeText('2026-10-02T14:05', 'locale', 'de'), { format: 'locale', locale: 'de' })).toBe('2026-10-02T14:05');
    });
  });
  describe('parseDateRange / formatDateRangeText', () => {
    const ref = new Date(2026, 9, 3);
    it.each([
      ['2026-10-01 ~ 2026-10-31', ['2026-10-01', '2026-10-31']],
      ['2026-10-01~2026-10-31', ['2026-10-01', '2026-10-31']],
      ['2026-10-01 – 10-31', ['2026-10-01', '2026-10-31']],
      ['2026-10-01 - 2026-10-31', ['2026-10-01', '2026-10-31']],
      ['2026-10-01/2026-10-31', ['2026-10-01', '2026-10-31']],
      ['2026-10-31 ~ 2026-10-01', ['2026-10-01', '2026-10-31']],
      ['2026-10-05', ['2026-10-05', '2026-10-05']],
      ['2025-12-20 ~ 01-05', ['2025-12-20', '2026-01-05']],
      ['2026-10-31 ~ 2026-01-05', ['2026-01-05', '2026-10-31']],
    ])('reads %j', (text, expected) => {
      const r = parseDateRange(text, { referenceDate: ref });
      expect(r ? [r.start, r.end] : null).toEqual(expected);
    });
    it.each(['', 'soon', '2026-10-01 ~ soon', '2026-10-01 ~ 2026-10-02 ~ 2026-10-03'])('does not read %j', (text) => {
      expect(parseDateRange(text, { referenceDate: ref })).toBeNull();
    });
    it('round-trips in a locale order', () => {
      const text = formatDateRangeText('2026-10-01', '2026-10-31', 'locale', 'de');
      expect(text).toBe('01.10.2026 – 31.10.2026');
      expect(parseDateRange(text, { format: 'locale', locale: 'de' })).toEqual({ start: '2026-10-01', end: '2026-10-31' });
    });
  });

  describe('parseDateTimeRange / formatDateTimeRangeText', () => {
    const ref = new Date(2026, 9, 3);
    it.each([
      ['2026-10-01 09:00 ~ 2026-10-31 18:00', ['2026-10-01T09:00', '2026-10-31T18:00']],
      ['2026-10-01 09:00 ~ 18:00', ['2026-10-01T09:00', '2026-10-01T18:00']],
      ['2026-10-01 ~ 2026-10-31', ['2026-10-01T00:00', '2026-10-31T23:59']],
      ['2026-10-05', ['2026-10-05T00:00', '2026-10-05T23:59']],
      ['2026-10-05 22:00', ['2026-10-05T22:00', '2026-10-05T23:59']],
      ['2026-10-01T09:00/2026-10-31T18:00', ['2026-10-01T09:00', '2026-10-31T18:00']],
      ['2026-10-01T09:00:00+09:00/2026-10-31T18:00:00+09:00', ['2026-10-01T09:00', '2026-10-31T18:00']],
      ['2026-10-01 18:00 ~ 09:00', ['2026-10-01T09:00', '2026-10-01T18:00']],
      ['2025-12-20 09:00 ~ 01-05 18:00', ['2025-12-20T09:00', '2026-01-05T18:00']],
    ])('reads %j', (text, expected) => {
      const r = parseDateTimeRange(text, { referenceDate: ref });
      expect(r ? [r.start, r.end] : null).toEqual(expected);
    });
    it('takes the default times it is given', () => {
      expect(parseDateTimeRange('2026-10-01 ~ 2026-10-02', { startTime: '09:00', endTime: '18:00' }))
        .toEqual({ start: '2026-10-01T09:00', end: '2026-10-02T18:00' });
    });
    it.each(['', 'soon', '2026-10-01 ~ 25:00', '2026-10-01 09:00 ~ soon'])('does not read %j', (text) => {
      expect(parseDateTimeRange(text, { referenceDate: ref })).toBeNull();
    });
    it('round-trips in a locale order', () => {
      const text = formatDateTimeRangeText('2026-10-01T09:00', '2026-10-31T18:00', 'locale', 'de');
      expect(text).toBe('01.10.2026 09:00 – 31.10.2026 18:00');
      expect(parseDateTimeRange(text, { format: 'locale', locale: 'de' }))
        .toEqual({ start: '2026-10-01T09:00', end: '2026-10-31T18:00' });
    });
  });
});
