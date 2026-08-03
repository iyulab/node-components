import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';

/**
 * 역할 토큰 대비 계약 (WCAG 2.1)
 *
 * ★**왜 이 검사가 생겼는가 — 세 번 같은 형태로 틀렸다.**
 *
 *   ⑴ `--u-txt-color-weak` 가 흰 바탕 대비 2.68 로 AA 미달이었다(4회 관측 후 수정).
 *   ⑵ `shade-600` 위의 흰 글자가 **8색 중 6색** 미달이었다(라이트만).
 *   ⑶ 그리고 이 검사를 쓰면서: 위 둘을 잡은 실측이 전부 **한 방향만** 재고 있었다.
 *      *"다크는 8/8 통과"* 는 **면 위의 흰 글자**에 대해 참이었고, 같은 토큰이 **바탕
 *      위의 글자**로 쓰일 때는 `--u-primary-color` 3.07 · `--u-danger-color` 2.74 로
 *      미달이었다. 아무도 그 방향을 재지 않았다.
 *
 * ⇒ 색 하나를 재는 것으로는 토큰이 안전한지 알 수 없다. **조합**을 재야 하고, 조합은
 *   테마마다 다르다. 그래서 이 파일은 값이 아니라 **(전경, 배경, 기준)** 표를 단언한다.
 *
 * ## 왜 라이트와 다크가 다른 단을 요구하는가 (구조적 이유)
 *
 *   라이트: 바탕 `--u-bg-color` = 흰색 · 유채색 면 위의 글자 `--u-*-txt-color` = 흰색
 *           ⇒ 두 요구가 **같은 조건**(`contrast(shade, #FFF) ≥ 4.5`) — 한 단이 둘 다 맡는다.
 *   다크:   바탕 = `#121212` · on-color = 흰색
 *           ⇒ 두 요구가 **정반대 방향**. 바탕에서 읽히는 밝은 단은 흰 글자를 못 받고,
 *             흰 글자를 받는 어두운 단은 바탕에서 안 읽힌다. **한 단이 둘 다 맡을 수 없다.**
 *
 *   ⇒ 그래서 단마다 **용도를 확정**한다(아래 계약). 시트 주석의 *"용도는 소비처가 정한다"*
 *     는 대비 요구가 용도마다 다르다는 사실과 양립하지 않는다 — 강도 축은 유지하되,
 *     각 단이 **무엇을 보장하는지**를 명시하는 것이 이 계약의 내용이다.
 *
 * ## 단별 계약
 *
 *   | 단              | 용도                                   | 기준 |
 *   |-----------------|----------------------------------------|------|
 *   | `--u-*-bg-color`| **연한 면** (알림 배경 등)             | 본문 4.5 · `-strong` 아이콘 3.0 |
 *   | `-weakest`      | 연한 **그래픽** (진행바 버퍼 등)       | — |
 *   | `-weaker`       | 면 위의 테두리                         | (todo ⑶ 참조) |
 *   | `-weak`         | 바탕 위의 그래픽 (진행바·별점·포커스링) | 3.0 (todo ⑵ — 다크 미달) |
 *   | `-color`        | **면** — `--u-*-txt-color` 를 받는다    | on-color 4.5 |
 *   | `-strong`       | **글자·아이콘** — 바탕 위               | 4.5 |
 *
 *   ★**면과 그래픽을 한 단에 겹쳐 둔 것이 알림 결함의 원인이었다.** `-weakest` 는
 *     진행바 버퍼(그래픽)에도 알림 배경(면)에도 쓰였는데, 그래픽으로 보이려면 진해야 하고
 *     면으로 쓰이려면 옅어야 한다. 라이트 shade-200 은 그래픽 쪽에 맞춰져 있었고 그 위의
 *     아이콘이 4/4 미달이었다. 면은 `--u-*-bg-color` 로 분리했다.
 *
 *   ⚠`-weak`·`-weaker` 는 아직 계약을 만족하지 않는다. 이 파일은 **만족하는 것만 단언**하고
 *     나머지는 아래 `todo` 블록에 측정값과 함께 남긴다 — 통과하지 않는 단언을 넣어
 *     검사를 빨갛게 두면 검사 전체가 무시된다.
 */

