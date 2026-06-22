import { describe, it, expect, afterEach } from 'vitest';
import {
  registerLocale,
  getLocaleStrings,
  formatTemplate,
  getDefaultLocale,
  setDefaultLocale,
  getEffectiveLocale,
  resolveLocale,
} from '../../src/core/locale.js';

describe('locale', () => {
  describe('getDefaultLocale', () => {
    it('returns English validation templates', () => {
      const en = getDefaultLocale();
      expect(en.required).toBe('This field is required');
      expect(en.minValue).toBe('Value must be at least {min}');
      expect(en.maxValue).toBe('Value must be at most {max}');
      expect(en.stepMismatch).toBe('Value must be a multiple of {step}');
      expect(en.minCount).toBe('Please select at least {min} items');
      expect(en.maxCount).toBe('Please select no more than {max} items');
    });

    it('returns a copy (not a mutable reference)', () => {
      const a = getDefaultLocale();
      const b = getDefaultLocale();
      a.required = 'modified';
      expect(b.required).toBe('This field is required');
    });
  });

  describe('getLocaleStrings', () => {
    it('returns English when lang is undefined', () => {
      expect(getLocaleStrings(undefined).required).toBe('This field is required');
    });

    it('returns English when lang is not registered', () => {
      expect(getLocaleStrings('fr').required).toBe('This field is required');
    });
  });

  describe('registerLocale', () => {
    it('registers and retrieves a locale', () => {
      registerLocale('ko', { required: '필수 항목입니다.' });
      expect(getLocaleStrings('ko').required).toBe('필수 항목입니다.');
    });

    it('merges with English defaults for partial registration', () => {
      registerLocale('ja', { required: '必須項目です' });
      const strings = getLocaleStrings('ja');
      expect(strings.required).toBe('必須項目です');
      expect(strings.minValue).toBe('Value must be at least {min}'); // English fallback
    });

    it('resolves case-insensitively', () => {
      registerLocale('DE', { required: 'Pflichtfeld' });
      expect(getLocaleStrings('de').required).toBe('Pflichtfeld');
      expect(getLocaleStrings('DE').required).toBe('Pflichtfeld');
    });

    it('resolves base language from full tag (ko-KR → ko)', () => {
      registerLocale('ko', { required: '필수 항목입니다.' });
      expect(getLocaleStrings('ko-KR').required).toBe('필수 항목입니다.');
    });

    it('prefers exact match over base language', () => {
      registerLocale('zh', { required: '必填' });
      registerLocale('zh-tw', { required: '必填欄位' });
      expect(getLocaleStrings('zh-TW').required).toBe('必填欄位');
      expect(getLocaleStrings('zh').required).toBe('必填');
    });
  });

  describe('formatTemplate', () => {
    it('replaces a single placeholder', () => {
      expect(formatTemplate('Value must be at least {min}', { min: 18 }))
        .toBe('Value must be at least 18');
    });

    it('keeps unreplaced placeholders', () => {
      expect(formatTemplate('{min} {unknown}', { min: 1 })).toBe('1 {unknown}');
    });

    it('handles a template without placeholders', () => {
      expect(formatTemplate('This field is required', {})).toBe('This field is required');
    });
  });

  describe('setDefaultLocale / resolveLocale', () => {
    afterEach(() => {
      setDefaultLocale(undefined);
    });

    it('setDefaultLocale stores the locale', () => {
      setDefaultLocale('ko-KR');
      expect(getEffectiveLocale()).toBe('ko-KR');
    });

    it('getEffectiveLocale returns undefined by default', () => {
      expect(getEffectiveLocale()).toBeUndefined();
    });

    it('resolveLocale: widget locale takes priority over the default', () => {
      setDefaultLocale('en-US');
      expect(resolveLocale('ko-KR')).toBe('ko-KR');
    });

    it('resolveLocale: falls back to setDefaultLocale', () => {
      setDefaultLocale('ko-KR');
      expect(resolveLocale(undefined)).toBe('ko-KR');
      expect(resolveLocale(null)).toBe('ko-KR');
    });

    it('resolveLocale: returns undefined when nothing is set', () => {
      expect(resolveLocale(undefined)).toBeUndefined();
    });
  });
});
