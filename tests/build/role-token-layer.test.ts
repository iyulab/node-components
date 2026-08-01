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

const isDecorative = (sel: string) => /\[color[~^$*]?=/.test(sel);

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

  it('두 시트의 역할 토큰이 같은 팔레트 단으로 매핑된다 (다크 모드 정합)', () => {
    // 팔레트 *값* 자체가 시트별로 다르므로(--u-blue-600 = #1E88E5 / #2A659D)
    // 같은 shade 이름으로 매핑해야 양 테마가 동시에 성립한다.
    const map = (sheet: string) => {
      const css = read(join(root, 'src/assets/styles', sheet));
      const out: Record<string, string> = {};
      for (const m of css.matchAll(/^\s*(--u-(?:primary|info|success|warning|danger)-color[\w-]*)\s*:\s*var\((--u-[\w-]+)\)/gm)) {
        out[m[1]] = m[2];
      }
      return out;
    };
    expect(map('dark.css')).toEqual(map('light.css'));
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
    // 이 건수가 0 이 되면 위 검사는 아무것도 지키지 않는 것이다.
    let n = 0;
    for (const f of styleFiles()) {
      for (const { sel, body } of ruleBlocks(read(f))) {
        if (!isDecorative(sel)) continue;
        n += (body.match(new RegExp(`var\\(--u-(?:${HUES})-\\d+`, 'g')) || []).length;
      }
    }
    expect(n).toBeGreaterThan(100);
  });

  it('시맨틱 토큰이 역할 층을 경유한다', () => {
    const routed = {
      '--u-txt-color-hover': '--u-primary-color',
      '--u-txt-color-active': '--u-primary-color',
      '--u-icon-color-hover': '--u-primary-color',
      '--u-icon-color-active': '--u-primary-color',
      '--u-link-txt-color': '--u-primary-color-strong',
      '--u-input-border-color-focus': '--u-primary-color',
      '--u-input-border-color-invalid': '--u-danger-color',
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
