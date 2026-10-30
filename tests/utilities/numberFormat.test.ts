import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Locale } from '../../src/utilities/Locale.js';
import { applyNumberFormat } from '../../src/utilities/numberFormat.js';

// 기대값은 같은 서식 코드를 Excel(en-US 로캘)이 보이는 글자다.
describe('applyNumberFormat — spreadsheet format codes', () => {
  let prev: string;
  beforeEach(() => {
    prev = Locale.get();
    Locale.set('en');
  });
  afterEach(() => {
    Locale.set(prev as Parameters<typeof Locale.set>[0]);
  });

  const text = (v: unknown, code: string) => applyNumberFormat(v, code)?.text;

  it('keeps a trailing unit literal', () => {
    expect(text(1234, '#,##0원')).toBe('1,234원');
    expect(text(1234, '#,##0" 원"')).toBe('1,234 원');
  });

  it('puts the minus sign before a currency prefix in a single section', () => {
    expect(text(-1234, '₩#,##0')).toBe('-₩1,234');
    expect(text(-1234, '#,##0')).toBe('-1,234');
  });

  it('uses the negative section with the absolute value', () => {
    expect(text(-1234, '#,##0;(#,##0)')).toBe('(1,234)');
    expect(text(1234, '#,##0;(#,##0)')).toBe('1,234');
    expect(text(-1234.5, '#,##0.00;-#,##0.00')).toBe('-1,234.50');
  });

  it('uses the zero section', () => {
    expect(text(0, '#,##0;(#,##0);"-"')).toBe('-');
    expect(text(0, '#,##0;(#,##0);\\-')).toBe('-');
  });

  it('reads a color as a tone', () => {
    expect(applyNumberFormat(1234, '#,##0;[Red](#,##0)')).toEqual({ text: '1,234', tone: undefined });
    expect(applyNumberFormat(-1234, '#,##0;[Red](#,##0)')).toEqual({ text: '(1,234)', tone: 'danger' });
    expect(applyNumberFormat(-1234.5, '#,##0.00;[Red]-#,##0.00')).toEqual({ text: '-1,234.50', tone: 'danger' });
  });

  it('scales by trailing commas', () => {
    expect(text(123456789, '#,##0,,"백만"')).toBe('123백만');
    expect(text(1234567, '#,##0,')).toBe('1,235');
  });

  it('formats percent, padding zeros and optional digits', () => {
    expect(text(0.1235, '0.00%')).toBe('12.35%');
    expect(text(5, '000')).toBe('005');
    expect(text(0.5, '#.##')).toBe('.5');
    expect(text(0.5, '0.0#')).toBe('0.5');
    expect(text(1.234, '0.0#')).toBe('1.23');
  });

  it('reads [$sym-locale] as the symbol and _x as an alignment space', () => {
    expect(text(1234, '[$₩-412]#,##0')).toBe('₩1,234');
    expect(text(1234, '#,##0_);(#,##0)')).toBe('1,234 '); // punctuation space — the width of «)»
  });

  it('uses the text section for non-numeric values, and reads numeric text as a number', () => {
    expect(text('n/a', '#,##0;-#,##0;0;"["@"]"')).toBe('[n/a]');
    expect(text('n/a', '#,##0')).toBe('n/a');
    expect(text('1234.5', '#,##0.0')).toBe('1,234.5');
  });

  it('does not write a minus for a negative that rounds to zero', () => {
    expect(text(-0.4, '#,##0')).toBe('0');
    expect(text(-0.004, '0.00')).toBe('0.00');
  });

  it('returns null for syntax it does not support', () => {
    expect(applyNumberFormat(5, '[>100]#,##0;0')).toBeNull();
    expect(applyNumberFormat(5, '0.00E+00')).toBeNull();
    expect(applyNumberFormat(5, '# ?/?')).toBeNull();
  });

  it('follows the given locale, then the app locale', () => {
    expect(applyNumberFormat(1234.5, '#,##0.00', 'de')?.text).toBe('1.234,50');
    Locale.set('de');
    expect(text(1234.5, '#,##0.00')).toBe('1.234,50');
  });
});

describe('applyNumberFormat — Intl options', () => {
  it('formats with the options in the given locale', () => {
    expect(applyNumberFormat(1234.5, { minimumFractionDigits: 2 }, 'en')?.text).toBe('1,234.50');
    expect(applyNumberFormat(0.256, { style: 'percent', maximumFractionDigits: 1 }, 'en')?.text).toBe('25.6%');
    expect(applyNumberFormat(1234, { style: 'currency', currency: 'KRW' }, 'ko')?.text).toBe('₩1,234');
  });

  it('keeps significant digits for a small value', () => {
    expect(applyNumberFormat(0.00007729, { maximumSignificantDigits: 4 }, 'en')?.text).toBe('0.00007729');
  });

  it('never writes a signed zero unless the options ask for a sign', () => {
    expect(applyNumberFormat(-0.0001, { maximumFractionDigits: 2 }, 'en')?.text).toBe('0');
    expect(applyNumberFormat(-1, {}, 'en')?.text).toBe('-1');
    expect(applyNumberFormat(-0.0001, { maximumFractionDigits: 2, signDisplay: 'always' }, 'en')?.text).toBe('-0');
  });

  it('reads numeric text, shows other text as is, and empties null', () => {
    expect(applyNumberFormat('12', { minimumFractionDigits: 1 }, 'en')?.text).toBe('12.0');
    expect(applyNumberFormat('n/a', {}, 'en')?.text).toBe('n/a');
    expect(applyNumberFormat(null, {}, 'en')?.text).toBe('');
    expect(applyNumberFormat(undefined, '#,##0', 'en')?.text).toBe('');
  });
});
