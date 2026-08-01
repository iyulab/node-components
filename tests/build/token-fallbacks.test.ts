import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'fs';
import { resolve, join } from 'path';
// @ts-expect-error — 생성기는 .mjs 로, 타입 선언이 없다
import { resolveTokens, planFallbacks, parseFallbacks, CANONICAL_SHEET, EXCLUDED, SYSTEM_FALLBACK } from '../../scripts/token-fallbacks.mjs';

const root = resolve(__dirname, '../..');
const read = (p: string) => readFileSync(join(root, p), 'utf-8');
const sheet = (name: string) => read(`src/assets/styles/${name}.css`);

/**
 * 규약: **컴포넌트는 토큰 시트 없이도 렌더된다.**
 *
 * 소비자가 `styles/tokens.css` 를 로드하지 않으면 `var(--u-X)` 는 무효가 되고 그 선언이
 * 통째로 버려진다 — 텍스트가 안 보이고 테두리가 사라진다. 폴백이 그것을 막는다.
 *
 * ★이 파일의 존재 이유는 폴백이 **있는지** 보는 것이 아니라 폴백이 **시트와 어긋나지
 * 않는지** 보는 것이다. 리터럴은 정의상 시트 값의 복제이므로, 시트만 고치면 412곳이
 * 조용히 낡는다. 그 스테일은 눈으로 잡을 수 없다(양쪽 다 유효한 CSS 이고 시트가 있는
 * 개발 환경에서는 폴백이 아예 평가되지 않는다).
 */
