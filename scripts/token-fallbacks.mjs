// 시트 토큰 참조에 **use-site 리터럴 폴백**을 배선한다 — `var(--u-X)` → `var(--u-X, #212121)`.
//
// 왜 필요한가: 소비자가 토큰 시트(`styles/tokens.css`)를 로드하지 않으면 `var(--u-X)` 는
// 무효가 되어 해당 선언이 통째로 버려진다. 텍스트가 안 보이고 테두리가 사라지는 식으로
// 화면이 깨진다. 폴백이 있으면 시트 없이도 기본 테마로 렌더된다.
//
// ⚠**`@property` 로 대체할 수 없다**(조사 완료 — 재검토 불필요). `initial-value` 는
// 상속을 유지하며 기본값을 주는 이상적 메커니즘처럼 보이지만, `@property` 는 **섀도 루트
// 안에서 무시되고 document 스코프에만 등록된다**(전 브라우저). 우리 컴포넌트는 섀도 시트로
// 스타일을 싣기 때문에 document 시트를 로드해야 하는데, **그 시트의 부재가 바로 막으려는
// 상황**이라 순환이다. use-site `var(--token, literal)` 이 CSS 가 주는 유일한 수단이다.
//
// 스테일 위험(리터럴이 시트 값과 어긋남)은 `tests/build/token-fallbacks.test.ts` 의
// 대조 테스트가 막는다 — 그래서 폴백은 **손으로 쓰지 않고 생성한다.**
//
//   node scripts/token-fallbacks.mjs                 # 계획만 출력(dry-run)
//   node scripts/token-fallbacks.mjs --write         # 전 토큰 배선
//   node scripts/token-fallbacks.mjs --write --token=--u-border-color,--u-bg-color
//
// ★배선은 **토큰 단위**로 나눌 수 있다(`--token`). use-site 단위로 자르면 중단 시
// "일부 화면만 폴백을 가진" 상태가 되지만, 토큰 단위면 "이 토큰들은 시트 없이도 렌더된다"
// 는 일관된 상태로 끊긴다.
import { readFileSync, writeFileSync, globSync } from 'fs';
import { join } from 'path';

const SHEET = 'src/assets/styles/light.css';
const SOURCE_GLOB = 'src/**/*.ts';

/**
 * ★정본 시트는 **light** 다.
 *
 * 색 토큰은 여백·반경과 달리 **테마 변형**이다(`--u-blue-600` = `#1E88E5` light /
 * `#2A659D` dark). use-site 리터럴은 둘 중 하나만 구울 수 있다. light 를 고르는 이유는
 * **시트 부재 = 테마 미적용**이기 때문이다 — 폴백이 발동하는 상황에는 `color-scheme` 도
 * `prefers-color-scheme` 매핑도 없으므로, 기본 테마의 값이 유일하게 정합한 선택이다.
 * (이것은 도출이 아니라 결정이다 — `DL-123-1`.)
 */
export const CANONICAL_SHEET = 'light';

/** 폴백을 배선하지 않는 토큰. 이유는 각 항목에 적는다. */
export const EXCLUDED = new Map([
  // 폰트 스택은 리터럴이 100자를 넘는다. 모든 use-site 에 굽으면 소스가 읽을 수 없게 되고,
  // 시트가 없을 때의 실피해도 다르다 — 폰트는 **UA 기본으로 폴백해도 화면이 깨지지 않는다**
  // (색/테두리는 깨진다). 비용은 확실하고 이득은 미감 수준이라 제외한다.
  ['font', '리터럴 100자 초과 · 시트 부재 시 UA 기본으로 안전하게 대체됨'],
]);

const isExcluded = name => {
  for (const [key] of EXCLUDED) if (name.startsWith(`--u-${key}-`)) return true;
  return false;
};

