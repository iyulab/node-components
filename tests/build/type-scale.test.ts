// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'fs';
import { resolve, join, basename } from 'path';

const root = resolve(__dirname, '..', '..');
const sheet = (t: 'light' | 'dark') =>
  readFileSync(join(root, 'src/assets/styles', `${t}.css`), 'utf-8');
const read = (p: string) => readFileSync(p, 'utf-8');
const styleFiles = () =>
  globSync('src/**/*.styles.ts', { cwd: root }).map(p => join(root, p));

/** 단은 크기가 아니라 **역할**이다 — 큰 것부터 작은 것 순. */
const STEPS = [
  'display', 'title', 'subtitle', 'body', 'label', 'caption', 'overline',
] as const;
const PROPS = ['size', 'weight', 'leading', 'tracking'] as const;

const decl = (css: string, name: string) => {
  const m = css.match(new RegExp(`^\\s*${name}\\s*:\\s*([^;]+);`, 'm'));
  return m ? m[1].trim() : null;
};
const px = (v: string) => Number(v.replace('px', ''));

/**
 * **타입 스케일 축**의 계약.
 *
 * ★왜 이 축이 필요했나: 종전에 제공되던 타이포 토큰은 **폰트 패밀리 6개가 전부**였고
 *   `font-size`·`font-weight`·`line-height`·`letter-spacing` 은 **한 개도 없었다**.
 *   그래서 소비자는 화면의 모든 글자 크기를 리터럴로 적었고, 한 앱 안에 12·12.5·13·13.5·14
 *   가 섞였다. 위계가 없으면 화면이 평평해 보이고, 평평한 화면은 낡아 보인다.
 *
 * ★왜 네 값을 **묶어서** 내나: 크기만 주면 소비자가 굵기·행간을 각자 정해 결국 제각각이
 *   된다. 단 하나가 네 값을 모두 소유해야 스케일이 스케일로 동작한다.
 */