const root = resolve(__dirname, '../..');
const AA_TEXT = 4.5;
const AA_NONTEXT = 3.0;

type Theme = 'light' | 'dark';

/** 시트의 `--x: value` 를 전부 읽어 `var()` 체인을 hex 까지 해석한다 */
function loadTokens(theme: Theme): Record<string, string> {
  const css = readFileSync(join(root, 'src/assets/styles', `${theme}.css`), 'utf-8');
  const raw: Record<string, string> = {};
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) raw[m[1]] = m[2].trim();

  const seen = new Set<string>();
  const resolveToken = (name: string): string => {
    if (seen.has(name)) throw new Error(`토큰 순환 참조: ${name}`);
    const value = raw[name];
    if (value === undefined) throw new Error(`${theme}.css 에 없는 토큰: ${name}`);
    const ref = value.match(/^var\((--[\w-]+)\)$/);
    if (!ref) return value;
    seen.add(name);
    try {
      return resolveToken(ref[1]);
    } finally {
      seen.delete(name);
    }
  };
  return new Proxy({} as Record<string, string>, { get: (_, k: string) => resolveToken(k) });
}

const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

function luminance(hex: string): number {
  const m = hex.trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) throw new Error(`hex 가 아닌 값: ${hex}`);
  const n = parseInt(m[1], 16);
  return (
    0.2126 * channel(((n >> 16) & 255) / 255) +
    0.7152 * channel(((n >> 8) & 255) / 255) +
    0.0722 * channel((n & 255) / 255)
  );
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const ROLES = ['primary', 'info', 'success', 'warning', 'danger'] as const;

/** 소수 2자리로 끊어 보고 — 실패 메시지가 실측값을 그대로 담아야 다음 사람이 다시 재지 않는다 */
const show = (n: number) => n.toFixed(2);

