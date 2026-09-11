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

/**
 * `checkable` 행 — 토글과 체크박스가 **나란히** 있다. 둘 다 우리 타깃이고 보이는 간격은 4px 뿐이라,
 * 둘 다 가운데 정렬로 24 까지 넓히면 영역이 3px 겹친다(3 + 4 > 4). ⇒ 이 행에서만 토글의 늘어난
 * 폭을 **왼쪽(헤더 여백)** 으로 몰고, 체크박스는 양쪽 4px 씩 넓힌다. 보이는 것은 하나도 움직이지 않는다.
 */
const CHECKABLE = '<u-tree checkable><u-tree-item>Parent<u-tree-item>Child</u-tree-item></u-tree-item><u-tree-item>Leaf</u-tree-item></u-tree>';

async function mountCheckable(): Promise<void> {
  document.body.innerHTML = `<div style="padding:40px;width:320px">${CHECKABLE}</div>`;
  const deadline = Date.now() + 1000;
  while (Date.now() < deadline) {
    const root = document.querySelector('u-tree-item')?.shadowRoot;
    const t = root?.querySelector('.prefix-toggler') as HTMLElement | null;
    const c = root?.querySelector('.prefix-checkbox') as HTMLElement | null;
    if (t && !t.hidden && c && !c.hidden) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error('토글과 체크박스가 함께 나타나지 않았다');
}

function visibleRect(el: HTMLElement) {
  const box = el.getBoundingClientRect();
  const cs = getComputedStyle(el, '::before');
  const left = box.left + parseFloat(cs.left);
  const top = box.top + parseFloat(cs.top);
  const width = parseFloat(cs.width);
  const height = parseFloat(cs.height);
  return { left, top, width, height, right: left + width, cx: left + width / 2, cy: top + height / 2 };
}

describe('u-tree-item checkable 행 — 체크박스 영역 24 · 보이는 16, 토글과 겹치지 않는다 (§D-57)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const q = (sel: string, i = 0) =>
    (Array.from(document.querySelectorAll('u-tree-item'))[i] as HTMLElement).shadowRoot!.querySelector(sel) as HTMLElement;

  it('체크박스: 잡히는 영역은 24×24 이고, 보이는 상자는 그대로 16×16 이며 가운데에 있다', async () => {
    await mountCheckable();
    const c = q('.prefix-checkbox');
    const box = c.getBoundingClientRect();
    const v = visibleRect(c);
    expect(`${Math.round(box.width)}x${Math.round(box.height)}`).toBe('24x24');
    expect(`${Math.round(v.width)}x${Math.round(v.height)}`, '보이는 상자가 커졌다면 시각 계약이 바뀐 것이다').toBe('16x16');
    expect(Math.abs(v.cx - (box.left + box.width / 2))).toBeLessThan(0.5);
  });

  it('🔴토글 영역과 체크박스 영역이 겹치지 않는다 — 둘 다 우리 타깃이다', async () => {
    await mountCheckable();
    const t = q('.prefix-toggler').getBoundingClientRect();
    const c = q('.prefix-checkbox').getBoundingClientRect();
    expect(Math.round(t.width)).toBe(24);
    expect(t.right).toBeLessThanOrEqual(c.left + 0.5);
  });

  it('보이는 것은 움직이지 않는다 — 토글 사각형 18 · 간격 4 · 체크박스 16 · 간격 4 · 레이블', async () => {
    await mountCheckable();
    const t = visibleRect(q('.prefix-toggler'));
    const c = visibleRect(q('.prefix-checkbox'));
    const content = q('.content').getBoundingClientRect();
    expect(Math.round(t.width)).toBe(18);
    expect(Math.round(c.left - t.right)).toBe(4);
    expect(Math.round(content.left - c.right)).toBe(4);
    // 글리프는 보이는 사각형 가운데에 있다 — 영역이 비대칭이어도.
    const glyph = q('.prefix-toggler u-icon').getBoundingClientRect();
    expect(Math.abs(glyph.left + glyph.width / 2 - t.cx)).toBeLessThan(0.5);
  });

  it('체크 표시(✓)도 보이는 상자 가운데에 있다', async () => {
    await mountCheckable();
    const c = q('.prefix-checkbox');
    const v = visibleRect(c);
    const icon = c.querySelector('u-icon')!.getBoundingClientRect();
    expect(Math.abs(icon.left + icon.width / 2 - v.cx)).toBeLessThan(0.5);
    expect(Math.abs(icon.top + icon.height / 2 - v.cy)).toBeLessThan(0.5);
  });

  it('🔴체크된 상자는 채워진다 — 테두리·채움이 가상 요소로 옮겨간 뒤에도', async () => {
    /* 채움은 요소가 아니라 `::before` 가 그린다. 상태 규칙(`[checked]`)이 옛 자리(요소)에 남으면
       24×24 영역 전체가 칠해지거나, 가상 요소가 비어 «체크했는데 빈 상자» 가 된다. */
    await mountCheckable();
    // 채움에는 140ms 전환이 걸려 있다 — 바로 읽으면 전환의 시작값(투명)이 나온다. 전환 시간을 0 으로.
    (document.querySelector('u-tree') as HTMLElement).style.setProperty('--u-duration-fast', '0s');
    const item = document.querySelector('u-tree-item') as HTMLElement & { checked: boolean; updateComplete: Promise<boolean> };
    const c = q('.prefix-checkbox');
    const fill = () => getComputedStyle(c, '::before').backgroundColor;
    expect(fill()).toBe('rgba(0, 0, 0, 0)');
    item.checked = true;
    await item.updateComplete;
    expect(fill()).not.toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(c).backgroundColor, '24×24 영역 전체가 칠해졌다').toBe('rgba(0, 0, 0, 0)');
  });

  it('체크박스 영역의 가장자리를 눌러도 체크된다 — 늘어난 4px 가 실제로 포인터를 받는다', async () => {
    await mountCheckable();
    const parent = document.querySelector('u-tree-item') as HTMLElement;
    const c = q('.prefix-checkbox');
    const box = c.getBoundingClientRect();
    const hit = parent.shadowRoot!.elementFromPoint(box.right - 1, box.top + box.height / 2);
    expect(hit, `가장자리가 ${(hit as HTMLElement | null)?.className} 로 갔다`).toBe(c);
    let checked = 0;
    parent.addEventListener('check', () => checked++);
    (hit as HTMLElement).click();
    expect(checked).toBe(1);
  });

  it('checkable 행과 아닌 행의 높이가 같다 — 늘어난 영역이 행을 키우지 않는다', async () => {
    await mountCheckable();
    const plain = document.createElement('div');
    plain.innerHTML = '<u-tree><u-tree-item>Plain</u-tree-item></u-tree>';
    document.body.appendChild(plain);
    await new Promise((r) => setTimeout(r, 60));
    const items = Array.from(document.querySelectorAll('u-tree-item')) as HTMLElement[];
    const h = (el: HTMLElement) => el.shadowRoot!.querySelector('.header')!.getBoundingClientRect().height;
    expect(Math.round(h(items[0]))).toBe(Math.round(h(items[items.length - 1])));
  });
});
