import { BrowserStorage, BrowserStorageOptions } from './BrowserStorage.js'

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
   * 내부적으로 제공되는 스타일 시트를 사용할지 여부
   * @default true
   */
  useBuiltIn?: boolean;

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
}

/**
 * Theme 클래스 — 싱글톤 패턴으로 사용합니다.
 */
export class Theme {
  private static _instance: Theme;
  
  private readonly STORAGE_KEY_DEFAULT = 'theme';
  private storage: BrowserStorage | null = null;
  private _isInitialized = false;
  private _isDebugMode = false;

  /** private 생성자 — 외부에서 new Theme()를 할 수 없게 함 */
  private constructor() {}

  /** 싱글톤 인스턴스 접근자 */
  public static get instance(): Theme {
    if (!this._instance) {
      this._instance = new Theme();
    }
    return this._instance;
  }

  /** 외부에서 현재 초기화 상태를 확인할 수 있게 getter 제공 */
  public get isInitialized() {
    return this._isInitialized;
  }

  /**
   * 테마 유틸리티 초기화
   */
  public async init(options?: ThemeInitOptions) {
    this._isDebugMode = options?.debug || false;
    this.log('init called', { options }); // 초기화 호출 로깅

    // 1. 스토리지 옵션이 존재하는 경우 스토리지 초기화
    if (options?.store) {
      this.log('store option provided, initializing BrowserStorage');
      this.storage = new BrowserStorage(options.store);
    }

    // 2. 스타일 시트를 문서 헤드에 추가합니다.
    const useBuiltIn = options?.useBuiltIn ?? true;
    if (useBuiltIn) {
      this.log('Import enabled: loading styles via internal assets');
      const assets = Object.entries(import.meta.glob(`../assets/styles/*.css`, {
        eager: true,
        query: '?inline'
      }));
      this.log(`found ${assets.length} style assets`, assets.map(a => a[0]));

      for (let [path, module] of assets) {
        const fileName = (path as string).split('/').pop() || (path as string);

        // 스타일 시트를 생성합니다.
        const style = document.createElement('style');
        style.setAttribute('data-path', fileName);
        style.textContent = (module as { default: string }).default;

        // 이미 추가된 스타일 시트는 건너뜁니다.
        if (document.head.querySelector(`style[data-path="${fileName}"]`)) {
          this.log('style already present, skipping', fileName);
          continue;
        }
        document.head.appendChild(style);
        this.log('appended style to head', fileName);
      }
    }

    // 3. 저장된 테마가 있으면 적용하고, 없으면 기본값 또는 시스템 테마를 적용합니다.
    let theme: ThemeType = options?.default || 'system';
    if (this.storage !== null) {
      const savedTheme = await this.storage.get(this.STORAGE_KEY_DEFAULT) as ThemeType | null;
      if (savedTheme) {
        theme = savedTheme;
        this.log('loaded theme from storage', theme);
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
  public get(): ThemeType | undefined {
    const attr = document.documentElement.getAttribute('data-theme');
    switch (attr) {
      case 'system': return 'system';
      case 'light': return 'light';
      case 'dark': return 'dark';
      default: return undefined;
    }
  }

  /**
   * 현재 문서 테마를 설정합니다.
   */
  public set(theme: ThemeType) {
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
      this.storage.set(this.STORAGE_KEY_DEFAULT, theme);
      this.log('saved theme to storage', theme);
    }
  }

  /**
   * 시스템 테마 변경을 처리하는 메서드
   */
  private handleSystemThemeChanged = (_?: MediaQueryListEvent) => {
    if (document.documentElement.getAttribute('data-theme') === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('theme', isDark ? 'dark' : 'light');
    }
  };

  /**
   * 디버그 모드시 로그 출력 함수 (인스턴스 스코프)
   */
  private log(...args: any[]) {
    if (this._isDebugMode) console.log('[theme]', ...args);
  }
}

/**
 * 테마 유틸리티 싱글톤 인스턴스입니다.
 */
export const theme = Theme.instance;