/**
 * 개발 모드 «사용 안내» 경고 — 오류 경로가 아닌, ***조용히 틀리는*** 상태를 한 번 알린다.
 *
 * 이 패키지에는 같은 모양의 경고가 이미 있다(`UElement.warnIfTokensMissing` — 토큰 시트 부재).
 * 공통 규약: `[<패키지>]` 네임스페이스 · 개발 모드에서만(`process.env.NODE_ENV !== 'production'`) ·
 * 같은 키로는 **한 번만** · 무엇이 틀렸는지가 아니라 **무엇을 하면 되는지**를 적는다.
 *
 * ⚠**`import.meta.env.DEV` 를 쓰지 않는다** — Vite 는 이 라이브러리 **자신의** `vite build`
 * 시점에 그 값을 정적으로 `false` 로 치환하고, Rollup 의 dead-code elimination 이 이후
 * 분기를 통째로 지운다. 소비자가 dev 서버로 띄워도 이미 게시본에서 죽은 코드라 살아나지
 * 않는다(2026-09-13 실측 — 1.40.1·1.40.2 게시본에서 이 경고가 전부 no-op 이었다).
 * `process.env.NODE_ENV` 는 이 라이브러리의 빌드가 손대지 않고 그대로 dist 에 남아,
 * **소비자 자신의** 번들러가 소비자의 빌드 시점에 치환한다(React 등 생태계 라이브러리와
 * 동일한 관례) — `tests/build/dev-warning-dist.test.ts` 가 게시본에 대해 이 계약을 지킨다.
 *
 * 이 파일이 생긴 계기: 소비앱의 메뉴 30개가 해석되지 않는 아이콘 이름으로 **한꺼번에 같은
 * 큐브 폴백**을 그렸는데 신호가 0 이었다(소비자 실측). 폴백은 의도된 것이라(접힌 사이드바에서
 * 아이콘이 없으면 메뉴가 «높이만 있는 빈 줄» 이 된다) 제거가 답이 아니다 — **없는 것은 경고다.**
 * 같은 부류가 셋 더 있었다: 높이 제약이 없어 18px 로 붕괴하는 `u-split-panel`, 가상화가 꺼지는
 * `flex-table`, 133px 로 앉는 `modern-app` 셸 — 모두 «에러 없이 틀린 화면» 이다.
 *
 * 형제 패키지도 같은 규약을 쓴다 — `createDevWarner('@iyulab/flex-table')` 로 자기 네임스페이스의
 * 경고 함수를 만든다. 키는 네임스페이스 안에서만 겹치므로 두 패키지가 같은 키를 써도 서로를 막지 않는다.
 */

const warned = new Set<string>();

/**
 * `scope` 네임스페이스(`[@iyulab/flex-table]` 처럼 찍힌다)의 개발 모드 1회성 경고 함수를 만든다.
 * 프로덕션 빌드에서는 호출 자체가 no-op 이다.
 */
export function createDevWarner(scope: string): (key: string, message: string) => void {
  return (key, message) => {
    if (process.env.NODE_ENV === 'production') return;
    const scoped = `${scope} ${key}`;
    if (warned.has(scoped)) return;
    warned.add(scoped);
    // diagnostic: 이 도우미는 받은 scope(호출하는 패키지 이름)로 접두를 붙인다.
    console.warn(`[${scope}] ${message}`);
  };
}

/** `key` 당 한 번만, 개발 모드에서만 `[@iyulab/components]` 로 `console.warn` 한다. */
export const devWarnOnce = createDevWarner('@iyulab/components');

/** 테스트용 — 모든 네임스페이스의 가드를 비운다. */
export function resetDevWarnings(): void {
  warned.clear();
}
