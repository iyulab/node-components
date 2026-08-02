import { describe, it, expect, beforeEach } from 'vitest';
// ★이 파일은 **토큰 시트를 import 하지 않는다.** 그것이 이 테스트의 전부다.
import '../../src/components/button/UButton.js';
import '../../src/components/badge/UBadge.js';
import '../../src/components/card/UCard.js';
import '../../src/components/alert/UAlert.js';
import '../../src/components/avatar/UAvatar.js';

/**
 * 규약: **컴포넌트는 토큰 시트 없이도 렌더된다.**
 *
 * 소비자가 `styles/tokens.css` 를 로드하지 않으면 `var(--u-X)` 는 무효가 되고 그 선언이
 * **통째로 버려진다**. 색이 빠지는 게 아니라 규칙이 사라지는 것이라, 텍스트가 안 보이거나
 * 패널이 완전히 투명해진다 — 실제로 그런 사고가 있었다
 * (`overlay-panel-fallback.browser.test.ts` 가 그 회귀 테스트다).
 *
 * ★`token-fallbacks.test.ts` 는 폴백이 **시트와 일치하는지**를 소스 대조로 본다.
 *   이 파일은 폴백이 **실제로 발동하는지**를 렌더로 본다. 둘은 다른 것을 잡는다 —
 *   전자는 스테일을, 후자는 *"폴백을 배선했는데도 여전히 안 보이는"* 경우를 잡는다
 *   (우선순위에 밀리거나, 파생 계산이 무효 값을 타고 통째로 무너지는 경우).
 *
 * ⚠**측정 지점은 컴포넌트마다 다르다.** 색을 `:host` 에 두는 것(배지·아바타·카드 배경),
 *   내부 훅에 두는 것(버튼 `--btn-color`, 알림 `--alert-*`), `part` 요소에 두는 것
 *   (카드 테두리)이 섞여 있다. 구조를 추측하면 *"색이 없다"* 가 아니라 *"내가 엉뚱한
 *   곳을 봤다"* 를 실패로 보고하게 된다 — 이 파일의 첫 판이 정확히 그랬다.
 */
describe('토큰 시트 없이 렌더', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    // 다른 테스트 파일이 시트를 실었을 가능성을 차단한다 — 이 단언이 없으면
    // 시트가 있는 채로 통과해 **아무것도 검증하지 않는 테스트**가 된다.
    const probe = getComputedStyle(document.documentElement).getPropertyValue('--u-primary-color');
    expect(probe.trim(), '이 파일은 토큰 시트가 없는 상태를 전제한다').toBe('');
  });

  const INVISIBLE = new Set(['rgba(0, 0, 0, 0)', 'transparent', '']);

  async function mount(tag: string, attrs: Record<string, string> = {}, text = 'Text') {
    const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<unknown> };
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.textContent = text;
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it('버튼의 브랜드 훅이 시트 값으로 폴백된다', async () => {
    const el = await mount('u-button', {}, 'OK');
    // `--btn-color: var(--u-primary-color, #1565C0)` — 시트가 없으므로 폴백이 발동한다.
    // ⚠과거 이 자리에는 **Tailwind 계열 `#2563eb`** 가 박혀 있었다. 시트를 안 쓴 소비자만
    // 버튼이 다른 파랑으로 보였고, 시트를 쓰는 개발 환경에서는 절대 드러나지 않았다.
    expect(getComputedStyle(el).getPropertyValue('--btn-color').trim()).toBe('#1976D2');
  });

  it('버튼의 파생 톤(color-mix)이 무효로 무너지지 않는다', async () => {
    const el = await mount('u-button', {}, 'OK');
    // `color-mix(in srgb, var(--btn-color) 12%, var(--u-bg-color, #FFFFFF))` —
    // 두 인자 중 하나라도 무효면 **파생 전체가 무효**가 된다. 훅 하나만 폴백을 갖고
    // 배경 토큰이 비면 여기서 무너진다.
    const surface = getComputedStyle(el).getPropertyValue('--btn-color-surface').trim();
    expect(surface).not.toBe('');
    expect(surface).toMatch(/^(rgb|color|#)/);
  });

  it('배지 배경이 투명으로 무너지지 않는다', async () => {
    // 배경은 `:host([color=…])` 에 있다 — color 를 주지 않으면 규칙 자체가 없다.
    // ★이 단언은 Cycle 141 까지 **무엇을 재는지 모호했다**: 당시 `--u-blue-600` 과
    // `--u-primary-color` 가 같은 값이라 어느 쪽을 통과시키는지 구별되지 않았다.
    // 역할 단이 갈라지자 배지의 `color="blue"` 가 **역할 토큰**을 읽고 있었음이 드러났고
    // (다른 8색은 팔레트 직참조), 그것을 장식 축으로 되돌린 뒤의 값이다.
    const el = await mount('u-badge', { color: 'blue' }, '3');
    expect(getComputedStyle(el).backgroundColor).toBe('rgb(33, 150, 243)'); // --u-blue-500
  });

  it('카드의 배경(:host)과 테두리(part=base)가 남는다', async () => {
    const el = await mount('u-card', {}, 'Body');
    expect(INVISIBLE.has(getComputedStyle(el).backgroundColor)).toBe(false);
    const base = el.shadowRoot!.querySelector('[part~="base"]') as HTMLElement;
    expect(base, 'u-card 는 part="base" 를 가진다(리셋 내성 래퍼)').toBeTruthy();
    expect(INVISIBLE.has(getComputedStyle(base).borderTopColor)).toBe(false);
  });

  it('알림의 상태 색이 역할 토큰 폴백을 탄다', async () => {
    const el = await mount('u-alert', { status: 'error' }, 'Error');
    // `--alert-border-color: var(--u-danger-color-weaker, #E57373)`
    const border = getComputedStyle(el).getPropertyValue('--alert-border-color').trim();
    expect(border).toBe('#E57373');
  });

  it('아바타 배경이 남는다', async () => {
    const el = await mount('u-avatar', { label: 'AB' }, '');
    expect(getComputedStyle(el).backgroundColor).toBe('rgb(158, 158, 158)'); // #9E9E9E
  });
});
