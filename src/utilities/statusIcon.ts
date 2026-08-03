/**
 * 역할 축(의미)의 상태 → 내장 아이콘 이름.
 *
 * ## 왜 있나
 *
 * `u-tag`·`u-badge` 의 상태는 **색으로만** 전달돼 왔다. 색각 이상(남성 약 8%)이나 흑백
 * 인쇄에서는 *"성공"* 과 *"실패"* 가 같은 회색 알약이 된다. 대비 계약(1.20.0)은
 * *읽히는가* 를 지키지 *구별되는가* 를 지키지 않는다 — 역할 색 충돌 검사(ΔE)가
 * **색 공간에서** 세운 그 구분을, 이 표는 **모양 공간에서** 세운다.
 *
 * ## 매핑하지 않는 것
 *
 * - **장식 축**(`blue`·`purple` …)은 *색 자체*를 뜻하지 의미를 뜻하지 않는다.
 * - **`neutral`·`primary`** 는 상태가 아니다(`primary` 는 브랜드 강조이지 «좋음»이 아니다).
 *
 * ⇒ 그 자리에 `icon` 을 줘도 **아무것도 그리지 않는다.** 없는 의미를 아이콘으로 지어내면
 *   그 아이콘이 잘못된 정보를 나른다.
 *
 * ⚠**`u-alert` 의 `status` 축(`error`·`notice` …)은 다른 어휘다** — 이름이 겹치지 않으므로
 * 한 표로 합치지 않았다. 합치려면 두 축의 이름을 먼저 통일해야 하고, 그것은 파괴적 변경이다.
 */
export const STATUS_ICON = {
  info: 'info-circle-fill',
  success: 'circle-check-fill',
  warning: 'alert-triangle-fill',
  danger: 'alert-circle-fill',
} as const;

/** 의미를 갖는 역할 값. */
export type StatusRole = keyof typeof STATUS_ICON;

/** 역할 값이면 아이콘 이름을, 아니면 `undefined` 를 돌려준다. */
export function statusIcon(color?: string): string | undefined {
  return color && color in STATUS_ICON ? STATUS_ICON[color as StatusRole] : undefined;
}
