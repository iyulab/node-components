import { describe, it, expect, afterEach } from 'vitest';
import { Locale } from '../../src/utilities/Locale.js';
import { formatNumber, formatCurrency, formatDate } from '../../src/utilities/format.js';

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
      // "2026-02-24" 를 Date.parse 로 읽으면(UTC) UTC-5 이하 시간대에서 2026-02-23 로 밀린다.
      // y/m/d 분리 파싱이면 어느 시간대에서든 24일로 남는다.
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
  });
});
