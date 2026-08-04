/**
 * **브랜드 악센트 시드 → 역할 램프 파생.**
 *
 * 소비자가 시드 색 하나를 주면 `--u-primary-*` 5단과 그 면 위의 글자색을 계산한다.
 * 종전에는 소비자가 램프를 **손으로 열 줄 적었고**, 그 값들이 대비 계약을 만족하는지는
 * 아무것도 확인하지 않았다.
 *
 * ## 🔴 왜 CSS 만으로 하지 않는가 — 실측이 정한 것이다
 *
 * `color-mix()` 로 고정 비율만 섞으면 **밝은 시드에서 계약이 깨진다** — 노랑 시드의
 * `-strong` 이 바탕 대비 **2.21**(기준 4.5)이었다. 목표 대비까지 섞으려면 **대비를 계산**
 * 해야 하고 CSS 에는 그 수단이 없다. ⇒ 계산은 JS 가 하고, 결과만 커스텀 프로퍼티로 넣는다.
 *
 * ## ⚠ 두 목표를 «동시에» 건다
 *
 * 대비만 목표로 삼으면 시드가 이미 4.5 를 넘을 때 탐색이 **시드 자신에서 멈춰**
 * `-strong` 과 `-color` 가 같은 값이 된다(실측: 5역할 중 4). 그러면 계약은 만족하는데
 * **위계가 사라진다.** 그래서 «바탕과 4.5» 와 «`-color` 와 1.20» 을 함께 만족시킨다.
 *
 * ## 방향은 «바탕 기준»이다 — 라이트/다크가 같은 코드로 돈다
 *
 * `-strong` 은 바탕에서 **멀어지는** 쪽(라이트면 검정, 다크면 흰색), `-weak` 이하는 바탕에
 * **가까워지는** 쪽이다. 다크 시트가 팔레트를 반전시켜 놓은 것과 같은 방향이다.
 */

/** 역할 램프 한 벌. 시트의 `--u-{role}-color-*` 와 이름이 1:1 이다. */
export interface AccentRamp {
  weakest: string;
  weaker: string;
  weak: string;
  color: string;
  strong: string;
  /** 면(`color`) 위에 놓이는 글자색 — `--u-{role}-txt-color`. */
  txt: string;
}

/** 대비 계약의 문턱값 — `tests/build/token-contrast.test.ts` 와 같은 값이다. */
export const AA_TEXT = 4.5;
export const AA_GRAPHIC = 3.0;
/** `-strong` 이 `-color` 와 갈려 보이기 위한 최소 대비(2026-08-04 채택). */
export const MIN_STEP_SEPARATION = 1.2;

const clamp = (v: number) => Math.min(255, Math.max(0, v));
const channelLum = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

/** `#rgb`·`#rrggbb`·`rgb(r g b)` 를 [r,g,b] 로. 해석할 수 없으면 `null`. */
export function parseColor(value: string): [number, number, number] | null {
  const v = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, c => c + c) : hex[1];
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(v);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

export function toHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map(v => Math.round(clamp(v)).toString(16).padStart(2, '0')).join('');
}

