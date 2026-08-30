import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/tree-item/UTreeItem.js';
import type { UTreeItem } from '../../src/components/tree-item/UTreeItem.js';

/**
 * `UCheckbox`(docket #147)와 같은 결함 형태 — `.prefix-checkbox`/`.prefix-toggler`도
 * 상태에 따라 보이는 `u-icon`을 자기 클릭 핸들러가 있는 박스 위에 얹는 동일한 패턴을 쓴다.
 */
function createItem(attrs: Record<string, string> = {}): UTreeItem {
  const item = document.createElement('u-tree-item') as UTreeItem;
  for (const [k, v] of Object.entries(attrs)) item.setAttribute(k, v);
  return item;
}

describe('UTreeItem — prefix 아이콘이 클릭을 가로채지 않는다 (docket #147과 같은 부류)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('checked 상태에서 .prefix-checkbox u-icon 은 pointer-events:none 이다', async () => {
    const item = createItem({ checkable: '' });
    document.body.appendChild(item);
    (item as unknown as { checked: boolean }).checked = true;
    await item.updateComplete;

    const icon = item.shadowRoot!.querySelector('.prefix-checkbox u-icon') as HTMLElement;
    expect(getComputedStyle(icon).pointerEvents).toBe('none');
  });

  it('.prefix-toggler u-icon 도 pointer-events:none 이다(항상 보이는 아이콘)', async () => {
    const item = createItem();
    (item as unknown as { leaf: boolean }).leaf = false;
    document.body.appendChild(item);
    await item.updateComplete;

    const icon = item.shadowRoot!.querySelector('.prefix-toggler u-icon') as HTMLElement;
    expect(getComputedStyle(icon).pointerEvents).toBe('none');
  });
});
