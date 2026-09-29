import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/breadcrumb/UBreadcrumb.js';
import '../../src/components/breadcrumb-item/UBreadcrumbItem.js';
import type { UBreadcrumb } from '../../src/components/breadcrumb/UBreadcrumb.js';

/** 슬롯 배정·`slotchange` 는 비동기라 한 틱을 넘겨 기다린다. */
const settle = () => new Promise((r) => setTimeout(r, 50));

async function mount(markup: string): Promise<UBreadcrumb> {
  document.body.innerHTML = markup;
  const bc = document.querySelector('u-breadcrumb') as UBreadcrumb;
  await bc.updateComplete;
  await settle();
  return bc;
}

const separators = (bc: UBreadcrumb) => [...bc.shadowRoot!.querySelectorAll<HTMLElement>('.separator')];

describe('u-breadcrumb — 구분자는 항목 사이마다 하나씩 놓인다', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('사용자 지정 구분자(문서 예제 그대로)가 항목 사이마다 그려진다', async () => {
    const bc = await mount(`
      <u-breadcrumb>
        <span slot="separator">/</span>
        <u-breadcrumb-item href="/">Home</u-breadcrumb-item>
        <u-breadcrumb-item href="/products">Products</u-breadcrumb-item>
        <u-breadcrumb-item>Detail</u-breadcrumb-item>
      </u-breadcrumb>`);

    const seps = separators(bc);
    expect(seps.map((s) => s.textContent)).toEqual(['/', '/']);
    // 마지막 표식은 항목에만 붙는다 — 섀도의 <slot> 요소에 붙으면 안 된다.
    expect([...document.querySelectorAll('u-breadcrumb-item[data-last]')].map((e) => e.textContent)).toEqual(['Detail']);
    expect(bc.shadowRoot!.querySelector('nav > slot')!.hasAttribute('data-last')).toBe(false);
  });

  it('구분자 슬롯이 항목보다 뒤에 와도, 나중에 바뀌어도 같다', async () => {
    const bc = await mount(`
      <u-breadcrumb>
        <u-breadcrumb-item href="/">Home</u-breadcrumb-item>
        <u-breadcrumb-item>Page</u-breadcrumb-item>
        <span slot="separator">›</span>
      </u-breadcrumb>`);
    expect(separators(bc).map((s) => s.textContent)).toEqual(['›']);

    const replacement = document.createElement('span');
    replacement.slot = 'separator';
    replacement.textContent = '>';
    bc.querySelector('[slot="separator"]')!.replaceWith(replacement);
    await settle();
    expect(separators(bc).map((s) => s.textContent)).toEqual(['>']);
  });

  it('구분자는 장식이라 접근성 트리에서 빠진다', async () => {
    const bc = await mount(`
      <u-breadcrumb>
        <span slot="separator">/</span>
        <u-breadcrumb-item href="/">Home</u-breadcrumb-item>
        <u-breadcrumb-item>Page</u-breadcrumb-item>
      </u-breadcrumb>`);
    expect(separators(bc).map((s) => s.getAttribute('aria-hidden'))).toEqual(['true']);
  });

  it('기본 구분자(슬롯 없음)도 항목 사이마다 하나다', async () => {
    const bc = await mount(`
      <u-breadcrumb>
        <u-breadcrumb-item href="/">Home</u-breadcrumb-item>
        <u-breadcrumb-item href="/a">A</u-breadcrumb-item>
        <u-breadcrumb-item>B</u-breadcrumb-item>
      </u-breadcrumb>`);
    expect(separators(bc)).toHaveLength(2);
    expect(separators(bc).every((s) => s.querySelector('u-icon'))).toBe(true);
  });
});
