import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/skeleton/USkeleton.js';

/**
 * `u-skeleton[lines]` — **여러 줄 자리표시자**.
 *
 * 소비앱 초안(`lob-layout-primitives` R6)이 *"목록·카드용 스켈레톤 프리셋"* 을 요구했고,
 * 실측하면 이 모노레포 안에서도 **2파일 12사용처**가 폭만 다른 막대를 손으로 반복하고
 * 있었다(`UElementBlock` 8줄 · `UTableBlock` 4줄).
 *
 * ⚠**기본(단일 막대)의 모양을 바꾸지 않는 것이 이 변경의 계약이다** — `lines` 가 없으면
 * 종전과 완전히 같아야 한다. 그래서 «단일 막대» 케이스를 함께 잰다(회귀 감시).
 */

const mount = async (attrs: Record<string, string>) => {
  const el = document.createElement('u-skeleton') as HTMLElement & { updateComplete: Promise<unknown> };
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('u-skeleton[lines]', () => {
  it('lines=3 이면 막대 3개를 그리고 마지막이 짧다', async () => {
    const el = await mount({ lines: '3', width: '300px' });
    const bars = [...el.shadowRoot!.querySelectorAll<HTMLElement>('.line')];

    expect(bars).toHaveLength(3);
    const widths = bars.map(b => b.getBoundingClientRect().width);
    expect(widths[0]).toBeCloseTo(widths[1], 0);
    expect(widths[2]).toBeLessThan(widths[0]);
  });

  it('🔴lines 가 없으면 종전 그대로 — 호스트 자신이 막대다', async () => {
    const el = await mount({ width: '200px', height: '1em' });

    expect(el.shadowRoot!.querySelectorAll('.line')).toHaveLength(0);
    const bg = getComputedStyle(el).backgroundColor;
    expect(bg).not.toBe('rgba(0, 0, 0, 0)'); // 배경이 살아 있다
    expect(el.getBoundingClientRect().width).toBeCloseTo(200, 0);
  });

  it('lines=1 은 여러 줄로 취급하지 않는다 (경계값)', async () => {
    const el = await mount({ lines: '1' });
    expect(el.shadowRoot!.querySelectorAll('.line')).toHaveLength(0);
  });

  it('여러 줄에서도 reduce 는 장식을 멈춘다 (CSSOM 판독)', async () => {
    const el = await mount({ lines: '3', effect: 'shimmer' });
    const stopped = [...(el.shadowRoot!.adoptedStyleSheets ?? [])]
      .flatMap(s => [...s.cssRules])
      .filter((r): r is CSSMediaRule =>
        r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion'))
      .flatMap(m => [...m.cssRules]) as CSSStyleRule[];

    // ⚠`animation: none` 을 그대로 찾으면 안 된다 — 크로미움은 단축 속성을 펼쳐
    //   `animation: auto ease 0s 1 normal none running none` 으로 직렬화한다(실측).
    //   롱핸드(`animation-name`)로 읽는다.
    expect(
      stopped.some(r => r.selectorText.includes('.line') && r.style.animationName === 'none'),
    ).toBe(true);
  });
});