describe('역할 토큰 대비 계약', () => {
  for (const theme of ['light', 'dark'] as Theme[]) {
    describe(theme, () => {
      const t = loadTokens(theme);

      it('`-strong` 은 바탕 위에서 본문 글자로 읽힌다 (AA 4.5)', () => {
        // 1.16.0 에서는 라이트 warning 이 제외돼 있었다(yellow-700 = 1.66). 1.17.0 이
        // 그 단을 yellow-1000 으로 옮기면서 **제외가 사라졌다** — 5역할 전부 단언한다.
        const fails: string[] = [];
        for (const role of ROLES) {
          const c = contrast(t[`--u-${role}-color-strong`], t['--u-bg-color']);
          if (c < AA_TEXT) fails.push(`--u-${role}-color-strong ${t[`--u-${role}-color-strong`]} on ${t['--u-bg-color']} = ${show(c)}`);
        }
        expect(fails).toEqual([]);
      });

      it('`-color` 면 위에서 on-color 글자가 읽힌다 (AA 4.5)', () => {
        const fails: string[] = [];
        for (const role of ROLES) {
          const fg = t[`--u-${role}-txt-color`];
          const c = contrast(fg, t[`--u-${role}-color`]);
          if (c < AA_TEXT) fails.push(`--u-${role}-txt-color ${fg} on --u-${role}-color ${t[`--u-${role}-color`]} = ${show(c)}`);
        }
        expect(fails).toEqual([]);
      });

      it('중립 텍스트 토큰이 **표면 3종** 위에서 AA 를 받친다 (weak 는 아래 참조)', () => {
        // ★1.19.0 이전에는 기준면이 `--u-bg-color` 하나였다. 그 사이 면 축이 늘었는데
        //   (`-raised` 는 1.18.0 신설) **검사의 곱집합은 늘리지 않았다** — 축을 추가하면서
        //   그 축과 기존 축의 교차를 재지 않은 것이다. 소비앱이 카드 위 보조 텍스트에서
        //   그것을 먼저 밟았다(라이트 4.41 · 다크 4.16).
        //
        //   `-weak` 는 base 만 단언한다. raised·active 는 현재 미달이며 값을 고치는 것이
        //   **게시된 전 컴포넌트의 보조 텍스트를 움직이는** 사람 판단이라, 아래 핀 블록 ⑷ 에
        //   측정값으로 고정해 두고 감시한다.
        const SURFACES = ['--u-bg-color', '--u-bg-color-raised', '--u-bg-color-active'];
        const fails: string[] = [];
        for (const token of ['--u-txt-color', '--u-txt-color-strong']) {
          for (const surface of SURFACES) {
            const c = contrast(t[token], t[surface]);
            if (c < AA_TEXT) fails.push(`${token} ${t[token]} on ${surface} ${t[surface]} = ${show(c)}`);
          }
        }
        const weak = contrast(t['--u-txt-color-weak'], t['--u-bg-color']);
        if (weak < AA_TEXT)
          fails.push(`--u-txt-color-weak ${t['--u-txt-color-weak']} on --u-bg-color = ${show(weak)}`);
        expect(fails).toEqual([]);
      });

      it('유채색 표면 토큰 위에서 본문이 읽힌다 (AA 4.5)', () => {
        const fails: string[] = [];
        for (const role of ROLES) {
          const surface = `--u-${role}-bg-color`;
          const c = contrast(t['--u-txt-color'], t[surface]);
          if (c < AA_TEXT) fails.push(`--u-txt-color on ${surface} ${t[surface]} = ${show(c)}`);
        }
        expect(fails).toEqual([]);
      });

      it('유채색 표면 위에서 **그 역할의 글자**도 읽힌다 (AA 4.5)', () => {
        // 위 단언은 그 면 위의 **본문**(중립)을 재고, 이건 같은 면 위의 **유채색 글자**를
        // 잰다 — u-tag 의 surface/filled variant 가 쓰는 실제 조합이다(1.19.0 역할 축).
        // 태그는 의미를 색으로도 전달하므로 중립 본문으로 대체할 수 없다. 두 조합의
        // 요구가 다르므로 단언도 둘이다.
        const fails: string[] = [];
        for (const role of ROLES) {
          const fg = `--u-${role}-color-strong`;
          const surface = `--u-${role}-bg-color`;
          const c = contrast(t[fg], t[surface]);
          if (c < AA_TEXT) fails.push(`${fg} ${t[fg]} on ${surface} ${t[surface]} = ${show(c)}`);
        }
        expect(fails).toEqual([]);
      });

      it('★상태 아이콘이 그 상태의 면 위에서 보인다 (비텍스트 3.0)', () => {
        // u-alert 의 실제 조합이다: --alert-icon-color(-strong) on --alert-background-color.
        // 1.16.0 까지 알림 배경이 `-weakest`(라이트 shade-200)였고 라이트 4/4 미달이었다.
        // 이 단언이 그 자리를 지킨다 — 배경을 다시 진하게 만들면 여기서 걸린다.
        const fails: string[] = [];
        for (const role of ROLES) {
          if (role === 'primary') continue; // 상태가 아니다 (알림에 primary 는 없다)
          const [fg, bg] = [t[`--u-${role}-color-strong`], t[`--u-${role}-bg-color`]];
          const c = contrast(fg, bg);
          if (c < AA_NONTEXT) fails.push(`--u-${role}-color-strong ${fg} on --u-${role}-bg-color ${bg} = ${show(c)}`);
        }
        expect(fails).toEqual([]);
      });

      it('★입력 상태 테두리가 입력면 위에서 보인다 (비텍스트 3.0)', () => {
        // 여기만 테두리를 잰다 — 1.4.11 은 *상태를 식별하는 데 필요한* 경계를 요구하고,
        // focus/invalid 는 정확히 그것이다("여기 입력한다" · "이 값이 틀렸다").
        // 카드 경계·구분선은 장식이라 대상이 아니다(아래 todo ⑶ 이 그 자리를 지킨다).
        //
        // ⚠**바탕이 아니라 입력면 위에서 잰다.** 테두리는 입력 상자를 두르므로 실제로
        // 인접한 것은 `--u-input-bg-color` 다 — 다크에서 둘이 다르다(neutral-200 vs 바탕).
        const fails: string[] = [];
        for (const token of ['--u-input-border-color-focus', '--u-input-border-color-invalid']) {
          const c = contrast(t[token], t['--u-input-bg-color']);
          if (c < AA_NONTEXT)
            fails.push(`${token} ${t[token]} on --u-input-bg-color ${t['--u-input-bg-color']} = ${show(c)}`);
        }
        expect(fails).toEqual([]);
      });

      it('★바탕 위 그래픽(-strong)이 바탕에서도 트랙 위에서도 보인다 (비텍스트 3.0)', () => {
        // 포커스 링 · 진행바 · 별점 · 스플리터가 읽는 단이다. 두 표면을 모두 재는 이유는
        // 진행바가 **트랙 위에** 그려지기 때문이다(바탕만 재면 그 자리를 놓친다).
        // 1.20.0 이전에는 이 자리들이 `-weak` 였고 트랙 위에서 10칸 중 9칸이 미달이었다.
        const SURFACES = ['--u-bg-color', '--u-neutral-200'];
        const fails: string[] = [];
        for (const role of ROLES) {
          const fg = `--u-${role}-color-strong`;
          for (const surface of SURFACES) {
            const c = contrast(t[fg], t[surface]);
            if (c < AA_NONTEXT) fails.push(`${fg} ${t[fg]} on ${surface} ${t[surface]} = ${show(c)}`);
          }
        }
        expect(fails).toEqual([]);
      });

      it('아이콘 토큰이 바탕 위에서 보인다 (비텍스트 3.0)', () => {
        // 테두리는 여기 없다 — 아래 todo ⑶ 참조. 아이콘은 의미를 나르므로 1.4.11 대상이
        // 명확하지만, 테두리는 무엇이 "UI 컴포넌트 경계"인지가 판단을 요구한다.
        const fails: string[] = [];
        for (const token of ['--u-icon-color']) {
          const c = contrast(t[token], t['--u-bg-color']);
          if (c < AA_NONTEXT) fails.push(`${token} ${t[token]} on ${t['--u-bg-color']} = ${show(c)}`);
        }
        expect(fails).toEqual([]);
      });
    });
  }

  it('★아직 계약을 만족하지 못하는 조합 — 측정값을 고정해 둔다', () => {
    // 이 단언은 **현재의 미달 상태를 기록**한다. 고쳐지면 여기서 실패하므로,
    // 그때 값을 지우고 위 describe 블록으로 승격시키면 된다.
    // 통과하지 않는 단언을 위에 섞으면 검사 전체가 빨간 채로 무시된다 — 그것을 피한다.
    const light = loadTokens('light');
    const dark = loadTokens('dark');

    // ⑴ **해소됨** (1.17.0) — 알림이 `-weakest` 대신 면 토큰을 쓰게 되어 두 테마 4/4
    //    통과한다. 위 `상태 아이콘이 그 상태의 면 위에서 보인다` 로 승격됐다.
    //    다만 `-weakest` 자체는 여전히 면으로 쓰기엔 진하다 — 다른 컴포넌트가 그것을
    //    면으로 쓰기 시작하면 같은 결함이 재발한다. 값을 남겨 감시한다.
    const weakestAsSurface = Object.fromEntries(
      (['danger', 'warning', 'info', 'success'] as const).map(r => [
        r,
        Number(contrast(light[`--u-${r}-color-strong`], light[`--u-${r}-color-weakest`]).toFixed(2)),
      ]),
    );
    expect(weakestAsSurface, '라이트 -weakest 를 면으로 썼을 때의 아이콘 대비 (기준 3.0)').toEqual({
      danger: 2.61, warning: 6.14, info: 3.28, success: 4.79,
    });

    // ⑵ 다크 포커스링·그래픽(`-weak`)이 바탕 위에서 3.0 미달.
    //    ★이 자리는 단순 재매핑으로 못 고친다 — 다크에서 `-weak`(바탕 위 그래픽, 밝아야
    //    함)과 `-color`(흰 글자를 받는 면, 어두워야 함)이 **팔레트의 반대쪽**을 요구한다.
    //    강도 축 하나로는 표현되지 않으므로 사람 판단(새 축 신설 여부)이 필요하다.
    const weakOnBg = Number(contrast(dark['--u-primary-color-weak'], dark['--u-bg-color']).toFixed(2));
    expect(weakOnBg, '다크 --u-primary-color-weak on bg (기준 3.0)').toBe(2.31);

    // ⑶ **평상** 테두리 토큰 — 양 테마 모두 1.4.11(3.0) 미달. ★상태 테두리(focus·invalid)는
    //    1.19.0 에서 `-strong` 으로 옮겨 해소됐고 위 describe 블록으로 승격됐다. 남은 것은
    //    카드 경계·구분선이며 **성격이 다르다**: 1.4.11 은 *상태를 식별하는 데 필요한* 경계만
    //    요구하므로 장식 구분선은 애초에 대상이 아니다.
    //    ⚠그리고 *"`-strong` 단으로 올리면 통과한다"* 는 **틀렸다** — 아래 값이 보여주듯
    //    `-strong` 자체가 미달이다. 통과하려면 `neutral-600`(라이트 4.61 · 다크 3.27 =
    //    보조 텍스트와 같은 진하기)까지 가야 하고, 그것은 큰 시각 변경이다.
    const borders = {
      light: Number(contrast(light['--u-border-color-strong'], light['--u-bg-color']).toFixed(2)),
      dark: Number(contrast(dark['--u-border-color-strong'], dark['--u-bg-color']).toFixed(2)),
    };
    expect(borders, '--u-border-color-strong on bg (기준 3.0)').toEqual({ light: 1.88, dark: 2.40 });

    // ⑷ ★**보조 텍스트가 올림면 위에서 미달** — 두 테마 **같은 형태**다: 바탕에서는
    //    아슬하게 통과하고(라이트 4.61 = 여유 0.11) 면이 한 단 올라가면 떨어진다.
    //    `--u-bg-color-raised` 는 1.18.0 신설이므로 이 조합은 *"깨진 것"* 이 아니라
    //    **교차 검증된 적이 없는 새 조합**이다.
    //
    //    ⚠소비자에게 선택지가 없다: 위 단은 `--u-txt-color`(본문)뿐이라 그것을 쓰면
    //    보조 텍스트와 본문의 **위계가 사라진다**. ***읽히거나, 위계가 있거나*** 둘 중 하나다.
    //
    //    해소하려면 `--u-txt-color-weak` 를 양 테마에서 한 단씩 옮기면 된다(실측:
    //    라이트 neutral-700 → 세 면 6.19/5.93/5.34 · 다크 neutral-800 → 8.64/6.62/5.01,
    //    **6/6 통과**). 그런데 대가가 있다 — 보조↔본문 대비비가 **다크 2.33 → 1.46**,
    //    라이트 3.49 → 2.60 으로 줄어 위계가 약해진다. 그리고 이 토큰은 **1.15.0 에서
    //    이미 한 번 옮겼다**(neutral-500 → 600, 5패키지 50곳). 세 릴리스 만의 두 번째
    //    이동이므로 사람 판단으로 남긴다.
    //
    //    ⇒ 같은 리포의 `u-widgets` 는 이미 *"보조 텍스트는 표면 위에서 잰다"* 로 판정했다
    //    (`DL-146-2`). components 만 바탕 기준이라는 **비대칭이 이 핀의 실체**다.
    const weakOnSurfaces = {
      light: {
        raised: Number(contrast(light['--u-txt-color-weak'], light['--u-bg-color-raised']).toFixed(2)),
        active: Number(contrast(light['--u-txt-color-weak'], light['--u-bg-color-active']).toFixed(2)),
      },
      dark: {
        raised: Number(contrast(dark['--u-txt-color-weak'], dark['--u-bg-color-raised']).toFixed(2)),
        active: Number(contrast(dark['--u-txt-color-weak'], dark['--u-bg-color-active']).toFixed(2)),
      },
    };
    expect(weakOnSurfaces, '--u-txt-color-weak 를 올림면 위에 썼을 때 (기준 4.5)').toEqual({
      light: { raised: 4.41, active: 3.97 },
      dark: { raised: 4.16, active: 3.15 },
    });
  });
});
