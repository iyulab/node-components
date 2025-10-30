/**
 * chat-components에서 제공하는 스타일입니다.
 */
export type Theme = 'light' | 'dark';

/**
 * 현재 문서 테마를 가져옵니다.
 * @returns 현재 테마, 'light' 또는 'dark' 중 하나입니다.
 */
export function getTheme(): Theme {
  const attr = document.documentElement.getAttribute('theme');
  return attr === 'dark' ? 'dark' : 'light';
}

/**
 * 문서 테마를 'light' 또는 'dark'로 설정합니다.
 * @param theme - 설정할 테마, 'light' 또는 'dark' 중 하나입니다.
 * @throws 테마가 'light' 또는 'dark'가 아닌 경우 오류가 발생합니다.
 */
export function setTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('theme', 'dark');
  } else if (theme === 'light') {
    document.documentElement.removeAttribute('theme');
  } else {
    throw new Error(`Invalid theme: ${theme}. Use 'light' or 'dark'.`);
  }
}