/**
 * ★**시스템 색 폴백은 리터럴 폴백과 다른 전략이고, 둘 다 정당하다.**
 *
 * `Canvas`/`CanvasText` 는 OS 테마를 따라가므로 시트 부재 시 **다크 환경에서도 맞다** —
 * light 리터럴이 못 하는 일이다. 그래서 이미 그렇게 배선된 곳(드로어·대화상자 패널,
 * `UElement` 의 텍스트/폰트)은 **덮어쓰지 않는다.**
 *
 * 그런데도 이 전략을 412곳으로 확대하지 않는 이유는 **팔레트가 관계적**이기 때문이다.
 * 시스템 색 등가물이 있는 토큰은 10여 개뿐이고(`Canvas`·`CanvasText`·`Field`·`GrayText`…),
 * 나머지 ~95개(팔레트 shade 전부, 역할 5단×5역할)에는 없다. 섞으면 경계가 **대비쌍을
 * 가로지른다** — `--u-bg-color`=`Canvas`(다크에서 검정)인데 `--u-txt-color-weak`=`#9E9E9E`
 * (흰 배경 기준 중간 회색)면 읽을 수 없고, 두 토큰은 서로가 전략을 바꿨다는 것을 모른다.
 *
 * ⇒ 경로가 아니라 **값**으로 판정한다. 파일이 이동해도 판정이 따라오고, 같은 전략을
 * 새로 쓰는 곳도 자동으로 인정된다. 확산은 테스트의 기준선이 감시한다.
 */
export const SYSTEM_FALLBACK = {
  pattern: /^(inherit|currentColor|Canvas|CanvasText|Field|FieldText|GrayText|ButtonFace|ButtonText|color-mix\([^]*CanvasText[^]*\))$/,
  reason: 'OS 테마를 따라가는 시스템 색 — 시트 부재 시 다크 환경에서도 정합한다',
};

/**
 * `var(--u-X, <fallback>)` 을 **괄호 균형**으로 읽는다.
 *
 * ⚠정규식 `[^)]+` 로는 안 된다 — `rgba(0, 0, 0, 0.5)` 의 첫 `)` 에서 잘려
 * `rgba(0, 0, 0, 0.5` 를 폴백으로 읽는다. 그러면 대조 테스트가 **생성기 자신이 만든
 * 배선**을 불일치로 보고한다(그림자·오버레이·툴팁 배경이 전부 `rgba()` 다).
 */
export function* parseFallbacks(src) {
  const open = /var\(\s*(--u-[\w-]+)\s*,\s*/g;
  let m;
  while ((m = open.exec(src))) {
    const start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    for (; i < src.length && depth > 0; i++) {
      if (src[i] === '(') depth++;
      else if (src[i] === ')' && --depth === 0) break;
    }
    // start/end 는 --refresh 가 리터럴만 정확히 갈아끼우기 위해 필요하다.
    // 문자열 치환으로는 안 된다 — 같은 `var(--u-x, #ABC)` 가 파일 안에 여러 번 나오고,
    // 그중 일부만 갱신 대상인 경우를 구별할 수 없다.
    yield { name: m[1], literal: src.slice(start, i).trim(), start, end: i };
  }
}

/** `--name: value;` 선언을 맵으로. */
function declarations(css) {
  return new Map(
    [...css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)].map(m => [m[1], m[2].trim()]),
  );
}

/**
 * 토큰 값을 **리터럴이 될 때까지** 푼다.
 *
 * 역할 토큰 층(Cycle 108)이 생기면서 체인이 한 단 깊어졌다:
 *   `--u-txt-color-hover` → `var(--u-primary-color)` → `var(--u-blue-600)` → `#1E88E5`
 * 한 단만 풀면 폴백 자리에 또 `var()` 가 들어가 아무것도 해결되지 않는다.
 */
