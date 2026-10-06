/**
 * 진행 표시(`u-progress-bar`·`u-progress-ring`·`u-spinner`)를 보조기기에 `progressbar` 로 내놓는다.
 *
 * 그리는 막대·고리만 있고 역할이 없으면 보조기기에는 아무것도 없다 — 진행 중이라는 사실도, 몇 % 인지도.
 * 역할과 값은 `ElementInternals` 기본값이라 호스트에 단 `role`·`aria-*` 속성이 이긴다. 값이 정해지지 않은
 * 진행(`indeterminate`·스피너)은 `aria-valuenow` 를 두지 않는다 — WAI-ARIA 의 «진행 중, 양은 모름» 표기.
 */
export function attachProgressbar(host: HTMLElement): ElementInternals | undefined {
  if (!('attachInternals' in host)) return undefined;
  const internals = host.attachInternals();
  internals.role = 'progressbar';
  return internals;
}

export function syncProgressValue(
  internals: ElementInternals | undefined,
  state: { indeterminate: boolean; value: number; min: number; max: number },
): void {
  if (!internals) return;
  internals.ariaValueMin = String(state.min);
  internals.ariaValueMax = String(state.max);
  internals.ariaValueNow = state.indeterminate ? null : String(Math.max(state.min, Math.min(state.max, state.value)));
}