describe('타입 스케일 축', () => {
  it('두 시트가 7단 × 4속성을 모두 선언한다', () => {
    for (const t of ['light', 'dark'] as const) {
      const css = sheet(t);
      const missing: string[] = [];
      for (const s of STEPS)
        for (const p of PROPS)
          if (!decl(css, `--u-text-${s}-${p}`)) missing.push(`${t}: --u-text-${s}-${p}`);
      expect(missing).toEqual([]);
    }
  });

  it('타이포는 테마와 무관하다 — 두 시트의 값이 같다', () => {
    const [l, d] = [sheet('light'), sheet('dark')];
    const diff: string[] = [];
    for (const s of STEPS)
      for (const p of PROPS) {
        const n = `--u-text-${s}-${p}`;
        if (decl(l, n) !== decl(d, n)) diff.push(`${n}: ${decl(l, n)} ≠ ${decl(d, n)}`);
      }
    expect(diff).toEqual([]);
  });

  it('★스케일이 스케일답다 — 인접 단의 비율이 1.05~1.35', () => {
    // 비율이 1 에 붙으면 위계가 안 보이고, 너무 벌어지면 중간 크기가 없어 소비자가
    // 스케일 밖 값을 쓰게 된다. (display↔title 은 큰 도약이라 상한에 붙는다.)
    const css = sheet('light');
    const sizes = STEPS.map(s => px(decl(css, `--u-text-${s}-size`)!));
    const bad: string[] = [];
    for (let i = 1; i < sizes.length; i++) {
      const r = sizes[i - 1] / sizes[i];
      if (r < 1.05 || r > 1.35) bad.push(`${STEPS[i - 1]}/${STEPS[i]} = ${r.toFixed(3)}`);
    }
    expect(bad, '인접 단 비율이 범위 밖이다').toEqual([]);
  });

  it('★단이 커질수록 크기가 커진다(역전 없음)', () => {
    const css = sheet('light');
    const sizes = STEPS.map(s => px(decl(css, `--u-text-${s}-size`)!));
    for (let i = 1; i < sizes.length; i++)
      expect(sizes[i], `${STEPS[i]} 가 ${STEPS[i - 1]} 이상이다`).toBeLessThan(sizes[i - 1]);
  });

  it('🔴한글 기준 행간 — 모든 단이 1.4 이상', () => {
    // 라틴 관례(1.2)를 그대로 쓰면 한글에서 줄이 붙어 보인다. 받침 때문에 글자 상자가
    // 세로로 꽉 차 있어 같은 행간이라도 여백이 덜 남는다.
    const css = sheet('light');
    const bad: string[] = [];
    for (const s of STEPS) {
      const v = Number(decl(css, `--u-text-${s}-leading`));
      if (!(v >= 1.4)) bad.push(`${s}: ${v}`);
    }
    expect(bad, '행간이 1.4 미만인 단').toEqual([]);
  });

  it('🔴한글에 양수 자간을 기본으로 주지 않는다 (예외는 overline 하나)', () => {
    // 한글은 양수 letter-spacing 에서 가독성이 떨어진다. `overline` 만 영문·숫자 라벨을
    // 전제한 자리라 예외이고, 그 사실은 시트 주석에 적혀 있다.
    const css = sheet('light');
    const positive = STEPS.filter(s => {
      const v = decl(css, `--u-text-${s}-tracking`)!;
      return !v.startsWith('-') && parseFloat(v) > 0;
    });
    expect(positive).toEqual(['overline']);
  });

  /**
   * 🔴**같은 위계가 두 값이면 스케일이 스케일이 아니다.**
   *
   * 실측(2026-08-04): `u-dialog`·`u-drawer` 제목이 **18px 리터럴**이고 `u-alert` 제목은
   * `--u-text-subtitle-size`(16px) 였다 — *다이얼로그 제목 18 · 얼럿 제목 16* 으로 **같은
   * 위계가 두 값**이었다. 18px 는 스케일에 **없는 단**이라 리터럴로만 존재할 수 있었다.
   *
   * ⚠**단을 늘려 18px 를 만들지 않았다** — 요구처가 둘뿐이라 단일 수요 선제 확장이다.
   * 대신 두 자리를 기존 단으로 옮겼다(2026-08-04 사람 채택).
   */
  it('🔴제목 위계를 가진 컴포넌트가 «같은 단»을 읽는다 (리터럴로 갈라지지 않는다)', () => {
    const TITLED = ['alert/UAlert', 'dialog/UDialog', 'drawer/UDrawer'];
    const bad: string[] = [];
    for (const c of TITLED) {
      const src = read(join(root, `src/components/${c}.styles.ts`));
      // 헤더 규칙(`.header {`)의 font-size 만 본다 — 아이콘 크기·본문은 다른 축이다.
      const header = src.match(/\.header\s*\{[^}]*\}/)?.[0] ?? '';
      if (!/font-size:\s*var\(--u-text-subtitle-size/.test(header))
        bad.push(`${c}: ${header.match(/font-size:[^;]*/)?.[0] ?? '(font-size 없음)'}`);
    }
    expect(bad, '제목 단이 갈렸다 — 같은 위계는 같은 토큰을 읽어야 한다').toEqual([]);
  });

  it('굵기가 100~900 범위의 100 단위다', () => {
    const css = sheet('light');
    const bad: string[] = [];
    for (const s of STEPS) {
      const v = Number(decl(css, `--u-text-${s}-weight`));
      if (!(v >= 100 && v <= 900 && v % 100 === 0)) bad.push(`${s}: ${v}`);
    }
    expect(bad).toEqual([]);
  });
});

/**
 * **모션 축**의 계약.
 * 값이 없으면 앱마다 다른 속도가 생기고, `prefers-reduced-motion` 은 반드시 빠뜨리는
 * 앱이 나온다 — 그리고 그 앱은 접근성 감사 전까지 아무도 모른다.
 */
