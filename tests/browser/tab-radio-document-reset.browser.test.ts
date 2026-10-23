import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * 탭 패널(card · pill)의 탭 테두리와 단추형 라디오의 칸 구분선은 문서의 전역 리셋(Tailwind preflight 류 `* { border: 0 solid }`) 아래에서도
 * 그대로다 — 꽂힌 자식에 `::slotted` 로 준 테두리는 그 리셋에 진다. 담는 쪽은 폭 · 색만 넘기고 자식이 자기 `.base` 에 그린다.
 */

const RESET = '*, ::before, ::after { margin: 0; padding: 0; border: 0 solid; box-sizing: border-box; }';

afterEach(() => {
  document.body.innerHTML = '';
  document.querySelectorAll('style[data-reset]').forEach((s) => s.remove());
});

const settle = async () => {
  const els = [...document.querySelectorAll('*')].filter((e) => e.tagName.includes('-')) as Array<HTMLElement & { updateComplete?: Promise<unknown> }>;
  await Promise.all(els.map((e) => e.updateComplete));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
};

const borders = (els: Element[]) => els.map((el) => {
  const cs = getComputedStyle(el.shadowRoot!.querySelector('.base')!);
  return [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].join(' ');
});

async function underReset(html: string, pick: () => Element[]) {
  document.body.innerHTML = html;
  await settle();
  const before = borders(pick());
  const style = document.createElement('style');
  style.dataset.reset = '';
  style.textContent = RESET;
  document.head.appendChild(style);
  await settle();
  return { before, after: borders(pick()) };
}

describe('tab · radio borders under a document-wide reset', () => {
  for (const appearance of ['card', 'pill']) {
    it(`🔴u-tab-panel appearance="${appearance}"`, async () => {
      const { before, after } = await underReset(
        `<u-tab-panel appearance="${appearance}" value="a"><u-tab value="a">A</u-tab><u-tab value="b">B</u-tab><div slot="panel-a">a</div></u-tab-panel>`,
        () => [...document.querySelectorAll('u-tab')]);
      expect(before.some((b) => b !== '0px 0px 0px 0px')).toBe(true);
      expect(after).toEqual(before);
    });
  }

  it('🔴u-radio type="button" — dividers between the options', async () => {
    const { before, after } = await underReset(
      `<u-radio type="button" orientation="horizontal"><u-option value="a">A</u-option><u-option value="b">B</u-option><u-option value="c">C</u-option></u-radio>`,
      () => [...document.querySelectorAll('u-option')]);
    expect(before.slice(0, 2)).toEqual(['0px 1px 0px 0px', '0px 1px 0px 0px']);
    expect(before[2]).toBe('0px 0px 0px 0px');
    expect(after).toEqual(before);
  });
});
