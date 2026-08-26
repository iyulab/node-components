import { describe, it, expect, afterEach, vi } from 'vitest';
import { Locale } from '../../src/utilities/Locale.js';

describe('Locale', () => {
  afterEach(() => {
    Locale.set('en');
  });

  describe('get / set', () => {
    it('defaults to en in Node/SSR even when the host OS locale is not English', async () => {
      // Node 21+ exposes a global `navigator` whose `.language` reflects the host
      // OS/ICU locale (this machine's is non-English), not a browser user's setting.
      // Trusting it here would leak the server's locale into every SSR/test run.
      // ⚠이전 버전의 이 테스트는 detectLocale()과 똑같은(가드 없는) 식으로 기대값을
      // 계산해 항상 자기 자신과만 비교했다 — 이 결함(Locale.ts detectLocale())을
      // 발견하지 못한 이유였다. 지금은 고정된 계약값 'en'과 비교한다.
      expect(typeof navigator !== 'undefined' && navigator.language).toBeTruthy();
      expect(typeof window).toBe('undefined');
      vi.resetModules();
      const { Locale: FreshLocale } = await import('../../src/utilities/Locale.js');
      expect(FreshLocale.get()).toBe('en');
    });

    it('detects navigator.language when a real browser window is present', async () => {
      vi.resetModules();
      const originalWindow = (globalThis as { window?: unknown }).window;
      const originalNavigator = globalThis.navigator;
      (globalThis as { window?: unknown }).window = {};
      Object.defineProperty(globalThis, 'navigator', {
        value: { language: 'fr-FR' },
        configurable: true,
      });
      try {
        const { Locale: FreshLocale } = await import('../../src/utilities/Locale.js');
        expect(FreshLocale.get()).toBe('fr-FR');
      } finally {
        if (originalWindow === undefined) delete (globalThis as { window?: unknown }).window;
        else (globalThis as { window?: unknown }).window = originalWindow;
        Object.defineProperty(globalThis, 'navigator', { value: originalNavigator, configurable: true });
        vi.resetModules();
      }
    });

    it('stores the active locale', () => {
      Locale.set('ko');
      expect(Locale.get()).toBe('ko');
    });
  });

  describe('getValue', () => {
    it('returns the built-in English message for the active locale', () => {
      expect(Locale.getValue('valueMissing')).toBe('This field is required');
    });

    it('returns built-in messages for other shipped locales', () => {
      Locale.set('ko');
      expect(Locale.getValue('valueMissing')).toBe('필수 항목입니다');
      Locale.set('ja');
      expect(Locale.getValue('valueMissing')).toBe('この項目は必須です');
      Locale.set('de');
      expect(Locale.getValue('valueMissing')).toBe('Dieses Feld ist erforderlich');
      Locale.set('vi');
      expect(Locale.getValue('valueMissing')).toBe('Trường này là bắt buộc');
      Locale.set('zh-TW');
      expect(Locale.getValue('valueMissing')).toBe('此欄位為必填');
      Locale.set('ru');
      expect(Locale.getValue('valueMissing')).toBe('Это поле обязательно для заполнения');
      Locale.set('ar');
      expect(Locale.getValue('valueMissing')).toBe('هذا الحقل مطلوب');
    });

    it('resolves pt-BR case-insensitively', () => {
      Locale.set('PT-br');
      expect(Locale.getValue('valueMissing')).toBe('Este campo é obrigatório');
    });

    it('falls back to en for an unregistered locale', () => {
      Locale.set('nl');
      expect(Locale.getValue('valueMissing')).toBe('This field is required');
    });

    it('resolves a regional tag to its base language (ko-KR → ko)', () => {
      Locale.set('ko-KR');
      expect(Locale.getValue('valueMissing')).toBe('필수 항목입니다');
    });

    it('is case-insensitive', () => {
      Locale.set('KO');
      expect(Locale.getValue('valueMissing')).toBe('필수 항목입니다');
    });

    it('substitutes template params', () => {
      expect(Locale.getValue('rangeUnderflow', { min: 18 })).toBe('Value must be at least 18');
    });

    it('keeps unresolved placeholders as-is', () => {
      expect(Locale.getValue('rangeUnderflow', {})).toBe('Value must be at least {min}');
    });
  });

  describe('register', () => {
    it('overrides a key without affecting sibling keys', () => {
      Locale.register('ko', { valueMissing: '커스텀 메시지' });
      Locale.set('ko');
      expect(Locale.getValue('valueMissing')).toBe('커스텀 메시지');
      // 같은 로케일의 다른 내장 키는 그대로 유지되어야 한다
      expect(Locale.getValue('rangeUnderflow')).toBe('값은 {min} 이상이어야 합니다');
    });

    it('registers a brand-new locale on top of the English fallback', () => {
      Locale.register('nl', { valueMissing: 'Dit veld is verplicht' });
      Locale.set('nl');
      expect(Locale.getValue('valueMissing')).toBe('Dit veld is verplicht');
      expect(Locale.getValue('rangeOverflow')).toBe('Value must be at most {max}');
    });

    it('merges repeated calls onto the previous registration, not just English', () => {
      Locale.register('fr', { valueMissing: 'Champ requis' });
      Locale.register('fr', { rangeOverflow: 'Trop grand' });
      Locale.set('fr');
      expect(Locale.getValue('valueMissing')).toBe('Champ requis');
      expect(Locale.getValue('rangeOverflow')).toBe('Trop grand');
    });
  });
});
