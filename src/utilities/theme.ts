/**
 * chat-components에서 제공하는 스타일입니다.
 */
export type UTheme = 'light' | 'dark' | 'system';

/**
 * 스타일 시트를 동적으로 문서에 추가합니다.
 * 이 함수는 '../assets/styles/' 디렉토리 내의 CSS 파일을 찾아서 문서의 <head>에 추가합니다.
 */
export function importTheme(theme: UTheme | "all" = "all") {
  Object.entries(import.meta.glob(`../assets/styles/*.css`, { 
    eager: true,
    query: "?inline" 
  })).map(([path, module]) => {
    path = path.split('/').pop() || path;
    
    // 현재 테마와 일치하지 않는 스타일 시트는 건너뜁니다.
    if (theme === "light" || theme === "dark") {
      if (!path.includes(theme)) return;
    }

    // 스타일 시트를 생성합니다.
    const style = document.createElement('style');
    style.setAttribute('data-path', path);
    style.textContent = (module as { default: string }).default;
    
    // 이미 추가된 스타일 시트는 건너뜁니다.
    if (document.head.querySelector(`style[data-path="${path}"]`)) {
      return; 
    }
    document.head.appendChild(style);
  });
}

/**
 * 현재 문서 테마를 가져옵니다.
 * @returns 현재 테마, 'light', 'dark' 또는 'system' 중 하나입니다.
 */
export function getTheme(): UTheme {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark') return 'dark';
  if (attr === 'system') return 'system';
  return 'light';
}

/**
 * 문서 테마를 'light', 'dark' 또는 'system'으로 설정합니다.
 * @param theme - 설정할 테마, 'light', 'dark' 또는 'system' 중 하나입니다.
 * @throws 테마가 'light', 'dark' 또는 'system'이 아닌 경우 오류가 발생합니다.
 */
export function setTheme(theme: UTheme) {
  if (typeof window === 'undefined') {
    throw new Error('setTheme can only be called in a browser environment.');
  }

  if (theme === 'system') {
    document.documentElement.setAttribute('data-theme', 'system');
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handleSystemThemeChanged);
    handleSystemThemeChanged(); // 초기 설정을 위해 호출
  } else if (theme === 'dark') {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChanged);
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('theme', 'dark');
  } else if (theme === 'light') {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handleSystemThemeChanged);
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('theme', 'light');
  } else {
    throw new Error(`Invalid theme: ${theme}. Use 'light', 'dark', or 'system'.`);
  }
}

/**
 * 문서 테마를 토글합니다.
 * 현재 테마가 'light'이면 'dark'로, 'dark'이면 'light'로 변경합니다.
 * system 테마가 설정된 경우, 토글이 불가능하며 경고를 출력합니다.
 * @return 변경된 테마입니다. system 테마인 경우 변경되지 않습니다.
 */
export function toggleTheme(): UTheme {
  const current = getTheme();
  
  if (current === 'system') {
    // eslint-disable-next-line no-console
    console.warn('Cannot toggle theme when system theme is active. Please set a specific theme (light or dark) first.');
    return current;
  }
  
  const changed = current === 'light' ? 'dark' : 'light';
  setTheme(changed);
  return changed;
}

/**
 * 시스템 테마 변경 시 호출되는 핸들러입니다.
 * 시스템 테마가 변경되면 문서의 테마를 자동으로 업데이트합니다.
 */
const handleSystemThemeChanged = () => {
  if (document.documentElement.getAttribute('data-theme') === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('theme', isDark ? 'dark' : 'light');
  }
};