import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'fs';
import { resolve, join, basename } from 'path';
// @ts-expect-error — 문서 생성기는 .mjs 로, 타입 선언이 없다
import { renderDesignTokensDoc, DOC_PATH as TOKEN_DOC } from '../../scripts/design-tokens-doc.mjs';

const root = resolve(__dirname, '../..');
const read = (p: string) => readFileSync(p, 'utf-8');
const styleFiles = () =>
  globSync('src/components/**/*.styles.ts', { cwd: root }).map(p => join(root, p));

const ROLES = ['primary', 'info', 'success', 'warning', 'danger'] as const;
const STEPS = ['-weakest', '-weaker', '-weak', '', '-strong'] as const;
const HUES = 'blue|red|green|yellow|orange|purple|pink|teal|cyan';

/**
 * 규약: **컴포넌트는 팔레트 프리미티브가 아니라 역할 토큰을 참조한다.**
 *
 * 두 축을 구분한다:
 *  - **역할 축** — `[status=…]`·`[invalid]`·`:focus-visible`·링크·checked 처럼 *의미*가 있는 자리.
 *    반드시 `--u-{role}-color{-step}` 을 거친다. 그래야 소비자가 역할 토큰 하나를 바꿔
 *    전 컴포넌트를 브랜딩할 수 있다.
 *  - **장식 축** — `[color="purple"]` 처럼 소비자가 고른 색. `purple` 에는 역할 의미가 없으므로
 *    역할 토큰으로 흡수하면 공개 API 가 깨진다. 팔레트 직참조가 정상이며 이 검사 대상이 아니다.
 *
 * 이 검사가 존재하는 이유: 역할 층은 **한 군데라도 팔레트를 직접 보면 그만큼 무력해진다**.
 * `--u-primary-color` 를 바꿨는데 절반만 바뀌는 상태가 바로 이 층이 해결하려던 증상이다.
 */
function ruleBlocks(css: string): Array<{ sel: string; body: string }> {
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sel: m[1], body: m[2] }));
}

/** 역할 값 — `color=` 를 쓰지만 **의미 축**이라 장식 면제를 받으면 안 된다. */
const ROLE_VALUES = ['primary', 'info', 'success', 'warning', 'danger'];

/**
 * `[color=X]` 라고 전부 장식인 것은 아니다.
 *
 * ★1.19.0 이전의 이 판정은 `/\[color=/` 하나였고, 그 결과 **역할 값 규칙이 팔레트를 직접
 * 읽어도 아래 검사가 침묵했다.** 역할 값은 정의상 *"리브랜딩을 따라오는 축"* 이므로
 * 팔레트 직참조는 그 축의 존재 이유를 무효화한다 — 장식 축과 정확히 반대 요구다.
 * 면제는 **장식 값에만** 준다.
 */
