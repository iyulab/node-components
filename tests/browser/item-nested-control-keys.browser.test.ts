import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/tree/UTree.js';
import '../../src/components/tree-item/UTreeItem.js';
import '../../src/components/menu/UMenu.js';
import '../../src/components/menu-item/UMenuItem.js';
import type { UTreeItem } from '../../src/components/tree-item/UTreeItem.js';
import type { UMenuItem } from '../../src/components/menu-item/UMenuItem.js';

/**
 * 항목 안 컨트롤의 키는 그 컨트롤의 것이다 — `u-tree`·`u-menu` 의 키보드 모델은 항목 «자신» 에 포커스가
 * 있을 때만 해석한다(`u-tab-panel` 과 같은 원칙).
 *
 * 항목은 `prefix`·`suffix` 슬롯에 컨트롤(행 동작 버튼 등)을 받는다. 그 버튼에서 누른 Enter·Space 를 컨테이너가
 * `preventDefault` 하면 버튼의 네이티브 활성화가 사라지고, 화살표는 버튼을 떠나 항목 사이로 새어 나간다.
 */

afterEach(() => {
  document.body.innerHTML = '';
});

async function mount(markup: string) {
  document.body.innerHTML = markup;
  await customElements.whenDefined('u-tree');
  await new Promise(r => setTimeout(r, 0));
  const btn = document.getElementById('act') as HTMLButtonElement;
  let clicks = 0;
  btn.addEventListener('click', () => clicks++);
  return { btn, clicks: () => clicks };
}

const TREE = `
  <u-tree selectable>
    <u-tree-item id="one">One
      <button slot="suffix" id="act">Act</button>
      <u-tree-item slot="children">One child</u-tree-item>
    </u-tree-item>
    <u-tree-item id="two">Two</u-tree-item>
  </u-tree>`;

const MENU = `
  <u-menu selection="single">
    <u-menu-item id="one">One <button slot="suffix" id="act">Act</button></u-menu-item>
    <u-menu-item id="two">Two</u-menu-item>
  </u-menu>`;

describe('u-tree — 항목 안 컨트롤', () => {
  it('suffix 버튼의 Enter·Space 는 버튼을 누르고 항목을 펼치거나 고르지 않는다', async () => {
    const { btn, clicks } = await mount(TREE);
    const one = document.getElementById('one') as UTreeItem;
    btn.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(clicks()).toBe(2);
    expect(one.expanded).toBe(false);
    expect(one.selected).toBe(false);
  });

  it('suffix 버튼을 마우스로 눌러도 항목을 고르거나 펼치지 않는다 · 항목 본문 클릭은 여전히 고른다', async () => {
    const { btn, clicks } = await mount(TREE);
    const one = document.getElementById('one') as UTreeItem;
    await userEvent.click(btn);
    expect([clicks(), one.selected, one.expanded]).toEqual([1, false, false]);
    await userEvent.click(one);
    expect(one.selected).toBe(true);
  });

  it('suffix 버튼에서 누른 화살표는 항목 이동이 아니다', async () => {
    const { btn } = await mount(TREE);
    btn.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(btn);
  });

  it('항목 자신에서는 여전히 화살표가 옮긴다', async () => {
    await mount(TREE);
    (document.getElementById('one') as HTMLElement).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement?.id).toBe('two');
  });
});

describe('u-menu — 항목 안 컨트롤', () => {
  it('suffix 버튼의 Enter·Space 는 버튼을 누르고 항목을 활성화하지 않는다', async () => {
    const { btn, clicks } = await mount(MENU);
    const one = document.getElementById('one') as UMenuItem;
    let picks = 0;
    one.addEventListener('pick', () => picks++);
    btn.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(clicks()).toBe(2);
    expect(picks).toBe(0);
    expect(one.selected).toBe(false);
  });

  it('suffix 버튼을 마우스로 눌러도 항목을 고르지 않고, 클릭은 바깥까지 전파된다 · 항목 본문 클릭은 여전히 고른다', async () => {
    const { btn, clicks } = await mount(MENU);
    const one = document.getElementById('one') as UMenuItem;
    let outer = 0;
    document.body.addEventListener('click', () => outer++);
    await userEvent.click(btn);
    expect([clicks(), outer, one.selected]).toEqual([1, 1, false]);
    await userEvent.click(one);
    expect(one.selected).toBe(true);
  });

  it('suffix 버튼에서 누른 화살표는 항목 이동이 아니다', async () => {
    const { btn } = await mount(MENU);
    btn.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(btn);
  });

  it('항목 자신에서는 여전히 화살표가 옮긴다', async () => {
    await mount(MENU);
    (document.getElementById('one') as HTMLElement).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement?.id).toBe('two');
  });
});
