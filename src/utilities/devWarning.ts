/**
 * 개발 모드 «사용 안내» 경고 — 오류 경로가 아닌, ***조용히 틀리는*** 상태를 한 번 알린다.
 *
 * 이 패키지에는 같은 모양의 경고가 이미 있다(`UElement.warnIfTokensMissing` — 토큰 시트 부재).
 * 공통 규약: `[@iyulab/components]` 네임스페이스 · 개발 모드에서만(`import.meta.env.DEV`) ·
 * 같은 키로는 **한 번만** · 무엇이 틀렸는지가 아니라 **무엇을 하면 되는지**를 적는다.
 *
 * 이 파일이 생긴 계기: 소비앱의 메뉴 30개가 해석되지 않는 아이콘 이름으로 **한꺼번에 같은
 * 큐브 폴백**을 그렸는데 신호가 0 이었다(docket #265 R3). 폴백은 의도된 것이라(접힌 사이드바에서
 * 아이콘이 없으면 메뉴가 «높이만 있는 빈 줄» 이 된다) 제거가 답이 아니다 — **없는 것은 경고다.**
 * 같은 부류가 셋 더 있었다: 높이 제약이 없어 18px 로 붕괴하는 `u-split-panel`, 가상화가 꺼지는
 * `flex-table`, 133px 로 앉는 `modern-app` 셸 — 모두 «에러 없이 틀린 화면» 이다(HD-61 ⒝).
 */

const warned = new Set<string>();

/** `key` 당 한 번만, 개발 모드에서만 `console.warn` 한다. 프로덕션 빌드에서는 호출 자체가 no-op 이다. */
export function devWarnOnce(key: string, message: string): void {
  if (!import.meta.env?.DEV) return;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[@iyulab/components] ${message}`);
}

/** 테스트용 — 가드를 비운다. */
export function resetDevWarnings(): void {
  warned.clear();
}