const isDecorative = (sel: string) =>
  /\[color[~^$*]?=/.test(sel) &&
  !ROLE_VALUES.some(r => new RegExp(`\\[color[~^$*]?=["']?${r}["']?\\]`).test(sel));

describe('역할 토큰 층', () => {
  it('두 시트가 5역할 × 5단 그리드를 전부 정의한다', () => {
    for (const sheet of ['light.css', 'dark.css']) {
      const css = read(join(root, 'src/assets/styles', sheet));
      const missing: string[] = [];
      for (const role of ROLES) {
        for (const step of STEPS) {
          const token = `--u-${role}-color${step}`;
          if (!new RegExp(`^\\s*${token}\\s*:`, 'm').test(css)) missing.push(token);
        }
      }
      expect(missing, `${sheet} 에 없는 역할 토큰`).toEqual([]);
    }
  });

  it('두 시트가 같은 역할 토큰 집합을 정의한다 (키 집합만 — 단은 테마별로 다르다)', () => {
    // ★이 검사는 원래 **값(팔레트 단)까지 같기를** 요구했다. 근거는
    //   *"팔레트 값 자체가 시트별로 다르므로 같은 shade 이름으로 매핑해야 양 테마가
    //     동시에 성립한다"*
    // 였고, 그 전제가 **실측으로 반증됐다**(Cycle 141):
    //
    //   다크 팔레트는 휘도 순으로 설계됐지만 라이트(Material 2)는 색상 기준이다.
    //   같은 shade 이름이 두 테마에서 같은 세기를 뜻하지 않는다 —
    //     라이트 blue-600 #1E88E5 : 흰 글자 3.68 ✗
    //     다크   blue-600 #2A659D : 흰 글자 6.09 ✓
    //   같은 단으로 묶어 둔 탓에 **라이트만 미달인 결함**이 세 번 반복해서 나왔다.
    //
    // ⇒ 정합의 단위는 **단이 아니라 대비**다. 값은 token-contrast.test.ts 가 지키고,
    //   여기서는 **키 집합**만 본다 — 한쪽 시트에만 있는 토큰은 여전히 결함이다
    //   (그 토큰은 다른 테마에서 폴백이 발동해 반대 테마 색이 칠해진다).
    const map = (sheet: string) => {
      const css = read(join(root, 'src/assets/styles', sheet));
      const out: Record<string, string> = {};
      for (const m of css.matchAll(/^\s*(--u-(?:primary|info|success|warning|danger)-color[\w-]*)\s*:\s*var\((--u-[\w-]+)\)/gm)) {
        out[m[1]] = m[2];
      }
      return out;
    };
    expect(Object.keys(map('dark.css')).sort()).toEqual(Object.keys(map('light.css')).sort());
  });

  it('역할 축에 팔레트 프리미티브 직참조가 없다', () => {
    const offenders: string[] = [];
    for (const f of styleFiles()) {
      for (const { sel, body } of ruleBlocks(read(f))) {
        if (isDecorative(sel)) continue;
        for (const m of body.matchAll(new RegExp(`var\\(--u-(?:${HUES})-\\d+`, 'g'))) {
          offenders.push(`${basename(f)}  ${sel.trim().replace(/\s+/g, ' ').slice(-40)}  ${m[0]})`);
        }
      }
    }
    expect(offenders.sort()).toEqual([]);
  });

  it('장식 축(`[color=X]`)의 팔레트 직참조는 보존된다', () => {
    // 네거티브 컨트롤 — 위 검사가 장식 축까지 삼키면 `color="purple"` API 가 깨진다.
    //
    // 총 건수로 재지 않는다: 매트릭스를 접는 것은 **정당한 리팩터**라 건수가 줄어드는
    // 것이 정상이고(u-tag 36규칙 → 9), 매직 넘버는 그때마다 거짓 실패를 낸다.
    // 대신 **`color=` 를 쓰는 컴포넌트마다 팔레트 직참조가 남아 있는지**를 본다 —
    // 어느 하나라도 0 이 되면 그 컴포넌트의 장식 축이 역할 층에 흡수된 것이다.
    const empty: string[] = [];
    for (const f of styleFiles()) {
      const blocks = ruleBlocks(read(f));
      if (!blocks.some(b => isDecorative(b.sel))) continue;
      const n = blocks
        .filter(b => isDecorative(b.sel))
        .reduce((s, b) => s + (b.body.match(new RegExp(`var\\(--u-(?:${HUES})-\\d+`, 'g')) || []).length, 0);
      if (n === 0) empty.push(basename(f));
    }
    expect(empty, '장식 축이 팔레트를 직접 읽지 않는 컴포넌트').toEqual([]);
  });

  it('시맨틱 토큰이 역할 층을 경유한다', () => {
    // ★hover/active 텍스트·아이콘은 `-strong` 을 경유한다(Cycle 141). `-color` 는 **면**의
    // 단이라 다크에서 바탕 위 글자로 쓰면 3.07 로 미달한다 — 두 용도의 대비 요구가
    // 다크에서 정반대 방향이기 때문이다(token-contrast.test.ts 참조).
    // 🔴~~테두리(`-focus`·`-invalid`)는 글자가 아니라 비텍스트(3.0)라 `-color` 로 충분하다.~~
    //    **반증됐다 (1.19.0)** — 실측하니 다크에서 `focus` 2.74 · `invalid` 2.44 로 그
    //    비텍스트 기준 자체에 미달이었다. 이 문장은 *"기준이 낮으니 낮은 단으로 충분"* 을
    //    **재지 않고** 추론했다. 테두리는 면이 아니라 **면 위에 그리는 선**이므로 글자와
    //    같은 쪽(`-strong`)이 맞다. ⇒ token-contrast.test.ts 가 이제 실제로 잰다.
    const routed = {
      '--u-txt-color-hover': '--u-primary-color-strong',
      '--u-txt-color-active': '--u-primary-color-strong',
      '--u-icon-color-hover': '--u-primary-color-strong',
      '--u-icon-color-active': '--u-primary-color-strong',
      '--u-link-txt-color': '--u-primary-color-strong',
      '--u-input-border-color-focus': '--u-primary-color-strong',
      '--u-input-border-color-invalid': '--u-danger-color-strong',
    };
    for (const sheet of ['light.css', 'dark.css']) {
      const css = read(join(root, 'src/assets/styles', sheet));
      for (const [token, role] of Object.entries(routed)) {
        expect(
          new RegExp(`^\\s*${token}\\s*:\\s*var\\(${role}\\)`, 'm').test(css),
          `${sheet}: ${token} 이 ${role} 을 경유해야 한다`,
        ).toBe(true);
      }
    }
  });

  it('theming.md 가 실제 역할 그리드와 일치한다', () => {
    // 손으로 쓴 표는 드리프트한다 — 실제로 이 문서는 `u-badge` 가 브랜드 오버라이드를
    // 따른다고 적고 있었으나, u-badge 는 역할 축 참조가 0건이다.
    const doc = read(join(root, 'docs/theming.md'));
    const missing: string[] = [];
    for (const role of ROLES) if (!doc.includes(`\`${role}\``)) missing.push(`role: ${role}`);
    for (const step of STEPS) if (!doc.includes(`--u-{role}-color${step}`)) missing.push(`step: ${step || '(기본)'}`);
    expect(missing, 'theming.md 에 문서화되지 않은 역할/단').toEqual([]);

    // 장식 축을 가진 컴포넌트 목록도 실제와 대조한다.
    const decorative = new Set<string>();
    for (const f of styleFiles()) {
      if (/\[color[~^$*]?=/.test(read(f))) {
        decorative.add(basename(f).replace(/^U|\.styles\.ts$/g, '').toLowerCase());
      }
    }
    const undocumented = [...decorative].filter(c => !doc.includes(`u-${c}`)).sort();
    expect(undocumented, 'theming.md 의 장식 축 목록에 빠진 컴포넌트').toEqual([]);
  });

  it('생성 레퍼런스가 시트와 동기화돼 있다', () => {
    // 시트 레벨 토큰은 어느 컴포넌트 JSDoc 에도 없어 `css-custom-properties.md` 에 안 잡힌다.
    // 소비자는 생성 문서를 먼저 열므로, 별도 생성기 + drift 검사가 필요하다.
    expect(read(join(root, TOKEN_DOC))).toBe(renderDesignTokensDoc(root));
  });

  it('세 문서가 서로를 가리킨다', () => {
    // 소비자가 어느 문서로 들어와도 나머지에 도달해야 한다 — 이번 층의 실패 원인이
    // 기능 부재가 아니라 발견 불가였다.
    const docs = {
      'docs/theming.md': ['design-tokens.md', 'css-custom-properties.md'],
      'docs/design-tokens.md': ['theming.md', 'css-custom-properties.md'],
      'docs/css-custom-properties.md': ['theming.md', 'design-tokens.md'],
    };
    const missing: string[] = [];
    for (const [doc, links] of Object.entries(docs)) {
      const body = read(join(root, doc));
      for (const l of links) if (!body.includes(l)) missing.push(`${doc} -> ${l}`);
    }
    expect(missing).toEqual([]);
  });

  it('역할 토큰은 팔레트 별칭이지 color-mix 파생이 아니다', () => {
    // 파생으로 단을 만들면 브랜드 색 교체 시 5단이 기계적 혼합이 되어
    // 팔레트가 손으로 조정한 명도 곡선을 잃는다.
    for (const sheet of ['light.css', 'dark.css']) {
      const css = read(join(root, 'src/assets/styles', sheet));
      const bad = [
        ...css.matchAll(/^\s*(--u-(?:primary|info|success|warning|danger)-color[\w-]*)\s*:\s*([^;]+);/gm),
      ]
        .filter(m => !/^var\(--u-[\w-]+\)$/.test(m[2].trim()))
        .map(m => `${sheet}: ${m[1]} = ${m[2].trim()}`);
      expect(bad).toEqual([]);
    }
  });
});

describe('스케일 토큰 — 반경', () => {
  const STEPS = ['none', 'sm', 'md', 'lg', 'xl', 'pill', 'circle'];

  it('두 시트가 반경 스케일을 같은 값으로 정의한다', () => {
    const map = (sheet: string) => {
      const css = read(join(root, 'src/assets/styles', sheet));
      return Object.fromEntries(
        [...css.matchAll(/^\s*(--u-radius-[\w-]+)\s*:\s*([^;]+);/gm)].map(m => [m[1], m[2].trim()]),
      );
    };
    const light = map('light.css');
    expect(Object.keys(light).sort()).toEqual(STEPS.map(s => `--u-radius-${s}`).sort());
    // 반경은 테마와 무관하다 — 색과 달리 시트별로 달라질 이유가 없다.
    expect(map('dark.css')).toEqual(light);
  });

  it('컴포넌트가 스케일에 있는 반경을 리터럴로 쓰지 않는다', () => {
    // em 기반·다중값·calc 반경은 스케일 밖이다(폰트 크기를 따라야 하거나 기하 계산이다).
    // 여기서 막는 것은 **스케일에 이미 있는 값**을 리터럴로 다시 쓰는 것이다.
    const SCALE = new Set(['0', '3px', '4px', '6px', '8px', '999px', '9999px', '50%']);
    const offenders: string[] = [];
    for (const f of styleFiles()) {
      for (const m of read(f).matchAll(/border-radius:\s*([^;]+);/g)) {
        const v = m[1].trim();
        if (SCALE.has(v)) offenders.push(`${basename(f)}: ${v}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
