// **시드 → 역할 램프 파생의 «재는 자리».**
//
// 소비앱 초안(`design-foundations` R6)이 요구한 것은 *"브랜드 시드 하나를 주면 역할 램프가
// 나온다"* 이다. 우리 시트에는 그 기제가 없다 — `color-mix` **0건**이고 역할 램프 5단이
// 팔레트 단(`--u-blue-700` …)에 **손으로 매핑**돼 있다.
//
// 🔴**그런데 파생식을 고르기 전에 답해야 할 질문이 있다**: 시트의 대비 보증은 지금
// `4.60 ✓ (600 은 3.68 ✗)` 같은 **손으로 잰 주석**이고, 계산된 램프는 그 보증을 이어받지
// 못한다. ⇒ 이 파일은 파생식을 **채택하지 않는다.** 후보 식이 «우리 대비 계약을 만족하는가»를
// 재는 자리만 만든다. 채택은 사람 결정(L2)이다.
//
//   node scripts/seed-ramp.mjs          # 현행 시트 vs 후보 파생식 대조표
//
// 대비 계약 — `tests/build/token-contrast.test.ts` 가 **역할 토큰에 대해 실제로 단언하는 둘**:
//   -color   면   → 그 역할의 `--u-{role}-txt-color` 와 4.5   (⚠흰색 고정이 아니다)
//   -strong  글자 → 바탕과 4.5
// (`-weak` 은 역할 토큰 계약이 아니다 — 중립 텍스트에만 있다. 첫 판이 그것을 넣었다가
//  현행 시트를 «3/5 미달»로 만들었다.)

const channel = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

export function luminance(hex) {
  const m = hex.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) throw new Error(`hex 가 아닌 값: ${hex}`);
  const n = parseInt(m[1], 16);
  return (
    0.2126 * channel(((n >> 16) & 255) / 255) +
    0.7152 * channel(((n >> 8) & 255) / 255) +
    0.0722 * channel((n & 255) / 255)
  );
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const toRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (rgb) =>
  '#' + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');

/** `color-mix(in srgb, seed p%, other)` 와 같은 계산. CSS 가 실제로 하는 것과 같은 공간이다. */
export function mix(seed, other, p) {
  const [a, b] = [toRgb(seed), toRgb(other)];
  return toHex(a.map((v, i) => v * p + b[i] * (1 - p)));
}

/**
 * 후보 파생식 — **가장 단순한 것부터 잰다.**
 * 시드를 흰색/검은색과 고정 비율로 섞어 5단을 만든다. 팔레트가 200/300/500/700/800 을
 * 고르는 관계를 근사한 것이다.
 */
export function deriveRamp(seed) {
  return {
    weakest: mix(seed, '#ffffff', 0.25),
    weaker: mix(seed, '#ffffff', 0.4),
    weak: mix(seed, '#ffffff', 0.75),
    color: seed,
    strong: mix(seed, '#000000', 0.8),
  };
}

/**
 * 후보 ② — **목표 대비까지 어둡게 섞는다.** 고정 비율(후보 ①)이 밝은 시드에서 실패하는
 * 것이 «식의 한계»인지 «비율의 한계»인지 가르기 위한 것이다. 0.02 단위로 훑는다(연속
 * 탐색이 필요할 만큼 정밀한 자리가 아니고, 눈으로 검산할 수 있는 편이 낫다).
 */
export function deriveStrong(seed, bg, min = 4.5) {
  for (let p = 1; p >= 0; p -= 0.02) {
    const c = mix(seed, '#000000', p);
    if (contrast(c, bg) >= min) return { value: c, ratio: Number(p.toFixed(2)) };
  }
  return { value: '#000000', ratio: 0 };
}

/**
 * 면 위의 글자를 «고른다» — 검정/흰색 중 대비가 큰 쪽.
 *
 * 🔴**이것이 파생식의 숨은 절반이다.** 시트는 역할마다 `--u-{role}-txt-color` 를 **손으로**
 * 정해 두었고(경고는 검정, 나머지는 흰색), 시드에서 램프를 계산하려면 그 선택도 계산해야
 * 한다. *"시드 하나면 된다"* 가 성립하려면 여기까지 파생돼야 한다.
 */
export function deriveOnColor(surface) {
  return contrast(surface, '#000000') >= contrast(surface, '#ffffff') ? '#000000' : '#ffffff';
}

/**
 * 계약 판정 — **시트가 실제로 단언하는 둘만 잰다.**
 *
 * ⚠**첫 판은 셋을 쟀고 현행 시트를 3/5 로 떨어뜨렸다.** 두 군데가 틀렸다:
 * ⑴`-color` 의 «면 위 글자»를 흰색으로 고정했다 — 실제로는 역할별 `--u-{role}-txt-color`
 *   이고 경고는 **검정**이다(그래서 노랑이 1.40 으로 «미달»로 보였다).
 * ⑵`-weak`(바탕 위 그래픽 3.0)를 역할 계약으로 셈했다 — 시트의 계약 테스트는 그것을
 *   **역할 토큰에 대해 단언하지 않는다**(중립 텍스트에만 있다).
 * ⇒ ***정당한 값에 발화하는 검사는 무시당한다*** — 이 리포가 검사기마다 반복 기록한 실패
 *   모드이고, 여기서는 «현행 시트가 known-good 이다»가 그 판별식이었다.
 */