describe('모션 축', () => {
  const DURATIONS = ['instant', 'fast', 'normal', 'slow'] as const;

  it('지속시간·이징 토큰이 있다', () => {
    const css = sheet('light');
    for (const d of DURATIONS)
      expect(decl(css, `--u-duration-${d}`), `--u-duration-${d}`).toBeTruthy();
    for (const e of ['standard', 'decelerate', 'accelerate'])
      expect(decl(css, `--u-ease-${e}`), `--u-ease-${e}`).toBeTruthy();
  });

  it('★`prefers-reduced-motion: reduce` 에서 모든 지속시간이 0 이 된다', () => {
    const css = sheet('light');
    const block = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/);
    expect(block, 'reduced-motion 블록이 없다 — 소비자에게 떠넘기지 않는다').toBeTruthy();
    for (const d of DURATIONS)
      expect(block![1], `--u-duration-${d} 가 0 으로 눌리지 않았다`)
        .toMatch(new RegExp(`--u-duration-${d}\\s*:\\s*0ms`));
  });

  /**
   * 🔴**이 단언이 없어서 축이 0 곳에 배선된 채로 출하될 뻔했다.**
   *
   * 시트에 토큰이 있고 reduced-motion 블록도 있었지만 **어떤 컴포넌트도 그 축을 읽지
   * 않았다**(실측 0건). 위 두 단언은 **둘 다 통과한다** — 시트만 보기 때문이다.
   * 그 상태에서 CHANGELOG 는 *"이 축을 경유하는 모든 애니메이션이 함께 멈춘다"* 고
   * 적혀 있었고, 경유하는 것이 0개라 아무것도 멈추지 않았다.
   *
   * ⇒ ***축의 계약은 "토큰이 있다" 가 아니라 "컴포넌트가 그것을 지난다" 이다.***
   * `scale-tokens` 초안 §4-2 가 수용 기준으로 요구한 것이 정확히 이것이다.
   */
  it('🔴컴포넌트의 `transition` 이 리터럴 지속시간을 쓰지 않는다 (축을 경유한다)', () => {
    const offenders: string[] = [];
    for (const file of styleFiles()) {
      for (const decl of read(file).match(/transition:\s*[^;]+;/g) ?? []) {
        // ⚠축을 경유한 자리의 **폴백**은 위반이 아니다 — `var(--u-duration-x, 220ms)` 의
        //   `220ms` 는 시트 부재 시 렌더를 살리는 장치이고, 시트가 있으면 축을 지난다.
        //   이것을 빼지 않으면 배선된 33곳이 전부 위반으로 잡힌다(첫 판 실측).
        const bare = decl.replace(/var\(\s*--u-(?:duration|ease)-[\w-]+\s*,[^)]*\)/g, '');
        // `0s` 는 축 밖이다 — 지연 없음/즉시를 뜻하고 눌러야 할 시간이 아니다.
        if (/(?<![\w.])(?!0s\b)\d*\.?\d+m?s\b/.test(bare))
          offenders.push(`${basename(file)}: ${decl.trim()}`);
      }
    }
    expect(offenders, '리터럴 지속시간은 prefers-reduced-motion 을 비껴간다').toEqual([]);
  });

  it('컴포넌트-로컬 지속시간 토큰도 공용 축에서 파생한다', () => {
    // 로컬 축 자체는 정당하다(소비자가 그 컴포넌트만 조절). 다만 **기본값**이 리터럴이면
    // 그 컴포넌트만 reduced-motion 을 비껴간다 — `--switch-duration` 이 실제로 그랬다.
    const bad: string[] = [];
    for (const file of styleFiles())
      for (const m of read(file).matchAll(/(--[\w-]*duration[\w-]*)\s*:\s*([^;]+);/g))
        if (!m[2].includes('var(--u-duration-')) bad.push(`${basename(file)}: ${m[0].trim()}`);
    expect(bad).toEqual([]);
  });
});