export function resolveTokens(css) {
  const decls = declarations(css);
  const resolved = new Map();

  const resolve = (name, seen = new Set()) => {
    if (resolved.has(name)) return resolved.get(name);
    if (seen.has(name)) return null; // 순환 — 시트 결함이다. 호출부가 보고한다.
    seen.add(name);

    const raw = decls.get(name);
    if (raw === undefined) return null;

    // 값 전체가 단일 `var(--x)` 인 경우에만 체인으로 본다. `rgba(0,0,0,.5)` 나
    // `1px solid var(--x)` 같은 합성 값은 그 자체가 리터럴이다.
    const chain = raw.match(/^var\(\s*(--[\w-]+)\s*\)$/);
    const value = chain ? resolve(chain[1], seen) : raw;
    if (value !== null) resolved.set(name, value);
    return value;
  };

  for (const name of decls.keys()) resolve(name);
  return resolved;
}

/**
 * 배선 계획을 만든다. 파일을 쓰지 않는다.
 *
 * 이미 폴백을 가진 참조(`var(--u-space-md, 12px)`)는 **건드리지 않는다** — 여백 축은
 * Cycle 118 이 이미 배선했고, 다시 쓰면 그 결정을 조용히 덮어쓴다.
 */
export function planFallbacks(root, { tokens } = {}) {
  const sheet = readFileSync(join(root, SHEET), 'utf-8');
  const literals = resolveTokens(sheet);
  const only = tokens && tokens.length ? new Set(tokens) : null;

  const edits = [];
  const skipped = { excluded: new Map(), unresolved: new Map() };

  for (const rel of globSync(SOURCE_GLOB, { cwd: root })) {
    const path = join(root, rel);
    const src = readFileSync(path, 'utf-8');
    const hits = [];

    for (const m of src.matchAll(/var\(\s*(--u-[\w-]+)\s*\)/g)) {
      const [text, name] = m;
      if (only && !only.has(name)) continue;
      if (isExcluded(name)) {
        skipped.excluded.set(name, (skipped.excluded.get(name) || 0) + 1);
        continue;
      }
      const literal = literals.get(name);
      if (!literal) {
        skipped.unresolved.set(name, (skipped.unresolved.get(name) || 0) + 1);
        continue;
      }
      hits.push({ text, name, literal, replacement: `var(${name}, ${literal})` });
    }

    if (hits.length) edits.push({ rel, path, hits });
  }

  return { literals, edits, skipped };
}

/**
 * **스테일 폴백 갱신** — 시트 값이 바뀌었을 때 이미 배선된 리터럴을 다시 굽는다.
 *
 * ★왜 별도 함수인가: `planFallbacks` 는 **폴백이 없는** 참조만 본다(그것이 옳다 —
 * 이미 배선된 자리를 다시 쓰면 Cycle 118 의 여백 결정을 조용히 덮어쓴다). 그 결과
 * *"폴백은 손으로 쓰지 말고 생성한다"* 는 원칙에 **갱신 경로가 없었다** — 역할 토큰
 * 매핑을 한 번 바꿀 때마다 수십 곳을 손으로 고쳐야 했고, 실제로 직전 릴리스에서
 * 19곳을 그렇게 고쳤다. 원칙의 절반만 구현돼 있었던 셈이다.
 *
 * 판정은 `tests/build/token-fallbacks.test.ts` 의 스테일 검사와 **같은 규칙**이다:
 * 시스템 색 폴백은 다른 전략이므로 건드리지 않고, 제외 토큰도 건드리지 않는다.
 */
