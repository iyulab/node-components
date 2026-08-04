import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
// @ts-expect-error — .mjs 유틸(타입 선언 없음). 이 파일이 그 계약을 대신 고정한다.
import { contrast, mix, deriveRamp, deriveStrong, deriveOnColor, evaluate } from '../../scripts/seed-ramp.mjs';

/**
 * **시드 → 램프 파생 «평가기»가 옳은가.**
 *
 * 이 파일은 파생식을 채택하지 않는다 — 채택은 사람 결정(L2)이다. 여기서 지키는 것은
 * ***"평가기가 현행 시트를 통과시키는가"*** 하나다.
 *
 * 🔴**그 판별식이 실제로 값을 냈다.** 평가기 첫 판이 현행 시트를 **3/5 미달**로 보고했고,
 * 원인은 시트가 아니라 평가기였다: ⑴`-color` 의 «면 위 글자»를 흰색으로 고정했는데
 * 경고는 **검정**이다 ⑵`-weak`(그래픽 3.0)을 역할 계약으로 셈했는데 시트의 계약 테스트는
 * 그것을 역할 토큰에 단언하지 않는다. ⇒ ***정당한 값에 발화하는 검사는 무시당한다.***
 */

const root = resolve(__dirname, '../..');
const ROLES = ['primary', 'info', 'success', 'warning', 'danger'] as const;

function sheet(file: string) {
  const css = readFileSync(join(root, 'src/assets/styles', file), 'utf-8');
  const map: Record<string, string> = {};
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) map[m[1]] = m[2].trim();
  const read = (name: string, depth = 0): string => {
    const v = map[name] ?? '';
    const ref = v.match(/^var\((--[\w-]+)\)$/);
    return ref && depth < 8 ? read(ref[1], depth + 1) : v;
  };
  return read;
}

describe('시드 → 램프 파생의 재는 자리', () => {
  it('🔴평가기는 현행 시트(known-good)를 5/5 통과시킨다', () => {
    const light = sheet('light.css');
    const bg = light('--u-bg-color');
    const fails: string[] = [];

    for (const role of ROLES) {
      const r = evaluate(
        { color: light(`--u-${role}-color`), strong: light(`--u-${role}-color-strong`) },
        { bg, onColor: light(`--u-${role}-txt-color`) },
      );
      if (!r.pass) fails.push(`${role}: ${r.rows.map((x: { step: string; value: number }) => `${x.step} ${x.value.toFixed(2)}`).join(' · ')}`);
    }
    expect(fails).toEqual([]);
  });

  it('on-color 선택은 계산으로 시트와 5/5 일치한다 (파생 가능한 축)', () => {
    const light = sheet('light.css');
    for (const role of ROLES) {
      expect(deriveOnColor(light(`--u-${role}-color`)).toLowerCase())
        .toBe(light(`--u-${role}-txt-color`).toLowerCase());
    }
  });

  it('mix 는 CSS color-mix(in srgb) 와 같은 계산이다 (경계값)', () => {
    expect(mix('#ffffff', '#000000', 1)).toBe('#ffffff');
    expect(mix('#ffffff', '#000000', 0)).toBe('#000000');
    expect(mix('#ffffff', '#000000', 0.5)).toBe('#808080');
  });

  it('🔴고정 비율 파생은 «밝은 시드»에서 계약을 깬다 — 이것이 T-E 의 실측이다', () => {
    const bg = '#ffffff';
    // 노랑 계열 시드: 검정과 80% 섞어도 바탕 대비 4.5 에 못 미친다.
    const yellow = evaluate(deriveRamp('#FDD835'), { bg });
    expect(yellow.pass).toBe(false);

    // 목표 대비까지 어둡게 섞으면 만족한다 ⇒ «식의 한계»가 아니라 «고정 비율의 한계»다.
    const targeted = deriveStrong('#FDD835', bg);
    expect(contrast(targeted.value, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('🔴그러나 목표 대비 탐색은 «단»을 없앤다 — 채택 전에 답해야 할 것', () => {
    const bg = '#ffffff';
    // primary 시드는 이미 4.5 를 넘으므로 탐색이 시드 자신에서 멈춘다 ⇒ -strong == -color.
    const t = deriveStrong('#1976D2', bg);
    expect(t.ratio).toBe(1);
    expect(contrast(t.value, '#1976D2')).toBeCloseTo(1, 2);
  });
});
