import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/pagination/UPagination.js';
import type { UPagination } from '../../src/components/pagination/UPagination.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `u-pagination` — 0 기준 `page` · 범위와 총 건수 · 이전/다음 · 쪽 번호(생략 부호) · 선택적 페이지 크기.
 * 페이지 축은 데이터 소스와 두 표의 것과 같다(0 기준). 현재 쪽은 포커스되는 버튼에 `aria-current="page"` 로 실린다.
 */
beforeEach(() => {
  document.body.innerHTML = '';
  Locale.set('en');
});

async function mount(attrs: string): Promise<UPagination> {
  document.body.innerHTML = `<u-pagination ${attrs}></u-pagination>`;
  const el = document.querySelector('u-pagination') as UPagination;
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 0));
  return el;
}

const sr = (el: UPagination) => el.shadowRoot!;
const labels = (el: UPagination) => [...sr(el).querySelectorAll('.pages > *')].map((n) =>
  n.localName === 'span' ? '…' : n.getAttribute('aria-label') === 'Previous page' ? '<' : n.getAttribute('aria-label') === 'Next page' ? '>' : n.textContent!.trim());
const innerButton = (host: Element) => host.shadowRoot!.querySelector('button')!;

describe('u-pagination', () => {
  it('범위·총 건수를 쓰고, 처음·끝·현재 양옆만 쪽 번호로 — 사이는 생략 부호', async () => {
    const el = await mount('page="5" page-size="20" total-count="345"');
    expect(sr(el).querySelector('[part="range"]')!.textContent).toBe('101–120 of 345');
    expect(labels(el)).toEqual(['<', '1', '…', '5', '6', '7', '…', '18', '>']);
  });

  it('NEGATIVE 사이가 한 쪽뿐이면 생략 대신 그 쪽을 그린다 · 쪽이 적으면 전부', async () => {
    const el = await mount('page="2" page-size="10" total-count="70"');
    expect(labels(el)).toEqual(['<', '1', '2', '3', '4', '…', '7', '>']);
    const few = await mount('page="0" page-size="10" total-count="25"');
    expect(labels(few)).toEqual(['<', '1', '2', '3', '>']);
  });

  it('🔴현재 쪽은 포커스되는 버튼에 aria-current="page" — 이름은 «Page n»', async () => {
    const el = await mount('page="1" page-size="10" total-count="50"');
    const pages = [...sr(el).querySelectorAll('u-button[part="page"]')];
    const current = pages.find((p) => p.getAttribute('aria-current') === 'page')!;
    expect(current.textContent!.trim()).toBe('2');
    await (current as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    expect(innerButton(current).getAttribute('aria-current')).toBe('page');
    expect(innerButton(current).getAttribute('aria-label')).toBe('Page 2');
    expect(pages.filter((p) => p.hasAttribute('aria-current'))).toHaveLength(1);
    expect(sr(el).querySelector('nav')!.getAttribute('aria-label')).toBe('Pagination');
  });

  it('누르면 page-change {page, pageSize} 를 내고 스스로 옮긴다 · 처음에는 이전이 꺼져 있다', async () => {
    const el = await mount('page="0" page-size="10" total-count="50"');
    const events: unknown[] = [];
    el.addEventListener('page-change', (e) => events.push(e.detail));
    expect((sr(el).querySelector('[part="prev"]') as HTMLElement & { disabled: boolean }).disabled).toBe(true);
    await userEvent.click(innerButton(sr(el).querySelector('[part="next"]')!));
    await el.updateComplete;
    expect(events).toEqual([{ page: 1, pageSize: 10 }]);
    expect(el.page).toBe(1);
  });

  it('NEGATIVE 취소하면 그대로다(소스에 묶었을 때 소스가 정답)', async () => {
    const el = await mount('page="0" page-size="10" total-count="50"');
    el.addEventListener('page-change', (e) => e.preventDefault());
    await userEvent.click(innerButton(sr(el).querySelector('[part="next"]')!));
    await el.updateComplete;
    expect(el.page).toBe(0);
  });

  it('페이지 크기를 바꾸면 첫 장으로 — page-change {page: 0, pageSize}', async () => {
    const el = await mount('page="3" page-size="10" total-count="200" page-sizes="10,50,100"');
    const events: { page: number; pageSize: number }[] = [];
    el.addEventListener('page-change', (e) => events.push(e.detail));
    const select = sr(el).querySelector('u-select') as HTMLElement & { value: string };
    expect(select.getAttribute('aria-label')).toBe('Rows per page');
    select.value = '50';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    expect(events).toEqual([{ page: 0, pageSize: 50 }]);
    expect([el.page, el.pageSize]).toEqual([0, 50]);
  });

  it('NEGATIVE page-sizes 가 없으면 크기 선택을 그리지 않는다 · 행이 없어도 한 쪽', async () => {
    const el = await mount('total-count="0"');
    expect(sr(el).querySelector('u-select')).toBeNull();
    expect(sr(el).querySelector('[part="range"]')!.textContent).toBe('0–0 of 0');
    expect(labels(el)).toEqual(['<', '1', '>']);
  });

  it('로캘을 따른다', async () => {
    Locale.set('ko');
    const el = await mount('page="0" page-size="20" total-count="45"');
    expect(sr(el).querySelector('[part="range"]')!.textContent).toBe('45건 중 1–20');
    expect(sr(el).querySelector('nav')!.getAttribute('aria-label')).toBe('페이지 이동');
  });
});
