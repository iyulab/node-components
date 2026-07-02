import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

// 테스트 전용 설정. vite.config.ts의 빌드 플러그인(react-wrapper/glob)을
// 로드하지 않도록 vitest 전용 config를 분리한다 — 테스트 실행이 dist/를
// 건드리는 부작용을 막기 위함.
//
// 두 프로젝트로 분리:
// - unit: 순수 로직(Node 환경) — 기존 tests/**/*.test.ts
// - browser: 실제 커스텀 엘리먼트 레이아웃/CSS 검증이 필요한 테스트
//   (jsdom은 overflow clipping, floating-ui의 실제 position 계산을 재현하지 못함)
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/**/*.test.ts'],
          exclude: ['tests/browser/**'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'browser',
          include: ['tests/browser/**/*.test.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
