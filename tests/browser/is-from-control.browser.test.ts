import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/button/UButton.js';
import { isFromControl } from '../../src/utilities/elements.js';

/**
 * 행·셀처럼 «눌렀다» 를 스스로 해석하는 상자(두 표의 `row-activate`)가 그 안에 그려진 컨트롤의 클릭을
 * 제 것으로 읽지 않게 하는 판정. 셀 글자를 누른 것은 상자의 것, 셀 안 버튼·링크·우리 버튼을 누른 것은
 * 그 컨트롤의 것이다.
 */
describe('isFromControl', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function clickResult(cellHtml: string, pick: (cell: HTMLElement) => Element): boolean {
    const cell = document.createElement('div');
    cell.innerHTML = cellHtml;
    document.body.appendChild(cell);
    let seen: boolean | null = null;
    cell.addEventListener('click', (e) => { seen = isFromControl(e, cell); });
    (pick(cell) as HTMLElement).click();
    return seen!;
  }

  it('plain text in the box is the box’s own click', () => {
    expect(clickResult('<span>Order 1001</span>', (c) => c.querySelector('span')!)).toBe(false);
    expect(clickResult('Order 1001', (c) => c)).toBe(false);
  });

  it('a button, a link, an input and a role="button" are their own', () => {
    expect(clickResult('<button><span>Delete</span></button>', (c) => c.querySelector('span')!)).toBe(true);
    expect(clickResult('<a href="#x">Open</a>', (c) => c.querySelector('a')!)).toBe(true);
    expect(clickResult('<input type="checkbox">', (c) => c.querySelector('input')!)).toBe(true);
    expect(clickResult('<div role="button">Go</div>', (c) => c.querySelector('div')!)).toBe(true);
  });

  it('a link without href is text, not a control', () => {
    expect(clickResult('<a>plain</a>', (c) => c.querySelector('a')!)).toBe(false);
  });

  it('sees into an open shadow root — a u-button is a control', async () => {
    const cell = document.createElement('div');
    cell.innerHTML = '<u-button>Delete</u-button>';
    document.body.appendChild(cell);
    const btn = cell.querySelector('u-button') as HTMLElement & { updateComplete: Promise<unknown> };
    await btn.updateComplete;
    let seen: boolean | null = null;
    cell.addEventListener('click', (e) => { seen = isFromControl(e, cell); });
    (btn.shadowRoot!.querySelector('button') as HTMLElement).click();
    expect(seen).toBe(true);
  });

  it('a control outside the box does not count — the walk stops at the boundary', () => {
    const outer = document.createElement('button');
    const cell = document.createElement('div');
    cell.textContent = 'text';
    outer.appendChild(cell);
    document.body.appendChild(outer);
    let seen: boolean | null = null;
    cell.addEventListener('click', (e) => { seen = isFromControl(e, cell); });
    cell.click();
    expect(seen).toBe(false);
  });
});
