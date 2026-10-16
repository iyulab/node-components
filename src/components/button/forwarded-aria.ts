/**
 * 호스트에서 안쪽 포커스 대상(`<button>`/`<a>`)으로 옮기는 ARIA — 이름과 버튼 계열의 상태다.
 * 상태 속성은 포커스된 요소에 있어야 보조기기가 읽는다(WCAG 4.1.2). `aria-pressed` 는 링크에
 * 허용되지 않아 `<button>` 에만 싣는다. `aria-controls` 는 id 참조라 `forwardControls()` 가 따로 옮긴다.
 */
export const FORWARDED_ARIA = ['aria-label', 'aria-pressed', 'aria-expanded', 'aria-haspopup', 'aria-controls', 'aria-current'] as const;

/** 값이 «있다/없다» 로도 쓰이는 상태 속성 — 빈 값은 속성 존재, 곧 `true` 다. */
const PRESENCE_STATES: ReadonlySet<string> = new Set(['aria-pressed', 'aria-expanded', 'aria-haspopup', 'aria-current']);

/**
 * 옮길 값을 호스트에서 읽는다. 상태 속성의 빈 값은 `"true"` 로 읽는다 — React 19 는 커스텀 요소의
 * 불리언 `true` 를 빈 속성으로 쓰고(내장 요소에는 `"true"`), 빈 값은 ARIA 에서 유효하지 않아
 * 안쪽 요소에 그대로 옮기면 보조기기가 «설정 안 됨» 으로 읽는다. 이름(`aria-label`)의 빈 값은 그대로다.
 */
export function readForwardedAria(host: Element, name: (typeof FORWARDED_ARIA)[number]): string | undefined {
  const value = host.getAttribute(name);
  if (value === null) return undefined;
  return value === '' && PRESENCE_STATES.has(name) ? 'true' : value;
}
