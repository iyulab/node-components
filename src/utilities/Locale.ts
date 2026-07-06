/**
 * @iyulab/components 의 경량 로케일 유틸리티.
 *
 * 범위: 라이브러리가 스스로 생성하는 chrome 문자열(검증 메시지 등)만 대상.
 * 일반 i18n 프레임워크가 아니다. 앱 콘텐츠 번역은 consumer 의 i18n 계층이 담당한다.
 *
 * en/ko/ja/zh-CN/es/fr 은 빌드 시점에 내장된다 (src/assets/locales/*.json).
 * 그 외 언어는 register()로 테이블 단위 등록/오버라이드한다.
 */

/** 라이브러리가 기본 제공하는 로케일. */
export type SupportedLocale =
  | 'en' | 'ko' | 'ja' | 'zh-CN' | 'zh-TW' | 'es' | 'fr' | 'de' | 'pt-BR' | 'vi' | 'th' | 'id' | 'ru' | 'ar';

/** 내장 로케일은 자동완성되지만, 임의의 BCP47 태그도 그대로 받는다. */
export type LocaleTag = SupportedLocale | (string & {});

/** 라이브러리가 제공하는 chrome 문자열 키. 지금은 검증 메시지뿐이지만 이후 다른 UI 문구도 추가될 수 있다. */
export type LocaleMessageKey =
  | 'valueMissing'
  | 'badInput'
  | 'typeMismatch'
  | 'patternMismatch'
  | 'rangeUnderflow'
  | 'rangeOverflow'
  | 'stepMismatch'
  | 'tooShort'
  | 'tooLong';

type LocaleTable = Record<LocaleMessageKey, string>;

const builtins = new Map<string, LocaleTable>(
  Object.entries(
    import.meta.glob('../assets/locales/*.json', { eager: true, import: 'default' }),
  ).map(([path, mod]) => {
    const name = path.split('/').pop()?.replace('.json', '') || '';
    return [name.toLowerCase(), mod as LocaleTable] as [string, LocaleTable];
  }),
);

const overrides = new Map<string, LocaleTable>();

/** 브라우저 환경이면 `navigator.language`/`document.lang`으로 초기 로케일을 추측한다. */
function detectLocale(): LocaleTag {
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
  if (typeof document !== 'undefined' && document.documentElement?.lang) return document.documentElement.lang;
  return 'en';
}

let active: LocaleTag = detectLocale();

/** 정확 일치 → base 언어(ko-KR → ko) → en 순으로 값을 찾는다. */
function lookup(locale: string, key: LocaleMessageKey): string {
  const norm = locale.toLowerCase();
  const base = norm.split('-')[0];
  const chain = base === norm ? [norm, 'en'] : [norm, base, 'en'];

  for (const tag of chain) {
    const value = overrides.get(tag)?.[key] ?? builtins.get(tag)?.[key];
    if (value) return value;
  }
  return builtins.get('en')![key];
}

/**
 * 검증 메시지 로케일을 관리하는 정적 유틸리티입니다.
 */
export class Locale {
  /** 개별 인스턴스 생성을 방지합니다. */
  private constructor() {}

  /** 전역 활성 로케일을 지정합니다. */
  public static set(locale: LocaleTag): void {
    active = locale;
  }

  /** 전역 활성 로케일을 반환합니다 (초기값은 브라우저 언어 자동 감지, 실패 시 'en'). */
  public static get(): LocaleTag {
    return active;
  }

  /**
   * 로케일 하나의 메시지 테이블(전체 또는 일부)을 등록합니다.
   * 이미 존재하는 값(내장 포함) 위에 병합되므로, 일부 키만 넘겨도 나머지 키가 사라지지 않습니다.
   */
  public static register(locale: LocaleTag, table: Partial<LocaleTable>): void {
    const norm = locale.toLowerCase();
    const current = overrides.get(norm) ?? builtins.get(norm) ?? builtins.get('en')!;
    overrides.set(norm, { ...current, ...table });
  }

  /**
   * 현재 활성 로케일 기준으로 메시지를 조회합니다.
   * `params`가 있으면 템플릿의 `{name}` 자리를 치환합니다.
   */
  public static getValue(key: LocaleMessageKey, params?: Record<string, string | number>): string {
    const template = lookup(active, key);
    return params
      ? template.replace(/\{(\w+)\}/g, (_, name) => (params[name] != null ? String(params[name]) : `{${name}}`))
      : template;
  }
}
