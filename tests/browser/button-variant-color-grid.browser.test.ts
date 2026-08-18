import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/button/UButton.js';

/**
 * **variant × color 격자** — 색 축이 *모든* variant 에 닿는가.
 *
 * ## 왜 이 파일이 생겼나
 *
 * `variant="ghost"` 가 `color` 를 **무시하고 있었다**. `solid`·`outlined`·`link` 셋은
 * 따르는데 `ghost` 만 `color: var(--u-txt-color)` 로 고정돼, 어떤 색을 줘도 같은 중립색이
 * 나왔다. 소비자가 12조합(variant 3 × color 4)을 **격자로 나란히 렌더해 대조**하고서야
 * 드러났다 — 9개가 일치하고 3개가 어긋나는 형태였다.
 *
 * ★**축이 한 자리에서만 끊기면 개별 확인으로는 보이지 않는다.** `ghost` 를 혼자 보면
 * *"ghost 는 원래 수수한 것"* 으로 읽히고, `solid` 를 보면 축이 멀쩡하다. 격자로 놓고
 * **행 사이를 비교**해야 구멍이 자리로 나타난다.
 *
 * ⇒ 그래서 이 테스트는 값을 단언하지 않고 **관계**를 단언한다:
 *   ⑴ 모든 variant 에서 `color` 를 바꾸면 **무언가 바뀐다**(축이 닿는다)
 *   ⑵ 색을 주지 않은 기본 렌더는 **건드리지 않는다**(가산 변경)
 *
 * ## 왜 브라우저 프로젝트인가
 * jsdom 은 Lit 의 구성 스타일시트를 계산값에 반영하지 않는다 — `color` 를 물으면 상속된
 * 기본값이 나와 이 격자가 **전부 같아 보인다**(= 항상 통과하는 테스트).
 */

/**
 * ⚠**variant 마다 축이 «나타나는 자리»가 다르다.** 실측(크로미움):
 *
 * ```
 * solid    호스트 background-color   neutral rgb(25,118,210) → danger rgb(211,47,47)
 * outlined 내부 border-color         색 축을 따른다. 글자색은 중립 고정이 «정상»이다
 * ghost    글자 color                ← 이 파일이 생긴 자리
 * link     글자 color                이미 따르고 있었다
 * ```
 *
 * 한 속성으로 전부 재려다 `solid` 의 글자색(항상 흰색)과 `outlined` 의 글자색(항상 중립)을
 * *"축이 안 닿는다"* 로 오판할 뻔했다 — **정당한 설계에 발화하는 쪽**의 실패다.
 */
const VARIANTS = [
  { name: 'solid', where: 'host-bg' },
  { name: 'outlined', where: 'inner-border' },
  { name: 'ghost', where: 'color' },
  { name: 'link', where: 'color' },
] as const;

const COLORS = ['primary', 'warning', 'danger'] as const;

async function mount(attrs: Record<string, string>) {
  const el = document.createElement('u-button') as HTMLElement & { updateComplete: Promise<unknown> };
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.textContent = '버튼';
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** 이 variant 가 실제로 색을 칠하는 자리의 계산값. */
function paintedColor(el: HTMLElement, where: string): string {
  if (where === 'host-bg') return getComputedStyle(el).backgroundColor;
  if (where === 'inner-border')
    return getComputedStyle(el.shadowRoot!.firstElementChild as Element).borderColor;
  return getComputedStyle(el).color;
}

describe('u-button variant × color 격자', () => {
  beforeEach(() => {
    window.scrollTo(0, 0);
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  for (const { name: variant, where } of VARIANTS) {
    it(`★${variant} 이 color 축을 따른다 — 역할별로 서로 다른 색이 나온다 (${where})`, async () => {
      const seen = new Map<string, string>();
      for (const color of COLORS) {
        const el = await mount({ variant, color });
        seen.set(color, paintedColor(el, where));
      }

      // 셋이 전부 같으면 축이 이 variant 에 닿지 않는 것이다 — ghost 가 정확히 그랬다.
      const distinct = new Set(seen.values());
      expect(
        distinct.size,
        `${variant} 이 ${COLORS.join('/')} 에 같은 색을 낸다: ${[...seen].map(([k, v]) => `${k}=${v}`).join(' ')}`,
      ).toBe(COLORS.length);
    });
  }

  it('⚠color 를 주지 않은 렌더는 건드리지 않는다 (가산 변경)', async () => {
    // 색 축을 배선하면서 기본 인상이 바뀌면 그것은 가산이 아니라 시각 변경이다.
    const bare = paintedColor(await mount({ variant: 'ghost' }), 'color');
    const neutral = paintedColor(await mount({ variant: 'ghost', color: 'neutral' }), 'color');
    expect(bare).toBe(neutral);

    // 그리고 그 값은 역할색이 아니라 본문 글자색이어야 한다.
    const probe = document.createElement('div');
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue('--u-txt-color').trim();
    document.body.appendChild(probe);
    expect(bare).toBe(getComputedStyle(probe).color);
  });

  it('ghost 의 색은 «면 단»이 아니라 «바탕 위 글자» 단이다', async () => {
    // 면 단(-color)을 쓰면 흰 바탕에서 대비가 얕아진다. 역할 층이 그래서 단을 갈라 뒀다.
    const el = await mount({ variant: 'ghost', color: 'danger' });
    const probe = document.createElement('div');
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue('--u-danger-color-strong').trim();
    document.body.appendChild(probe);
    expect(paintedColor(el, 'color')).toBe(getComputedStyle(probe).color);
  });
});
