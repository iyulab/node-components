import { defineConfig } from 'vitest/config';

// 테스트 전용 설정. vite.config.ts의 빌드 플러그인(react-wrapper/glob)을
// 로드하지 않도록 vitest 전용 config를 분리한다 — 테스트 실행이 dist/를
// 건드리는 부작용을 막기 위함.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
