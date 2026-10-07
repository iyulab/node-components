/**
 * 호스트에서 안쪽 포커스 대상(`<button>`/`<a>`)으로 옮기는 ARIA — 이름과 버튼 계열의 상태다.
 * 상태 속성은 포커스된 요소에 있어야 보조기기가 읽는다(WCAG 4.1.2). `aria-pressed` 는 링크에
 * 허용되지 않아 `<button>` 에만 싣는다. `aria-controls` 는 id 참조라 `forwardControls()` 가 따로 옮긴다.
 */
export const FORWARDED_ARIA = ['aria-label', 'aria-pressed', 'aria-expanded', 'aria-haspopup', 'aria-controls', 'aria-current'] as const;
