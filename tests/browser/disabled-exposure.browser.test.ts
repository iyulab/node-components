import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/index.js';

/**
 * 폼 컨트롤이 **아닌** 비활성 가능 요소가 비활성을 접근성 트리에 알리는가.
 *
 * 폼 컨트롤은 `field-name-reach-census` 의 표가 덮는다. 여기는 그 표 밖에서 `disabled` 를
 * 갖는 것들이다 — 역할이 **호스트**에 있는 셋(`u-menu-item`·`u-tab`·`u-tree-item`)과,
 * `href` 가 있을 때 링크를 그리는 `u-breadcrumb-item`. 넷 다 비활성일 때 동작만 막고
 * `aria-disabled` 를 내지 않았다.
 *
 * 네이티브 요소에 위임하는 것(`u-button`·`u-icon-button`·`u-copy-button`·`u-expander` 의
 * 헤더)은 이미 네이티브 `disabled` 로 알리므로 대상이 아니다 — 실측으로 확인했다.
 */

/** [마크업, 비활성을 알려야 하는 노드를 찾는 함수] */
const CASES: Array<[string, string, (host: HTMLElement) => Element | null]> = [
  ['u-menu-item', '<u-menu><u-menu-item id="c" disabled>Item</u-menu-item></u-menu>', (h) => h],
  ['u-tab', '<u-tab-panel><u-tab id="c" disabled>Tab</u-tab></u-tab-panel>', (h) => h],
  ['u-tree-item', '<u-tree><u-tree-item id="c" disabled>Node</u-tree-item></u-tree>', (h) => h],
  ['u-breadcrumb-item', '<u-breadcrumb><u-breadcrumb-item id="c" href="#x" disabled>Crumb</u-breadcrumb-item></u-breadcrumb>',
    (h) => h.shadowRoot!.querySelector('a')],
];

async function settle(): Promise<void> {
  const all = Array.from(document.body.querySelectorAll('*')) as (HTMLElement & { updateComplete?: Promise<unknown> })[];
  for (const el of all) if (el.updateComplete) await el.updateComplete;
  await new Promise((r) => setTimeout(r, 80));
}

describe('폼 컨트롤 밖 — 비활성이 접근성 노드에 도달한다', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it.each(CASES)('%s: disabled → aria-disabled="true"', async (_tag, markup, pick) => {
    document.body.innerHTML = markup;
    await settle();
    const node = pick(document.getElementById('c')!);
    expect(node).not.toBeNull();
    expect(node!.getAttribute('aria-disabled')).toBe('true');
  });

  it.each(CASES)('NEGATIVE: %s: 비활성을 풀면 aria-disabled 가 사라진다', async (_tag, markup, pick) => {
    document.body.innerHTML = markup;
    await settle();
    const host = document.getElementById('c') as HTMLElement & { disabled: boolean };
    host.disabled = false;
    await settle();
    expect(pick(host)!.hasAttribute('aria-disabled')).toBe(false);
  });
});
