// @ts-check
import eventsPlugin from './cem-events-plugin.js';

/**
 * Custom Elements Manifest 분석기 설정의 공통 몸 — 컴포넌트 패키지마다 `custom-elements-manifest.config.mjs` 에서
 * `export default cemConfig()` 로 쓴다. 소스 전체를 읽고(대상을 열거하지 않는다 — 분석기가 `@customElement` 를 찾는다) 시험 ·
 * 스타일 · 선언 파일만 뺀다. `package.json` 의 `customElements` 필드는 분석기에 쓰게 하지 않고 패키지가 직접 적는다.
 *
 * 다른 패키지의 기반 클래스(`UElement` …)를 물려받은 요소는 매니페스트의 `superclass` 가 그 패키지와 모듈을 가리킨다 —
 * 도구는 그 패키지의 매니페스트를 따라간다(CEM 의 방식). 분석기의 `dependencies` 옵션은 켜지 않는다: 켜도 상위 멤버를 펼쳐 주지
 * 않았고(실측), 소비 의존성을 훑느라 경고만 늘었다.
 */
export function cemConfig() {
  return {
    globs: ['src/**/*.ts'],
    exclude: ['**/*.test.ts', '**/*.styles.ts', '**/*.d.ts'],
    outdir: 'dist',
    litelement: true,
    packagejson: false,
    plugins: [eventsPlugin()],
  };
}
