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
            // ⚠고정 포트가 필요하다 — vitest 의 기본 포트 자동선택이 이 머신의
            // Windows 동적 포트 제외 범위(`netsh interface ipv4 show
            // excludedportrange protocol=tcp`, Hyper-V/WSL NAT 예약)와 충돌해
            // `EACCES: listen 127.0.0.1:63315`(그리고 IPv6 `::1` 도 동일)로
            // 실패하던 것을 실측으로 확인했다 — 이 리포가 오래 "선존 미해결
            // 환경 제약"으로 이월해 온 그 결함이다. 이 포트는 이 머신의 현재
            // 제외 범위 밖으로 확인됐으나, Windows 가 범위를 재할당하면(재부팅
            // 등) 다시 막힐 수 있다 — 그때는 위 명령으로 새 빈 포트를 고른다.
            api: { host: '127.0.0.1', port: 41501 },
          },
          // 파일마다 새 컨텍스트를 강제한다(기본값이지만 명시한다).
          // ⚠`browser` 하위가 아니라 **여기**다 — `test.isolate` 가 정식 위치이고,
          //   `browser.isolate` 로 두면 조용히 무시된다(실측 확인).
          // 두 종류의 파일 간 오염이 실재한다:
          //  - light.css 를 임포트하는 파일이 토큰 부재를 전제하는 파일과 섞이면 안 된다
          //  - UElement 의 토큰 경고는 모듈 수준 1회 플래그라, 앞선 파일이 소비하면 사라진다
          isolate: true,
        },
      },
    ],
  },
});
