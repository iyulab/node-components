// 등록 데코레이터 바로 위 JSDoc 에 `@internal` 이 있는가 — 다른 컴포넌트가 내부에서만 쓰는
// 요소(예: 날짜 피커들의 달력 격자)는 공개 표면이 아니므로 공개 문서에 싣지 않는다.
//
// `plugins/vite-plugin-react-wrapper.ts` 의 같은 이름 함수와 같은 규칙이다(그쪽이 TS 라 .mjs 에서
// 직접 못 부른다). tests/build/react-wrapper-events.test.ts 가 둘의 판정을 대조한다.
export function isInternalElement(content) {
  const doc = content.match(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*@customElement\s*\(/);
  return !!doc && /@internal\b/.test(doc[1]);
}
