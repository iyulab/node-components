import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';

/**
 * **역할 색의 «의미 충돌»** — 뜻이 다른 두 역할이 눈으로 구별되는가.
 *
 * ## 왜 대비 검사로는 잡히지 않는가
 *
 * `token-contrast.test.ts` 는 각 역할색을 **자기 바탕에 대해** 잰다. 그래서
 * *"저장(primary)과 삭제(danger)가 같은 색"* 인 상태도 **양쪽 다 통과한다** — 둘 다
 * 흰 바탕에서 4.5:1 을 넘기기 때문이다. 대비는 *읽히는가*를 묻지 *구별되는가*를 묻지 않는다.
 *
 * ⇒ 그래서 이 파일은 **역할끼리의 거리**를 잰다. CIELAB ΔE(CIE76) 로, 같은 단끼리.
 *
 * ## ⚠ 이 검사의 진짜 실패 모드는 «정당한 설계에 발화하는 것»이다
 *
 * `primary` 와 `info` 는 기본값이 **의도적으로 같다** — 시트가 그렇게 적어 두었다:
 * *"primary 와 기본값은 같으나 역할이 다르다 — 브랜딩은 primary 만 바꾼다."*
 * 소비자가 `--u-primary-color` 를 브랜드 색으로 덮으면 둘이 갈린다. 그것이 설계다.
 * ⇒ **면제는 목록으로 둔다.** 대상(무엇을 검사하는가)은 시트에서 도출하지만, 면제는
 * *"무엇이 위반인가"* 에 대한 판단 = **규칙**이므로 손으로 쓰는 것이 맞다.
 *
 * ## 임계값을 20 으로 둔 근거 (실측)
 *
 * 지금 시트에서 면제쌍을 뺀 **최소 거리는 38.7**(라이트 `-strong` 의 warning/danger)이다.
 * 20 은 그 절반 아래이고, ΔE 20 은 나란히 놓으면 누구에게나 다른 색이다.
 * ⇒ 여유가 크므로 **정상적인 램프 조율에는 발화하지 않고**, 두 역할이 실제로 붙는
 * 사고에만 발화한다. 붙는 사고는 **조용하다** — 아무 테스트도 실패하지 않는다.
 */

const root = resolve(__dirname, '..', '..');
const ROLES = ['primary', 'info', 'success', 'warning', 'danger'] as const;
const STEPS = ['-color', '-color-strong', '-color-weak', '-color-weaker'] as const;
const THEMES = ['light', 'dark'] as const;

/** 뜻이 겹치도록 «설계된» 쌍. 시트 주석이 근거를 갖고 있어야 한다. */
const EXEMPT = new Set(['info|primary']);

const pairKey = (a: string, b: string) => [a, b].sort().join('|');

const MIN_DELTA_E = 20;

function loadTokens(theme: string): (name: string) => string | undefined {
  const css = readFileSync(join(root, 'src/assets/styles', `${theme}.css`), 'utf-8');
  const raw = new Map<string, string>();
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) raw.set(m[1], m[2].trim());
  return (name: string) => {
    let v = raw.get(name);
    for (let i = 0; i < 10 && v?.startsWith('var('); i++) v = raw.get(v.slice(4, -1).trim());
    return v?.startsWith('#') ? v : undefined;
  };
}

/** sRGB hex → CIELAB (D65). ΔE 를 재려면 지각 균등 공간이어야 한다 — RGB 거리는 무의미하다. */
function lab(hex: string): [number, number, number] {
  const n = hex.replace('#', '');
  const srgb = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255);
  const [r, g, b] = srgb.map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const xyz: [number, number, number] = [
    (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047,
    r * 0.2126 + g * 0.7152 + b * 0.0722,
    (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883,
  ];
  const [X, Y, Z] = xyz.map(v => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116));
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}

const deltaE = (a: string, b: string): number => {
  const [A, B] = [lab(a), lab(b)];
  return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
};

describe('역할 색 의미 충돌', () => {
  for (const theme of THEMES) {
    it(`🔴${theme} — 뜻이 다른 역할끼리 ΔE ≥ ${MIN_DELTA_E}`, () => {
      const t = loadTokens(theme);
      const collisions: string[] = [];

      for (const step of STEPS)
        for (let i = 0; i < ROLES.length; i++)
          for (let j = i + 1; j < ROLES.length; j++) {
            if (EXEMPT.has(pairKey(ROLES[i], ROLES[j]))) continue;
            const [a, b] = [t(`--u-${ROLES[i]}${step}`), t(`--u-${ROLES[j]}${step}`)];
            if (!a || !b) continue; // 그 계열에 그 단이 없다 — 대비 층이 단을 건너뛰는 것은 정상이다
            const d = deltaE(a, b);
            if (d < MIN_DELTA_E)
              collisions.push(`${ROLES[i]}/${ROLES[j]}${step}: ΔE ${d.toFixed(1)} (${a} vs ${b})`);
          }

      expect(
        collisions,
        '뜻이 다른 두 역할이 같은 색으로 보인다 — 대비 검사는 이것을 잡지 못한다(둘 다 자기 바탕에서 통과한다)',
      ).toEqual([]);
    });
  }

  it('⚠면제쌍은 시트가 근거를 갖고 있다 (면제가 조용히 늘어나지 않게)', () => {
    // 면제는 «규칙»이라 손으로 쓴다. 대신 그 근거가 시트에 남아 있는지를 여기서 잰다 —
    // 근거 없는 면제가 쌓이면 이 검사는 아무것도 지키지 않게 된다.
    const css = readFileSync(join(root, 'src/assets/styles/light.css'), 'utf-8');
    const undocumented = [...EXEMPT].filter(k => {
      const [a, b] = k.split('|');
      return !(
        new RegExp(`/\\*[^*]*${a}[\\s\\S]{0,200}?${b}[\\s\\S]{0,80}?같`).test(css) ||
        new RegExp(`/\\*[^*]*${b}[\\s\\S]{0,200}?${a}[\\s\\S]{0,80}?같`).test(css)
      );
    });
    expect(undocumented, '면제쌍의 근거가 시트 주석에 없다').toEqual([]);
  });

  it('⚠검사가 공허하지 않다 — 실제로 비교된 쌍이 있다', () => {
    // 토큰 이름이 바뀌면 t() 가 전부 undefined 를 돌려주고 위 단언이 «통과»한다.
    const t = loadTokens('light');
    const resolved = ROLES.filter(r => t(`--u-${r}-color`));
    expect(resolved.length, '역할색이 하나도 해석되지 않았다 — 토큰 이름이 바뀌었나?').toBe(ROLES.length);
  });
});
