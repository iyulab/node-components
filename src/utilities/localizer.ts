import i18next from 'i18next';
import BrowserDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initLitI18n, translate } from 'lit-i18n';
import { initReactI18next, useTranslation } from 'react-i18next';

export const languages = ['en', 'ko'] as const;
export type Languages = typeof languages[number];

export type Resources = {
  [lang in Languages]: { 
    [namespace: string]: Record<string, any>; 
  };
}

/**
 * ULocalizer의 설정 옵션입니다.
 */
export interface LocalizerConfig {
  /**
   * 파일 시스템을 이용한 리소스의 기본 경로입니다.
   * - 파일경로는 /${basepath}/${lng}/${ns}.json 형식으로 구성됩니다.
   * - ex) /locales/en/translation.json
   * @default 'locales'
   */
  basepath?: string;
  
  /**
   * 디버그 모드를 활성화 또는 비활성화합니다.
   * @default false
   */
  debug?: boolean;
  
  /**
   * 로컬라이제이션 키의 기본 네임스페이스입니다.
   * @default 'translation'
   */
  defaultNS?: string;

  /**
   * 추가로 사용할 네임스페이스입니다.
   */
  namespace?: string[];
  
  /**
   * 파일시스템을 사용하지 않고, 로컬라이제이션을 구성 하기위한 추가 리소스입니다.
   * - 파일 시스템을 이용한 리소스는 basepath를 통해 설정됩니다.
   * - 기본 리소스는 ko, en이 포함됩니다.
   */
  resources?: Resources;
}

export const localizer = {

  /** 언어 설정 및 리소스를 주입합니다. */
  async init(config?: LocalizerConfig) {
    const debug = config?.debug || false;
    const basepath = config?.basepath?.replace(/^\/|\/$/g, '') || 'locales';
    const defaultNS = config?.defaultNS || 'translation';
    const namespace = config?.namespace || [];
    const resources = config?.resources;

    // i18next 초기화 - Updated for i18next v24
    await i18next
      .use(HttpBackend)
      .use(BrowserDetector)
      .use(initLitI18n)
      .use(initReactI18next)
      .init({
        debug: debug,
        load: 'languageOnly',
        backend: {
          loadPath: `/${basepath}/{{lng}}/{{ns}}.json`,
        },
        detection: { 
          order: ['navigator'],
          caches: [] // Updated for newer version
        },
        supportedLngs: languages,
        fallbackLng: 'en',
        defaultNS: defaultNS,
        ns: [ defaultNS, ...namespace ],
        nsSeparator: '::',
        interpolation: {
          escapeValue: false,
        }
      });

    // 추가 리소스가 있을 경우 추가
    if (resources) {
      localizer.addResources(resources);
    }
  },

  /** 현재 설정된 언어를 반환합니다. */
  get(): Languages {
    const i18lang = i18next.language;
    return (
      i18lang.includes('ko') 
      ? 'ko' 
      : 'en'
    );
  },

  /** 언어를 설정합니다. */
  async set(locale: Languages) {
    await i18next.changeLanguage(locale);
    window.dispatchEvent(new CustomEvent('locale-change', { detail: locale }));
  },

  /** 리소스를 직접 추가합니다. */
  addResources(resources: Resources) {
    for (const lang of languages) {
      for (const ns in resources[lang]) {
        i18next.addResourceBundle(lang, ns, resources[lang][ns], true, true);
      }
    }
  },
};

/**
 * Lit Element에 사용할 수 있는 번역 함수입니다.
 * @param key 번역할 키
 * @example
 * ```ts
 * import { t } from './ULocalizer';
 * 
 * html`<div>${t('hello')}</div>`
 * html`<div>${t('namespace::bye')}</div>`
 * ```
 */
// 수정: 타입 오류 해결을 위해 translate 함수를 사용하는 방식 변경
export function t(key: string | string[], options?: any): string {
  // 타입 어설션(as any)을 사용하여 타입 오류 방지
  return translate(key, options) as any;
}

/**
 * React에서 사용할 수 있는 번역 함수입니다.
 * @example
 * ```ts
 * import { useT } from './ULocalizer';
 * 
 * const { t } = useT();
 * return <div>{t('hello')}</div>
 * return <div>{t('namespace::bye')}</div>
 * ```
 */
export function useT() {
  return useTranslation();
}