import { BrowserStorage, BrowserStorageOptions } from './BrowserStorage.js';

/**
 * 스타일 시트 번들 로드, 내부 자산에서 CSS를 인라인으로 가져옵니다.
 * 빌드 시점에 정적 파일을 포함시키기 위해 Vite의 `import.meta.glob`을 사용합니다.
 */
const styleSheetBundle = Object.entries(import.meta.glob('../assets/styles/*.css', {
  eager: true,
  query: '?inline',
})).map(([path, module]) => {
  const name = path.split('/').pop()?.replace('.css', '') || '';
  return [name, (module as any).default] as [string, string];
}).filter(([name]) => name !== '');

/** iyulab에서 제공하는 스타일 타입입니다. */
export type ThemeType = 'system' | 'light' | 'dark';

/** 테마 초기 설정 옵션 */
export interface ThemeInitOptions {
  /** 
   * 디버그 모드 활성화 여부
   * @default false
   */
  debug?: boolean;

  /** 
   * 테마 설정을 브라우저 스토리지에 영구 저장할지 여부 또는 옵션
   * @default false
   */
  store?: false | BrowserStorageOptions;

  /** 
   * 기본 테마 설정 
   * @default 'system'
   */
  default?: ThemeType;

  /** 
   * 내부적으로 제공되는 스타일 시트를 사용할지 여부
   * @default true
   */
  useBuiltIn?: boolean;
}

/**
 * 현재 문서에 테마를 적용하고 관리하는 유틸리티 전역 인스턴스입니다.
 */
export class Theme {
  private static readonly STORAGE_THEME_KEY = 'theme';
  private static storage: BrowserStorage | null = null;
  private static _isInitialized = false;
  private static _isDebugMode = false;

  /** 개별 인스턴스 생성을 방지합니다. */
  private constructor() {}

  public static get isInitialized() {
    return this._isInitialized;
  }

  public static get isDebugMode() {
    return this._isDebugMode;
  }

  /**
   * 테마 유틸리티를 초기화합니다.
   */
  public static async init(options?: ThemeInitOptions) {
    this._isDebugMode = options?.debug || false;
    this.log('init called', { options }); // 초기화 호출 로깅

    // 1. 스토리지 옵션이 존재하는 경우 스토리지 초기화
    if (options?.store) {
      this.storage = new BrowserStorage(options.store);
      this.log('store option provided, initializing BrowserStorage');
    } else {
      this.storage = null;
      this.log('no store option provided, skipping BrowserStorage initialization');
    }

    // 2. 스타일 시트를 문서 헤드에 추가합니다.
    const useBuiltIn = options?.useBuiltIn ?? true;
    if (useBuiltIn) {
      this.log('Import enabled: loading styles via internal assets');
      for (let [name, module] of styleSheetBundle) {
        // 스타일 시트를 생성합니다.
        const style = document.createElement('style');
        style.setAttribute('data-name', name);
        style.textContent = module;

        // 이미 추가된 스타일 시트는 건너뜁니다.
        if (document.head.querySelector(`style[data-name="${name}"]`)) {
          this.log('style already present, skipping', name);
          continue;
        }
        document.head.appendChild(style);
        this.log('appended style to head', name);
      }
    } else {
      const styleHead = document.head.querySelectorAll('style[data-name]');
      styleHead.forEach(el => el.remove());
      this.log('Import disabled: removed internal styles from head');
    }

    // 3. 저장된 테마가 있으면 적용하고, 없으면 기본값 또는 시스템 테마를 적용합니다.
    let theme: ThemeType = options?.default ?? 'system';
    if (this.storage !== null) {
      const savedTheme = await this.storage.get(this.STORAGE_THEME_KEY) as ThemeType | null;
      if (savedTheme) {
        theme = savedTheme;
        this.log('loaded theme from storage', theme);
      } else {
        this.log('no saved theme in storage, using default', theme);
      }
    }
    this.set(theme);

    // 4. 초기화 완료 플래그 설정
    this._isInitialized = true;
    this.log('theme initialized');
  }

  /**
   * 현재 문서에 적용된 테마를 가져옵니다.
   */
  public static get(): ThemeType | undefined {
    const attr = document.documentElement.getAttribute('data-theme');
    switch (attr) {
      case 'system': return 'system';
      case 'light': return 'light';
      case 'dark': return 'dark';
      default: return undefined;
    }
  }

  /**
   * 현재 문서에 적용할 테마를 설정합니다.
   */
  public static set(theme: ThemeType) {
    try {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      if (theme === 'system') {
        document.documentElement.setAttribute('data-theme', 'system');
        media.addEventListener('change', this.handleSystemThemeChanged);
        this.handleSystemThemeChanged(); // 초기 설정을 위해 호출
        this.log('system theme applied (data-theme=system)');
      } else if (theme === 'dark') {
        media.removeEventListener('change', this.handleSystemThemeChanged);
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.setAttribute('theme', 'dark');
        this.log('dark theme applied (data-theme=dark, theme=dark)');
      } else if (theme === 'light') {
        media.removeEventListener('change', this.handleSystemThemeChanged);
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.setAttribute('theme', 'light');
        this.log('light theme applied (data-theme=light, theme=light)');
      } else {
        throw new Error(`Invalid theme: ${theme}. Use 'light', 'dark', or 'system'.`);
      }
    } catch (e) {
      this.log('Error applying theme:', e);
    }

    // 설정된 테마를 스토리지에 저장합니다.
    if (this.storage !== null) {
      this.storage.set(this.STORAGE_THEME_KEY, theme);
      this.log('saved theme to storage', theme);
    }
  }

  /** 시스템 테마 변경을 처리하는 메서드 */
  private static handleSystemThemeChanged = (_?: MediaQueryListEvent) => {
    if (document.documentElement.getAttribute('data-theme') === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('theme', isDark ? 'dark' : 'light');
      this.log('system theme changed, applied', isDark ? 'dark' : 'light');
    }
  };

  /** 디버그 모드시 로그 출력 함수 (인스턴스 스코프) */
  private static log(...args: any[]) {
    if (this._isDebugMode) console.log('[theme]', ...args);
  }
}