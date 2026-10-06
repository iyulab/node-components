import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import type { UInput } from '../../src/components/input/UInput.js';

/**
 * `chars` — «이 칸은 N자를 담는다». 폭을 정하지 않은 칸이 N자 + 접미 아이콘(스테퍼·지우기·토글) + 패딩 폭으로 그려진다.
 * 종전에는 그런 선언이 없어 소비자가 아이콘 상자·패딩·호스트 하한을 복제한 `calc()` 로 칸 폭을 정했고, 밀도가 바뀌면 어긋났다.
 */
const mount = async (html: string, target?: string) => {
  document.body.innerHTML = `<div style="${target ? `--u-target-size:${target};` : ''}font-size:14px">${html}</div>`;
  const el = document.querySelector('u-input') as UInput;
  await el.updateComplete;
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  return el;
};
const box = (el: UInput, sel: string) => el.shadowRoot!.querySelector(sel)!.getBoundingClientRect();
const chPx = (el: UInput, n: number) => {
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;font:inherit;visibility:hidden';
  probe.textContent = '0'.repeat(n);
  el.shadowRoot!.querySelector('.container')!.appendChild(probe);
  const w = probe.getBoundingClientRect().width;
  probe.remove();
  return w;
};

describe('u-input chars', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it.each([['', ''], ['', '44px'], [' clearable value="1"', '44px']])(
    'number%s · 하한 %s — 글자 영역이 정확히 N자, 칸은 그만큼만',
    async (extra, target) => {
      const el = await mount(`<u-input type="number" chars="12"${extra}></u-input>`, target || undefined);
      const text = box(el, 'input').width;
      expect(text).toBeGreaterThanOrEqual(chPx(el, 12) - 1);
      expect(text).toBeLessThanOrEqual(chPx(el, 12) + 1);
      const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
      expect(box(el, '.container').width).toBeCloseTo(parseFloat(getComputedStyle(container).minInlineSize), 0);
    });

  it('폭을 준 칸에서는 하한으로만 — 넓으면 채우고 좁으면 넘친다', async () => {
    let el = await mount('<u-input type="number" chars="12" style="width:320px"></u-input>');
    expect(box(el, '.container').width).toBeCloseTo(320, 0);
    el = await mount('<u-input type="number" chars="12" style="width:90px"></u-input>');
    expect(box(el, 'input').width).toBeGreaterThanOrEqual(chPx(el, 12) - 1);
    expect(box(el, '.container').width).toBeGreaterThan(90);
  });

  it('NEGATIVE — chars 가 없으면 종전 폭(입력의 고유 폭)이다', async () => {
    const el = await mount('<u-input type="number"></u-input>');
    expect(box(el, 'input').width).toBeGreaterThan(chPx(el, 12) + 20);
  });

  it('NEGATIVE — 0·음수·NaN 은 지정 없음과 같다', async () => {
    for (const v of ['0', '-3', 'abc']) {
      const el = await mount(`<u-input type="number" chars="${v}"></u-input>`);
      expect(box(el, 'input').width).toBeGreaterThan(chPx(el, 12) + 20);
    }
  });
});
