import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/tag/UTag.js';

/**
 * `u-tag` 의 `variant × color` 조합은 **장식 축**이다 — `color="purple"` 에는 역할 의미가
 * 없으므로 역할 토큰으로 흡수하면 공개 API 가 깨진다(`role-token-layer.test.ts` 가 감시).
 *
 * 이 테스트는 36조합의 **실제 렌더 색**을 팔레트 단으로 대조한다. 매트릭스를 접는
 * 리팩터가 시각을 바꾸지 않았음을 증명하는 것이 목적이라, 기대값을 하드코딩하지 않고
 * **팔레트 토큰과 비교**한다 — 팔레트가 바뀌면 함께 따라가되 매핑이 바뀌면 잡힌다.
 *
 * ⚠`yellow` 는 2곳에서 한 단 진하다(solid 600, outlined 텍스트 700). 명도가 높아
 * 흰 배경에서 대비가 부족하기 때문이며, 접을 때 반드시 보존해야 하는 예외다.
 */

const COLORS = ['blue', 'green', 'yellow', 'red', 'orange', 'teal', 'cyan', 'purple', 'pink'] as const;

/** [variant][prop] = shade — yellow 예외는 아래 YELLOW 로 덮는다 */
const MATRIX: Record<string, Record<string, number>> = {
  solid: { '--tag-bg-color': 500, '--tag-border-color': 500 },
  surface: { '--tag-color': 800, '--tag-bg-color': 100, '--tag-border-color': 300 },
  filled: { '--tag-color': 800, '--tag-bg-color': 100 },
  outlined: { '--tag-color': 600, '--tag-border-color': 300 },
};
const YELLOW: Record<string, Record<string, number>> = {
  solid: { '--tag-bg-color': 600, '--tag-border-color': 600 },
  outlined: { '--tag-color': 700 },
};

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

async function mount(variant: string, color: string) {
  const el = document.createElement('u-tag') as HTMLElement & { updateComplete: Promise<unknown> };
  el.setAttribute('variant', variant);
  el.setAttribute('color', color);
  el.textContent = 'Tag';
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('u-tag 장식 매트릭스 (variant × color)', () => {
  beforeAll(() => {
    expect(token('--u-blue-500'), '이 테스트는 토큰 시트를 전제한다').not.toBe('');
  });
  afterEach(() => document.body.replaceChildren());

  for (const variant of Object.keys(MATRIX)) {
    it(`variant="${variant}" 의 9색이 전부 자기 팔레트 단을 쓴다`, async () => {
      const wrong: string[] = [];
      for (const color of COLORS) {
        const el = await mount(variant, color);
        const cs = getComputedStyle(el);
        for (const [prop, defaultShade] of Object.entries(MATRIX[variant])) {
          const shade = (color === 'yellow' && YELLOW[variant]?.[prop]) || defaultShade;
          const actual = cs.getPropertyValue(prop).trim();
          const expected = token(`--u-${color}-${shade}`);
          if (actual !== expected) {
            wrong.push(`${variant}/${color} ${prop}: ${actual} ≠ --u-${color}-${shade}(${expected})`);
          }
        }
      }
      expect(wrong).toEqual([]);
    });
  }

  it('color="neutral" 은 매트릭스가 아니라 브랜드 경로(--tag-fill-color)를 탄다', async () => {
    // 네거티브 컨트롤 — 매트릭스를 접을 때 `[color]` 로 뭉뚱그리면 neutral 까지 삼켜
    // 브랜드 오버라이드 경로가 죽는다. `color` 는 reflect 되므로 항상 존재한다.
    const el = await mount('solid', 'neutral');
    expect(getComputedStyle(el).getPropertyValue('--tag-bg-color').trim())
      .toBe(token('--u-primary-color'));

    document.documentElement.style.setProperty('--u-primary-color', 'rgb(255, 0, 128)');
    expect(
      getComputedStyle(el).getPropertyValue('--tag-bg-color').trim(),
      'neutral 태그가 브랜드 색을 따르지 않는다',
    ).toBe('rgb(255, 0, 128)');
    document.documentElement.style.removeProperty('--u-primary-color');
  });

  it('색 지정 태그는 브랜드 오버라이드에 면역이다', async () => {
    const el = await mount('solid', 'green');
    const before = getComputedStyle(el).getPropertyValue('--tag-bg-color').trim();
    expect(before).toBe(token('--u-green-500'));
    document.documentElement.style.setProperty('--u-primary-color', 'rgb(255, 0, 128)');
    expect(getComputedStyle(el).getPropertyValue('--tag-bg-color').trim(), '장식 축이 오염됐다')
      .toBe(before);
    document.documentElement.style.removeProperty('--u-primary-color');
  });
});
