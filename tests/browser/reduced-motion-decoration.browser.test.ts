import { describe, it, expect } from 'vitest';
import '../../src/components/skeleton/USkeleton.js';
import '../../src/components/spinner/USpinner.js';

/**
 * `prefers-reduced-motion: reduce` 에서 **무엇이 멈추고 무엇이 멈추지 않는가.**
 *
 * ## 갈림길은 «멈추냐 마냐»가 아니었다
 *
 * 시트의 reduce 규칙은 **지속시간 축을 0 으로 누르는** 방식이라 `animation` 을 직접 쓰는
 * 자리에는 닿지 않는다 — 그리고 그것은 의도다(`animation: none` 강제는 **의미를 나르는**
 * 움직임까지 죽인다). 그래서 자리마다 갈라야 한다:
 *
 * - `USkeleton` 의 `pulse`/`shimmer` → **장식**. 기본값이 이미 `animation: none` 이고
 *   정지한 블록이 «로딩 중»을 그대로 나른다 ⇒ **멈춘다.**
 * - `USpinner` 의 회전 → **신호**. 멈추면 진행 여부를 알 수 없다 ⇒ **유지한다**
 *   (WCAG 2.2.2 는 로딩 표시처럼 움직임이 본질인 것을 예외로 둔다).
 *
 * ## ⚠ 측정의 한계 — 미디어 상태를 강제할 수 없다
 *
 * 브라우저 러너에서 `prefers-reduced-motion` 을 켤 수단이 없어 **계산값으로는 못 잰다.**
 * 대신 **CSSOM 을 판독한다** — 문자열 대조보다 강하다: 셀렉터에 오타가 있거나 규칙이
 * 파싱되지 않으면 브라우저가 **버리므로** 이 단언이 발화한다. 그리고 «유지» 쪽(스피너)도
 * 함께 재서 *과잉 정지*가 들어오면 잡는다 — 이 항목의 갈림길이 그쪽이었기 때문이다.
 */

const reduceRules = (el: Element): CSSRule[] =>
  [...(el.shadowRoot!.adoptedStyleSheets ?? [])]
    .flatMap(s => [...s.cssRules])
    .filter((r): r is CSSMediaRule =>
      r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion'))
    .flatMap(m => [...m.cssRules]);

const mount = async (tag: string, attrs: Record<string, string> = {}) => {
  const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<unknown> };
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
};

describe('prefers-reduced-motion — 장식과 신호를 가른다', () => {
  it('🔴장식은 멈춘다 — pulse·shimmer 가 reduce 블록에서 animation: none 이다', async () => {
    const el = await mount('u-skeleton', { effect: 'pulse' });
    const stopped = reduceRules(el)
      .filter((r): r is CSSStyleRule => r instanceof CSSStyleRule)
      .filter(r => r.style.getPropertyValue('animation-name') === 'none'
        || /animation:\s*none/.test(r.cssText));
    const selectors = stopped.map(r => r.selectorText).join(' | ');
    expect(selectors, 'pulse 가 정지 대상에 없다').toContain('pulse');
    expect(selectors, 'shimmer 가 정지 대상에 없다').toContain('shimmer');
    el.remove();
  });

  it('🔴신호는 유지된다 — u-spinner 에는 reduce 정지 규칙이 없다', async () => {
    // ⚠이쪽이 이 항목의 진짜 갈림길이다. «전부 멈춘다»는 처방이 스피너를 죽이면
    // 사용자는 진행 중인지 알 수 없게 된다.
    const el = await mount('u-spinner');
    expect(reduceRules(el).map(r => r.cssText)).toEqual([]);
    el.remove();
  });

  it('평상시에는 장식이 실제로 돈다 (규칙을 더하면서 기본을 죽이지 않았다)', async () => {
    const el = await mount('u-skeleton', { effect: 'pulse' });
    expect(getComputedStyle(el).animationName).toBe('pulse');
    el.remove();
  });

  it('effect 를 주지 않은 스켈레톤은 종전대로 정적이다', async () => {
    const el = await mount('u-skeleton');
    expect(getComputedStyle(el).animationName).toBe('none');
    el.remove();
  });
});
