import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/card/UCard.js';

/**
 * 카드 전체가 링크인 모드(`href`).
 *
 * 바깥 상자가 `<a>` 로 그려지고, 카드로 읽힌다 — 글자는 잉크·밑줄 없음 · hover 는 테두리가 싣고 들어 올리지 않는다.
 * 호스트가 overflow 를 자르므로 포커스 링은 상자 안쪽에 그려져야 보인다.
 */
type Card = HTMLElement & { updateComplete: Promise<unknown> };

afterEach(() => {
  document.body.replaceChildren();
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
});

async function mount(markup: string): Promise<Card> {
  document.body.innerHTML = markup;
  const card = document.querySelector('u-card') as Card;
  await card.updateComplete;
  return card;
}

const base = (card: Card) => card.shadowRoot!.querySelector('[part="base"]') as HTMLElement;

describe('u-card href', () => {
  it('🔴바깥 상자가 링크다 — href·target·rel 이 그 <a> 에 있고, 슬롯 내용은 그 안에 그려진다', async () => {
    const card = await mount('<u-card href="#order-42" target="_self" rel="nofollow"><span slot="header">Order 42</span>Body</u-card>');
    const a = base(card);
    expect(a.tagName).toBe('A');
    expect(a.getAttribute('href')).toBe('#order-42');
    expect(a.getAttribute('target')).toBe('_self');
    expect(a.getAttribute('rel')).toBe('nofollow');
    expect(a.contains(card.shadowRoot!.querySelector('slot:not([name])'))).toBe(true);
  });

  it('🔴카드로 읽힌다 — 글자색은 상속(링크색 아님) · 밑줄 없음', async () => {
    document.body.style.color = 'rgb(10, 20, 30)';
    const card = await mount('<u-card href="#x" style="--u-txt-color: inherit">Body</u-card>');
    const s = getComputedStyle(base(card));
    expect(s.textDecorationLine).toBe('none');
    expect(s.color).toBe('rgb(10, 20, 30)');
    document.body.style.color = '';
  });

  it('🔴hover 는 테두리 색을 바꾸고 카드를 들어 올리지 않는다', async () => {
    const card = await mount('<u-card href="#x" style="--u-border-color: rgb(1, 1, 1); --u-border-color-strong: rgb(200, 0, 0)">Body</u-card>');
    const before = getComputedStyle(base(card)).borderTopColor;
    await userEvent.hover(card);
    await new Promise((r) => setTimeout(r, 300));
    expect(before).toBe('rgb(1, 1, 1)');
    expect(getComputedStyle(base(card)).borderTopColor).toBe('rgb(200, 0, 0)');
    expect(getComputedStyle(card).transform).toBe('none');
  });

  it('🔴Tab 으로 링크에 닿고, 포커스 링은 상자 안쪽에 그린다(호스트가 바깥을 자른다)', async () => {
    const card = await mount('<button id="before">b</button><u-card href="#x">Body</u-card>');
    (document.getElementById('before') as HTMLButtonElement).focus();
    await userEvent.tab();
    expect(card.shadowRoot!.activeElement).toBe(base(card));
    const s = getComputedStyle(base(card));
    expect(s.outlineStyle).toBe('solid');
    expect(parseFloat(s.outlineOffset)).toBeLessThan(0);
  });

  it('🔴Enter 로 이동한다', async () => {
    await mount('<button id="before">b</button><u-card href="#card-target">Body</u-card>');
    (document.getElementById('before') as HTMLButtonElement).focus();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(location.hash).toBe('#card-target');
  });

  it('호스트의 aria-label 이 링크의 이름이 된다(카드 글 전부 대신)', async () => {
    const card = await mount('<u-card href="#x" aria-label="Order 42">Long body text</u-card>');
    expect(base(card).getAttribute('aria-label')).toBe('Order 42');
  });

  it('NEGATIVE href 가 없으면 상자는 링크가 아니고 Tab 에 닿지 않는다', async () => {
    const card = await mount('<button id="before">b</button><u-card>Body</u-card><button id="after">a</button>');
    expect(base(card).tagName).toBe('DIV');
    (document.getElementById('before') as HTMLButtonElement).focus();
    await userEvent.tab();
    expect(document.activeElement?.id).toBe('after');
  });
});
