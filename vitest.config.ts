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
            // ⚠`headless: true` 명시가 필요하다 — 지정하지 않으면(로컬 실행 시 UI 기본
            // 켜짐, `browser.ui` 기본값 `!process.env.CI`) 헤드 있는(visible) Chromium
            // 창이 뜨고, 그 창은 Windows 의 디스플레이 배율(이 머신 150%)에 실제로
            // 종속된다 — `window.devicePixelRatio` 는 `1`을 자체 보고해도 OS 창
            // 합성(compositing) 단계에서 얇은 테두리가 물리 픽셀에 스냅되어
            // `getComputedStyle().borderTopWidth`가 스타일시트의 `1px` 대신
            // `0.666667px`(=1/1.5)로 읽힌다(실측, cycle-354 — `headless: true`로
            // 고정하자 같은 머신에서 정확히 `1px`이 나옴을 확인). CSS px 는 정의상
            // 렌더링 배율과 무관해야 하므로 이건 소스 결함이 아니라 헤드 있는 브라우저
            // 인스턴스가 호스트 배율의 영향을 받는 테스트 환경 결함이다 — CI 등
            // 애초에 헤드리스로 도는 환경에서는 안 보인다.
            instances: [{ browser: 'chromium', headless: true }],
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
