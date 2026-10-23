import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/card/UCard.js';
import type { UCard } from '../../src/components/card/UCard.js';

/**
 * `u-card tone` — 카드가 이웃보다 먼저 읽혀야 할 때(«확인할 것» · «다음 할 일»). 상태 톤은 옅은 면과 테두리, `primary` 는
 * 주 색 테두리. 톤은 안쪽 상자에 칠하므로 바깥 시트가 호스트에 건 `--card-border-color`(하우스 시트가 그렇게 한다)가 덮지 못한다.
 * NEGATIVE: 톤이 없으면 종전대로 `--card-border-color` 를 따른다.
 */
afterEach(() => document.body.replaceChildren());

async function mount(tone?: string): Promise<UCard> {
  const style = document.createElement('style');
  // 하우스 시트처럼 바깥에서 카드 테두리 색을 정한다.
  style.textContent = 'u-card { --card-border-color: rgb(1, 2, 3); --u-warning-bg-color: rgb(255, 240, 200); --u-warning-color-weak: rgb(240, 200, 0); --u-primary-color: rgb(10, 80, 200); }';
  document.body.appendChild(style);
  const el = document.createElement('u-card') as UCard;
  if (tone) el.setAttribute('tone', tone);
  el.textContent = 'body';
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const base = (el: UCard) => getComputedStyle(el.shadowRoot!.querySelector('.base')!);

describe('u-card tone', () => {
  it('warning paints the status face and border, over a page-set border colour', async () => {
    const b = base(await mount('warning'));
    expect(b.backgroundColor).toBe('rgb(255, 240, 200)');
    expect(b.borderTopColor).toBe('rgb(240, 200, 0)');
  });

  it('primary keeps the face and draws the main colour around it', async () => {
    const b = base(await mount('primary'));
    expect(b.borderTopColor).toBe('rgb(10, 80, 200)');
    expect(b.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('NEGATIVE — no tone follows --card-border-color', async () => {
    expect(base(await mount()).borderTopColor).toBe('rgb(1, 2, 3)');
  });
});
