import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/input/UInput.js';

/**
 * 빈 `u-select`(값 없음 · 플레이스홀더 없음)의 높이 — 값이 있을 때, 그리고 같은 행의 `u-input` 과 같아야 한다.
 * 종전에는 표시 칸에 줄 상자가 없어 컨테이너가 패딩만큼 낮아졌고, 폼 한 줄에서 라벨 기준선이 어긋났다.
 */
afterEach(() => { document.body.innerHTML = ''; });

const containerHeight = (el: Element) =>
  (el.shadowRoot!.querySelector('.container') as HTMLElement).getBoundingClientRect().height;

async function mount(html: string) {
  document.body.innerHTML = html;
  const els = [...document.body.querySelectorAll('u-select, u-input')] as Array<HTMLElement & { updateComplete: Promise<unknown> }>;
  await Promise.all(els.map((e) => e.updateComplete));
  await new Promise((r) => setTimeout(r, 30));
  return els;
}

describe('u-select 빈 상태 높이', () => {
  it('🔴값이 없어도 값이 있을 때와 같은 높이다', async () => {
    const [empty, filled] = await mount(
      '<u-select><u-option value="a">Apple</u-option></u-select>' +
      '<u-select value="a"><u-option value="a">Apple</u-option></u-select>',
    );
    expect(Math.abs(containerHeight(empty) - containerHeight(filled))).toBeLessThan(1);
  });

  it('🔴같은 행의 u-input 과 높이가 같다', async () => {
    const [select, input] = await mount('<u-select><u-option value="a">Apple</u-option></u-select><u-input></u-input>');
    expect(Math.abs(containerHeight(select) - containerHeight(input))).toBeLessThan(1);
  });

  it('⚪NEGATIVE — 플레이스홀더가 있는 빈 선택은 종전과 같다(한 줄)', async () => {
    const [withPh, filled] = await mount(
      '<u-select placeholder="Pick one"><u-option value="a">Apple</u-option></u-select>' +
      '<u-select value="a"><u-option value="a">Apple</u-option></u-select>',
    );
    expect(Math.abs(containerHeight(withPh) - containerHeight(filled))).toBeLessThan(1);
  });
});
