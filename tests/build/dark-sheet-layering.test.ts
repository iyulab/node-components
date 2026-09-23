import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';

const root = resolve(__dirname, '../..');
const read = (p: string) => readFileSync(join(root, 'src/assets/styles', p), 'utf-8');

/**
 * `dark.css` 의 두 블록 — 무엇이 어디 사는가.
 *
 *   `:root[theme="dark"]`         (0,1,1)  모드에 따라 값이 달라지는 것 — 색·그림자
 *   `:root:where([theme="dark"])` (0,1,0)  모드와 무관한 스케일 — 반경·여백·글자·모션·글꼴
 *
 * 뒤의 것이 앞 블록에 있으면 `:root` 로 선언한 하우스·소비자 층이 다크 모드에서만 조용히
 * 진다(docket `#413`). 그리고 지속시간이 앞 블록에 있으면 light.css 의 `prefers-reduced-motion`
 * 규칙(`:root`)이 다크에서 무시된다 — 이 불변식이 그 둘을 함께 지킨다.
 *
 * ⚠**범주 목록은 손으로 쓴다** — «어떤 토큰이 모드와 무관한가» 는 시트에서 도출할 수 있는
 * 사실이 아니라 설계 지식이다(값이 우연히 같은 색도 있다). 대신 그 목록이 **실제로** 모드
 * 무관인지(라이트와 값이 같은지)를 여기서 대조한다.
 */
const SCALE = /^--u-(radius|space|text|duration|ease|font)-/;

function declarations(css: string): Map<string, string> {
  const m = new Map<string, string>();
  for (const x of css.matchAll(/(--u-[\w-]+)\s*:\s*([^;]+);/g)) if (!m.has(x[1])) m.set(x[1], x[2].trim().replace(/\s+/g, ' '));
  return m;
}

/** 선택자로 시작하는 최상위 블록의 본문(중첩 없음). */
function block(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`);
  expect(start, `${selector} 블록이 없다`).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf('\n}', start));
}

describe('dark.css — 모드 무관 스케일은 :root 와 같은 특이도에 산다', () => {
  const dark = read('dark.css');
  const light = declarations(read('light.css'));
  const high = declarations(block(dark, ':root[theme="dark"]'));
  const low = declarations(block(dark, ':root:where([theme="dark"])'));

  it('높은 블록(0,1,1)에는 스케일 토큰이 하나도 없다', () => {
    expect([...high.keys()].filter(k => SCALE.test(k))).toEqual([]);
  });

  it('스케일 토큰은 전부 낮은 블록(0,1,0)에 있다 — 시트가 자기완결이다', () => {
    const lightScale = [...light.keys()].filter(k => SCALE.test(k)).sort();
    expect(lightScale.length).toBeGreaterThan(0);
    expect([...low.keys()].sort()).toEqual(lightScale);
  });

  it('낮은 블록의 값은 라이트와 같다 — 정말 모드와 무관하다', () => {
    const differs = [...low].filter(([k, v]) => light.get(k) !== v).map(([k]) => k);
    expect(differs).toEqual([]);
  });

  it('다크 시트도 prefers-reduced-motion 에서 지속시간을 0 으로 누른다', () => {
    const media = dark.slice(dark.indexOf('@media (prefers-reduced-motion: reduce)'));
    expect(media).toMatch(/:root:where\(\[theme="dark"\]\)\s*\{/);
    for (const k of ['instant', 'fast', 'normal', 'slow']) {
      expect(media).toMatch(new RegExp(`--u-duration-${k}: *0ms`));
    }
  });
});
