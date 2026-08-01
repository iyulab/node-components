import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'fs';
import { resolve, join, basename } from 'path';

const root = resolve(__dirname, '../..');
const read = (p: string) => readFileSync(p, 'utf-8');
const styleFiles = () =>
  globSync('src/components/**/*.styles.ts', { cwd: root }).map(p => join(root, p));

/** 축 B — 컨테이너·오버레이. 절대 여백을 소유하는 컴포넌트다. */
const AXIS_B = [
  'UAlert', 'UButtonGroup', 'UCard', 'UCarousel', 'UDialog',
  'UDrawer', 'UDivider', 'UMenu', 'USlider', 'UTooltip',
];

const SPACE_STEPS = { '3xs': '2px', '2xs': '4px', xs: '6px', sm: '8px', md: '12px', lg: '16px' };

/** 여백을 지정하는 선언인가 (`padding-block-start`·`--menu-padding` 같은 파생형 포함) */
const SPACING_DECL =
  /(?:^|\s|;)((?:(?:padding|margin)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?|(?:row-|column-)?gap|--[a-z-]*(?:padding|gap|margin)[a-z-]*)\s*:\s*)([^;}]+)/g;

/**
 * 규약: **여백은 하나의 축이 아니다.**
 *
 * 실측(Cycle 117)이 확인한 것:
 *  - **축 A — 타입 상대 여백(`em` + `font-size: inherit`)**. 폼·인라인 요소가 쓴다.
 *    소비자가 타이포를 키우면 여백도 따라 커지는 것이 **의도된 동작**이다.
 *  - **축 B — 절대 여백(`px`)**. 컨테이너·오버레이의 레이아웃 여백. 콘텐츠 타이포와 무관하다.
 *
 * ★ 이 파일의 존재 이유는 축 B 를 검사하는 것이 아니라 **축 A 가 축 B 로 흡수되는 것을 막는**
 *   것이다. "여백 토큰을 만들었으니 전부 토큰으로" 는 자연스러운 다음 수순처럼 보이지만,
 *   그렇게 하면 `body { font-size: 18px }` 를 지정한 소비자의 폼 여백이 따라 커지지 않는다 —
 *   기능이 조용히 사라지고 아무 테스트도 실패하지 않는다. 그래서 여기서 세어 둔다.
 *
 * 판정 근거: claudedocs/plans/20260801-space-axis-verdict.md
 */
describe('스케일 토큰 — 여백(축 B, 절대)', () => {
  const sheet = (name: string) =>
    Object.fromEntries(
      [...read(join(root, 'src/assets/styles', name)).matchAll(/^\s*(--u-space-[\w-]+)\s*:\s*([^;]+);/gm)]
        .map(m => [m[1], m[2].trim()]),
    );

  it('두 시트가 여백 스케일을 같은 값으로 정의한다', () => {
    const light = sheet('light.css');
    expect(light).toEqual(
      Object.fromEntries(Object.entries(SPACE_STEPS).map(([k, v]) => [`--u-space-${k}`, v])),
    );
    // 여백은 반경과 마찬가지로 테마와 무관하다.
    expect(sheet('dark.css')).toEqual(light);
  });

  it('배선된 폴백 리터럴이 시트 값과 일치한다 (오배선 검출)', () => {
    // 배선은 `var(--u-space-X, <원래 리터럴>)` 형태다. 폴백이 시트 값과 다르면
    // 토큰 시트 유무에 따라 렌더가 달라진다 — 시각 변화 0 이라는 주장이 깨진다.
    const light = sheet('light.css');
    const bad: string[] = [];
    for (const f of styleFiles()) {
      for (const m of read(f).matchAll(/var\((--u-space-[\w-]+)\s*,\s*([^)]+)\)/g)) {
        const [, token, fallback] = m;
        if (light[token] !== fallback.trim()) {
          bad.push(`${basename(f)}: ${token} 폴백 ${fallback.trim()} ≠ 시트 ${light[token]}`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it('축 B 컴포넌트가 스케일에 있는 px 여백을 리터럴로 쓰지 않는다', () => {
    const scale = new Set(Object.values(SPACE_STEPS));
    const offenders: string[] = [];
    for (const f of styleFiles()) {
      const name = basename(f).replace('.styles.ts', '');
      if (!AXIS_B.includes(name)) continue;
      for (const m of read(f).matchAll(SPACING_DECL)) {
        // 토큰 배선분은 폴백 안에 리터럴이 남아 있으므로 제외하고 본다
        const value = m[2].replace(/var\(--u-space-[\w-]+\s*,\s*[^)]+\)/g, '');
        for (const lit of value.matchAll(/(?:^|[\s(,])(\d+px)(?![\w-])/g)) {
          if (scale.has(lit[1])) offenders.push(`${name}: ${m[1].trim()} ${m[2].trim()}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('★축 A 보존 — `em` 여백이 절대 스케일로 흡수되지 않았다', () => {
    // 기준선: em 여백 **값** 71개 / 21개 스타일시트 (Cycle 118 시점 git HEAD 대조로 확정).
    // 이 수치가 **줄면** 축 A 가 축 B 로 흡수됐다는 뜻이다(장식 축 보존 가드와 같은 형태).
    // 늘어나는 것은 문제가 아니다 — 새 폼 컴포넌트가 올바른 단위를 쓴 것이다.
    //
    // ⚠**선언이 아니라 값을 센다.** 선언 수로 세면 축약형 안의 값 하나가 흡수돼도 보이지
    //   않는다 — `padding: var(--x, 0.2em) var(--y, 0.5em)` 에서 한쪽만 절대 토큰으로
    //   바꿔도 선언 수는 그대로다. 실제로 이 가드의 첫 판을 그렇게 썼고,
    //   네거티브 컨트롤(UBadge 부분 흡수)이 **통과해 버려서** 잡혔다.
    let values = 0;
    const files = new Set<string>();
    for (const f of styleFiles()) {
      for (const m of read(f).matchAll(SPACING_DECL)) {
        const n = [...m[2].matchAll(/(?:^|[\s(,])[0-9.]+em(?![\w-])/g)].length;
        if (n > 0) {
          values += n;
          files.add(basename(f));
        }
      }
    }
    expect(values).toBeGreaterThanOrEqual(71);
    expect(files.size).toBeGreaterThanOrEqual(21);
  });
});
