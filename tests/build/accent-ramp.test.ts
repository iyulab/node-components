import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import {
  deriveAccentRamp, accentCustomProperties, contrast, mix, pickOnColor, parseColor,
  AA_TEXT, AA_GRAPHIC, MIN_STEP_SEPARATION,
} from '../../src/utilities/accent.js';

/**
 * **시드 → 악센트 램프 파생의 계약.**
 *
 * 이 검사가 지키는 것은 *"파생된 값이 우리 대비 계약을 만족하는가"* 다 — 시트의 손 튜닝된
 * 값에는 `4.60 ✓` 같은 **손으로 잰 주석**이 붙어 있지만, 계산된 램프는 그 보증을 이어받지
 * 못한다(그 사실이 이 기능을 여기까지 미룬 잠금이었다).
 *
 * ⚠**두 테마를 같은 알고리즘으로 잰다** — 방향은 «바탕에서 멀어지는 쪽/가까워지는 쪽»으로만
 * 정의되므로 라이트(`#FFFFFF`)와 다크(`#121212`)가 같은 코드로 돈다.
 */

const root = resolve(__dirname, '../..');

function sheetValue(file: string, name: string): string {
  const css = readFileSync(join(root, 'src/assets/styles', file), 'utf-8');
  const map: Record<string, string> = {};
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) map[m[1]] = m[2].trim();
  const read = (n: string, depth = 0): string => {
    const v = map[n] ?? '';
    const ref = /^var\((--[\w-]+)\)$/.exec(v);
    return ref && depth < 8 ? read(ref[1], depth + 1) : v;
  };
  return read(name);
}

/** 실제 브랜드 시드로 쓰일 법한 색들 — 밝은 것(노랑)이 이 검사의 시금석이다. */
const SEEDS = ['#1976D2', '#2E7D32', '#D32F2F', '#FDD835', '#6A1B9A', '#00838F', '#212121', '#F5F5F5'];

describe('악센트 램프 파생', () => {
  for (const [themeName, sheet] of [['light', 'light.css'], ['dark', 'dark.css']] as const) {
    describe(themeName, () => {
      const bg = sheetValue(sheet, '--u-bg-color');

      it('바탕값을 시트에서 읽는다 (하드코딩하지 않는다)', () => {
        expect(parseColor(bg)).not.toBeNull();
      });

      it('🔴모든 시드에서 대비 계약을 만족한다 — 면 위 글자 4.5 · 바탕 위 글자 4.5', () => {
        const fails: string[] = [];
        for (const seed of SEEDS) {
          const r = deriveAccentRamp(seed, bg);
          const onColor = contrast(r.color, r.txt);
          const strongOnBg = contrast(r.strong, bg);
          if (onColor < AA_TEXT) fails.push(`${seed} -color/txt ${onColor.toFixed(2)}`);
          if (strongOnBg < AA_TEXT) fails.push(`${seed} -strong/bg ${strongOnBg.toFixed(2)}`);
        }
        expect(fails).toEqual([]);
      });

      it('🔴`-strong` 이 `-color` 와 갈린다 — 계약만 맞추면 두 단이 같아진다', () => {
        const fails: string[] = [];
        for (const seed of SEEDS) {
          const r = deriveAccentRamp(seed, bg);
          const sep = contrast(r.strong, r.color);
          if (sep < MIN_STEP_SEPARATION) fails.push(`${seed} 구분 ${sep.toFixed(2)}`);
        }
        expect(fails).toEqual([]);
      });

      it('`-weak` 은 바탕 위 그래픽으로 보인다 (비텍스트 3.0)', () => {
        const fails: string[] = [];
        for (const seed of SEEDS) {
          const c = contrast(deriveAccentRamp(seed, bg).weak, bg);
          if (c < AA_GRAPHIC) fails.push(`${seed} -weak/bg ${c.toFixed(2)}`);
        }
        expect(fails).toEqual([]);
      });

      it('단이 바탕 쪽으로 단조롭게 옅어진다 (weakest → weak)', () => {
        for (const seed of SEEDS) {
          const r = deriveAccentRamp(seed, bg);
          const d = (c: string) => contrast(c, bg);
          expect(d(r.weakest)).toBeLessThanOrEqual(d(r.weaker) + 0.01);
          expect(d(r.weaker)).toBeLessThanOrEqual(d(r.weak) + 0.01);
        }
      });
    });
  }

  it('시트 기본 시드를 넣으면 시트 값 근방이 나온다 (동떨어지지 않는다)', () => {
    const bg = sheetValue('light.css', '--u-bg-color');
    const r = deriveAccentRamp(sheetValue('light.css', '--u-primary-color'), bg);
    const sheetStrong = sheetValue('light.css', '--u-primary-color-strong');
    // 같은 값을 요구하지 않는다 — 손 튜닝과 계산은 다른 근거를 갖는다. «가깝다»만 본다.
    expect(Math.abs(contrast(r.strong, bg) - contrast(sheetStrong, bg))).toBeLessThan(1.5);
  });

  it('커스텀 프로퍼티 이름이 시트의 역할 토큰과 1:1 이다', () => {
    const props = accentCustomProperties(deriveAccentRamp('#1976D2', '#FFFFFF'));
    expect(Object.keys(props).sort()).toEqual([
      '--u-primary-color',
      '--u-primary-color-strong',
      '--u-primary-color-weak',
      '--u-primary-color-weaker',
      '--u-primary-color-weakest',
      '--u-primary-txt-color',
    ]);
  });

  describe('색 유틸', () => {
    it('mix 는 CSS color-mix(in srgb) 와 같다 (경계값)', () => {
      expect(mix('#ffffff', '#000000', 1)).toBe('#ffffff');
      expect(mix('#ffffff', '#000000', 0)).toBe('#000000');
      expect(mix('#ffffff', '#000000', 0.5)).toBe('#808080');
    });

    it('3자리 hex 와 rgb() 를 모두 읽는다 — 시트/계산값이 둘 다 온다', () => {
      expect(parseColor('#fff')).toEqual([255, 255, 255]);
      expect(parseColor('rgb(25, 118, 210)')).toEqual([25, 118, 210]);
      expect(parseColor('nope')).toBeNull();
    });

    it('면 위 글자는 대비가 큰 쪽을 고른다 — 노랑은 검정이다', () => {
      expect(pickOnColor('#FDD835')).toBe('#000000');
      expect(pickOnColor('#1976D2')).toBe('#ffffff');
    });
  });
});
