import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/tree/UTree.js';
import '../../src/components/tree-item/UTreeItem.js';

/**
 * `u-tree-item` 펼침 토글 — **잡히는 영역(24×24)과 보이는 사각형(18×18)을 가른다** (§D-57).
 *
 * `u-slider` 의 thumb 와 같은 결정(§C-A ⑷ «히트 영역만 넓힌다»)이다. ⚠두 축을 함께 재지 않으면
 * 검증이 안 된다 — 영역만 재면 «보이는 사각형까지 커졌다» 를, 사각형만 재면 «영역이 안
 * 넓어졌다» 를 통과시킨다. 그리고 이 결정이 성립하는 조건 — **늘어난 3px 가 다른 타깃 위에
 * 떨어지지 않는다**(헤더 자신의 여백과 레이블 앞 간격) — 을 «레이아웃이 그대로다» 로 잰다.
 */

async function mount(html: string): Promise<void> {
  document.body.innerHTML = `<div style="padding:40px;width:320px">${html}</div>`;
  const deadline = Date.now() + 1000;
  while (Date.now() < deadline) {
    const t = document.querySelector('u-tree-item')?.shadowRoot?.querySelector('.prefix-toggler') as HTMLElement | null;
    if (t && !t.hidden) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error('토글이 나타나지 않았다');
}

const TREE = '<u-tree trigger="icon"><u-tree-item>Parent<u-tree-item>Child</u-tree-item></u-tree-item><u-tree-item>Leaf</u-tree-item></u-tree>';

function parts() {
  const [parent, , leaf] = Array.from(document.querySelectorAll('u-tree-item')) as HTMLElement[];
  const root = parent.shadowRoot!;
  const toggler = root.querySelector('.prefix-toggler') as HTMLElement;
  const cs = getComputedStyle(toggler, '::before');
  const box = toggler.getBoundingClientRect();
  const inset = parseFloat(cs.left);
  const visible = { left: box.left + inset, width: parseFloat(cs.width), height: parseFloat(cs.height) };
  return { parent, leaf, toggler, box, visible };
}

describe('u-tree-item 펼침 토글 — 영역 24 · 보이는 사각형 18 (§D-57)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('잡히는 영역은 24×24 이고, 보이는 사각형은 그대로 18×18 이며 가운데에 있다', async () => {
    await mount(TREE);
    const { box, visible } = parts();
    expect(`${Math.round(box.width)}x${Math.round(box.height)}`).toBe('24x24');
    expect(`${Math.round(visible.width)}x${Math.round(visible.height)}`, '보이는 사각형이 커졌다면 시각 계약이 바뀐 것이다').toBe('18x18');
    expect(Math.abs(visible.left + visible.width / 2 - (box.left + box.width / 2))).toBeLessThan(0.5);
  });

  it('레이블은 보이는 사각형에서 종전 간격(4px) 뒤에 선다 — 늘어난 영역이 레이블을 밀지 않는다', async () => {
    await mount(TREE);
    const { parent, visible } = parts();
    const content = parent.shadowRoot!.querySelector('.content')!.getBoundingClientRect();
    expect(Math.round(content.left - (visible.left + visible.width))).toBe(4);
  });

  it('토글을 가진 행과 갖지 않은 행의 높이가 같다 — 늘어난 영역이 행을 키우지 않는다', async () => {
    await mount(TREE);
    const { parent, leaf } = parts();
    const h = (el: HTMLElement) => el.shadowRoot!.querySelector('.header')!.getBoundingClientRect().height;
    expect(Math.round(h(parent))).toBe(Math.round(h(leaf)));
  });

  it('토글 영역의 가장자리를 눌러도 펼쳐진다 — 늘어난 3px 가 실제로 포인터를 받는다', async () => {
    await mount(TREE);
    const { parent, box } = parts();
    const hit = parent.shadowRoot!.elementFromPoint(box.left + 1, box.top + box.height / 2);
    expect(hit?.classList.contains('prefix-toggler'), `가장자리가 ${hit?.className} 로 갔다`).toBe(true);
    (hit as HTMLElement).click();
    await (parent as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete;
    expect(parent.hasAttribute('expanded')).toBe(true);
  });
});
