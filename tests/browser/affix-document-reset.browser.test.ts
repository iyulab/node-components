import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * 접두 · 접미 슬롯 옆 간격은 문서의 전역 리셋(Tailwind preflight 류 `* { margin: 0 }`) 아래에서도 그대로다 — `::slotted` 여백은 그
 * 리셋에 진다(캡슐화 문맥이 다르면 문서 쪽 normal 선언이 이긴다). 간격은 섀도 안 `.affix` 상자가 갖는다.
 * NEGATIVE: 접두가 없으면 그 상자는 자리를 차지하지 않는다(글자가 접두 없는 같은 요소와 같은 자리).
 */

const RESET = '*, ::before, ::after { margin: 0; padding: 0; border: 0 solid; box-sizing: border-box; }';
const TAGS = ['u-button', 'u-badge', 'u-tab', 'u-menu-item', 'u-option', 'u-breadcrumb-item'];

afterEach(() => {
  document.body.innerHTML = '';
  document.querySelectorAll('style[data-reset]').forEach((s) => s.remove());
});

const settle = async () => {
  const els = [...document.querySelectorAll('*')].filter((e) => e.tagName.includes('-')) as Array<HTMLElement & { updateComplete?: Promise<unknown> }>;
  await Promise.all(els.map((e) => e.updateComplete));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
};

/** 접두 상자의 오른쪽 끝과 글자 왼쪽 끝 사이 · 글자 오른쪽 끝과 접미 상자 왼쪽 끝 사이. */
function gaps(el: HTMLElement) {
  const pre = (el.querySelector('[slot="prefix"]') as HTMLElement).getBoundingClientRect();
  const suf = (el.querySelector('[slot="suffix"]') as HTMLElement).getBoundingClientRect();
  const text = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim()) as Text;
  const range = document.createRange();
  range.selectNodeContents(text);
  const t = range.getBoundingClientRect();
  return [Math.round(t.left - pre.right), Math.round(suf.left - t.right)];
}

describe('prefix · suffix spacing under a document-wide reset', () => {
  for (const tag of TAGS) {
    it(`🔴${tag}`, async () => {
      document.body.innerHTML = `<div style="padding:8px"><${tag}><span slot="prefix" style="display:inline-block;width:10px;height:10px;background:red"></span>Label<span slot="suffix" style="display:inline-block;width:10px;height:10px;background:blue"></span></${tag}></div>`;
      await settle();
      const el = document.querySelector(tag) as HTMLElement;
      const before = gaps(el);
      expect(before[0]).toBeGreaterThan(0);
      const style = document.createElement('style');
      style.dataset.reset = '';
      style.textContent = RESET;
      document.head.appendChild(style);
      await settle();
      expect(gaps(el)).toEqual(before);
    });
  }

  it('NEGATIVE: no prefix, no box — the label starts where it would without the slot', async () => {
    document.body.innerHTML = `<u-button id="a">Label</u-button><br><u-button id="b"><span slot="suffix"></span>Label</u-button>`;
    await settle();
    const affix = document.getElementById('a')!.shadowRoot!.querySelector('.affix-prefix') as HTMLElement;
    expect(affix.getBoundingClientRect().width).toBe(0);
  });
});
