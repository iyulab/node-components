import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';

/**
 * 차트 범주 팔레트(`--u-chart-color-1..8`) 계약.
 *
 * 여덟 칸은 **한 벌로** 검증됐다(시트 주석 — 밝기 대역·채도·색각 이상 구별·대비). 이 파일은 그 검증을
 * 다시 하지 않는다(시뮬레이션은 외부 검증기의 몫). 대신 **한 칸만 갈아 끼우거나 순서를 흔드는** 편집이
 * 조용히 통과하지 못하게, 색 값만으로 계산되는 네 가지를 단언한다:
 *
 *   ⑴ 두 시트에 여덟 칸이 전부 있고 서로 다르다
 *   ⑵ 상태색(success · warning · danger)과 같은 값이 아니다 — 상태색이 계열을 사칭하지 않는다
 *   ⑶ 이웃 칸의 정상 시각 OKLab ΔE(×100) ≥ 15 — 색을 다 보는 사람도 이웃을 가를 수 있다
 *   ⑷ 다크는 바탕·올림면 모두 대비 ≥ 3:1(다크 칸은 그 기준으로 골랐다). 라이트는 6번(노랑)만
 *      3:1 미만이 허용된 예외다 — 범례·레이블이 함께 있어야 한다는 문서 조건과 한 쌍
 */

const root = resolve(__dirname, '../..');
type Theme = 'light' | 'dark';

function loadTokens(theme: Theme): (name: string) => string {
  const css = readFileSync(join(root, 'src/assets/styles', `${theme}.css`), 'utf-8');
  const raw: Record<string, string> = {};
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) raw[m[1]] = m[2].trim();
  const get = (name: string, depth = 0): string => {
    const v = raw[name];
    if (v === undefined) throw new Error(`${theme}.css 에 없는 토큰: ${name}`);
    const ref = v.match(/^var\((--[\w-]+)\)$/);
    if (!ref || depth > 8) return v.toUpperCase();
    return get(ref[1], depth + 1);
  };
  return get;
}

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const rgb = (hex: string) => [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));

function oklab(hex: string): [number, number, number] {
  const [r, g, b] = rgb(hex);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
const deltaE = (a: string, b: string) => {
  const [x, y] = [oklab(a), oklab(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) * 100;
};
const lum = (hex: string) => { const [r, g, b] = rgb(hex); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];

describe('차트 범주 팔레트', () => {
  for (const theme of ['light', 'dark'] as Theme[]) {
    describe(theme, () => {
      const t = loadTokens(theme);
      const pal = SLOTS.map((n) => t(`--u-chart-color-${n}`));

      it('⑴ 여덟 칸이 전부 hex 로 해석되고 서로 다르다', () => {
        for (const c of pal) expect(c).toMatch(/^#[0-9A-F]{6}$/);
        expect(new Set(pal).size).toBe(8);
      });

      it('⑵ 상태색과 같은 값이 없다', () => {
        const status = ['success', 'warning', 'danger'].map((r) => t(`--u-${r}-color`));
        expect(pal.filter((c) => status.includes(c))).toEqual([]);
      });

      it('⑶ 이웃 칸의 정상 시각 ΔE ≥ 15', () => {
        const weak = pal.slice(1).map((c, i) => [i + 1, i + 2, deltaE(pal[i], c)] as const).filter(([, , d]) => d < 15);
        expect(weak.map(([a, b, d]) => `${a}↔${b} ${d.toFixed(1)}`)).toEqual([]);
      });

      it('⑷ 면 대비 — 다크 전 칸 ≥ 3:1 · 라이트는 6번만 예외', () => {
        const surfaces = [t('--u-bg-color'), t('--u-bg-color-raised')];
        const low = pal.flatMap((c, i) => surfaces.filter((s) => contrast(c, s) < 3).map((s) => `${i + 1}@${s} ${contrast(c, s).toFixed(2)}`));
        const allowed = theme === 'light' ? low.filter((x) => !x.startsWith('6@')) : low;
        expect(allowed).toEqual([]);
      });
    });
  }
});
