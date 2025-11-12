import { BrowserStorage, BrowserStorageOptions } from './storage.js';

/** iyulab에서 제공하는 스타일 타입입니다. */
export type ThemeType = 'light' | 'dark' | 'system';

/** 테마 초기 설정 옵션 */
export interface ThemeInitOptions {
  /** 
   * 디버그 모드 활성화 여부
   * @default false 
   */
  debug?: boolean;

  /** 
   * 기본 테마 설정 
   * @default 'system'
   */
  default?: ThemeType;

  /** 
   * 테마 설정 유지 옵션
   * @default false 
   */
  persist?: false | BrowserStorageOptions;

  /** 
   * 내부적으로 제공되는 스타일 시트를 자동으로 불러올지 여부
   * @default true
   */
  useBuiltIn?: boolean;
}

/* 모듈 스코프 상태 */
const STORAGE_KEY_DEFAULT = 'theme';
let browserStorage: BrowserStorage | null = null;
let isInitialized = false;
let isDebugMode = false;

/**
 * iyulab에서 제공하는 스타일 시트 및 테마 유틸리티입니다.
 */
export const theme = {
  get isInitialized() {
    return isInitialized;
  },

  /**
   * 테마 유틸리티를 초기화합니다.
   */
  init(options?: ThemeInitOptions) {
    isDebugMode = options?.debug || false;
    log('init called', { options }); // 초기화 호출 로깅

    if (options?.useBuiltIn !== false) {
      log('dynamicImport enabled: loading styles via import.meta.glob');
      const assets = Object.entries(import.meta.glob(`../assets/styles/*.css`, { 
        eager: true,
        query: "?inline"
      }));
      log(`found ${assets.length} style assets`, assets.map(a => a[0]));

      for (let [path, module] of assets) {
        path = path.split('/').pop() || path;

        // 스타일 시트를 생성합니다.
        const style = document.createElement('style');
        style.setAttribute('data-path', path);
        style.textContent = (module as { default: string }).default;
        
        // 이미 추가된 스타일 시트는 건너뜁니다.
        if (document.head.querySelector(`style[data-path="${path}"]`)) {
          log('style already present, skipping', path);
          return;
        }
        document.head.appendChild(style);
        log('appended style to head', path);
      }
    }

    if (options?.persist !== undefined && options?.persist !== false) {
      log('persist option provided, initializing BrowserStorage', options.persist);
      browserStorage = new BrowserStorage(options.persist);
      const savedTheme = browserStorage.get(STORAGE_KEY_DEFAULT) as ThemeType | undefined;
      log('retrieved savedTheme from storage', savedTheme);
      if (savedTheme) {
        theme.set(savedTheme);
      }
    } else if (options?.default) {
      log(`Applying default theme: ${options.default}`);
      theme.set(options.default);
    } else {
      log('No persist option or default theme provided, applying system theme by default');
      theme.set('system');
    }

    isInitialized = true;
    log('theme initialized', { isInitialized });
  },

  /**
   * 현재 문서 테마를 가져옵니다.
   * @returns 현재 테마, 'light', 'dark' 또는 'system' 중 하나입니다.
   */
  get(): ThemeType | undefined {
    const attr = document.documentElement.getAttribute('data-theme');
    log('get() called, data-theme attribute =', attr);
    switch (attr) {
      case 'system': return 'system';
      case 'light': return 'light';
      case 'dark': return 'dark';
      default: return undefined;
    }
  },

  /**
   * 문서 테마를 'light', 'dark' 또는 'system'으로 설정합니다.
   * @param theme - 설정할 테마, 'light', 'dark' 또는 'system' 중 하나입니다.
   * @throws 테마가 'light', 'dark' 또는 'system'이 아닌 경우 오류가 발생합니다.
   */
  set(theme: ThemeType) {
    log('set() called with', theme);
    if (typeof window === 'undefined') {
      log('set() aborted: not in browser environment');
      throw new Error('setTheme can only be called in a browser environment.');
    }

    if (theme === 'system') {
      log('setting theme to system; attaching matchMedia listener');
      document.documentElement.setAttribute('data-theme', 'system');
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChanged);
      handleSystemThemeChanged(); // 초기 설정을 위해 호출
      log('system theme applied (data-theme=system)');
    } else if (theme === 'dark') {
      log('setting theme to dark; removing matchMedia listener if present');
      try {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChanged);
      } catch (e) {
        // 일부 브라우저/레거시 환경에서 removeEventListener 실패 가능성 대비 (선택적)
        log('removeEventListener may have failed or not supported', e);
      }
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.setAttribute('theme', 'dark');
      log('dark theme applied (data-theme=dark, theme=dark)');
    } else if (theme === 'light') {
      log('setting theme to light; removing matchMedia listener if present');
      try {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChanged);
      } catch (e) {
        log('removeEventListener may have failed or not supported', e);
      }
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.setAttribute('theme', 'light');
      log('light theme applied (data-theme=light, theme=light)');
    } else {
      log('set() received invalid theme', theme);
      throw new Error(`Invalid theme: ${theme}. Use 'light', 'dark', or 'system'.`);
    }

    if (browserStorage) {
      browserStorage.set(STORAGE_KEY_DEFAULT, theme);
      log('persisted theme to storage', theme);
    }
  },

  /**
   * 문서 테마를 토글합니다.
   * 현재 테마가 'light'이면 'dark'로, 'dark'이면 'light'로 변경합니다.
   * system 테마가 설정된 경우, 토글이 불가능하며 경고를 출력합니다.
   * @return 변경된 테마입니다. system 테마인 경우 변경되지 않습니다.
   */
  toggle(): ThemeType {
    const current = theme.get();
    log('toggle() called, current theme =', current);
    
    if (current === 'system') {
      // eslint-disable-next-line no-console
      console.warn('Cannot toggle theme when system theme is active. Please set a specific theme (light or dark) first.');
      log('toggle aborted: current theme is system');
      return current;
    }
    
    const changed = current === 'light' ? 'dark' : 'light';
    theme.set(changed);
    log('toggle completed, new theme =', changed);
    return changed;
  }
}

/** 'system' 테마가 변경되면 문서의 테마를 자동으로 업데이트합니다. */
const handleSystemThemeChanged = () => {
  if (document.documentElement.getAttribute('data-theme') === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('theme', isDark ? 'dark' : 'light');
  }
};

/** 디버그 로그 출력 함수 */
const log = (...args: any[]) => { 
  if (isDebugMode) console.log('[theme]', ...args); 
};