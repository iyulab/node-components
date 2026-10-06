/**
 * `chars`(칸이 담을 글자 수)를 CSS 길이로 — 양의 유한수일 때만(그 밖은 지정 없음과 같다). 소수는 올린다.
 *
 * 글자를 받는 폼 컨트롤(`u-input`·`u-select`·`u-date-picker`·`u-date-range-picker`)이 같은 규칙을 쓴다 —
 * 각자 글자 영역 하한(`--*-min-text`)과 표시 글자 요소의 폭에 이 값을 준다. 한 곳에서 정해 형제가 갈리지 않게 한다.
 */
export function charsWidth(n: number | undefined | null): string | undefined {
  return n != null && Number.isFinite(n) && n > 0 ? `${Math.ceil(n)}ch` : undefined;
}