export function evaluate(ramp, { bg = '#ffffff', onColor } = {}) {
  const fg = onColor ?? deriveOnColor(ramp.color);
  const rows = [
    { step: '-color(면 위 글자)', target: fg, min: 4.5, value: contrast(ramp.color, fg) },
    { step: '-strong(바탕)', target: bg, min: 4.5, value: contrast(ramp.strong, bg) },
  ];
  return { rows, onColor: fg, pass: rows.every((r) => r.value >= r.min) };
}

// ─── 대조표 출력 ────────────────────────────────────────────────────────────
import { readFileSync } from 'fs';

const ROLES = ['primary', 'info', 'success', 'warning', 'danger'];

function sheetMap(file) {
  const css = readFileSync(new URL(`../src/assets/styles/${file}`, import.meta.url), 'utf8');
  const map = {};
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) map[m[1]] = m[2].trim();
  const resolve = (v, depth = 0) => {
    const ref = v.match(/^var\((--[\w-]+)\)$/);
    if (!ref || depth > 8) return v;
    return resolve(map[ref[1]] ?? v, depth + 1);
  };
  return (name) => resolve(map[name] ?? '');
}

if (process.argv[1]?.endsWith('seed-ramp.mjs')) {
  const light = sheetMap('light.css');
  const bg = light('--u-bg-color');
  console.log(`\n라이트 바탕 = ${bg}\n`);
  console.log('역할       시드(-color)  현행 시트        후보 파생식      on-color(시트→파생)');
  console.log('─'.repeat(82));
  let sheetPass = 0, derivedPass = 0, onColorMatch = 0;
  for (const role of ROLES) {
    const seed = light(`--u-${role}-color`);
    const sheetOn = light(`--u-${role}-txt-color`);
    const current = { color: seed, strong: light(`--u-${role}-color-strong`) };
    const derived = deriveRamp(seed);

    const a = evaluate(current, { bg, onColor: sheetOn });
    const b = evaluate(derived, { bg });           // on-color 도 파생한다
    if (a.pass) sheetPass++;
    if (b.pass) derivedPass++;
    if (b.onColor.toLowerCase() === sheetOn.toLowerCase()) onColorMatch++;

    const fmt = (r) => r.rows.map(x => `${x.value.toFixed(2)}${x.value >= x.min ? '✓' : '✗'}`).join(' ');
    console.log(
      `${role.padEnd(10)} ${seed.padEnd(13)} ${fmt(a).padEnd(16)} ${fmt(b).padEnd(16)} ` +
      `${sheetOn} → ${b.onColor}${b.onColor.toLowerCase() === sheetOn.toLowerCase() ? '' : '  ⚠다르다'}`,
    );
  }
  console.log('─'.repeat(82));
  console.log(`통과: 현행 시트 ${sheetPass}/${ROLES.length} · 후보① 고정비율 ${derivedPass}/${ROLES.length}`
    + ` · on-color 일치 ${onColorMatch}/${ROLES.length}`);
  console.log('열 순서 = -color(면 위 글자 4.5) · -strong(바탕 4.5)\n');

  console.log('후보② — -strong 을 «목표 대비까지» 어둡게 섞는다');
  console.log('─'.repeat(82));
  let targeted = 0, sameStep = 0;
  for (const role of ROLES) {
    const seed = light(`--u-${role}-color`);
    const { value, ratio } = deriveStrong(seed, bg);
    const c = contrast(value, bg);
    const sheetStrong = light(`--u-${role}-color-strong`);
    if (c >= 4.5) targeted++;
    const sepDerived = contrast(value, seed);
    const sepSheet = contrast(sheetStrong, seed);
    if (sepDerived < 1.05) sameStep++;
    console.log(
      `${role.padEnd(10)} 시드 ${seed}  →  ${value} (시드 ${(ratio * 100).toFixed(0)}%)  `
      + `대비 ${c.toFixed(2)}${c >= 4.5 ? '✓' : '✗'}   시트값 ${sheetStrong} (${contrast(sheetStrong, bg).toFixed(2)})`
      + `   단 구분 ${sepDerived.toFixed(2)} vs 시트 ${sepSheet.toFixed(2)}`,
    );
  }
  console.log('─'.repeat(82));
  console.log(`통과: 후보② ${targeted}/${ROLES.length}`);
  console.log(`🔴그러나 «-strong == -color» 가 ${sameStep}/${ROLES.length} — 계약은 만족하는데 **단이 사라진다**\n`);
}

/**
 * 후보 ③ — **목표 둘을 동시에**: 바탕 대비 `minContrast` 이면서 `-color` 와 `minSep` 만큼 갈린다.
 *
 * 후보②(대비만)가 4역할에서 `-strong == -color` 를 만든 것이 이 함수의 존재 이유다.
 * 대비를 이미 만족하는 시드에서는 탐색이 시드 자신에서 멈추므로, **단 구분을 별도 목표로**
 * 걸어야 위계가 남는다.
 */
export function deriveStrong2(seed, bg, { minContrast = 4.5, minSep = 1.2 } = {}) {
  for (let p = 1; p >= 0; p -= 0.02) {
    const c = mix(seed, '#000000', p);
    if (contrast(c, bg) >= minContrast && contrast(c, seed) >= minSep)
      return { value: c, ratio: Number(p.toFixed(2)) };
  }
  return { value: '#000000', ratio: 0 };
}
