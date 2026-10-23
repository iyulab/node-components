import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/dialog/UDialog.js';
import '../../src/components/drawer/UDrawer.js';

/**
 * 대화상자 · 서랍의 바닥 영역(`slot="footer"`)은 문서의 전역 리셋(Tailwind preflight 류 `* { padding: 0; border: 0 solid }`)
 * 아래에서도 여백과 구분선을 지킨다 — `::slotted` 에 둔 상자 속성은 그 리셋에 진다(캡슐화 문맥이 다르면 문서 쪽 normal 선언이
 * 이긴다). 그래서 상자는 섀도 안 `part="footer"` 가 그린다. NEGATIVE: 꽂힌 것이 없으면 바닥 영역을 그리지 않는다.
 */

const RESET = '*, ::before, ::after { margin: 0; padding: 0; border: 0 solid; box-sizing: border-box; }';
type Overlay = HTMLElement & { open: boolean; updateComplete: Promise<unknown> };

afterEach(() => {
  document.body.innerHTML = '';
  document.querySelectorAll('style[data-reset]').forEach((s) => s.remove());
});

const settle = async () => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 350));
};

async function mount(tag: 'u-dialog' | 'u-drawer', footer = true): Promise<Overlay> {
  document.body.innerHTML = `<${tag} open>Body${footer ? '<span slot="footer">Save</span>' : ''}</${tag}>`;
  const el = document.querySelector(tag) as Overlay;
  await el.updateComplete;
  await settle();
  return el;
}

/** 바닥 영역의 글자가 패널 아래 끝과 오른쪽 끝에서 떨어진 거리 · 구분선 두께. */
function footerGeometry(el: Overlay) {
  const part = el.shadowRoot!.querySelector('[part="footer"]') as HTMLElement;
  const text = (el.querySelector('[slot="footer"]') as HTMLElement).getBoundingClientRect();
  const box = part.getBoundingClientRect();
  return {
    below: Math.round(box.bottom - text.bottom),
    after: Math.round(box.right - text.right),
    rule: getComputedStyle(part).borderTopWidth,
  };
}

describe('dialog · drawer footer under a document-wide reset', () => {
  for (const tag of ['u-dialog', 'u-drawer'] as const) {
    it(`🔴${tag}: the footer keeps its padding and divider`, async () => {
      const el = await mount(tag);
      const before = footerGeometry(el);
      expect(before.below).toBeGreaterThan(4);
      expect(before.rule).toBe('1px');
      const style = document.createElement('style');
      style.dataset.reset = '';
      style.textContent = RESET;
      document.head.appendChild(style);
      await settle();
      expect(footerGeometry(el)).toEqual(before);
    });

    it(`NEGATIVE ${tag}: no footer content, no footer box`, async () => {
      const el = await mount(tag, false);
      const part = el.shadowRoot!.querySelector('[part="footer"]') as HTMLElement;
      expect(part.getBoundingClientRect().height).toBe(0);
    });
  }
});
