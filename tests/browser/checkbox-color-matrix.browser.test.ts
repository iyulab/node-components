import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/checkbox/UCheckbox.js';

/**
 * `u-checkbox` 의 `variant × color × (checked|indeterminate)` 조합.
 *
 * `u-tag` 와 같은 방법 — **리팩터 전에** 실제 렌더 색을 캡처해 두고, 접은 뒤 같은
 * 테스트가 통과하는지로 시각 동일을 증명한다.
 *
 * ⚠`color` 의 기본값은 `"blue"` 이고 reflect 된다. 그리고 **blue 는 팔레트가 아니라
 * 브랜드 훅**(`--checkbox-fill-color` → `--u-primary-color`)을 탄다 — 즉 blue 는
 * 장식 축의 한 값이 아니라 *"색을 지정하지 않음"* 의 표기다.
 */

const PALETTE_COLORS = ['green', 'red', 'orange', 'teal', 'cyan', 'purple', 'pink', 'neutral'] as const;
const STATES = ['checked', 'indeterminate'] as const;

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

async function mount(variant: string, color: string, state: string) {
  const el = document.createElement('u-checkbox') as HTMLElement & { updateComplete: Promise<unknown> };
  el.setAttribute('variant', variant);
  el.setAttribute('color', color);
  el.setAttribute(state, '');
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('u-checkbox 장식 매트릭스', () => {
  beforeAll(() => {
    expect(token('--u-green-600'), '이 테스트는 토큰 시트를 전제한다').not.toBe('');
  });
  afterEach(() => document.body.replaceChildren());

  it('variant="filled" 의 색이 테두리·배경에 도달한다', async () => {
    const wrong: string[] = [];
    for (const color of PALETTE_COLORS) {
      for (const state of STATES) {
        const cs = getComputedStyle(await mount('filled', color, state));
        const want = token(`--u-${color}-600`);
        for (const prop of ['--checkbox-border-color', '--checkbox-background-color']) {
          const got = cs.getPropertyValue(prop).trim();
          if (got !== want) wrong.push(`filled/${color}/${state} ${prop}: ${got} ≠ ${want}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it('variant="outline" 의 색이 텍스트·테두리에 도달한다', async () => {
    const wrong: string[] = [];
    for (const color of PALETTE_COLORS) {
      for (const state of STATES) {
        const cs = getComputedStyle(await mount('outline', color, state));
        const want = token(`--u-${color}-600`);
        for (const prop of ['--checkbox-color', '--checkbox-border-color']) {
          const got = cs.getPropertyValue(prop).trim();
          if (got !== want) wrong.push(`outline/${color}/${state} ${prop}: ${got} ≠ ${want}`);
        }
        const bg = cs.getPropertyValue('--checkbox-background-color').trim();
        if (bg !== 'transparent') wrong.push(`outline/${color}/${state} 배경: ${bg} ≠ transparent`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('color="blue"(기본)는 팔레트가 아니라 브랜드 훅을 탄다', async () => {
    // 네거티브 컨트롤 — blue 를 다른 8색과 같이 취급해 접으면 브랜드 경로가 죽는다.
    for (const variant of ['filled', 'outline'] as const) {
      const el = await mount(variant, 'blue', 'checked');
      expect(
        getComputedStyle(el).getPropertyValue('--checkbox-border-color').trim(),
        `${variant}/blue 가 --u-primary-color 를 따라야 한다`,
      ).toBe(token('--u-primary-color'));

      document.documentElement.style.setProperty('--u-primary-color', 'rgb(255, 0, 128)');
      expect(
        getComputedStyle(el).getPropertyValue('--checkbox-border-color').trim(),
        `${variant}/blue 가 브랜드 오버라이드를 따르지 않는다`,
      ).toBe('rgb(255, 0, 128)');
      document.documentElement.style.removeProperty('--u-primary-color');
    }
  });

  it('색 지정 체크박스는 브랜드 오버라이드에 면역이다', async () => {
    const el = await mount('filled', 'purple', 'checked');
    const before = getComputedStyle(el).getPropertyValue('--checkbox-border-color').trim();
    expect(before).toBe(token('--u-purple-600'));
    document.documentElement.style.setProperty('--u-primary-color', 'rgb(255, 0, 128)');
    expect(getComputedStyle(el).getPropertyValue('--checkbox-border-color').trim(), '장식 축이 오염됐다')
      .toBe(before);
    document.documentElement.style.removeProperty('--u-primary-color');
  });
});
