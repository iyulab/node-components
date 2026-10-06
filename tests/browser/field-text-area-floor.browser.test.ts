import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';

/**
 * `u-input` 의 글자 영역 하한(`#817`)과 같은 부류 — 접미 아이콘을 가진 형제 컨트롤도 좁은 칸에서 **글자 영역을 0 으로 접지 않는다**.
 * 좁으면 칸이 호스트 밖으로 넘친다(보이는 실패).
 *
 * 결함(수정 전 실측, 14px): `u-select clearable` 60px · 하한 44px → 표시 글자 0 · `u-date-picker clearable` 60px → 입력 2px.
 */
const mount = async (html: string, target?: string) => {
  document.body.innerHTML = `<div style="${target ? `--u-target-size:${target};` : ''}font-size:14px">${html}</div>`;
  const el = document.body.firstElementChild!.firstElementChild as HTMLElement & { updateComplete: Promise<unknown> };
  await el.updateComplete;
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  return el;
};
const root = (el: HTMLElement) => el.shadowRoot!;
const fourCh = (el: HTMLElement) => {
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;font:inherit;visibility:hidden';
  probe.textContent = '0000';
  root(el).querySelector('.container')!.appendChild(probe);
  const w = probe.getBoundingClientRect().width;
  probe.remove();
  return w;
};

const CASES = [
  ['u-select', (w: string) => `<u-select clearable value="a" style="width:${w}"><u-option value="a">Alpha</u-option></u-select>`, '.text-content'],
  ['u-date-picker', (w: string) => `<u-date-picker clearable value="2026-01-02" style="width:${w}"></u-date-picker>`, '.text-input'],
  ['u-date-range-picker', (w: string) => `<u-date-range-picker clearable value="2026-01-02/2026-01-09" style="width:${w}"></u-date-range-picker>`, '.text-input'],
] as const;

describe('형제 컨트롤 글자 영역 하한', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  for (const [tag, html, sel] of CASES) {
    it.each([['60px', ''], ['60px', '44px'], ['90px', '44px']])(`${tag} · 폭 %s · 하한 %s — 글자 영역 ≥ 4ch`, async (width, target) => {
      const el = await mount(html(width), target || undefined);
      const text = root(el).querySelector(sel)!.getBoundingClientRect().width;
      expect(text).toBeGreaterThanOrEqual(fourCh(el) - 0.5);
    });

    it(`${tag} — 하한 아래면 칸이 호스트 밖으로 넘치고 마지막 아이콘은 칸 안에 있다`, async () => {
      const el = await mount(html('60px'), '44px');
      const container = root(el).querySelector('.container')!.getBoundingClientRect();
      const icons = Array.from(root(el).querySelectorAll<HTMLElement>('.suffix-item')).filter((i) => !i.hidden);
      expect(container.width).toBeGreaterThan(60);
      expect(icons.at(-1)!.getBoundingClientRect().right).toBeLessThanOrEqual(container.right + 1);
    });

    it(`NEGATIVE — ${tag} 넓은 칸은 영향 없음`, async () => {
      const el = await mount(html('300px'), '44px');
      expect(root(el).querySelector('.container')!.getBoundingClientRect().width).toBeCloseTo(300, 0);
    });
  }

  it('지우기 몫은 지우기가 보일 때만 센다 — 값이 없으면 하한이 그만큼 작다', async () => {
    const withClear = await mount(CASES[1][1]('10px'), '44px');
    const a = root(withClear).querySelector('.container')!.getBoundingClientRect().width;
    const without = await mount('<u-date-picker clearable style="width:10px"></u-date-picker>', '44px');
    const b = root(without).querySelector('.container')!.getBoundingClientRect().width;
    expect(a - b).toBeGreaterThan(40);
  });
});