export function refreshFallbacks(root, { tokens, write = false, sheet, sourceGlob } = {}) {
  // sheet 를 밖에서 줄 수 있는 이유: **소비 패키지도 같은 토큰의 폴백을 배선한다.**
  // 그쪽 리포에는 시트가 없으므로(이 패키지가 정본) 경로를 주입받아야 한다.
  // 생성기를 패키지마다 복사하면 `DL-125-1` 이 기록한 드리프트 면이 그만큼 늘어난다.
  const literals = resolveTokens(readFileSync(sheet ?? join(root, SHEET), 'utf-8'));
  const only = tokens && tokens.length ? new Set(tokens) : null;
  const stale = [];

  for (const rel of globSync(sourceGlob ?? SOURCE_GLOB, { cwd: root })) {
    const path = join(root, rel);
    const src = readFileSync(path, 'utf-8');
    const hits = [...parseFallbacks(src)].filter(({ name, literal }) => {
      if (only && !only.has(name)) return false;
      if (isExcluded(name)) return false;
      if (SYSTEM_FALLBACK.pattern.test(literal)) return false;
      const expected = literals.get(name);
      return expected !== undefined && expected !== literal;
    });
    if (!hits.length) continue;

    for (const h of hits) stale.push({ rel, name: h.name, from: h.literal, to: literals.get(h.name) });

    if (write) {
      // 뒤에서부터 잘라 붙인다 — 앞에서 하면 뒤 항목의 인덱스가 밀린다.
      let out = src;
      for (const h of [...hits].reverse()) {
        out = out.slice(0, h.start) + literals.get(h.name) + out.slice(h.end);
      }
      writeFileSync(path, out, 'utf-8');
    }
  }
  return stale;
}

export function applyFallbacks(root, options = {}) {
  const plan = planFallbacks(root, options);
  for (const { path, hits } of plan.edits) {
    let src = readFileSync(path, 'utf-8');
    // 같은 토큰이 한 파일에 여러 번 나온다 — 전역 치환이 맞다. 폴백을 이미 가진 참조는
    // 정규식(`var(--u-x)` 정확 일치)에 걸리지 않으므로 이중 배선되지 않는다.
    for (const { text, replacement } of hits) src = src.split(text).join(replacement);
    writeFileSync(path, src, 'utf-8');
  }
  return plan;
}

// ── CLI ──────────────────────────────────────────────────────────────────────
const invokedDirectly = process.argv[1]?.endsWith('token-fallbacks.mjs');
if (invokedDirectly) {
  const root = process.cwd();
  const write = process.argv.includes('--write');
  const tokenArg = process.argv.find(a => a.startsWith('--token='));
  const tokens = tokenArg ? tokenArg.slice('--token='.length).split(',').filter(Boolean) : null;

  // --refresh: 배선이 아니라 **갱신**. 시트 값이 바뀐 뒤 스테일 리터럴을 다시 굽는다.
  if (process.argv.includes('--refresh')) {
    const stale = refreshFallbacks(root, { tokens, write });
    console.log(`${write ? '갱신' : '갱신 계획'}: ${stale.length}곳`);
    const byToken = new Map();
    for (const s of stale) {
      const e = byToken.get(s.name) || { count: 0, from: s.from, to: s.to };
      e.count++;
      byToken.set(s.name, e);
    }
    for (const [name, e] of [...byToken].sort((a, b) => b[1].count - a[1].count))
      console.log(`  ${String(e.count).padStart(3)}  ${name.padEnd(32)} ${e.from} → ${e.to}`);
    if (!write && stale.length) console.log('\n--write 를 붙이면 적용된다.');
    process.exit(0);
  }

  const plan = write
    ? applyFallbacks(root, { tokens })
    : planFallbacks(root, { tokens });

  const byToken = new Map();
  for (const { hits } of plan.edits)
    for (const h of hits) {
      const e = byToken.get(h.name) || { count: 0, literal: h.literal };
      e.count++;
      byToken.set(h.name, e);
    }

  const total = [...byToken.values()].reduce((s, e) => s + e.count, 0);
  console.log(`${write ? '배선' : '계획'}: ${total}곳 / ${byToken.size}토큰 / ${plan.edits.length}파일`);
  for (const [name, e] of [...byToken].sort((a, b) => b[1].count - a[1].count))
    console.log(`  ${String(e.count).padStart(3)}  ${name.padEnd(32)} ${e.literal}`);

  for (const [label, map] of [['제외', plan.skipped.excluded], ['해석 실패', plan.skipped.unresolved]])
    if (map.size) {
      console.log(`\n${label}: ${[...map.values()].reduce((a, b) => a + b, 0)}곳 / ${map.size}토큰`);
      for (const [name, count] of map) console.log(`  ${String(count).padStart(3)}  ${name}`);
    }
}