export function luminance(color: string): number {
  const rgb = parseColor(color);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map(v => channelLum(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.1 명암비. */
export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** `color-mix(in srgb, a p%, b)` 와 같은 계산. */
export function mix(a: string, b: string, p: number): string {
  const [x, y] = [parseColor(a), parseColor(b)];
  if (!x || !y) return a;
  return toHex([0, 1, 2].map(i => x[i] * p + y[i] * (1 - p)) as [number, number, number]);
}

/** 면 위의 글자를 고른다 — 검정/흰색 중 대비가 큰 쪽. */
export function pickOnColor(surface: string): string {
  return contrast(surface, '#000000') >= contrast(surface, '#ffffff') ? '#000000' : '#ffffff';
}

/**
 * 시드에서 `--u-primary-*` 램프를 만든다.
 *
 * @param seed 브랜드 색
 * @param bg   그 램프가 놓일 바탕(`--u-bg-color`) — 라이트/다크가 이 값 하나로 갈린다
 */
const STEP = 0.02;

/**
 * `from` 에서 `target` 쪽으로 조금씩 옮기며 **조건을 만족하는 첫 색**을 돌려준다.
 * 못 찾으면 `null` — 호출부가 반대 방향을 시도한다.
 */
function towards(from: string, target: string, ok: (c: string) => boolean): string | null {
  for (let p = 1; p >= 0; p -= STEP) {
    const c = mix(from, target, p);
    if (ok(c)) return c;
  }
  return null;
}

export function deriveAccentRamp(seed: string, bg: string): AccentRamp {
  const light = luminance(bg) > 0.5;
  const away = light ? '#000000' : '#ffffff'; // 바탕에서 멀어지는 방향
  const near = light ? '#ffffff' : '#000000'; // 바탕에 가까워지는 방향

  /**
   * 🔴**방향은 항상 «바탕에서 멀어지는 쪽»이 아니다 — 실측이 이 폴백을 만들게 했다.**
   *
   *   `#F5F5F5` 시드 + 다크 바탕 → `-strong` 을 흰색 쪽으로 밀어도 **구분 1.09** 가 한계다
   *                                 (시드가 이미 거의 흰색이다) ⇒ 반대로 «어둡게» 가야 갈린다
   *   `#6A1B9A` 시드 + 다크 바탕 → `-weak` 이 바탕 쪽으로는 그래픽 3.0 을 못 낸다
   *
   * ⇒ 한 방향을 시도하고 실패하면 **반대 방향**을 본다. 두 방향 다 실패하는 것만 극단값으로
   *   떨어뜨린다.
   */
  const either = (from: string, ok: (c: string) => boolean, first: string, second: string) =>
    towards(from, first, ok) ?? towards(from, second, ok);

  // ⑴ 면(`-color`): 그 위의 글자가 AA 를 받도록 — 대부분의 브랜드 색은 이미 통과한다.
  const color =
    either(seed, c => contrast(c, pickOnColor(c)) >= AA_TEXT, away, near) ?? seed;

  // ⑵ 글자(`-strong`): 바탕과 AA **이면서** 면과 최소 구분 — 두 목표를 동시에.
  const strongOk = (c: string) =>
    contrast(c, bg) >= AA_TEXT && contrast(c, color) >= MIN_STEP_SEPARATION;
  const strong = either(color, strongOk, away, near) ?? away;

  // ⑶ 그래픽(`-weak`): 바탕 쪽으로 **가장 옅게** 하되 비텍스트 3.0 을 유지한다.
  //    시드 자체가 3.0 을 못 내면(밝은 노랑 on 흰 바탕) 멀어지는 쪽에서 최소치를 찾는다.
  let weak: string;
  if (contrast(color, bg) >= AA_GRAPHIC) {
    weak = color;
    for (let p = 1; p >= 0; p -= STEP) {
      const candidate = mix(color, bg, p);
      if (contrast(candidate, bg) < AA_GRAPHIC) break;
      weak = candidate;
    }
  } else {
    weak = towards(color, away, c => contrast(c, bg) >= AA_GRAPHIC) ?? away;
  }

  // ⑷ 장식 단: 남은 거리를 나눈다. 대비 요구가 없는 자리(연한 면·버퍼)다.
  return {
    weakest: mix(weak, bg, 0.25),
    weaker: mix(weak, bg, 0.5),
    weak,
    color,
    strong,
    txt: pickOnColor(color),
  };
}

/** 램프를 커스텀 프로퍼티 이름 → 값 맵으로. */
export function accentCustomProperties(ramp: AccentRamp, role = 'primary'): Record<string, string> {
  return {
    [`--u-${role}-color-weakest`]: ramp.weakest,
    [`--u-${role}-color-weaker`]: ramp.weaker,
    [`--u-${role}-color-weak`]: ramp.weak,
    [`--u-${role}-color`]: ramp.color,
    [`--u-${role}-color-strong`]: ramp.strong,
    [`--u-${role}-txt-color`]: ramp.txt,
  };
}
