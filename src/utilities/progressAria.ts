import type { HostAria } from './hostAria.js';

/**
 * 진행 표시(`u-progress-bar`·`u-progress-ring`·`u-spinner`)를 보조기기에 `progressbar` 로 내놓는다.
 *
 * 그리는 막대·고리만 있고 역할이 없으면 보조기기에는 아무것도 없다 — 진행 중이라는 사실도, 몇 % 인지도.
 * 역할과 값은 호스트 **속성**이다(`HostAria` — DOM 도구도 보도록) · 소비자가 단 `role`·`aria-*` 가 이긴다.
 * 값이 정해지지 않은 진행(`indeterminate`·스피너)은 `aria-valuenow` 를 두지 않는다 — WAI-ARIA 의 «진행 중, 양은 모름» 표기.
 * 값을 주지 않으면(스피너) 역할만 단다.
 */
export function syncProgressbar(
  aria: HostAria,
  state?: { indeterminate: boolean; value: number; min: number; max: number },
): void {
  aria.set('role', 'progressbar');
  if (!state) return;
  aria.set('aria-valuemin', String(state.min));
  aria.set('aria-valuemax', String(state.max));
  aria.set('aria-valuenow', state.indeterminate ? null : String(Math.max(state.min, Math.min(state.max, state.value))));
}
