// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'fs';
import { resolve, join } from 'path';

const root = resolve(__dirname, '..', '..');
const sheet = (t: 'light' | 'dark') =>
  readFileSync(join(root, 'src/assets/styles', `${t}.css`), 'utf-8');

const decl = (css: string, name: string) => {
  const m = css.match(new RegExp(`^\\s*${name}\\s*:\\s*([^;]+);`, 'm'));
  return m ? m[1].trim() : null;
};
const alphaOf = (v: string) => {
  const m = v.match(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([\d.]+)\s*\)/);
  return m ? Number(m[1]) : null;
};

const STEPS = ['sm', 'md', 'lg', 'xl'] as const;
/** 높이 단 ↔ 색 축 단의 대응. 시트 주석이 선언한 짝이다. */
const PAIRED = {
  sm: 'weak',
  md: 'normal',
  lg: 'strong',
  xl: 'stronger',
} as const;

/**
 * **높이(elevation) 축**의 계약.
 *
 * 색 축(`--u-shadow-color-*`)은 있었지만 높이 축이 없어서 컴포넌트가 그림자를 리터럴로
 * 썼고, 같은 리듬을 의도한 자리에 **서로 다른 값 11가지**가 생겼다. 더 나쁜 것은 그
 * 리터럴들이 **테마를 몰랐다**는 점이다 — `rgba(0,0,0,.1)` 은 다크 바탕에서 거의
 * 보이지 않는다.
 */
describe('높이(elevation) 축', () => {
  it('두 시트가 4단을 모두 선언한다', () => {
    for (const t of ['light', 'dark'] as const) {
      const css = sheet(t);
      for (const s of STEPS)
        expect(decl(css, `--u-shadow-${s}`), `${t}.css 에 --u-shadow-${s} 가 없다`).toBeTruthy();
    }
  });

  it('★알파가 색 축과 어긋나지 않는다 (인라인의 대가를 여기서 갚는다)', () => {
    // 폴백 생성기가 합성 값을 리터럴로 다루므로 알파를 중첩할 수 없다(시트 주석 참조).
    // 그 결과 같은 숫자가 두 곳에 있게 되고, 이 단언이 그 둘을 묶는다.
    for (const t of ['light', 'dark'] as const) {
      const css = sheet(t);
      for (const s of STEPS) {
        const from = alphaOf(decl(css, `--u-shadow-${s}`)!);
        const to = alphaOf(decl(css, `--u-shadow-color-${PAIRED[s]}`)!);
        expect(from, `${t}: --u-shadow-${s} 의 알파가 --u-shadow-color-${PAIRED[s]} 와 다르다`)
          .toBe(to);
      }
    }
  });

  it('★단이 올라갈수록 진해지고 커진다 (두 테마 모두)', () => {
    for (const t of ['light', 'dark'] as const) {
      const css = sheet(t);
      const rows = STEPS.map(s => {
        const v = decl(css, `--u-shadow-${s}`)!;
        const [, y, blur] = v.match(/^0\s+(\d+)px\s+(\d+)px/)!.map(Number);
        return { s, y, blur, a: alphaOf(v)! };
      });
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i].y, `${t}: ${rows[i].s} 의 y 가 ${rows[i - 1].s} 이하다`)
          .toBeGreaterThan(rows[i - 1].y);
        expect(rows[i].blur, `${t}: ${rows[i].s} 의 번짐이 ${rows[i - 1].s} 이하다`)
          .toBeGreaterThan(rows[i - 1].blur);
        expect(rows[i].a, `${t}: ${rows[i].s} 의 알파가 ${rows[i - 1].s} 미만이다`)
          .toBeGreaterThanOrEqual(rows[i - 1].a);
      }
    }
  });

  it('★다크의 그림자가 라이트보다 진하다 (리터럴 시절에는 같았다)', () => {
    const [l, d] = [sheet('light'), sheet('dark')];
    for (const s of STEPS)
      expect(alphaOf(decl(d, `--u-shadow-${s}`)!)!, `다크 --u-shadow-${s}`)
        .toBeGreaterThan(alphaOf(decl(l, `--u-shadow-${s}`)!)!);
  });

  it('★컴포넌트가 높이 그림자를 리터럴로 쓰지 않는다', () => {
    // 예외는 하나뿐이고 그 자리에 근거가 적혀 있다: u-alert 의 glass variant 는
    // 유리 질감 레시피(30px 번짐 + backdrop-filter)라 "높이"를 뜻하지 않는다.
    const GLASS = 'src/components/alert/UAlert.styles.ts';
    const offenders: string[] = [];
    for (const rel of globSync('src/**/*.styles.ts', { cwd: root })) {
      const norm = rel.replace(/\\/g, '/');
      const src = readFileSync(join(root, rel), 'utf-8');
      for (const m of src.matchAll(/box-shadow:\s*([^;]+);/g)) {
        const v = m[1].replace(/\s+/g, ' ').trim();
        // `0 0 0 …` 은 링(포커스·테두리)이지 높이가 아니다.
        if (/^0 0 0\b/.test(v) || v === 'none' || v.startsWith('var(--u-shadow-')) continue;
        if (norm === GLASS && v.includes('30px')) continue;
        offenders.push(`${norm}: ${v}`);
      }
    }
    expect(offenders, '높이 축을 경유하지 않는 그림자').toEqual([]);
  });
});
