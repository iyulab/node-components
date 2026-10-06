import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';

/**
 * `chars` 의 형제 — `u-select`·`u-date-picker`·`u-date-range-picker` 도 «이 칸은 N자를 담는다» 를 선언한다(`u-input` 과 같은 축).
 * 종전에는 글자 하한(`--*-min-text`)만 있어 폭을 정하지 못했다 — 소비자가 지우기·화살표·달력 버튼 상자와 패딩을 복제한
 * `calc()` 로 칸 폭을 정했다. 선택은 더 나빴다: 폭을 정하지 않은 칸이 고른 값의 길이를 따라 값마다 넓어졌다 줄었다 했다.
 */
const mount = async (html: string, target?: string) => {
  document.body.innerHTML = `<div style="${target ? `--u-target-size:${target};` : ''}font-size:14px">${html}</div>`;
  const el = document.body.firstElementChild!.firstElementChild as HTMLElement & { updateComplete: Promise<unknown> };
  await el.updateComplete;
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  return el;
};
const box = (el: HTMLElement, sel: string) => el.shadowRoot!.querySelector(sel)!.getBoundingClientRect();
const chPx = (el: HTMLElement, n: number) => {
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;font:inherit;visibility:hidden';
  probe.textContent = '0'.repeat(n);
  el.shadowRoot!.querySelector('.container')!.appendChild(probe);
  const w = probe.getBoundingClientRect().width;
  probe.remove();
  return w;
};
const minInline = (el: HTMLElement) =>
  parseFloat(getComputedStyle(el.shadowRoot!.querySelector('.container') as HTMLElement).minInlineSize);

const OPTIONS = '<u-option value="a">A</u-option><u-option value="b">A much longer option label than twelve</u-option>';

/** 태그 · 표시 글자 요소 · 추가 마크업 */
const CASES: Array<[string, string, string]> = [
  ['u-select', '.text-content', OPTIONS],
  ['u-date-picker', '.text-input', ''],
  ['u-date-range-picker', '.text-input', ''],
];

describe('형제 컨트롤 chars', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  for (const [tag, text, inner] of CASES) {
    it.each([['', ''], ['', '44px'], [' clearable', '44px']])(
      `${tag}%s · 하한 %s — 글자 영역이 정확히 N자, 칸은 그만큼만`,
      async (extra, target) => {
        const value = tag === 'u-select' ? ' value="a"' : tag === 'u-date-picker' ? ' value="2026-10-07"' : '';
        const el = await mount(`<${tag} chars="12"${extra}${value}>${inner}</${tag}>`, target || undefined);
        const w = box(el, text).width;
        expect(w).toBeGreaterThanOrEqual(chPx(el, 12) - 1);
        expect(w).toBeLessThanOrEqual(chPx(el, 12) + 1);
        expect(box(el, '.container').width).toBeCloseTo(minInline(el), 0);
      });

    it(`${tag} — 폭을 준 칸에서는 하한으로만: 넓으면 채우고 좁으면 넘친다`, async () => {
      let el = await mount(`<${tag} chars="12" style="width:320px">${inner}</${tag}>`);
      expect(box(el, '.container').width).toBeCloseTo(320, 0);
      el = await mount(`<${tag} chars="12" style="width:90px">${inner}</${tag}>`);
      expect(box(el, text).width).toBeGreaterThanOrEqual(chPx(el, 12) - 1);
      expect(box(el, '.container').width).toBeGreaterThan(90);
    });

    it(`NEGATIVE ${tag} — 0·음수·NaN 은 지정 없음과 같다`, async () => {
      const plain = await mount(`<${tag}>${inner}</${tag}>`);
      const expected = box(plain, '.container').width;
      for (const v of ['0', '-3', 'abc']) {
        const el = await mount(`<${tag} chars="${v}">${inner}</${tag}>`);
        expect(box(el, '.container').width).toBeCloseTo(expected, 0);
      }
    });
  }

  it('🔴u-select — 고른 값이 바뀌어도 칸 폭이 그대로다(긴 값은 말줄임)', async () => {
    const el = await mount(`<u-select chars="12" value="a">${OPTIONS}</u-select>`) as HTMLElement & { value: string; updateComplete: Promise<unknown> };
    const short = box(el, '.container').width;
    el.value = 'b';
    await el.updateComplete;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(box(el, '.container').width).toBeCloseTo(short, 0);
  });

  it('NEGATIVE u-select — chars 가 없으면 종전처럼 고른 값의 길이를 따른다', async () => {
    const el = await mount(`<u-select value="a">${OPTIONS}</u-select>`) as HTMLElement & { value: string; updateComplete: Promise<unknown> };
    const short = box(el, '.container').width;
    el.value = 'b';
    await el.updateComplete;
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(box(el, '.container').width).toBeGreaterThan(short + 20);
  });
});