describe('토큰 폴백 — 시트 부재 내성', () => {
  describe('체인 해석', () => {
    it('모든 토큰이 리터럴까지 풀린다 (순환·미정의 0)', () => {
      // 역할 토큰 층(Cycle 108)이 체인을 한 단 깊게 만들었다:
      //   --u-txt-color-hover → var(--u-primary-color) → var(--u-blue-600) → #1E88E5
      // 한 단만 풀면 폴백 자리에 또 var() 가 들어가 아무것도 해결되지 않는다.
      const literals = resolveTokens(sheet('light'));
      const unresolved = [...literals].filter(([, v]) => /var\(/.test(v as string));
      expect(unresolved).toEqual([]);
      expect(literals.get('--u-txt-color-hover')).toBe('#1E88E5');
      expect(literals.get('--u-txt-color')).toBe('#212121');
    });

    it('합성 값은 체인으로 오인하지 않는다', () => {
      const literals = resolveTokens(sheet('light'));
      // `rgba(0,0,0,0.5)` 는 var() 를 포함하지 않는 리터럴이다. 값 전체가 단일 var() 일
      // 때만 체인이다 — 이 구분이 없으면 `1px solid var(--x)` 류가 잘못 풀린다.
      expect(literals.get('--u-overlay-bg-color')).toBe('rgba(0, 0, 0, 0.5)');
    });
  });

  describe('정본 시트는 light 다', () => {
    it('색 토큰은 테마 변형이므로 리터럴이 한 쪽만 담는다', () => {
      // ⚠여백·반경은 테마 불변이라(12px 은 양 시트에서 12px) `space-scale.test.ts` 는
      // `expect(dark).toEqual(light)` 로 끝났다. **색에 그 형태를 복사하면 안 된다** —
      // 여기서 두 시트는 정당하게 다르고, 폴백은 그중 light 를 굽는다.
      const light = resolveTokens(sheet('light'));
      const dark = resolveTokens(sheet('dark'));
      const divergent = [...light].filter(([n, v]) => dark.has(n) && dark.get(n) !== v);

      // 이 단언이 이 절의 핵심이다: 두 시트가 실제로 갈린다는 사실을 고정한다.
      // 갈리지 않는다면 "정본 시트" 결정 자체가 무의미해지므로 테스트가 그것을 알려야 한다.
      expect(divergent.length).toBeGreaterThan(50);
      expect(CANONICAL_SHEET).toBe('light');
    });

    it('두 시트가 같은 토큰 집합을 정의한다 (키 패리티)', () => {
      // ★*"light 를 정본으로 삼아도 안전하다"* 를 떠받치는 불변식이다.
      // 두 시트는 **각각 완결적**이다(override 층이 아니라 교체 대상). dark 에만 없는
      // 키가 생기면 그 토큰은 **다크에서 폴백이 발동**한다 — 종전에는 선언이 버려졌는데
      // 이제는 **라이트 색이 칠해진다.** 즉 *"시트를 쓰면 시각 변화 없음"* 이 깨지고,
      // 깨지는 자리는 다크 모드뿐이라 라이트로 개발하면 보이지 않는다.
      const keys = (name: string) => new Set(resolveTokens(sheet(name)).keys());
      const light = [...keys('light')].sort();
      const dark = [...keys('dark')].sort();
      expect(dark).toEqual(light);
    });

    it('배선된 폴백은 light 값이지 dark 값이 아니다', () => {
      const light = resolveTokens(sheet('light'));
      const dark = resolveTokens(sheet('dark'));
      const wired = [...wiredFallbacks()];
      if (!wired.length) return; // 배선 전 — 아래 커버리지 테스트가 잡는다

      const wrongSheet = wired.filter(
        ([name, literal]) =>
          dark.get(name) === literal && light.get(name) !== literal,
      );
      // 누가 dark 로 재생성하면 여기서 걸린다. 개발 환경에서는 시트가 있어 폴백이 평가되지
      // 않으므로, 이 오류는 **시트를 로드하지 않은 소비자에게만** 나타난다 — 즉 우리가
      // 절대 못 보는 곳에서만 틀린다.
      expect(wrongSheet).toEqual([]);
    });
  });

  describe('스테일 방지', () => {
    it('배선된 폴백 리터럴이 시트 값과 일치한다', () => {
      const light = resolveTokens(sheet('light'));
      const mismatched: string[] = [];
      for (const [name, literal, rel] of wiredFallbacks()) {
        if (isSystemFallback(literal)) continue; // 다른 전략 — 아래 절이 따로 감시한다
        const expected = light.get(name);
        if (expected !== undefined && expected !== literal)
          mismatched.push(`${rel}: var(${name}, ${literal}) — 시트는 ${expected}`);
      }
      expect(mismatched).toEqual([]);
    });

    it('폴백 없는 참조가 남아 있지 않다 (제외 목록 외)', () => {
      // 커버리지 단언. 토큰 단위로 나눠 배선하는 동안에는 이 테스트가 남은 양을 보고한다.
      const { edits, skipped } = planFallbacks(root, {}) as {
        edits: { rel: string; hits: { name: string }[] }[];
        skipped: { unresolved: Map<string, number> };
      };
      const remaining = edits.flatMap(e => e.hits.map(h => `${e.rel}: ${h.name}`));
      expect(remaining).toEqual([]);
      // 해석 실패는 곧 유령 토큰이다(참조되지만 시트에 없음). 과거에
      // `--u-border-color-hover` 가 정확히 그 상태였다(Cycle 104).
      expect([...skipped.unresolved.keys()]).toEqual([]);
    });

    it('시스템 색 폴백은 소수의 의도된 자리에만 있다', () => {
      // ★기준선 감시. 시스템 색(`Canvas`·`CanvasText`·`inherit`)은 OS 테마를 따라가므로
      // light 리터럴보다 나아 **보인다**. 그래서 확산 압력이 있다.
      // 확산하면 안 되는 이유는 팔레트가 관계적이기 때문이다 — 시스템 색 등가물이 있는
      // 토큰은 10여 개뿐이고, 섞으면 경계가 **대비쌍을 가로지른다**(배경은 OS 를 따라
      // 검게 가는데 보조 텍스트는 흰 배경 기준 회색으로 남는 식).
      // 늘리려면 그 관계를 먼저 풀어야 한다. 이 숫자가 오르면 이 대화를 하자는 뜻이다.
      // 현재 구성: UElement 2(txt·font) · UTooltip 1(font) · UDrawer 5 · UDialog 2.
      // 드로어/대화상자는 **패널 한 벌**로 자기완결적이다(배경 Canvas + 테두리
      // CanvasText 파생 + 텍스트 inherit) — 관계가 그 안에서 닫히므로 대비쌍이 갈리지 않는다.
      const system = [...wiredFallbacks()].filter(([, literal]) => isSystemFallback(literal));
      expect(system.length).toBe(10);
      expect(SYSTEM_FALLBACK.reason.length).toBeGreaterThan(10);
    });

    it('제외는 의도된 것만이다', () => {
      // 제외를 늘리는 것은 "이 토큰은 시트 없이 깨져도 된다"는 선언이다. 목록에 이유를
      // 강제해, 편의를 위한 조용한 제외를 막는다.
      expect([...EXCLUDED.keys()]).toEqual(['font']);
      for (const reason of EXCLUDED.values()) expect(String(reason).length).toBeGreaterThan(10);
    });
  });
});

/**
 * 소스에 실제로 배선돼 있는 `var(--u-X, literal)` 을 모은다.
 *
 * 파서는 **생성기와 공유한다** — 배선하는 쪽과 검사하는 쪽이 폴백을 다르게 읽으면
 * 검사가 자기가 만든 결과를 오판한다(정규식 `[^)]+` 가 `rgba(…)` 에서 정확히 그랬다).
 */
function* wiredFallbacks(): Generator<[string, string, string]> {
  for (const rel of globSync('src/**/*.ts', { cwd: root }))
    for (const { name, literal } of parseFallbacks(read(rel)) as Iterable<{
      name: string;
      literal: string;
    }>)
      yield [name, literal, rel];
}

const isSystemFallback = (literal: string) => SYSTEM_FALLBACK.pattern.test(literal);
