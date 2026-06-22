/**
 * @iyulab/components 의 경량 로케일 레지스트리.
 *
 * 범위: 라이브러리가 스스로 생성하는 chrome 문자열(검증 메시지 등)만 대상.
 * 일반 i18n 프레임워크가 아니다. 앱 콘텐츠 번역은 consumer 의 i18n 계층(예:
 * modern-app 의 i18next)이 담당한다.
 *
 * 영어가 내장 기본값이며, 한국어 등 도메인 로케일은 consumer 가 등록한다:
 *   registerLocale('ko', { required: '필수 항목입니다.', ... });
 *   setDefaultLocale('ko');
 *
 * 모노레포 로케일 표준(packages/u-widgets/src/core/locale.ts)과 동일한 계약을 따른다.
 */

export interface UComponentsLocaleStrings {
  // 검증 메시지 — 폼 컨트롤 (템플릿: {min}, {max}, {step})
  required: string;
  minValue: string;
  maxValue: string;
  stepMismatch: string;
  minCount: string;
  maxCount: string;
}

const EN: UComponentsLocaleStrings = {
  required: 'This field is required',
  minValue: 'Value must be at least {min}',
  maxValue: 'Value must be at most {max}',
  stepMismatch: 'Value must be a multiple of {step}',
  minCount: 'Please select at least {min} items',
  maxCount: 'Please select no more than {max} items',
};

const registry = new Map<string, UComponentsLocaleStrings>();

/**
 * 로케일을 등록한다. 부분 등록은 영어 기본값에 병합된다.
 */
export function registerLocale(
  lang: string,
  strings: Partial<UComponentsLocaleStrings>,
): void {
  registry.set(lang.toLowerCase(), { ...EN, ...strings });
}

/**
 * 주어진 언어 태그에 대한 로케일 문자열을 해석한다.
 *
 * 해석 순서:
 *   1. 정확히 일치 (예: 'ko-KR')
 *   2. 기반 언어 (예: 'ko')
 *   3. 영어 폴백
 */
export function getLocaleStrings(lang?: string): UComponentsLocaleStrings {
  if (!lang) return EN;

  const key = lang.toLowerCase();
  if (registry.has(key)) return registry.get(key)!;

  // 기반 언어 시도: 'ko-KR' → 'ko'
  const base = key.split('-')[0];
  if (base !== key && registry.has(base)) return registry.get(base)!;

  return EN;
}

/**
 * 템플릿 문자열의 {key} 플레이스홀더를 치환한다.
 */
export function formatTemplate(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] != null ? String(params[key]) : `{${key}}`,
  );
}

/**
 * 영어 기본값을 반환한다 (테스트/참조용).
 */
export function getDefaultLocale(): UComponentsLocaleStrings {
  return { ...EN };
}

// ── 전역 기본 로케일 ──

let _defaultLocale: string | undefined;

/**
 * 모든 컴포넌트에 적용되는 전역 기본 로케일을 설정한다.
 *
 * 해석 순서(우선순위 높은 순):
 *   1. 컴포넌트별 `locale` 속성/프로퍼티
 *   2. setDefaultLocale() 값
 *   3. document.documentElement.lang (브라우저)
 *   4. 영어 폴백
 *
 * @example
 * ```ts
 * import { setDefaultLocale } from '@iyulab/components';
 * setDefaultLocale('ko-KR');
 * ```
 */
export function setDefaultLocale(lang: string | undefined): void {
  _defaultLocale = lang;
}

/**
 * setDefaultLocale() 로 설정된 전역 기본 로케일을 반환한다.
 * 설정되지 않았으면 undefined 를 반환한다.
 */
export function getEffectiveLocale(): string | undefined {
  return _defaultLocale;
}

/**
 * 컴포넌트가 사용할 로케일을 해석한다.
 *
 * 우선순위: widgetLocale > setDefaultLocale() > document.lang > undefined
 */
export function resolveLocale(widgetLocale?: string | null): string | undefined {
  if (widgetLocale) return widgetLocale;
  if (_defaultLocale) return _defaultLocale;
  if (typeof document !== 'undefined' && document.documentElement?.lang) {
    return document.documentElement.lang;
  }
  return undefined;
}
