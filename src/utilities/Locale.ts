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
  | 'tooLong'
  | 'increment'
  | 'decrement'
  | 'clear'
  | 'showPassword'
  | 'hidePassword';

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
  // `typeof window !== 'undefined'`로 실제 브라우저인지 먼저 가른다 — Node 21+는
  // 전역 `navigator`를 자체 제공하는데(`.language`가 OS/ICU 로케일을 반영, 브라우저의
  // "사용자 언어 설정"과 무관), 이 가드가 없으면 SSR/CLI/테스트처럼 Node에서 이 모듈을
  // import하는 것만으로 서버 머신의 로케일이 기본 활성 로케일로 새어 들어온다.
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  if (typeof document !== 'undefined' && document.documentElement?.lang) return document.documentElement.lang;
  return 'en';
}

let active: LocaleTag = detectLocale();

/** 정확 일치 → base 언어(ko-KR → ko) → en 순의 조회 사슬. */
function chainOf(locale: string): string[] {
  const norm = locale.toLowerCase();
  const base = norm.split('-')[0];
  return base === norm ? [norm, 'en'] : [norm, base, 'en'];
}

/** 템플릿의 `{name}` 자리를 치환한다. 값이 없는 자리는 그대로 남긴다(디버깅 단서). */
function interpolate(template: string, params?: Record<string, string | number>): string {
  return params
    ? template.replace(/\{(\w+)\}/g, (_, name) => (params[name] != null ? String(params[name]) : `{${name}}`))
    : template;
}

function lookup(locale: string, key: LocaleMessageKey): string {
  for (const tag of chainOf(locale)) {
    const value = overrides.get(tag)?.[key] ?? builtins.get(tag)?.[key];
    if (value) return value;
  }
  return builtins.get('en')![key];
}

/* ──────────────────────────────────────────────────────────────────────────
   네임스페이스 — Layer 2+ 패키지가 자기 문자열을 담는 자리 (1.23.0~)

   ★**왜 필요했나**: 위의 `register`/`getValue` 는 `LocaleMessageKey`(검증 메시지 9키)
   라는 **닫힌 유니온**을 받는다. 상위 패키지의 화면 문자열은 그 유니온에 없고, 넣으면
   기반 라이브러리에 소비자 도메인 어휘가 쌓인다(확장 정책의 domain-boundary 위반).
   그래서 종전에는 각 패키지가 **자기 레지스트리를 손으로 만들거나**(실측 2곳) 문자열을
   **한국어로 하드코딩**했다(실측 27건). 세 번째 레지스트리가 생기기 직전이었다.

   ⚠**위 세 시그니처를 하나도 건드리지 않는다** — 순수 가산이다. 기존 9키는 종전 저장소에
   그대로 남고, 네임스페이스는 별도 저장소를 쓴다. 조회 사슬(`chainOf`)과 치환
   (`interpolate`)만 공유한다.
   ────────────────────────────────────────────────────────────────────────── */

/** ns → 정규화 로케일 태그 → 테이블. */
const namespaces = new Map<string, Map<string, Record<string, string>>>();

/**
 * 한 패키지(또는 앱 영역)의 문자열 묶음.
 *
 * 키 유니온을 **소비자가** 정하므로 라이브러리의 키셋은 커지지 않는다:
 * ```ts
 * const t = Locale.namespace<'empty' | 'loading'>('u-data-view');
 * t.register('en', { empty: 'No data', loading: 'Loading…' });
 * t.text('empty');
 * ```
 */
export interface LocaleNamespace<K extends string = string> {
  /** 네임스페이스 이름. */
  readonly name: string;
  /**
   * 로케일 하나의 테이블(전체 또는 일부)을 등록한다.
   * 같은 로케일에 반복 호출하면 **병합**된다 — 일부 키만 넘겨도 나머지가 사라지지 않는다.
   */
  register(locale: LocaleTag, table: Partial<Record<K, string>>): void;
  /**
   * 활성 로케일 기준으로 문자열을 찾는다.
   * 사슬(정확 일치 → base → en)에 없으면 **키 자체를 돌려준다** — 조용히 빈 문자열이
   * 되는 것보다 화면에 드러나는 편이 낫다.
   */
  text(key: K, params?: Record<string, string | number>): string;
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
    return interpolate(lookup(active, key), params);
  }

  /**
   * 네임스페이스 핸들을 얻습니다 — 같은 이름이면 **같은 저장소**를 가리킵니다.
   *
   * 상위 패키지가 자기 화면 문자열을 담는 자리입니다. 검증 메시지(`getValue`)의 키셋과
   * 완전히 분리돼 있어, 이 API 를 써도 라이브러리의 `LocaleMessageKey` 는 커지지 않습니다.
   *
   * @param name 네임스페이스 이름. 패키지·컴포넌트 단위를 권장합니다(예: `'u-data-view'`).
   */
  public static namespace<K extends string = string>(name: string): LocaleNamespace<K> {
    return {
      name,
      register(locale: LocaleTag, table: Partial<Record<K, string>>): void {
        const byLocale = namespaces.get(name) ?? new Map<string, Record<string, string>>();
        const norm = locale.toLowerCase();
        byLocale.set(norm, { ...byLocale.get(norm), ...(table as Record<string, string>) });
        namespaces.set(name, byLocale);
      },
      text(key: K, params?: Record<string, string | number>): string {
        const byLocale = namespaces.get(name);
        for (const tag of chainOf(active)) {
          const value = byLocale?.get(tag)?.[key];
          if (value) return interpolate(value, params);
        }
        return key;
      },
    };
  }
}
