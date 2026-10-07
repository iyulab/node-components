import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/card/UCard.js';

/**
 * 늘어난 카드의 테두리 상자는 호스트를 채운다.
 *
 * 면(배경·그림자)은 호스트가, 테두리는 안쪽 `.base` 가 그린다(소비 앱의 CSS 리셋에 테두리가 지워지지 않게). 그런데
 * `.base` 는 호스트의 flex 항목이면서 늘어나지 않아, 같은 행 높이에 맞춰 늘어난 카드는 내용 끝에서 테두리가 닫히고
 * 그 아래에 면만 한 번 더 그려졌다(이중 상자).
 */
afterEach(() => document.body.replaceChildren());

async function row(orientation: 'vertical' | 'horizontal'): Promise<HTMLElement[]> {
  document.body.innerHTML = `
    <div style="display:flex;gap:8px;width:900px">
      <u-card orientation="${orientation}" style="flex:1 1 200px"><span slot="header">A</span>short</u-card>
      <u-card orientation="${orientation}" style="flex:1 1 200px"><span slot="header">B</span>${'tall line<br>'.repeat(8)}</u-card>
    </div>`;
  const cards = [...document.querySelectorAll('u-card')] as Array<HTMLElement & { updateComplete: Promise<unknown> }>;
  for (const c of cards) await c.updateComplete;
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  return cards;
}

const heights = (card: HTMLElement) => ({
  host: card.getBoundingClientRect().height,
  base: card.shadowRoot!.querySelector('.base')!.getBoundingClientRect().height,
});

describe('u-card 늘어난 테두리', () => {
  for (const orientation of ['vertical', 'horizontal'] as const) {
    it(`${orientation === 'vertical' ? '🔴' : ''}${orientation} — 같은 행에서 늘어난 짧은 카드의 테두리 상자가 호스트 높이와 같다`, async () => {
      const [short, tall] = await row(orientation);
      expect(heights(short).host).toBeCloseTo(heights(tall).host, 0);
      expect(heights(short).base).toBeCloseTo(heights(short).host, 0);
    });
  }

  it('🔴높이를 준 카드도 테두리 상자가 채운다', async () => {
    document.body.innerHTML = '<u-card style="height:300px">x</u-card>';
    const card = document.querySelector('u-card') as HTMLElement & { updateComplete: Promise<unknown> };
    await card.updateComplete;
    expect(heights(card).base).toBeCloseTo(300, 0);
  });

  it('NEGATIVE 늘어나지 않은 카드는 내용 높이 그대로다', async () => {
    document.body.innerHTML = '<div style="display:flex;align-items:flex-start"><u-card>x</u-card></div>';
    const card = document.querySelector('u-card') as HTMLElement & { updateComplete: Promise<unknown> };
    await card.updateComplete;
    expect(heights(card).base).toBeCloseTo(heights(card).host, 0);
    expect(heights(card).host).toBeLessThan(120);
  });
});
