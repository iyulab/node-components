import { BrowserStorage, BrowserStorageOptions } from './BrowserStorage.js';
import { accentCustomProperties, deriveAccentRamp, type AccentRamp } from './accent.js';

/** 프로퍼티 «이름»만 필요할 때 쓰는 더미 — 값은 쓰지 않는다. */
const EMPTY_RAMP: AccentRamp = {
  weakest: '#000', weaker: '#000', weak: '#000', color: '#000', strong: '#000', txt: '#000',
};

/**
 * 스타일 시트 번들 로드, 내부 자산에서 CSS를 인라인으로 가져옵니다.
 * 빌드 시점에 정적 파일을 포함시키기 위해 vite의 `import.meta.glob`을 사용합니다.
 *
 * ⚠ 대상을 `{light,dark}` 로 **명시**한다. `*.css` 로 두면 정적 진입점용 `tokens.css`
 * (light/dark 를 `@import` 하는 한 장)까지 인라인돼, `<style>` 안의 상대 `@import` 가
 * 문서 기준으로 해석되면서 깨진다.
 */
const internalStyleBundle = Object.entries(import.meta.glob('../assets/styles/{light,dark}.css', {
  eager: true,
  query: '?raw',
  import: 'default',
})).map(([path, module]) => {
  const name = path.split('/').pop()?.replace('.css', '') || '';
  return [name, module as string] as [string, string];
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
      for (const [name, module] of internalStyleBundle) {
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
   * 사용자가 **선택한** 테마를 가져옵니다 — `'system'` 을 포함합니다.
   *
   * ⚠**이 값을 밝기 판단에 그대로 쓰지 마십시오.** `'system'` 은 실제로 적용된 색이
   * 아니라 *"OS 를 따른다"* 는 선호이며, 기본값이기도 합니다. 스타일이나 서드파티
   * 에디터 테마를 고를 때는 {@link resolved} 를 쓰십시오.
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
   * 문서에 **실제로 적용된** 테마를 가져옵니다 — 항상 `'light'` 또는 `'dark'` 입니다.
   *
   * `get()` 과 갈리는 지점은 `'system'` 일 때입니다. 선호가 system 이면 실효 테마는
   * OS 설정에 따라 갈리는데, `get()` 은 그것을 알려주지 못합니다. 그래서 소비자가
   * `get() === 'dark'` 로 분기하면 **system + OS 다크에서 밝은 화면을 그리게 됩니다**
   * — 기본 설정이 system 이라 이 경로가 가장 흔합니다.
   *
   * 판정 순서: `<html theme>`(항상 실효값이 적힘) → 명시 선호 → `prefers-color-scheme`.
   */
  public static resolved(): 'light' | 'dark' {
    const applied = document.documentElement.getAttribute('theme');
    if (applied === 'dark' || applied === 'light') return applied;

    const preference = this.get();
    if (preference === 'dark' || preference === 'light') return preference;

    // Theme.init() 이 아직 돌지 않았거나 SSR 후 하이드레이션 전인 경우.
    return typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
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

    // 브랜드 시드가 있으면 **새 바탕에 맞춰 램프를 다시 계산한다** — 라이트와 다크는
    // 같은 시드에서 다른 램프를 갖는다(대비 목표가 바탕 기준이기 때문이다).
    this.applyAccent();

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
      this.applyAccent();
    }
  };

  /** 마지막으로 지정된 브랜드 시드. 테마가 바뀌면 이 값으로 램프를 다시 계산한다. */
  private static accentSeed: string | null = null;

  /**
   * 브랜드 색 하나로 `--u-primary-*` 램프를 만든다.
   *
   * ```ts
   * Theme.accent('#6A1B9A');   // 램프 5단 + 면 위 글자색이 계산된다
   * Theme.accent(null);        // 해제 — 시트 기본값으로 되돌아간다
   * ```
   *
   * 종전에는 소비자가 램프를 **손으로 열 줄 적었고**, 그 값이 대비 계약을 만족하는지는
   * 아무것도 확인하지 않았다. 여기서는 «면 위 글자 4.5 · 바탕 위 글자 4.5 · 단 구분 1.20 ·
   * 그래픽 3.0» 을 만족하는 값을 **계산해서** 넣는다(`utilities/accent.ts`).
   *
   * ⚠**바탕은 계산 시점의 `--u-bg-color` 를 읽는다** — 소비자가 바탕을 덮었으면 그 값을
   * 기준으로 계산되고, 테마가 바뀌면 **다시 계산한다**(라이트/다크가 다른 램프를 갖는다).
   * ⇒ `Theme.set()` · 시스템 테마 변경 뒤에 자동으로 재적용된다.
   *
   * ⚠**변수는 `documentElement` 의 인라인 스타일로 들어간다** — 시트보다 우선하므로
   * 로드 순서에 기대지 않는다.
   */
  public static accent(seed: string | null): void {
    this.accentSeed = seed;
    this.applyAccent();
  }

  /** 현재 시드를 현재 테마의 바탕에 맞춰 다시 계산해 적용한다. */
  private static applyAccent(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const names = Object.keys(accentCustomProperties(EMPTY_RAMP));

    if (!this.accentSeed) {
      for (const n of names) root.style.removeProperty(n);
      return;
    }

    const bg = getComputedStyle(root).getPropertyValue('--u-bg-color').trim() || '#ffffff';
    const ramp = deriveAccentRamp(this.accentSeed, bg);
    for (const [name, value] of Object.entries(accentCustomProperties(ramp)))
      root.style.setProperty(name, value);
    this.log('accent applied', this.accentSeed, '→', ramp);
  }

  /** 디버그 모드시 로그 출력 함수 (인스턴스 스코프) */
  private static log(...args: unknown[]) {
    // 디버그 모드 전용 로거 — 정보성 출력이 이 함수의 본래 목적이다.
    // eslint-disable-next-line no-console
    if (this._isDebugMode) console.log('[theme]', ...args);
  }
}