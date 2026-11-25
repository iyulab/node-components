/**
 * `ElementInternals.states` 에 상태를 싣고 읽는 길 — 접두 없는 이름을 거부하는 Chromium(90–124)에서도 던지지 않는다.
 *
 * 컴포넌트는 `:state(open)` · `:state(field)` 같은 공개 표지를 낸다. 125 이전 Chromium 의 `CustomStateSet` 은 `--` 로
 * 시작하지 않는 이름을 `SyntaxError` 로 거부하고(`:state(x)` 도 모르는 선택자라 규칙째 버려진다), 대신 `--x` 와
 * `:--x` 를 받는다. 그래서 상태를 켜고 끌 때는 접두 없는 이름을 먼저 시도하고 거부당하면 `--이름` 으로 다시 한다 —
 * 125+ 경로는 그대로이고, 낡은 엔진에서는 컨트롤이 연결될 때 던지던 예외가 사라진다. 스타일시트는 `:is(:state(x), :--x)`
 * 로 두 형을 한 규칙에 쓴다(`:is()` 는 모르는 선택자를 버리고 나머지로 계속하므로 규칙이 통째로 죽지 않는다).
 *
 * `states` 자체가 없는 엔진(Chromium 90 미만 · Firefox 126 미만 · Safari 17.4 미만)에서는 아무것도 하지 않는다 —
 * 상태는 꾸밈 손잡이일 뿐이라 없어도 컴포넌트의 동작은 같다.
 */
export function setCustomState(internals: ElementInternals | null | undefined, name: string, on: boolean): void {
  const states = internals?.states;
  if (!states) return;
  const op = on ? 'add' : 'delete';
  try {
    states[op](name);
    return;
  } catch (error) {
    // 접두 없는 이름을 거부하는 엔진만 접두 형으로 간다 — 그 밖의 예외는 우리가 가릴 일이 아니다.
    if (!(error instanceof DOMException && error.name === 'SyntaxError')) throw error;
  }
  try {
    states[op](`--${name}`);
  } catch { /* 접두 형도 못 받는 엔진 — 상태 손잡이가 없는 것으로 둔다 */ }
}

/**
 * 요소가 그 상태를 싣고 있는가 — `setCustomState` 가 어느 형으로 실었든 읽는다. 접두 없는 `:state(x)`(125+) ·
 * 접두 형을 담은 집합을 125+ 가 읽는 `:state(--x)` · 125 미만 Chromium 의 `:--x`. 셋을 `:is()` 에 담아 모르는 형을 버린다.
 * `:is()` 조차 모르는 엔진에서는 `matches` 가 `SyntaxError` 를 던지므로 그때는 «아니오» 다.
 */
export function hasCustomState(element: Element, name: string): boolean {
  try {
    return element.matches(`:is(:state(${name}), :state(--${name}), :--${name})`);
  } catch {
    return false;
  }
}
